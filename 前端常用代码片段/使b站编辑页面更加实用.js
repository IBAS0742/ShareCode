// ==UserScript==
// @name         美化B站文件编辑
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       IBAS
// @match        https://member.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (location.pathname.startsWith('/platform/upload/text/edit')) {
        var a = document.createElement('A');
        a.innerHTML = "<i class='bcc-iconfont'></i>编辑模式";
        a.classList.add('main-site');
        a.style.marginLeft = '20px';
        a.onclick = function() {
            var ccbody = document.getElementById('cc-body');
            ccbody.style.paddingBottom = 0;
            ccbody.style.margin = 0;
            ccbody.style.zIndex = 10;
            var uploadWrap = ccbody.getElementsByClassName('upload-wrap')[0];
            uploadWrap.style.margin = 0;
            uploadWrap.style.width = 'unset';
            uploadWrap.style.overflow = 'hidden';
            ccbody.style.minWidth = 'unset';
            document.body.style.minWidth = 'unset';
        };
        var id1 = setInterval(function() {
            var div = document.getElementsByClassName('left-block')[0];
            if (div) {
                div.appendChild(a);
                clearInterval(id1);
            }
        },1000);
    } else if (location.pathname.startsWith('/article-text/home')) {
        var id2 = setInterval(function(){
            var app = document.getElementsByClassName('contet-wrap')[0];
            if (app) {
                app.style.width = "90%";
                clearInterval(id2);
            }
        },1000);
    }
})();