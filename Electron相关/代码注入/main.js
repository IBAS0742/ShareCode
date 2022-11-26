const electron = require('electron');
const { app, BrowserWindow,protocol } = electron;
const inj = require('./inj.json');

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            webSecurity: false
        }
    })

    win.loadURL("https://webstatic.mihoyo.com/ys/event/e20210713warm/index.html?bbs_auth_required=true&bbs_presentation_style=fullscreen&bbs_landscape=true&lang=zh-cn&device_type=pc&ext=%7b%22loc%22%3a%7b%22x%22%3a395.3184509277344%2c%22y%22%3a122.3721923828125%2c%22z%22%3a-410.13067626953127%7d%2c%22platform%22%3a%22WinST%22%7d&game_version=CNRELWin1.6.0_R3557509_S3266913_D3526661")
    win.webContents.on("did-finish-load", function() {
        // 和油猴一样
        win.webContents.executeJavaScript(`
    // 自动跳过对话
    setInterval(() => {
        let inps = document.getElementsByTagName('input');
        for (let i = 0;i < inps.length;i++) {
            inps[i].type = 'password';
        }
        let clayer = document.getElementsByClassName('gal-stage__clicklayer')[0];
        if (clayer) clayer.click();
    },100);`);
    });
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