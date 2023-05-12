const fs = require('fs');
const https = require("https");
const http = require('http');
const URL = require('url');
const qs = require("querystring");

/**
 * @return Promise
 * */
const post = function (url,option,data) {
    reqMethod = http.request.bind(http);
    let link = URL.parse(url);
    let opt = {
        hostname: link.hostname,
        path: link.path,
        method: 'post',
        port: link.port,
        ...(option || {})
    };
    return new Promise(function (s,f) {
        let req = reqMethod(opt,function (res) {
            let datas = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                datas += chunk;
            });
            res.on('end',function () {
                s(datas);
            });
            res.on('error',function (err) {
                f(err);
            });
        });
        if (data) {
            let reqStr = data;
            if (typeof data === 'object') {
                reqStr = JSON.stringify(data);
            }
            opt.headers = {
                ...(opt.headers || {}),
                'Content-Length': Buffer.byteLength(reqStr)
            };
            req.write(reqStr);
        }
        req.end();
        req.on('error',f);
    });
};
const apis = {
    apiUrl: "http://localhost:8099/api",
    post(method, param) {
        // 执行结果等同下面代码
        // fetch('http://localhost:8089/api',{
        //     method: 'post',
        //     body: JSON.stringify({
        //         Method: method,
        //         Params: param
        //     })
        // }).then(_=>_.text())
        console.log(`method = ${method} & param = ${param ? param.join(',') : ''}`)
        return post(apis.apiUrl, {
            headers: {
                'Content-Type': 'application/json',
            }
        }, {
            method: method,
            // params: [l.id,l.text,l.right],
            params: param,
        });
    },
    getDeviceInfo() {
        // return apis.toJson(apis.post('getDeviceInfo', [],false));
        return apis.post('getDeviceInfo', [],false)
            // .then(_=>_.text())
            .then(_ => JSON.parse(_.replace(/\\\\\"/g,'\\\\\\\"')))
            .then(_=>JSON.parse(_.content));
    },
    listDataByDeviceId(id) {
        return apis.post('listDataByDeviceId', [id + ''],false)
            .then(a=> {
                a = JSON.parse(a);
                return JSON.parse(a.content);
            });
    }
}

// 将记录修改为每天 48 个，没 30 分钟一个数据

let newRecords = [];
let dataStatus = [];
apis.getDeviceInfo().then(devs => {
    runPromiseByArrReturnPromise(dev => {
        return buildForId(dev.id);
    },devs).then(() => {
        fs.writeFileSync('new.sql',newRecords.join('\r\n') + '\r\n' + dataStatus.join('\r\n'),'utf-8');
    });
});

let halfHours = 30 * 60 * 1000;
let oneDay = 24 * 3600 * 1000;
let calcFTime = (function () {
    let time = new Date();
    time.setHours(0);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    let zeroTs = time.getTime();
    return function (ts, target, deta) {
        target = target || halfHours;
        deta = deta || (target / 2);
        // time.setTime(ts);
        // time.setTime(ts);
        // console.log(time);
        ts += deta;
        let cut = (ts - zeroTs) % target;
        if (cut < 0) {
            ts = ts - cut - target;
        } else {
            ts -= cut;
        }
        time.setTime(ts);
        // console.log(time);
        return {
            ts: ts,
            dateStr: time.toLocaleString()
        };
    }
})();
let getFlag = (function () {
    let strs = '.,';
    for (let i = 0;i < 26;i++) {
        strs += String.fromCharCode(97 + i);
        strs += String.fromCharCode(65 + i);
    }
    for (let i = 0;i < 10;i++) {
        strs += String.fromCharCode(48 + i);
    }
    // 000001 => 'a'
    return function (flags) {
        let f = '';
        flags = flags.join('');
        for (let i = 0;i < 48;i += 6) {
            f += strs[parseInt(flags.substring(i, i + 6),'2')];
        }
        return f;
    };
})();
function buildForId(id) {
    // id = '121000230413114'
    return apis.listDataByDeviceId(id).then(data => {
        let dateObj = new Date();
        // 需要重新计算 f_time
        data = data.reverse().map(_ => {
            let f_time = calcFTime(+_.time).ts;
            let day = calcFTime(+_.time,oneDay,1000);
            return {
                ..._,
                f_time,
                dayStr: day.dateStr,
                day: day.ts,
                h_index: (f_time - day.ts) / halfHours,
            };
        });
        let mapper = {};
        data.forEach(d => {
            if (d.day in mapper) {
                if (d.h_index > 47) {
                    return;
                }
                let t = mapper[d.day][d.h_index];
                if (t) {
                    // 计算哪个记录离半小时更近
                    let t1 = Math.abs(t.time - t.f_time);
                    let t2 = Math.abs(d.time - d.f_time);
                    if (t2 < t1) {
                        mapper[d.day][d.h_index] = d;
                    }
                } else {
                    mapper[d.day][d.h_index] = d;
                }
            } else {
                mapper[d.day] = [];
                for (let i = 0;i < 48;i++) {
                    mapper[d.day].push(null);
                }
                mapper[d.day][d.h_index] = d;
            }
        });
        for (let i in mapper) {
            // newRecords = newRecords.concat(mapper[i]);
            let flag = getFlag(mapper[i].map(_ => _ ? '1' : '0'));
            // console.log(`${mapper[i][47].dayStr}\t${flag}`);
            dataStatus.push(`insert OR IGNORE into dataStatus(id,deviceId,date,record) values("${id}_${i}","${id}","${i}","${flag}");`);
            mapper[i].forEach(nr => {
                if (nr) {
                    newRecords.push(`insert OR IGNORE into history(id, deviceId, time, f_time, d_1, d_2, d_3, d_4, d_power, d_signal) 
values("${nr.id}","${nr.deviceId}","${nr.time}","${nr.f_time}","${nr.d_1}","${nr.d_2}","${nr.d_3}","${nr.d_4}","${nr.d_power}","${nr.d_signal}");`);
                }
            });
        }
        // console.log(mapper);
        // data.forEach(d => {
        //     if (d.day in mapper) {
        //         mapper[d.day]++;
        //     } else {
        //         mapper[d.day] = 1;
        //     }
        //     console.log("index\tTimeStamp\t date string")
        //     if (d.day === '2023/5/8 00:00:00') {
        //         dateObj.setTime(d.f_time);
        //         console.log(`[${d.h_index}]\t${d.f_time}\t[${dateObj.toLocaleString()}]`);
        //     }
        // });
        // console.log(data[0].f_time)
        // console.log(mapper);
        return true;
    });
}
// 执行一个队列的 promise 并以 promise 返回
/**
 * @param promise   要执行的 promise，可以自行封装一次
 * @param arr       数组，参数集合，记得和 promise 匹配
 * @param doPromiseReturn   如果需要对 promise 的结果进行处理，可以使用这个参数
 * @returns {Promise<unknown>}
 */
const runPromiseByArrReturnPromise = (promise,arr,doPromiseReturn) => {
    let doing = false;
    doPromiseReturn = doPromiseReturn || (_=>_);
    return new Promise(s => {
        let _id = setInterval(() => {
            if (!doing) {
                doing = true;
                if (arr.length) {
                    let id = arr.pop();
                    promise(id)
                        .then(o => {
                            doPromiseReturn(o,id);
                            doing = false;
                        });
                } else {
                    clearInterval(_id);
                    s();
                }
            }
        },500);
    });
}