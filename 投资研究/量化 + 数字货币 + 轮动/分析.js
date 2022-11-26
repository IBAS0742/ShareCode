const datas = {
	btc: require('./btcusdt.json'),
	eth: require('./ethusdt.json'),
	// doge: require('./dogeusdt.json'),
	// theta: require('./thetausdt.json')
};
const fs = require('fs');

// let detaDay = 4
let len = datas.btc.length;

let allMoney = {
	usdt: {
		num: 1,
		price: 1
	}
};
let earn = {
	// usdt: {
	//		earn: 0,
	//		good: 0,
	//		bad: 0
	// }
};

let juece1 = rate => {
	let max = -1e10;
	let maxName = null;
	let names = [];
	for (let i in rate) {
		names.push(i);
		if (max < rate[i].rate) {
			max = rate[i].rate;
			maxName = i;
		}
	}
	if (max > 0) {
		let ind = names.indexOf(maxName);
		names.splice(ind,1);
	}
	for (let ind in names) {
		let i = names[ind];
		if (i !== 'usdt' && i in allMoney) {
			allMoney.usdt.num += allMoney[i].num * rate[i].lastPrice * (1 - 0.0004);
			// console.log(`卖出 ${i} 量为 ${allMoney[i]}`);
			if (!(i in earn)) {
				earn[i] = {
					earn: 0,
					good: 0,
					bad: 0
				};
			}
			let deta = (rate[i].lastPrice - allMoney[i].price) * allMoney[i].num;
			earn[i].earn += deta;
			earn[i][deta > 0 ? "good":"bad"]++;
			delete allMoney[i];
		}
	}
	if (max > 0) {
		if (!(maxName in allMoney)) {
			allMoney[maxName] = {
				num: allMoney.usdt.num / rate[maxName].lastPrice * (1 - 0.0004),
				price: rate[maxName].lastPrice
			};
			allMoney.usdt.num = 0;
		}
		// console.log(`买入 ${maxName}`);
	}
};

let juece2 = rate => {
	let max = 1e10;
	let maxName = null;
	let names = [];
	for (let i in rate) {
		names.push(i);
		if (max > rate[i].rate) {
			max = rate[i].rate;
			maxName = i;
		}
	}
	if (max < 0) {
		let ind = names.indexOf(maxName);
		names.splice(ind,1);
	}
	for (let ind in names) {
		let i = names[ind];
		if (i !== 'usdt' && i in allMoney) {
			allMoney.usdt.num += allMoney[i].num * rate[i].lastPrice * (1 - 0.0004);
			// console.log(`卖出 ${i} 量为 ${allMoney[i]}`);
			if (!(i in earn)) {
				earn[i] = {
					earn: 0,
					good: 0,
					bad: 0
				};
			}
			let deta = (rate[i].lastPrice - allMoney[i].price) * allMoney[i].num;
			earn[i].earn += deta;
			earn[i][deta > 0 ? "good":"bad"]++;
			delete allMoney[i];
		}
	}
	if (max > 0) {
		if (!(maxName in allMoney)) {
			allMoney[maxName] = {
				num: allMoney.usdt.num / rate[maxName].lastPrice * (1 - 0.0004),
				price: rate[maxName].lastPrice
			};
			allMoney.usdt.num = 0;
		}
		// console.log(`买入 ${maxName}`);
	}
};

let rate = {};
function calc(detaDay) {
	allMoney = {
		usdt: {
			num: 1,
			price: 1
		}
	};
	earn = {};
	for (let i = detaDay;i < len;i++) {
		rate = {};
		for (let name in datas) {
			rate[name] = {
				rate: datas[name][i][4] / datas[name][i - detaDay][1] - 1,
				lastPrice: + datas[name][i][4]
			};
		}
		juece1(rate);
	}

	let toUsdt = 0;
	rate.usdt = {lastPrice:1};
	for (let i in allMoney) {
		toUsdt += allMoney[i].num * allMoney[i].price;
	}
	// console.log(JSON.stringify(allMoney,'','\t'));
	// console.log(`全部转换为 usdt 值为 ${toUsdt}`);
	// console.log(`资产变化百分比 : ${(toUsdt - 1) * 100}`);
	return {
		allMoney,
		earn,
		toUsdt,
		persent: (toUsdt - 1) * 100
	}
}

let coinName = [];
let persents = [["ind","persent"]];
for (let i in datas) {
	coinName.push(i);
	persents[0].push(`${i}_earn`);
	persents[0].push(`${i}_good`);
	persents[0].push(`${i}_bad`);
}
for (let i = 1;i < 30;i++) {
	let obj = calc(i);
	let data = [i,obj.persent];
	coinName.forEach(cn => {
		data.push(obj.earn[cn].earn);
		data.push(obj.earn[cn].good);
		data.push(obj.earn[cn].bad);
	});
	persents.push(data);
}
fs.writeFileSync("persent.txt",persents.map(_ => _.join(';')).join('\r\n'),'utf-8');

let soloEarn = {};
for (let i in datas) {
	soloEarn[i] = datas[i][datas[i].length - 1][4] / datas[i][0][1];
}
console.log(soloEarn);