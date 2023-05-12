window.apis = {
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
    getDeviceInfo() {
        // return apis.toJson(apis.post('getDeviceInfo', [],false));
        return apis.post('getDeviceInfo', [],false)
            .then(_=>_.text())
            .then(_ => JSON.parse(_.replace(/\\\\\"/g,'\\\\\\\"')))
            .then(_=>JSON.parse(_.content));
    },
    listDataByDeviceId(id) {
        return apis.toJson(apis.post('listDataByDeviceId', [id + ''],false));
    }
};