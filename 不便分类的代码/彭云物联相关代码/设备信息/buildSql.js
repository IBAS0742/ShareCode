const aw = require('./奥维位置信息.json');
const of = require('./官网位置信息.json');
const fs = require('fs');

let mapper = {};
let objs = of.data.map((_,ind) => {
    mapper[_.deviceName] = ind;
    return {
        deviceName: _.deviceName,
        id: _.deviceId,
        deviceId: _.deviceId,
        lng: -1,
        lat: -1,
        dLat: _.lat,
        dLng: _.lng,
        mineTime: -1,
        netStatus: _.netStatus === "online" ? 1 : 0,
    }
});

aw.ObjItems[0].Object.ObjectDetail.ObjChildren.forEach(obj => {
    let ind = mapper[obj.Object.Name];
    if (typeof ind !== "undefined") {
        objs[ind].lat = obj.Object.ObjectDetail.Lat;
        objs[ind].lng = obj.Object.ObjectDetail.Lng;
        objs[ind].mineTime = obj.tmModify;
    }
});
fs.writeFileSync('./all_info.json',JSON.stringify(objs,'','\t'),'utf-8');

fs.writeFileSync('./insert_sql.sql',objs.map(obj => {
    return `insert into devicesStatus (id, deviceId, lat, lng, dLat, dLng, mineTime, netStatus) values("${obj.id}","${obj.deviceId}","${obj.lat}","${obj.lng}","${obj.dLat}","${obj.dLng}","${obj.mineTime}","${obj.netStatus}");`;
}).join('\r\n'),'utf-8');

// let o = objs.filter(_ => _.netStatus).filter(_ => _.lat === -1);
// console.log(JSON.stringify(o, '', '\t'))


