#include "ShpToRaster.h"

/**
ShpToRaster.h 头文件中的内容
#ifndef shp_to_raster_h
#define shp_to_raster_h
#include "gdal_priv.h"
#include "gdal_utils.h"
#include "ogrsf_frmts.h"
#include<iostream>
using namespace std;
void shpToRaster(
	char * shpPath,
	char * tifPath,
	char * width,
	char * height,
	char * initVal,
	char * fillVal,
	char * type
);
#endif
*/



#define MyGdalConst_WGS84_ESPS4326 "GEOGCS[\"WGS 84\",DATUM[\"WGS_1984\",SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],AUTHORITY[\"EPSG\",\"6326\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.01745329251994328,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4326\"]]"

/*
width 遥感影像的宽度
height 遥感影像的高度
initVal 初值
fillVal 矢量栅格化的值（例如线条的值）
*/
void shpToRaster(
	char * shpPath,
	char * tifPath,
	char * width,
	char * height,
	char * initVal,
	char * fillVal,
	char * type
) {
	GDALAllRegister();
	// GDALDataset * poDS = (GDALDataset*)GDALOpenEx(shpPath, GDAL_OF_UPDATE, NULL, NULL, NULL);
	GDALDataset * poDS = (GDALDataset*)GDALOpenEx(shpPath, GDAL_OF_VECTOR | GDAL_OF_VERBOSE_ERROR, NULL, NULL, NULL);
	GDALDataset* firstDataset;

	OGRLayer *poLayer;
	if (poDS == NULL)
	{
		printf("Open failed.\n");
		exit(1);
	}
	int err = -1;
	cout << "lay_count = " << poDS->GetLayerCount() << endl;
	OGRLayer * lay = poDS->GetLayer(0);
	char * name = (char *)lay->GetName();
    // 参数请参考这个 https://gdal.org/programs/gdal_rasterize.html
	char * opt[] = {
		"-burn", fillVal,
		"-ts", width, height,
		"-l", name,
		"-init",initVal,
		"-ot", type,
		NULL
	};

	GDALRasterizeOptions *options = GDALRasterizeOptionsNew(opt, NULL);
	GDALDataset* hRetDS = (GDALDataset*)GDALRasterize(tifPath, NULL, poDS, options, &err);
	GDALClose(hRetDS);
	GDALRasterizeOptionsFree(options);
	firstDataset = (GDALDataset*)GDALOpen(tifPath, GA_Update);
	firstDataset->SetProjection(MyGdalConst_WGS84_ESPS4326);
	GDALClose(firstDataset);
	GDALClose(poDS);
	GDALDestroyDriverManager();
}

/**
使用方法
#include "gdal_priv.h"
#include <string>
#include<iostream>
#include <stdlib.h>
#include "ShpToRaster.h"

int main() {
    // 注释部分是添加 gdal 的 data 文件到环境变量中，如果已经将 data 设置到 gdal 文件中则没必要
    //char cwd[1024];
	//char env[1024];
	//getcwd(cwd,1024);
	//sprintf(env, "GDAL_DATA=%s\\data", cwd);
	//cout << env << endl;
	//putenv(env);
    shpToRaster("c:\\xxx\\a.shp","c:\\xxx\\a.tif","100","100","0","1","Int16");
    return 0;
}
*/