- https://earthexplorer.usgs.gov/

```javascript
var trs = (() => {
    let trs = document.getElementsByTagName('tr');
    let ret = [];
    let toObj = (tr) => {
        let lis = tr.getElementsByTagName('li');
        let addToBulk = tr.getElementsByClassName('ee-icon-bulk')[0];
        if (!addToBulk) {
            addToBulk = tr.getElementsByClassName('ee-icon-order')[0];
        }
        return {
            addToBulk: addToBulk,
            filename: lis[0].innerText.substring(4),
            date: lis[1].innerText.substring(18),
            ele: tr,
            path: lis[2].innerText.substring(6),
            row: lis[3].innerText.substring(5)
        }
    };
    for (var i = 0;i < trs.length;i++) {
        if (trs[i].id.startsWith('resultRow')) {
            ret.push(toObj(trs[i]));
        }
    }
    return ret;
});
var pageNext = () => {
    let pn = document.getElementsByClassName('pageLink');
    return pn[pn.length - 2];
};

function addToBulk() {
    // 过滤条件
    var filter = tr => {
        let d = tr.date.split('-');
        if (d[0] === '2021') {
            return true;
        } else {
            return false;
        }
    };
    trs().filter(filter).forEach(_ => _.addToBulk.click());
    setTimeout(() => {
        pageNext().click();
    },2000);
}

```