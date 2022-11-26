

```javascript
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://space.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?domain=bilibili.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let exchange = (function(){
        let s = [11, 10, 3, 8, 4, 6];
        let xor = 177451812;
        let add = 8728348608;
        let table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
        let tr = {};
        for (let i = 0;i < table.length;i++) {
            tr[table[i]] = i;
        }
        // aid	205999630
        // bvid	"BV1th411e7Fc"
        function bv2av(x) {
            let r = 0;
            for (let i = 0;i < 6;i++) {
                r += tr[x[s[i]]] * 58 ** i
            }
            return (r - add) ^ xor
        }
        return {
            bv2av
        }
    })();
    function addAll() {
        var lis = document.getElementsByClassName('small-item fakeDanmu-item');
        lis.forEach(li => {
            let bvid = li.getAttribute('data-aid');

            fetch('https://api.bilibili.com/x/v2/history/toview/add',{
                method: 'post',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `jsonp=jsonp&csrf=${getCookie('bili_jct')}&aid=${exchange.bv2av(bvid)}`,
            })
        });
    };
    let id = setInterval(() => {
        let left = document.getElementsByClassName('page-head__left');
        if (left && left.length) {
            left[0].innerHTML += `<span id='playAfter' href='javascript:void(0);' style='width:140px;' class="play-all-btn"><i class="iconfont video-commonplayer_play"></i>
          全部添加到稍后观看
        </span>`;
            document.getElementById('playAfter').onclick = addAll;
            clearInterval(id);
        }
    },100);
    // console.log(exchange.bv2av('BV1th411e7Fc'))
    // Your code here...
})();
```