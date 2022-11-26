const fs = require('fs');

const maxLen = 6;
const jobs = 10;
const ton = n => {
    let d = maxLen - n.toString().length;
    for (;d > 0;d--) {
        n = '0' + n;
    }
    return n;
};

const cmds = [];
for (let i = 0;i < jobs;i++) {
    cmds.push([]);
}
const m3u8 = "m3u8.txt";
fs.readFileSync(m3u8,'utf-8').split('\n').filter(l => l.startsWith('http')).forEach((l,ind) => {
    cmds[ind % jobs].push(`wget --no-check-certificate ${l.trim()} -O "${ton(ind)}.ts"`);
});

let names = [];
for (let i = 0;i < jobs;i++) {
    let name = `download${i}.cmd`;
    fs.writeFileSync(name,cmds[i].join('\r\n'),'utf-8');
    names.push(`start ${name}`);
}
fs.writeFileSync(`run.bat`,names.join('\r\n'),'utf-8');