
// Function to populate the sidebar
function populateSidebar() {
    window.echart = echarts.init(document.getElementById('echartDom'));
    const sidebar = document.getElementById('sidebar');

    apis.getDeviceInfo().then((data) => {
        data.forEach((item) => {
            const div = document.createElement('div');
            div.textContent = item.name + " " + item.createTime;
            div.onclick = function() {
                menuItemClick(item);
            }
            sidebar.appendChild(div);
        });
    });
}

var menuItemClick = function (item) {
    console.log(item);
    let option = {
        title: {
            text: item.name,
            subtext: `id=[${item.createTime}]\t${item.createTime}`,
        },
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                start: 0,
                end: 100
            }
        ],
        xAxis: {
            type: 'category',
            data: []
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [],
                type: 'line',
                smooth: true
            }
        ]
    };
    apis.getDataStatusById(item.id).then((statusList) => {
        statusList.forEach((statusItem) => {
            let ret = getFlag.decode(statusItem);
            option.xAxis.data = option.xAxis.data.concat(ret.time);
            option.series[0].data = option.series[0].data.concat(ret.list);
        });
        console.log(option);
        window.echart.setOption(option);
        setTimeout(() => {
            window.echart.resize();
        },200);
    });
}

// Call the function on page load
window.onload = populateSidebar;
