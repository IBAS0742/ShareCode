const fs = require('fs');
const {
    parseList,
    parseDetail
} = require('./Utils');

// let content = fs.readFileSync('./out.txt','utf-8');
// console.log(parseList(content));

let content_1 = fs.readFileSync('./out.detail.txt','utf-8');

let ret = parseDetail(content_1);
console.log(ret);
console.log(ret.length);
// dearOneTable(a.split('\n').map(_=>_.trim()));



