var runPromiseByArrReturnPromise = (promise,arr,doPromiseReturn) => {
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
function search(page, keyword) {
    var fd = new FormData();
    var obj = {
        "taxonomy": "",
        "journalName": "",
        "LabsName": "",
        "fileType": "001,006",
        "dataSetStatus": "PUBLIC",
        "copyrightCode": "",
        "publishDate": "",
        "ordernum": "",
        "rorId": "",
        "ror": "",
        "page": `${page}`,
        "size": "10"
    };
    for (var i in obj) {
        fd.append(i,obj[i]);
    }
    return fetch(`https://www.scidb.cn/api/sdb-query-service/query?queryCode=&q=${encodeURI(keyword)}`,{
        method: 'post',mode:'cors',body:fd
    })
        .then(_=>_.json())
        .then(ret => {
            return ret.data.data.map(_=>{
                return {
                    title: _.titleZh,
                    link: `https://www.scidb.cn/detail?dataSetId=${_.dataSetId}`
                }
            });
        });
}
function run(keyword,fromPage,toPage,dom) {
    window.all = [];
    let pages = [];
    for (let i = fromPage;i <= toPage;i++) {
        pages.push(i);
    }
    dom.innerHTML = '';
    return runPromiseByArrReturnPromise(page => {
        return search(page, keyword).then(ret => {
            window.all = window.all.concat(ret);
            dom.innerHTML +=
                ret.map(p => {
                    return `<div class="ibas_ret"><a href="${p.link}" target="_blank">${p.title}</a></div>`;
                }).join('\r\n');
        });
    },pages);
}
run("土壤湿度", 8, 50, document.getElementById('__nuxt'));

rename "0".lej "SnapSave.io-“寻衅滋事”、私自架桥的黄德义，在美国会怎么判？【會員樣片節選】.mp4"
rename "1".lej "SnapSave.io-「新台幣」的誕生，台灣人曾窮到只剩下滿手鈔票，惡性通膨怎麼結束的？.mp4"
rename "2".lej "SnapSave.io-中国6月份CPI数据出炉，正式宣布全面进入通缩时代，韭菜直呼：我们准备好了失去30年.mp4"
rename 3.lej "SnapSave.io-中国的水果蔬菜种子被日本垄断，浙江省除杭州外取消户籍制，越来越多女大学生被人包养。.mp4"
rename 4.lej "SnapSave.io-中國經濟「新三駕馬車」開工了！都是誰？銀行副行長月入數百元的新時代（文昭談古論今20230717第1279期）.mp4"
rename 5.lej "SnapSave.io-二季度经济情况   是好转还是恶化？.mp4"
rename 6.lej "SnapSave.io-偏鄉消滅論可以逆轉，日本「地方創生」讓小鎮成功復活.mp4"
rename 7.lej "SnapSave.io-全球暖化的隱形元凶之一，牛羊成甲烷頭號公敵，世界各國腦迴路清奇的「神操作」.mp4"
rename 8.lej "SnapSave.io-台灣人愛熱炒小火鍋，免費供應白飯冰淇淋，有多大的行銷價值？.mp4"
rename 9.lej "SnapSave.io-大馬最快2026躋身高收入國，做對了哪些事，又有哪些挑戰.mp4"
rename 10.lej "SnapSave.io-寫寫字身價飆上億，中國網路小說產業有多龐大，是坑還是仙？.mp4"
rename 11.lej "SnapSave.io-巴黎人口210萬，卻住著600萬隻老鼠，市政府數百年來多次向老鼠宣戰，最終決定共存共好？.mp4"
rename 12.lej "SnapSave.io-摇滚姓党中式官场逻辑，房价稳降百姓断供轻生。中国经济下行年轻人找不到工作，然而官媒却以45度青年嘲讽当代众生想躺躺不下，想卷卷不赢。各地财政赤字公务员下岗，中央收入却增加了（单口相声嘚啵嘚之摇滚姓党）.mp4"
rename 13.lej "SnapSave.io-河南村镇银行卷走400亿迎来宣判，芯片和新能源企业大面积倒闭，高端国产红旗轿车成工业垃圾。.mp4" "
rename 14.lej "SnapSave.io-火遍全日本的「蛙化現象」，察覺心上人也喜歡自己，反而化成噁心青蛙.mp4"
rename 15.lej "SnapSave.io-特大好消息！！！维稳经费严重不足，基层派出所只能找企业要经费，今年下半年有好戏看了。.mp4"
rename 16.lej "SnapSave.io-禁忌史話：李銳日記秘密29｜延安究竟有多少特務？.mp4"
rename 17.lej "SnapSave.io-禁忌史話：李銳日記秘密30｜天下是「小米加步槍」打下的嗎？.mp4"
rename 18.lej "SnapSave.io-禁忌史話：李銳日記秘密31 ｜我給高崗當秘書.mp4"
rename 19.lej "SnapSave.io-科技骨干命丧北京，学伴发起人竟得高升。在一个没有法治的国家，百姓的一举一动皆错，权利未被关进牢笼。中国经济每况愈下，发改委开会不过为了做样子。一个什么样的队伍只关心下三路（单口相声嘚啵嘚之中国无法治）.mp4"
rename 20.lej "SnapSave.io-秦剛持續失蹤、王毅將代替出訪；大瓜捂成大雷！陰謀的總後台抓到了，是他？（文昭談古論今20230719第1280期）.mp4"
rename 21.lej "SnapSave.io-配屬扭蛋惹的禍？日本應屆畢業生超高就業率，背後暗藏快速離職風潮(720p).mp4"
rename 22.lej "SnapSave.io-🌟【經典重溫】禁忌史話：大饑荒 （1）到底死了多少人？.mp4"
rename 23.lej "SnapSave.io-🌟【經典重溫】禁忌史話：大饑荒 （2）七分人禍是哪些禍.mp4"