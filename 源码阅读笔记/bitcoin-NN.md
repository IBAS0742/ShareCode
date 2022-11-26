[比特币价格预测](https://github.com/Wihann77/Bitcoin-NN/blob/main/Bitcoin_NN.ipynb)

```[一]``` 获取比特币价格表，格式如下

| datetime | open | high | low | close | volume |
|--|--|--|--|--|--|
| 时间 | 开盘价格 | 最高价格 | 最低价格 | 收盘价格 | 交易量 |

```[二]``` 追加字段 Percentage_change ，格式如下

| datetime | open | high | low | close | volume | Percentage_change |
|--|--|--|--|--|--|--|
| 时间 | 开盘价格 | 最高价格 | 最低价格 | 收盘价格 | 交易量 | 环比增长 |

Percentage_change = (前一项[close] - 当前项[close]) / 前一项[close]

因此 数据的第一个项 没有 ```环比增长``` 的数值

```[三]``` 追加字段 Price_change 和 Momentum 格式如下 

| datetime | open | high | low | close | volume | Percentage_change | Price_change | Momentum |
|--|--|--|--|--|--|--|--|--|
| 时间 | 开盘价格 | 最高价格 | 最低价格 | 收盘价格 | 交易量 | 环比增长 | 价格变化值 | 累计变化 |

Price_change = open - close

Momentum ：
>   当前项[Price_change] 与 前一项[Price_change] 相同 ？
>>  (相同) 当前项[Momentum] = 前一项[Momentum] + (当前项[Price_change] 为 正 ？ 1 ： -1)

>>  (不同) 当前项[Momentum] = (当前项[Price_change] 为 正 ？ 1 ： -1)

>   首项[Momentum] = 首项[Price_change] 为 正 ？ 1 ： -1

```[四]``` 计算 close 字段的 rsi

这里用到了 [加权指数 python-ewm](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.ewm.html) [rsi指标](https://baike.baidu.com/item/RSI%E6%8C%87%E6%A0%87/7459334?fr=aladdin)

这里的 computerRSI 公式计算代码如下

```python
DataFrame.ewm(com=None, span=None, halflife=None, alpha=None, min_periods=0, adjust=True, ignore_na=False, axis=0, times=None)
com、span、halflife、alpha 可以任选其中一种用于指定 α
min_periods 用于指定最小的加权步长，如果设置为2，则第一项为 na，设置为3，则前两项为 na
```

ewm_mean 算法，用 js 实现大概如下

```js
Array.prototype.ewmMean = function(alpha) {
	let up = 0;
	let down = 0;
	let len = this.length - 1;
	this.forEach((n,ind) => {
		let r = ((1 - alpha) ** len);
		n = parseInt(n);
		if (!isNaN(n)) {
			up += n * r;
			down += r;
		}
		len--;
	});
	return up / down;
}
[0,1,2,'',4].ewmMean(2/3);
// 相当于python的
// df = pd.DataFrame({'B': [0, 1, 2, np.nan, 4]})
// df.ewm(alpha=2/3)
// df.ewm(com=0.5)
```

代码中的 rsi 算法大致如下

```
close = [1,3,1,5,4,2]
diff = [3 - 1,1 - 3,5 - 1,4 - 5,2 - 4]
     = [2,-2,4,-1,-2]
up_chg = [2,0,4,0,0]
down_chg = [0,-2,0,-1,-2]
up_chg_avg = up_chg.ewm(com=t-1,min_periods=t).mean();
down_chg_avg = down_chg.ewm(com=t-1,min_periods=t).mean();

rsi = 100 - 100 / (1 + abs(up_chg_avg / down_chg_avg))
```

其中，代码中的 ```data.diff(1).dropna()``` 使数据减少一行，```min_periods``` 使数据减少四行，因此计算完 rsi 之后少了 5 行数据

```[五]``` 构建神经网络