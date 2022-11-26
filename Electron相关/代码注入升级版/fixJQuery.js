window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

// 下面部分和 jQuery 是无关的，顺便在注入部分添加一些好用的脚本吧
window.fs = window.nodeRequire('fs');
window.path = window.nodeRequire('path');
window.basePath = 'D:\\Temp\\20210727_save';    // 定义默认的文件保存路径
window.createPathIsNotExist = fullPath => {     // 判断文件夹是否存在，不存在则创建
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath);
    }
};
/**
 * 保存 blob 文件
 * @param blobData  文件内容
 * @param filename  文件名
 * @param savePath  保存路径
 * @param callback  (msg,error)
 */
window.saveBlobToFile = (blobData,filename,savePath,callback) => {
    callback = callback || (() => {});
    var buf = new Buffer(blobData, 'base64'); // decode
    fs.writeFile(window.path.join(savePath || window.basePath,filename), buf, function(err) {
        if(err) {
            callback("err", err);
        } else {
            callback('ok',null);
        }
    });
}

/*
// 示例
function example_saveBlobToFile() {
    fetch('http://www.baidu.com').then(_ => _.blob())
    .then(blob => {
        let savePath = "d:\\Temp\\20210727";
        window.createPathIsNotExist(savePath);
        saveBlobToFile(blob,"test.html",savePath,function(msg,err) {
            if (err) {
                console.log(err);
            } else {
                console.log(`保存成功`);
            }
        });
    })
}
*/