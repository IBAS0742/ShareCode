const path = require('path');
const electron = require('electron');
const { app, BrowserWindow,protocol } = electron;
const inj = require('./inj.json');

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: false,            
            nodeIntegration: true,              // 启用 nodejs
            nodeIntegrationInWorker: true,      // 启用 nodejs
            nodeIntegrationInSubFrames: true,   // 启用 nodejs 在 iframe 中的使用
            javascript: true,                   // 启用 js
            webviewTag: true,                   // 启用 webview 标签
            // 预加载
            preload: path.join(__dirname, 'fixJQuery.js')   // 启用 nodejs 会影响到 jQuery 的使用
        }
    })

    win.loadURL("https://wuemoca.geo.uni-halle.de/app/"); // 打开某一个网页
    // win.webContents.on("did-finish-load", function() {
    //     // 和油猴一样（注入代码）
    //     win.webContents.executeJavaScript(`
    // // 自动跳过对话
    // setInterval(() => {
    //     let inps = document.getElementsByTagName('input');
    //     for (let i = 0;i < inps.length;i++) {
    //         inps[i].type = 'password';
    //     }
    //     let clayer = document.getElementsByClassName('gal-stage__clicklayer')[0];
    //     if (clayer) clayer.click();
    // },100);`);
    // });
    // protocol.interceptBufferProtocol("http", (request, result) => {
    //     console.log(`url = ${request.url}`);
    //     if (request.url === "https://webstatic.mihoyo.com/ys/event/e20210713warm/vendors.df8a2c1783.js") {
    //         return result(fs.readFileSync('./inj/vendors.f8411819d8.js'),'utf-8');
    //     }
    //     // ... // fetch other http protocol content and return to the electron
    // });

    const ses = win.webContents.session;
    ses.webRequest.onBeforeRequest({urls:['*://*/*']},
        function (details, callback) {
            let ind = -1;
            for (let i = 0;i < inj.length;i++) {
                if (details.url === inj[i].target) {
                    ind = i;
                    break;
                }
            }
            if (ind !== -1) {
                console.log('redirect');
                callback({
                    redirectURL: inj[ind].replace
                });
            } else {
                callback({});
            }
        });
}

app.whenReady().then(() => {
    createWindow()
})