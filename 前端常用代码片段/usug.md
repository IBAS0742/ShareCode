# 

```
// [
//     {
//         bulk: HTMLElement,
//         ID: 'LT05_L1TP_141029_20111028_20200820_02_T1',
//         DATE: '2011/10/28',
//         PATH: 141,
//         ROW: 29,
//          tr: HTMLElement,
//     }
// ]
function getTds(dom) {
    let tds = [];
    if (!dom) {
        dom = document;
    }
    let tb = document.getElementsByClassName('resultPageTable')[0];
    let trs = tb.getElementsByTagName('tr');
    for (let i = 1;i < trs.length;i++) {
        let lis = trs[i].getElementsByTagName('li');
        let tdObj = {
            bulk: trs[i].getElementsByClassName('ee-icon ee-icon-bulk')[0],
            ID: lis[0].innerText.substring(4),
            DATE: lis[1].innerText.substring(15),
            PATH: +lis[2].innerText.substring(6),
            ROW: +lis[3].innerText.substring(6),
            tr: trs[i],
        };
        tds.push(tdObj);
    }
    //'ee-icon ee-icon-bulk';
    return tds;
}

function loading() {
    return new Promise(s => {
        let id = setInterval(() => {
            if (document.getElementsByClassName('ui-widget-overlay').length > 0) {
            } else {
                clearInterval(id);
                console.log('ok')
                setTimeout(s,500);
            }
        },500);
    });
}

class AutoNextPage {
    constructor() {
        this.id = null;
        this.id1 = null;
        this.pageOver = true;
        this.downloadTds = false;
        this.nextItemFn = () => {};
    }
    // 停止全部内容
    stop() {
        clearInterval(this.id);
        clearInterval(this.id1);
    }
    // 进入下一页
    nextPage() {
        this.pageOver = true;
    }
    // 直接进入下一个项
    nextItem() {
        this.nextItemFn();
    }
    _autoNextPage() {
        // this.pageOver = false;
        let waitClassDom = (className,ind) => {
            return new Promise(s => {
                let id = setInterval(() => {
                    let d = document.getElementsByClassName(className);
                    if (d.length) {
                        if (ind === -1) {
                            s(d[d.length - 1]);
                        } else {
                            s(d[0]);
                        }
                        clearInterval(id);
                    } else {}
                },500);
            });
        };
        this.downloadTds = false;
        let tds = [];
        let waitId = null;
        let doTds = () => {
            if (this.downloadTds) {
                return;
            }
            if (tds.length) {
                let td = tds.shift();
                this.downloadTds = true;
                td.tr.getElementsByClassName('ee-icon-download')[0].click();
                waitOptionButton().then(ob => {
                    ob.click();
                    return waitSecondButton().then(sb => {
                        sb.click();
                        waitClassDom('closeProductOptionsButton').then(_=>_.click());
                        waitClassDom('ui-icon-closethick',-1).then(_=>_.click());
                        waitId = setTimeout(() => {
                            this.downloadTds = false;
                        },1000 * 60 * 15);
                    });
                });
            } else {
                this.pageOver = true;
            }
        };
        this.nextItemFn = (function () {
            if (waitId) {
                clearTimeout(waitId);
                this.downloadTds = false;
            }
        }).bind(this);
        // let waitDownloadDialog = () => waitClassDom('downloadOptionsDialog');
        let waitOptionButton = () => waitClassDom('productOptionsButton');
        let waitSecondButton = () => waitClassDom('secondaryDownloadButton');
        return loading().then(_ => {
            select20220119()
                .then(_tds => {
                    tds = _tds;
                    this.id1 = setInterval(() => {
                        doTds();
                    },500);
                })
            return "ok";
        });
    }
    autoNextPage() {
        let _n = () => {};
        let n = () => document.getElementsByClassName('pageLink')[2].click();
        this.pageOver = true;
        this.id = setInterval(() => {
            if (this.pageOver) {
                _n();
                this.pageOver = false;
                this._autoNextPage();
                _n = n;
            } else {
            }
        },500);
    }
}
// function _autoNextPage() {
//     // window.pageOver = false;
//     let waitClassDom = (className,ind) => {
//         return new Promise(s => {
//             let id = setInterval(() => {
//                 let d = document.getElementsByClassName(className);
//                 if (d.length) {
//                     if (ind === -1) {
//                         s(d[d.length - 1]);
//                     } else {
//                         s(d[0]);
//                     }
//                     clearInterval(id);
//                 } else {}
//             },500);
//         });
//     };
//     let downloadTds = false;
//     let tds = [];
//     let doTds = () => {
//         if (downloadTds) {
//             return;
//         }
//         if (tds.length) {
//             let td = tds.shift();
//             downloadTds = true;
//             td.tr.getElementsByClassName('ee-icon-download')[0].click();
//             waitOptionButton().then(ob => {
//                 ob.click();
//                 return waitSecondButton().then(sb => {
//                     sb.click();
//                     waitClassDom('closeProductOptionsButton').then(_=>_.click());
//                     waitClassDom('ui-icon-closethick',-1).then(_=>_.click());
//                     setTimeout(() => {
//                         downloadTds = false;
//                     },1000 * 60 * 15);
//                 });
//             });
//         } else {
//             window.pageOver = true;
//         }
//     };
//     // let waitDownloadDialog = () => waitClassDom('downloadOptionsDialog');
//     let waitOptionButton = () => waitClassDom('productOptionsButton');
//     let waitSecondButton = () => waitClassDom('secondaryDownloadButton');
//     return loading().then(_ => {
//         select20220119()
//             .then(_tds => {
//                 tds = _tds;
//                 setInterval(() => {
//                     doTds();
//                 },500);
//             })
//         return "ok";
//     });
// }
// function autoNextPage() {
//     let _n = () => {};
//     let n = () => document.getElementsByClassName('pageLink')[2].click();
//     window.pageOver = true;
//     setInterval(() => {
//         if (window.pageOver) {
//             _n();
//             window.pageOver = false;
//             _autoNextPage();
//             _n = n;
//         } else {
//         }
//     },500);
// }

// 挑选 2010 ~ 2013 中 3~9 月的数据
function select20220119(dom) {
    let _tds = [];
    return loading().then(() => {
        let tds = getTds(dom);
        tds.forEach(td => {
            let d = td.DATE.split('/');
            if (d[0] >= 2010 && d[0] <= 2013 && d[1] >= 3 && d[1] <= 9) {
                // td.bulk.click();
                _tds.push(td);
            } else {
                td.tr.remove();
            }
        });
        window.tds = _tds;
        return _tds;
    });
}

function search(datasetId,pages) {
    let div = document.createElement('div');
    let searchOne = (url) => {
        return jQuery.ajax({
            url: 'https://earthexplorer.usgs.gov/scene/downloadoptions/5e83d1193824e4fc/LT51410292011237IKR00',
            method: 'post'
        }).then(_ => {
            let d = document.createElement('div');
            d.innerHTML = _;
            return d.getElementsByClassName('modal')[0].id.split('_')[0];
        }).then(id => {
            return jQuery.ajax({
                url: `https://earthexplorer.usgs.gov/download/${id}/${url.split('/')[1]}/`,
                method: 'post'
            }).then(_ => _.url);
        });
    }
    return jQuery.ajax({
        url: 'https://earthexplorer.usgs.gov/scene/search',
        data: {
            datasetId: datasetId,
            resultsPerPage: 10,
            pageNum: pages,
        },
        method: 'post'
    }).then(dom => {
        div.innerHTML = dom;
        return select20220119(div)
            .then(tds => {
                // tds[1].tr.id.split('_').slice(1).join('/');
                let ret = [];
                let loading = false;
                return new Promise(s => {
                    let id = setInterval(() => {
                        if (loading) {
                            return;
                        }
                        if (tds.length) {
                            loading = true;
                            searchOne(tds[0].tr.id.split('_').slice(1).join('/'))
                                .then(url => {
                                    ret.push(url);
                                    tds.shift();
                                    loading = false;
                                    console.log(`剩余 ${tds.length} 个`)
                                });
                        } else {
                            s(ret);
                            clearInterval(id);
                        }
                    },500);
                });
            });
    });
}


```