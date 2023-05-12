// ==UserScript==
// @name         彭云物联数据转存本地
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.fala-iot.com/pc/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fala-iot.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
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
    let loading = null;
    let devices = [];
    function fetchAllDevices() {
        loading.load("获取所有设备信息");
        return apis.getAllDevices().then(_ => {
            devices = _.data;
            loading.close();
            apis.insertDeviceInfoIntoDB(_.data).then(_=>console.log(`over`));
            apis.updateDeviceNetStatus(_.data).then(_=>console.log(`over`));
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
    };
    String.prototype.to2 = function () {
        let s = this.toString();
        if (s.length < 2) {
            return `0${s}`;
        } else {
            return `${s}`
        }
    }
    function getDayString(offset) {
        let d = new Date();
        offset = offset || -1;
        d.setTime(d.getTime() + 1000 * 3600 * 24 * offset);
        return `${d.getFullYear()}-${`${d.getMonth() + 1}`.to2()}-${d.getDate().toString().to2()}`;
    }

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
                            let flag = getFlag(flags);
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
    let isOk2Run = function () {
        let d = new Date();
        let hour = d.getHours();
        let min = d.getMinutes();

        return hour === 0 && min > 30 && min < 36;
    }
    let autoDownload = function () {
        let autoTime = 1;
        loading.head = "[自动下载] ";
        let running = true;
        fetchHistoryAndInsertIntoDb().then(() => {
            loading.load(`[${lastDownloadDate}] 自动下载完成 ${autoTime} 次`);
            running = false;
        });

        setInterval(() => {
            if (running) {} else {
                if (isOk2Run()) {
                    autoTime++;
                    running = true;
                    fetchHistoryAndInsertIntoDb().then(() => {
                        loading.load(`[${lastDownloadDate}] 自动下载完成 ${autoTime} 次`);
                        running = false;
                    });
                }
            }
        }, 1000 * 60 * 2); // 两分钟检查一次

        setInterval(() => {
            if (!running) {
                loading.load(`[${lastDownloadDate}] 自动下载完成 ${autoTime} 次，等待下一次。`);
            }
        }, 1000 * 60 * 10);
    };
    function loadBtn() {
        let div_1 = document.createElement('div');
        let div = document.createElement('div');
        div.onclick = function () {
            div.style.display = 'none';
            div_1.style.display = 'none';
            fetchHistoryAndInsertIntoDb().then(() => {
                div.style.display = 'block';
                div_1.style.display = 'block';
            });
        };
        div.style.position = 'fixed';
        div.style.zIndex = 100000000;
        div.style.bottom = '20px';
        div.style.right = '20px';
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.borderRadius = '50px';
        div.style.background = '#ffaabb';
        div.style.textAlign = 'center';
        div.style.lineHeight = '100px';
        div.style.cursor = 'pointer';
        div.innerText = '导入数据库';
        div.style.fontSize = '18px';
        document.body.appendChild(div);

        div_1.onclick = function () {
            div_1.onclick = function () {};
            div.onclick = function () {};
            div.style.backgroundColor = '#bfbfbf';
            div.style.display = 'none';
            div_1.style.display = 'none';
            autoDownload();
        };
        div_1.style.position = 'fixed';
        div_1.style.zIndex = 100000000;
        div_1.style.bottom = '20px';
        div_1.style.right = '140px';
        div_1.style.width = '100px';
        div_1.style.height = '100px';
        div_1.style.borderRadius = '50px';
        div_1.style.background = '#ffaabb';
        div_1.style.textAlign = 'center';
        div_1.style.lineHeight = '100px';
        div_1.style.cursor = 'pointer';
        div_1.innerText = '自动导入数据库';
        div_1.style.fontSize = '16px';
        document.body.appendChild(div_1);

        loading = new class Loading {
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
    }
    setTimeout(()=>{
        loadBtn();
    },1000);
})();

// 配置 simpleDb 的 conofig 如下

/**
 {
    "port": ":8099",
    "port_desc": "端口",
    "db_path": "C:\\pan\\code\\golang\\toolbox\\simpledb\\soil_data.db",
    "db_path_desc": "数据库位置（相对位置时表示程序所在位置），可以另外由 --dbpath 参数指定",
    "static_path": "./",
    "static_path_desc": "(html位置)",
    "static_url": "/views/",
    "static_url_desc": "(html 访问链接)",
    "others": [
    ],
    "sqls_desc": "(一般是创建表sql，或初始化数据库sql)",
    "sqls_desc_history": "time 是数据的实际获取时间，ftime 是将他往最近的整点时间靠之后的时间，d_1 ~ d_4 是 devices 表中的 sensorList 按顺序对应的 4 个监测设备的值",
    "sqls_desc_location": "lat 和 lng 是奥维地图的经纬度，dLat 和 dLng 是设备产商提供的经纬度，mineTime 是奥维地图定位时的事件（即埋入时间）,netStatus 表示离线0、在线1",
    "sqls_desc_logger": "tbname 表示这个日志是关于哪一个表的",
    "sqls_desc_dataStatus": "记录数据情况，没30分钟是否有一个数据，用 record 记录是否有记录，一天共有 48~49 个记录，使用 二进制记录 000000~111111 共63总情况，用 [a~zA~Z0~9.]，一个字符表示 6 个时间的情况，一天需要 8 个字符",
    "sqls": [
        "create table if not exists devices(id char(20) primary key not null,name varchar(50) not null,createTime varchar(20) not null,iccid varchar(30) not null,sensorList varchar(2000) not null);",
        "create table if not exists history(id char(40) primary key not null,deviceId char(20) not null,time varchar(14) not null,f_time varchar(14) not null,d_1 real,d_2 real,d_3 real,d_4 real,d_power real,d_signal real)",
        "create table if not exists devicesStatus(id char(40) primary key not null,deviceId char(20) not null,lat real,lng real,dLat real,dLng real,mineTime varchar(20),netStatus tinyint)",
        "create table if not exists logger(ID integer PRIMARY KEY AUTOINCREMENT,tbname varchar(10),content varchar(256))",
        "create table if not exists dataStatus(ID char(40) primary key not null,deviceId varchar(20),date varchar(20),record varchar(10))"
    ],
    "api_desc": "",
    "apis": [
        {
            "name": "addDevices",
            "name_desc": "添加设备信息",
            "param": [
                "id", "name", "createTime", "iccid", "sensorList"
            ],
            "sql": "insert OR IGNORE into devices(id,name,createTime,iccid,sensorList) values(\"{id}\",\"{name}\",\"{createTime}\",\"{iccid}\",\"{sensorList}\");",
            "desc": "添加一个下载请求"
        },
        {
            "name": "listDevices",
            "name_desc": "获取所有设备信息",
            "return": [
                "id", "name", "createTime", "iccid", "sensorList"
            ],
            "sql": "select id,name,createTime,iccid,sensorList from devices"
        },
        {
            "name": "addDevicesHistory",
            "name_desc": "添加设备信息",
            "param": [
                "id", "deviceId", "time", "f_time", "d_1", "d_2","d_3","d_4","d_power","d_signal"
            ],
            "sql": "insert OR IGNORE into history(id, deviceId, time, f_time, d_1, d_2, d_3, d_4, d_power, d_signal) values(\"{id}\",\"{deviceId}\",\"{time}\",\"{f_time}\",\"{d_1}\",\"{d_2}\",\"{d_3}\",\"{d_4}\",\"{d_power}\",\"{d_signal}\");",
            "desc": "添加一个下载请求"
        },
        {
            "name": "listDataByDeviceId",
            "name_desc": "获取指定ID设备数据",
            "param": [
                "deviceId"
            ],
            "return": [
                "id", "deviceId", "time", "f_time", "d_1", "d_2","d_3","d_4","d_power","d_signal"
            ],
            "sql": "select id, deviceId, time, f_time, d_1, d_2, d_3, d_4, d_power, d_signal from history where deviceId=\"{deviceId}\" ORDER BY time asc"
        },
        {
            "name": "getDeviceInfo",
            "name_desc": "获取所有设备信息",
            "param": [],
            "return": [
                "id", "name", "createTime", "sensorList", "lat", "lng", "dLat", "dLng", "mineTime", "netStatus"
            ],
            "sql": "select devices.id,devices.name,devices.createTime,devices.sensorList,devicesStatus.lat,devicesStatus.lng,devicesStatus.dLat,devicesStatus.dLng,devicesStatus.mineTime,devicesStatus.netStatus from devices LEFT JOIN devicesStatus where devices.id=devicesStatus.deviceId",
            "sql_bak": "select id, deviceId, lat, lng, dLat, dLng, mineTime, netStatus from devicesStatus"
        },
        {
            "name": "updateDeviceNetStatus",
            "name_desc": "更新设备网络状态",
            "param": ["id", "netStatus"],
            "return": [],
            "sql": "update devicesStatus set netStatus=\"{netStatus}\" where id=\"{id}\""
        },
        {
            "name": "addDataStatus",
            "name_desc": "添加数据状态",
            "param": ["id", "deviceId", "date", "record"],
            "return": [],
            "sql": "insert OR IGNORE into dataStatus(id,deviceId,date,record) values(\"{id}\",\"{deviceId}\",\"{date}\",\"{record}\")"
        }
    ]
}
 */
