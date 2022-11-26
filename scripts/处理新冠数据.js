// 处理数据内容来自 https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports
const {
    getFromDay,
    getDayBetweenFromYearFirstDay
} = require('../../_utils/getDays');
const fs = require('fs');
const path = require('path');

// let nd = getFromDay(2020,1,22,false,false,2020,1,31);
let nd = getFromDay(2020,1,22,false,false,2021,1,10);

// 项目中的文件夹位置
let basePath = `D:\\codes\\node\\COVID-19\\csse_covid_19_data\\csse_covid_19_daily_reports`;
// 保存处理结果的文件夹位置
let savePath = `C:\\Users\\IBAS\\Desktop`;
if (process.argv.length >= 3) {
    basePath = process.argv[2];
}
if (process.argv.length >= 4) {
    savePath = process.argv[3];
}


class Country {
    constructor(country,chineseName) {
        this.country = country;
        this.chineseName = chineseName;
        this.dates = [];
        this.datas = [];
        this.tmp = [];
        this.tmpOk = false;
    }

    initTmp(n) {
        this.tmpOk = true;
        this.tmp = [];
        for (let i = 0;i < n;i++) {
            this.tmp.push(0);
        }
    }
    addTmp(n) {
        n.forEach((_,i) => {
            this.tmp[i] += +_;
        });
    }
    save(date) {
        if (!this.tmpOk) return;
        this.dates.push(date);
        this.datas.push(this.tmp);
        this.tmpOk = false;
    }
}
let countrys = (function (cts) {
    // return cts.map(ct => new Country(ct[0],ct[1]));
    let ctss = {};
    cts.forEach(ct => {
        ctss[ct[0]] = new Country(ct[0],ct[1]);
        for (let i = 2;i < ct.length;i++) {
            ctss[ct[i]] = ctss[ct[0]];
        }
    });
    return ctss;
})([
    ['China','中国','Mainland China'],
    ['Germany','德国'],
    ['France','法国'],
    ['United Kingdom','英国'],
    ['Italy','意大利'],
    ['Uzbekistan','乌兹别克斯坦'],
    ['Tajikistan','塔吉克斯坦'],
    ['Kyrgyzstan','吉尔吉斯斯坦'],
    ['Kazakhstan','哈萨克斯坦'],
    ['US','美国']
]);
let cities = (function (cts) {
    // return cts.map(ct => new Country(ct[0],ct[1]));
    let ctss = {};
    cts.forEach(ct => {
        ctss[ct[0]] = new Country(ct[0],ct[1]);
        for (let i = 2;i < ct.length;i++) {
            ctss[ct[i]] = ctss[ct[0]];
        }
    });
    return ctss;
})([
    ['Beijing','中国-北京'],
    ['Berlin','德国-柏林'],
    ['Washington','美国-华盛顿']
]);

// d = 20200122
let countryColumn = 1;
let comfirmed = 3;
let deaths = 4;

let d = nd();
while (d) {
    for (let i in countrys) {
        countrys[i].initTmp(2);
    }
    for (let i in cities) {
        cities[i].initTmp(2);
    }
    if (d < 20200322) {
        countryColumn = 1;
        comfirmed = 3;
        deaths = 4;
    } else {
        countryColumn = 3;
        comfirmed = 7;
        deaths = 8;
    }
    fs.readFileSync(path.join(basePath,`${d.substring(4,6)}-${d.substring(6,8)}-${d.substring(0,4)}.csv`),'utf-8')
        .split('\n').map(_ => _.split(',')).forEach(_ => {
            if (_[countryColumn] in countrys) {
                countrys[_[countryColumn]].addTmp([_[comfirmed],_[deaths]]);
            }
            if (_[countryColumn - 1] in cities) {
                cities[_[countryColumn - 1]].addTmp([_[comfirmed],_[deaths]]);
            }
    });
    for (let i in countrys) {
        countrys[i].save(d);
    }
    for (let i in cities) {
        cities[i].save(d);
    }

    d = nd();
}
// console.log(JSON.stringify(countrys,'','\t'));

let ind = 0;
let lines = [[''],['time']];
countrys.China.dates.forEach(_ => {
    lines.push([_]);
});
for (let i in countrys) {
    let ct = countrys[i];
    lines[0].push(ct.country);
    lines[0].push('');
    lines[1].push('comfirmed');
    lines[1].push('deaths');
    ind = 2;
    ct.datas.forEach(ds => {
        lines[ind].push(ds[0]);
        lines[ind].push(ds[1]);
        ind++;
    });
}
for (let i in cities) {
    let ct = cities[i];
    lines[0].push(ct.country);
    lines[0].push('');
    lines[1].push('comfirmed');
    lines[1].push('deaths');
    ind = 2;
    ct.datas.forEach(ds => {
        lines[ind].push(ds[0]);
        lines[ind].push(ds[1]);
        ind++;
    });
}
fs.writeFileSync(path.join(savePath,'rst.csv'),lines.map(_ => _.join(',')).join('\r\n'));