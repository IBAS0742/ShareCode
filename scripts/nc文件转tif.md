# NC 文件转 TIF 文件

- matlab 方法  [r.mat](./r.mat)

```matlab
clc;                                    %清除命令行窗口
clear;                                  %清除工作区
load('r');                              %载入我的r文件，因为matlab重建的R无法正常使用，也可能是我matlab的问题
filename='pre_1910_1912.nc';            %文件名

%% 提取变量
lon = ncread(filename,'lon')';           %读取经度范围和精度
lat = ncread(filename,'lat');            %读取纬度范围和精度
time = length(ncread(filename,'time'));  %读取时间序列长度

data = ncread(filename,'pre');           %提取变量（根据 nc 文件内容而定，可以用 hdfviewer 查看）

data = fliplr(rot90(data,-1));           %逆时针 90 度 和 左右 翻转，使得图片摆正位置，大部分 nc 文件是这个样子
data = data(:,:,1);                      %为方便，本例只绘制第一层的数据

%% 绘图
%R = georasterref('RasterSize', size(data),'Latlim', [double(min(lat))...
    %double(max(lat))], 'Lonlim', [double(min(lon)) double(max(lon))]); ...
    %不需要改动，关于georasterref函数，请查看官网介绍 （我创建的R有问题，但是不知道为什么）
r.RasterSize = size(data);
r.LatitudeLimits = [double(min(lat)) double(max(lat))];
r.LongitudeLimits = [double(min(lon)) double(max(lon))];
geotiffwrite(['out.tif'],data,r);     %保存绘制的地理栅格图像
```

- R 语言的方法 需要安装 raster 包

```r
library('raster');
r0 <- raster('C:\\Users\\IBAS\\Downloads\\pre_1910_1912.nc',varname='pre');
writeRaster(stack(r0),'C:\\Users\\IBAS\\Downloads\\pre_1910_1912.tif');
```

- [pyton 方法](https://blog.csdn.net/EWBA_GIS_RS_ER/article/details/84076201) 未作测试

- [python 方法](https://www.jianshu.com/p/50868ea0fc25) 未作测试

- [c/c++、java、python、matlab、perl、idl 方法](https://www.unidata.ucar.edu/software/netcdf/examples/programs/)