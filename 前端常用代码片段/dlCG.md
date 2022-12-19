
```javascript
funDownload = function (content, filename) {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
};
tpl = (url,ind) => `D:\\application\\ffmpeg-2020-09-30-git-9d8f9b2e40-full_build\\bin\\ffmpeg -i ${url} -c copy -bsf:a aac_adtstoasc ${ind}.mp4`
txt = Array.from(document.getElementsByClassName('dplayer-no-danmaku')).map((d,ind) => {
    return tpl(JSON.parse(vid[0].getAttribute('data-config')).video.url,ind + 43);
}).join('\r\n');
funDownload(txt,'a.txt')
```
