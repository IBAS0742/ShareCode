// 代码运行在财富页面任何位置均可 http://fund.eastmoney.com/fund.html
/**
CREATE TABLE `touzilicai`.`jijin`  (
  `id` int(10) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `buy` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sell` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cut_rate` varchar(10) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;
 */
var page = 1;
var sqls = [];
function next() {
    console.log(`current page is ${page}`);
	fetch(`http://fund.eastmoney.com/Data/Fund_JJJZ_Data.aspx?t=1&lx=1&letter=&gsid=&text=&sort=zdf,desc&page=${page},200&dt=1612273845016&atfc=&onlySale=0`).then(_ => _.text()).then(_ => {
		eval('window.' + _.substring(4));
		setTimeout(() => {
            window.db.datas.forEach(f => {
			    sqls.push(`insert into jijin(code,name,buy,sell,cut_rate) values('${f[0]}','${f[1]}','${f[9]}','${f[10]}','${f[17]}');`);
            });
            page++;
            if (page === 55) {
                console.log('over');
                // 该函数在 “前端常用代码片段\数据转文件下载.js” 中
                funDownload(sqls.join('\r\n'),'insert.sql');
            } else {
                setTimeout(next,1000);
            }
        },200);
	});
};
next();