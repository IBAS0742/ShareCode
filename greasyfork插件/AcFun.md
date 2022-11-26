# acfun

```js
// ==UserScript==
// @name         AcFun 视频播放
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.acfun.cn/v/*
// @icon         https://www.google.com/s2/favicons?domain=acfun.cn
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
     const utils = {
        isContainOneElementClassNameIs(className) {
            let fsadt = document.getElementsByClassName(className);
            if (fsadt.length) {
                return true;
            } else {
                return false;
            }
        }
    };
    // 不停的尝试
    let tryAndTryFns = [];
    function tryAndTry() {
        setInterval(() => {
            tryAndTryFns.forEach(f => f());
        },500);
    }
    function fullScreenAndDoubleTime() {
        if (utils.isContainOneElementClassNameIs('sp')) {
            return;
        }
        let speed = {
            sp1: 0.5,sp2: 1,sp3: 1.5,sp4: 2
        };
        let ra = document.getElementsByClassName('right-area')[0];
        ra.innerHTML = `<div class="banana sp" tar="sp1"><span class="icon"></span> X0.5</div>`;
        ra.innerHTML += `<div class="banana sp" tar="sp2"><span class="icon"></span> X1</div>`;
        ra.innerHTML += `<div class="banana sp" tar="sp3"><span class="icon"></span> X1.5</div>`;
        ra.innerHTML += `<div class="banana sp" tar="sp4"><span class="icon"></span> X2</div>`;

        ra.innerHTML += `<div class="collection mute"><span class="icon"></span>静音</div>`
        ra.innerHTML += `<div class="collection toplay" style="padding: 0 20px;"><span>⏸</span></div>`
        ra.innerHTML += `<div class="collection full" style="padding: 0 20px;"><span class="icon">全屏</span></div>`

        let sps = ra.getElementsByClassName('sp');
        let spsArr = [];
        for (let i = 0;i < sps.length;i++) {
            spsArr.push(sps[i]);
        }
        spsArr.forEach(sp => {
            sp.onclick = function() {
                spsArr.forEach(_sp => _sp.children[0].style.backgroundImage = `url(//ali-imgs.acfun.cn/kos/nlav10360/static/newVideo/widget/bread/img/icon_banana.d21040881e9721eb1fc8.svg)`);
                let vid = document.querySelector('#main video');
                vid.playbackRate = speed[this.getAttribute('tar')];
                this.children[0].style.backgroundImage = `url(//ali-imgs.acfun.cn/kos/nlav10360/static/newVideo/widget/bread/img/icon_banana_hover.31b7f8940e072833fa9c.svg)`;
                // this.children[0].style.backgroundImage = `url(//ali-imgs.acfun.cn/kos/nlav10360/static/newVideo/widget/bread/img/icon_banana.d21040881e9721eb1fc8.svg)`;
            };
        })
        ra.getElementsByClassName('mute')[0].onclick = function() {
            let vid = document.querySelector('#main video');
            vid.muted = !vid.muted;
            if (vid.muted) {
                this.children[0].style.backgroundImage = `url(//ali-imgs.acfun.cn/kos/nlav10360/static/newVideo/widget/bread/img/icon_follow_hover.c96c3455cd5ebe98a14d.svg)`;
            } else {
                this.children[0].style.backgroundImage = `url(//ali-imgs.acfun.cn/kos/nlav10360/static/newVideo/widget/bread/img/icon_follow.67c57d40c135d9f5036d.svg)`;
            }
        }
        let togglePlay = () => {
            let vid = document.querySelector('#main video');
            let $this = ra.getElementsByClassName('toplay')[0];
            if (vid.paused) {
                $this.innerHTML = "<span>⏸</span>";
                vid.play();
            } else {
                vid.pause();
                $this.innerHTML = "<span>▶</span>";
            }
        };
        ra.getElementsByClassName('toplay')[0].onclick = function() {
            togglePlay();
        }
        ra.getElementsByClassName('full')[0].onclick = function() {
            let vid = document.querySelector('#main video');
            vid.style.position = 'fixed';
            vid.style.left = 0;
            vid.style.top = 0;
            vid.style.width = '100vw';
            vid.style.height = '100vh';
            vid.style.zIndex = 100;
        }
        let fullScreen = false;
        document.body.onkeypress = function(e) {
            let vid = document.querySelector('#main video');
            if (e.key === 'f' || e.key === 'F') {
                fullScreen = !fullScreen;
                if (fullScreen) {
                    vid.style.position = 'fixed';
                    vid.style.left = 0;
                    vid.style.top = 0;
                    vid.style.width = '100vw';
                    vid.style.height = '100vh';
                    vid.style.zIndex = 100;
                    document.body.style.overflow = 'hidden';
                } else {
                    vid.style.position = 'relative';
                    vid.style.left = 'unset';
                    vid.style.top = 'unset';
                    vid.style.width = '100%';
                    vid.style.height = 'calc(100% - 40px)';
                    vid.style.zIndex = 'unset';
                    document.body.style.overflow = '';
                }
            } if (e.key === '1') {
                // vid.playbackRate = 0.5;
                spsArr[0].onclick();
            } else if (e.key === '2') {
                // vid.playbackRate = 1;
                spsArr[1].onclick();
            } else if (e.key === '3') {
                // vid.playbackRate = 1.5;
                spsArr[2].onclick();
            } else if (e.key === '4') {
                // vid.playbackRate = 2;
                spsArr[3].onclick();
            } else if (e.code === "Space") {
                togglePlay();
            } else if (e.key === 'a' || e.key === 'A') {
                vid.currentTime -= 5;
            } else if (e.key === 'd' || e.key === 'D') {
                vid.currentTime += 5;
            }
        }
        let id = setInterval(() => {
            let vid = document.querySelector('#main video');
            if (vid.readyState == 4) {
                clearInterval(id);
                if (vid.muted) {
                    vid.muted = false;
                }
                setTimeout(() => {
                    vid.play();
                },500);
            }
        },500);
        let mutedId = setInterval(() => {
            let vid = document.querySelector('#main video');
            if (vid.muted) {
                vid.muted = false;
            } else {
                vid.play();
                clearInterval(mutedId);
            }
        },500);
    }
    setTimeout(() => {
        tryAndTryFns.push(fullScreenAndDoubleTime);
        tryAndTry();
    },2000);
})();
```