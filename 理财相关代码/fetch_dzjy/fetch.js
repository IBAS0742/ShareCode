const {
    get
} = require('./Ajax.js');
const fs = require('fs');

// get('https://data.hexin.cn/market/dzjy/date/2023-07-03/').then(ret => {
//     fs.writeFileSync('./out.txt', ret, 'utf-8')
// });


get('https://data.hexin.cn/market/dzjystock/code/000953/date/2023-07-03/').then(ret => {
    fs.writeFileSync('./out.detail.txt', ret, 'utf-8')
});

