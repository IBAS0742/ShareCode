const parseListMethods = {
    getOptions: function (txt) {
        txt = txt.substring(txt.indexOf('<select'),txt.indexOf('</select>')).replace('selected', '');
        let opt = '<option >'.length;
        txt = txt.split('\n').map(_=>_.trim()).filter(_=>_.startsWith('<option')).map(_ => {
            return _.substring(opt, opt + 10);
        });
        // console.log(txt);
        return txt;
    },
    getTable: function (txt) {
        let ret = [];
        let map = {};
        txt = txt.split('\n').map(_ => _.trim());
        let i = 0;
        for (;i < txt.length;i++) {
            if (txt[i].startsWith('<a onclick="DC.clickHref')) {
                let obj = [txt[i].split('/')[4]];
                i++;
                for (let j = 0;j < 5;j++,i++) {
                    if (j) {
                        obj.push(+txt[i].substring(txt[i].indexOf('">') + 2,txt[i].indexOf('</span>')).split('%')[0]);
                    } else {
                        obj.push(txt[i].substring(txt[i].indexOf('">') + 2,txt[i].indexOf('</span>')));
                    }
                }
                if (obj[0] in map) {
                    continue;
                } else {
                    map[obj[0]] = 1;
                }
                ret.push(obj);
            }
        }
        return ret;
    },
    getDetail(txt) {
        function dearOneTable_(lines) {
            let obj = {
                date: '',
                buy: 0,
                buyQ: 0,
                rate: 0,
                buyName: '',
                sellName: '',
            };
            let i = 0;
            while (true) {
                if (lines[i].startsWith('<h1><span')) {
                    break;
                }
                i++;
            };
            obj.date = lines[i].split('10px;">')[1].substring(0,10);
            while (true) {
                if (lines[i].startsWith('<tr><th>')) {
                    break;
                }
                i++;
            }
            let sps = lines[i].match(/[-]{0,1}[0-9.]+/g).map(_=>+_);
            obj.buy = sps[0];
            obj.buyQ = sps[1];
            i++;
            sps = lines[i].match(/[-]{0,1}[0-9.]+/g).map(_=>+_);
            obj.rate = sps[1];
            i += 2;
            obj.buyName = lines[i].split('class="bfc-main">')[1].split('</span>')[0];
            obj.sellName = lines[i + 1].split('class="bfc-main">')[1].split('</span>')[0];
            // console.log(obj);
            return obj;
        };
        txt = txt.split('\n').map(_=>_.trim());
        let i = 0;
        while (true) {
            if (txt[i].startsWith('<div class="companyRD ')) {
                break;
            }
            i++;
        }
        let ret = [];
        for (;i < txt.length;i += 10) {
            if (!txt[i].startsWith('<div class="companyRD ')) {
                break;
            }
            ret.push(dearOneTable_(txt.slice(i, i + 10)));
        }
        return ret;
    },
}

const parseList = txt => {
    let dates = parseListMethods.getOptions(txt);
    let list = parseListMethods.getTable(txt);
    return {
        dates,
        list
    }
};

const parseDetail = txt => parseListMethods.getDetail(txt)

module.exports = {
    parseList,
    parseDetail
};