# 播放视频添加快捷键

![](./bilibili_1.jpg)

```js
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/video/*
// @icon         https://www.google.com/s2/favicons?domain=bilibili.com
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
        },
        setSpeedStory(speed) {
            localStorage.setItem('my_speed',speed);
        },
        getSpeed() {
            return localStorage.getItem('my_speed') || '2.0x';
        }
    };
    // 不停的尝试
    let tryAndTryFns = [];
    function tryAndTry() {
        setInterval(() => {
            tryAndTryFns.forEach(f => f());
        },500);
    }
    let changeActive = speed => {
        let speedList = document.getElementsByClassName('bilibili-player-video-btn-speed-menu-list');
        let btn = speedList[0].parentElement.parentElement.parentElement.children[0];
        for (let i = 0;i < speedList.length;i++) {
            let _speed = speedList[i].innerHTML;
            if (speedList[i].classList.contains('bilibili-player-active')) {
                speedList[i].classList.remove('bilibili-player-active');
            }
            if (_speed === speed) {
                speedList[i].classList.add('bilibili-player-active');
            }
        }
        btn.innerHTML = speed;
        utils.setSpeedStory(speed);
    }
    function addOtherSpeed() {
        let speedList = document.getElementsByClassName('bilibili-player-video-btn-speed-menu-list')[0].parentElement;
        if (speedList.getAttribute('set') === 'true') {
            return ;
        }
        speedList.setAttribute('set','true');
        let getLi = speed => {
            let li25 = document.createElement('li');
            li25.classList.add('bilibili-player-video-btn-speed-menu-list');
            li25.innerHTML = speed;
            li25.onclick = function () {
                let v = document.getElementsByTagName('video');
                if (v.length) {
                    v = v[0];
                } else {
                    v = document.getElementsByTagName('bwp-video')[0];
                }
                v.playbackRate = parseFloat(speed);
                //changeActive(speed);
            }
            return li25;
        };
        speedList.append(getLi('2.5x'));
        speedList.append(getLi('3x'));
        speedList.append(getLi('0.25x'));
        speedList = document.getElementsByClassName('bilibili-player-video-btn-speed-menu-list');
        for (let i = 0;i < speedList.length;i++) {
            let _onclick = speedList[i].onclick;
            let _click = speedList[i].click;
            speedList[i].onclick = function () {
                if (_click) _click.bind(this)();
                if (_onclick) _onclick.bind(this)();
                changeActive(this.innerHTML);
            }
        }
        return ``
    }
    function fullScreenAndDoubleTime() {
        if (utils.isContainOneElementClassNameIs('ibas-fullScreenAndDoubleTime')) {
            return;
        }
        var d = document.createElement('div');
        d.classList.add('bilibili-player-video-time');
        d.innerHTML += `<div class="bilibili-player-video-time-wrap ibas-fullScreenAndDoubleTime" speed="${utils.getSpeed()}">
                    <span class="bilibili-player-video-time-now">全屏+${utils.getSpeed()}倍</span>
                </div>`;
        addOtherSpeed();
        var control = document.getElementsByClassName('bilibili-player-video-control-bottom')[0].children[0].append(d);
        d.children[0].onclick = function () {
            let speed = this.getAttribute('speed');
            let speeds = document.getElementsByClassName('bilibili-player-video-btn-speed-menu-list');
            for (let i = 0;i < speeds.length;i++) {
                if (speeds[i].innerHTML === speed) {
                    speeds[i].click();
                }
            }
            document.getElementsByClassName('bilibili-player-iconfont-web-fullscreen-off')[0].click();
        };
    }
    setTimeout(() => {
        tryAndTryFns.push(fullScreenAndDoubleTime);
        tryAndTry();
    },2000);
    // Your code here...
})();

```