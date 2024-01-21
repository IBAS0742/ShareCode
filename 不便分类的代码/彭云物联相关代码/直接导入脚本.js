
let getFlag = (function () {
    let strs = '.,';
    for (let i = 0;i < 26;i++) {
        strs += String.fromCharCode(97 + i);
        strs += String.fromCharCode(65 + i);
    }
    for (let i = 0;i < 10;i++) {
        strs += String.fromCharCode(48 + i);
    }
    let zs = '000000';
    function tolen(s) {
        s = s + '';
        if (s.length < 6) {
            return zs.substring(s.length) + s;
        }
        return s;
    }
    // 000001 => 'a'
    return {
        encode:function (flags) {
            let f = '';
            flags = flags.join('');
            for (let i = 0;i < 48;i += 6) {
                f += strs[parseInt(flags.substring(i, i + 6),'2')];
            }
            return f;
        },
        // 'a' => 000001
        decode:function (flags) {
            return flags.split('').map(_ => strs.indexOf(_))
                .map(_ => tolen(_.toString(2)).split('').map(_=>+_))
                .flatMap(_=>_);
        }
    };
})();
let halfHours = 30 * 60 * 1000;
let oneDay = 24 * 3600 * 1000;
let getFTime = (function () {
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
let lastDownloadDate = '';
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
};
var loading = new class Loading {
        constructor() {
            this.loading = null;
            this.loadingText = null; //document.getElementById('loading-text');
            this.head = '';
            this.init();
        }
        init() {
            let div = document.createElement('div');
            div.innerHTML = `<div class="el-loading-spinner"><i class="el-icon-loading"></i><p class="el-loading-text" style="font-size:20px;" id="loading-text">拼命加载中</p></div>`;
            div.classList.add('el-loading-mask');
            div.style.display = 'none';
            div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            document.body.appendChild(div);
            this.loading = div;
            this.loadingText = document.getElementById('loading-text');
        }
        load(text) {
            this.loading.style.display = 'block';
            text = text || 'loading';
            this.loadingText.innerText = this.head + text;
        }
        close() {
            this.loading.style.display = 'none';
        }
    }
var apis = {
    /**
     *
     * @param deviceNo 121000230413101
     * @param date      2023-05-01
     */
    downloadDatas(deviceNo, date) {
        let r = Math.random().toString().substring(0,18);
        return fetch(`https://api.xzfala.com/v2/device/${deviceNo}/history/all?type=all&beginDate=${date}&endDate=${date}&r=${r}`,{
            headers: {
                token: localStorage.token,
            }
        }).then(_=>_.json());
    },
    getAllDevices() {
        let r = Math.random().toString().substring(0,18);
        return fetch(`https://api.xzfala.com/v2/device/of/master?versionName=9.9.9&r=${r}`,{
            headers: {
                token: localStorage.token,
            }
        }).then(_=>_.json());
    },

    apiUrl: "http://localhost:8099/api",
    toJson(pro) {
        return pro.then(_=>_.json()).then(_=>JSON.parse(_.content))
    },
    post(method,params,array) {
        params = params || [];
        if (array) {
            params = params.map(p => JSON.stringify(p.map(_=>`${_}`)));
        } else {
            params = params.map(_ => `${_}`);
        }
        return fetch(apis.apiUrl, {
            method: 'post',
            body: JSON.stringify({
                Method: method,
                Params: params,
                Array: array || false
            })
        });
    },
    insertDeviceInfoIntoDB(objs) {
        return apis.post('addDevices',objs.map(obj => {
            return [obj.id,obj.deviceName,obj.createTime,obj.iccid,JSON.stringify(obj.sensorList)]
        }),true);
    },
    insertDeviceHistoryIntoDb(obj) {
        return apis.post('addDevicesHistory',obj,true);
    },
    updateDeviceNetStatus(devices) {
        return apis.post('updateDeviceNetStatus', devices.map(obj => {
            return [obj.id, obj.netStatus === "1" ? 1 : 0]
        }), true);
    },
    addDataStatus(deviceId, date, record) {
        return apis.post('addDataStatus', [`${deviceId}_${date}`, deviceId, date, record], false);
    }
};
function fetchAllDevices() {
    loading.load("获取所有设备信息");
    return apis.getAllDevices().then(_ => {
        devices = _.data;
        loading.close();
        apis.insertDeviceInfoIntoDB(_.data).then(_=>console.log(`over`));
        apis.updateDeviceNetStatus(_.data).then(_=>console.log(`over`));
    });
}
let devices = [];
function getDayString(offset) {
    let d = new Date();
    offset = offset || -1;
    d.setTime(d.getTime() + 1000 * 3600 * 24 * offset);
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.to2()}-${d.getDate().toString().to2()}`;
}
function fetchHistoryAndInsertIntoDb(offset) {
    if (devices.length) {
        let counter = 0;
        let total = devices.length;
        let date = getDayString(offset);
        lastDownloadDate = date;
        return runPromiseByArrReturnPromise(device => {
            let d = device.sensorList.map(_=>_.sensorKey);
            if (d.length < 4) {
                for (let ti = d.length;ti < 4;ti++) {
                    d.push('-');
                }
            }
            let keys = [...d,'power','signal'];
            loading.load(`[正在获取设备数据] [process] [${counter + 1} / ${total}]`);
            let day = null;
            return apis.downloadDatas(device.id, date).then(_=>_.data).then(data => {
                let historyData = [];
                // todo
                for (let i = 0;i < data.power.length;i++) {
                    let f_time = getFTime(data["power"][i].time).ts;
                    day = getFTime(data["power"][i].time,oneDay,1000);
                    historyData.push([
                        `${device.id}-${data["power"][i].time / 1000}`,
                        device.id,
                        data["power"][i].time,
                        f_time,
                        ...keys.map(k => {
                            if (k === '-') {
                                return '-100';
                            } else {
                                let d = data[k][i] || {};
                                return (d.dataStr || '-100')
                            }
                        }),
                        // (data["8"][i].dataStr || '-100'),
                        // (data["9"][i].dataStr || '-100'),
                        // (data["a"][i].dataStr || '-100'),
                        // (data["b"][i].dataStr || '-100'),
                        // (data["power"][i].dataStr || '-100'),
                        // (data["signal"][i].dataStr || '-100'),
                        (f_time - day.ts) / halfHours, // h_index
                    ]);
                }
                loading.load(`[正在将数据写入本地数据库] [process] [${counter + 1} / ${total}]`);
                return apis.insertDeviceHistoryIntoDb(historyData).then(() => {
                    counter++;
                    console.log(`[process] [${counter} / ${total}]`);
                    return true;
                }).then(() => {
                    let flags = [];
                    if (historyData.length && day) {
                        for (let i = 0;i < 48;i++) {
                            flags.push(0);
                        }
                        historyData.forEach(hd => {
                            if (hd[10] < 48) {
                                flags[hd[10]] = 1;
                            }
                        });
                        let flag = getFlag.encode(flags);
                        return apis.addDataStatus(device.id, day.ts, flag);
                    } else {
                        return null;
                    }
                });
            });
        },devices).then(() => {
            loading.close();
            return '';
        });
    } else {
        return fetchAllDevices().then(() => fetchHistoryAndInsertIntoDb(offset))
    }
}
function importTo(offset) {
    fetchHistoryAndInsertIntoDb(offset).then(() => {
    });
}