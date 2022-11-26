// ==UserScript==
// @name         CSDN 复制代码
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://blog.csdn.net/*
// @icon         https://www.google.com/s2/favicons?domain=csdn.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setInterval(() => {
        $('#article_content pre').each((ind,pre) => {
            $(pre).replaceWith(`<textarea style="width:100%;height: ${pre.offsetHeight}px;">${$(pre).find('code')[0].innerText}</textarea>`);
        });
    },1000);
    // Your code here...
})();