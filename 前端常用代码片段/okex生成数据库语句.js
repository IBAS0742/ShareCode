var sqls = [];
var d = new Date();
jQuery('table.comb-table > tbody > tr').each((ind,tr) => {
	let tds = jQuery(tr).find('td');
	if (tds[8].innerText == "完全成交") {
		let _d = tds[0].innerText;
		d.setFullYear(+_d.substring(0,4));
		d.setMonth(+_d.substring(5,7) - 1);
		d.setDate(+_d.substring(8,10));
		d.setHours(+_d.substring(11,13));
		d.setMinutes(+_d.substring(14,16));
		d.setSeconds(+_d.substring(17,20));
		d.setMilliseconds(0);
		
		sqls.push(`INSERT INTO recording(id,label,content_1,content_2,content_3) 
		VALUES ('00000000-${d.getTime()}', 'okex', '${tds[4].innerText.split(' ')[0].replace(/,/g,'')}', '${tds[3].innerText === "卖出" ? 'sellout' : 'buyin'}', 'robot_${d.getTime()}');`);
	}
});
sqls.join('\r\n');