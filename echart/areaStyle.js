// https://echarts.apache.org/zh/option.html#series-line.areaStyle
// https://echarts.apache.org/examples/zh/editor.html?c=area-basic
var data = [820, 932, 901, -934, 1290, 1330, 1320];
var max = -1e10,min = 1e10;
data.forEach(d => {
    max = max > d ? max : d;
    min = min > d ? d : min;
});
var zero = Math.abs(max / (max - min));
option = {
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: data,
        type: 'line',
        areaStyle: {
            color:{
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0, color: 'red' // 0% 处的颜色
                },{
                    offset: zero, color: 'red' // 0% 处的颜色
                }, {
                    offset: zero, color: 'blue' // 0% 处的颜色
                },{
                    offset: 1, color: 'blue' // 100% 处的颜色
                }],
                global: false // 缺省为 false
            }
        },
        color: 'white'
    }]
};

