option = {
    dataset: [{
        source: [
            [1, 20],
            [2, 80],
            [3, 120],
            [4, 710],
            [5, 896],
            [6, 100],
            [7, 196],
        ]
    }, {
        source: [
            [1, 486],
            [2, 529],
            [3, 593],
            [4, 717],
            [5, 896],
            [6, 102],
            [7, 119],
        ]
    }],
    title: {
        text: '1981 - 1998 gross domestic product GDP (trillion yuan)',
        subtext: 'By ecStat.regression',
        sublink: 'https://github.com/ecomfe/echarts-stat',
        left: 'center'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    xAxis: {
        splitLine: {
            lineStyle: {
                type: 'dashed'
            }
        }
    },
    yAxis: {
        splitLine: {
            lineStyle: {
                type: 'dashed'
            }
        }
    },
    series: [{
        name: 'scatter',
        type: 'scatter',
        datasetIndex: 0
    },{
        name: 'line',
        type: 'line',
        smooth: true,
        datasetIndex: 1,
        symbolSize: 0.1,
        symbol: 'circle',
        labelLayout: { dx: -20 },
        encode: { label: 2, tooltip: 1 }
    }]
};