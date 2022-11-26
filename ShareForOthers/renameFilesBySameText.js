/*
# 这是一个例子
echo test01 > a.txt
echo. > a.mp3
echo test02 > b.txt
echo. > b.mp3
echo test03 > c.txt
echo. > c.mp3
*/
const fs = require('fs');
// 这里需要用 \\ 而不是 \ ，也可以考虑用 /
const mp3Path = "I:\\tmp\\新建文件夹 (53)\\";
const txtPath = "I:\\tmp\\新建文件夹 (53)\\闪电文字语音转换软件\\";

const Adder = new class {
	constructor() {
		this.files = {
			//name: 2
		};
	}
	
	add(file) {
		let ext = file.substring(file.length - 4);
		let name = file.substring(0,file.length - 4);
        // 这里是读取 .txt 中的内容到 .mp3 要求存在两个文件同名不同后缀
		if (ext === ".mp3" || ext === ".txt") {
			if (name in this.files) {
				this.files[name] = 2;
			} else {
				this.files[name] = 1;
			}
		}
	}
	
	run() {
		for (let i in this.files) {
			if (this.files[i] === 2) {
                // 读取文件内容
				let name = fs.readFileSync(txtPath + i + '.txt','utf16le').trim();
                // 重命名
				if (name) {
					fs.renameSync(mp3Path + i + ".mp3",mp3Path + name + '.mp3');
				}
			}
		}
	}
}

fs.readdirSync(mp3Path).forEach(Adder.add.bind(Adder));
fs.readdirSync(txtPath).forEach(Adder.add.bind(Adder));
console.log(mp3Path);
console.log(txtPath);
console.log(Adder);
Adder.run();
