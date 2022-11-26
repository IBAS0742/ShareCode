GDAL Grid Create

程序中的 [data 数据](datas/test.txt)和 生成的 [c# shp](datas/test_out.shp) [c# warp tif](datas/test_out.tif) 和 [c tif](datas/test_out.c.tif) 数据在此

- [python](https://gis.stackexchange.com/questions/337009/interpolating-vrt-to-geotiff-using-gdal-grid-in-python-creates-null-image)

- [直接使用GDAL工具包](https://gdal.org/programs/gdal_grid.html#gdal-grid)

- [C# GDAL 工具包解法](https://gis.stackexchange.com/questions/306213/how-to-use-gdal-grid-with-vrt-file-in-c-c)

```cs
// ds 是 shp 点文件
// tiffFile 是 tif 文件路径，或者 GdalOpen 的 Dataset 对象
var ds = Gdal.OpenEx(vrtFile, 0, null, null, null);         
var gridDS =  Gdal.wrapper_GDALGrid(tiffFile, ds, new GDALGridOptions(new string[] {"-of", "gtiff", "-ot", "Float64" }), null, string.Empty);
```

- ❌[C# GDAL DLL 方法](https://github.com/configare/hispeed/blob/730563c6dfa450a4058f669cc8179242e7e63d3f/%E3%80%90%E6%8E%A7%E5%88%B6%E3%80%91UI%E6%A1%86%E6%9E%B6(%E9%80%9A%E7%94%A8)/GeoDo.RSS.UI.AddIn.DataPro/BasicTools/GDALVisitor/GDALAlgorithm.cs)

- [c/c++](https://liminlu.blog.csdn.net/article/details/8138382)

```c
/*

53414.28,31421.88,39.555
53387.8,31425.02,36.8774
53359.06,31426.62,31.225
53348.04,31425.53,27.416
53344.57,31440.31,27.7945
53352.89,31454.84,28.4999
53402.88,31442.45,37.951
53393.47,31393.86,32.5395
53358.85,31387.57,29.426
53358.59,31376.62,29.223
53348.66,31364.21,28.2538
53362.8,31340.89,26.8212
53335.73,31347.62,26.2299
*/
#include "gdal_priv.h"
#include <iostream>
#include "ogrsf_frmts.h"
#include <fstream>
#include "gdal_alg.h"
void GDALGridTest()
{
	const char* filename = "D:\\tmp\\test.txt";
	const char* outputfullname = "d:\\tmp\\test_out.c.tif";

	//计算最大最小值
	double  dfXMin;
	double  dfXMax;
	double  dfYMin;
	double  dfYMax;
	double  dfZMin;
	double  dfZMax;

	GUInt32  nPoints = 126;
	double* padfX = new double[nPoints];
	double* padfY = new double[nPoints];
	double* padfZ = new double[nPoints];

	//将文本文件读入数组并统计出最大最小值
	std::ifstream ifile(filename, ios::in);
	string strBuf;

	int i = 0;
	while (getline(ifile, strBuf))
	{
		// 使用boost库的split拆分字符串
		//split(vStr, strBuf, is_any_of(","), token_compress_on);
		char* chs = new char[strBuf.length() + 1];
		strcpy(chs, strBuf.c_str());
		char * vStr = strtok(chs, ",");
		double tmpX = atof(vStr);
		vStr = strtok(NULL, ",");
		double tmpY = atof(vStr);
		vStr = strtok(NULL, ",");
		double tmpZ = atof(vStr);

		padfX[i] = tmpX;
		padfY[i] = tmpY;
		padfZ[i] = tmpZ;

		if (i == 0)
		{
			dfXMin = tmpX;
			dfXMax = tmpX;
			dfYMin = tmpY;
			dfYMax = tmpY;
			dfZMin = tmpZ;
			dfZMax = tmpZ;
		}

		dfXMin = (tmpX < dfXMin) ? tmpX : dfXMin;
		dfXMax = (tmpX > dfXMax) ? tmpX : dfXMax;
		dfYMin = (tmpY < dfYMin) ? tmpY : dfYMin;
		dfYMax = (tmpY > dfYMax) ? tmpY : dfYMax;
		dfZMin = (tmpZ < dfZMin) ? tmpZ : dfZMin;
		dfZMax = (tmpZ > dfZMax) ? tmpZ : dfZMax;
		i++;
	}

	ifile.close();

	//计算图像大小
	double pixResoultion = 0.5;	//设置分辨率为0.5
	GUInt32 nXSize = (dfXMax - dfXMin) / pixResoultion;
	GUInt32 nYSize = (dfYMax - dfYMin) / pixResoultion;

	GDALAllRegister();

	// 离散点内插方法，使用反距离权重插值法
	GDALGridInverseDistanceToAPowerOptions* poOptions = new GDALGridInverseDistanceToAPowerOptions();
	poOptions->dfPower = 2;
	poOptions->dfRadius1 = 20;
	poOptions->dfRadius2 = 15;

	char* pData = new char[nXSize * nYSize];

	// 离散点内插方法，使用反距离权重插值法。使用其他的插值算法，这里换成其他的，还有下面的GDALGridCreate函数的对应参数
	GDALGridCreate(GGA_InverseDistanceToAPower, poOptions, nPoints, padfX, padfY, padfZ,
		dfXMin, dfXMax, dfYMin, dfYMax, nXSize, nYSize, GDT_Byte, pData, NULL, NULL);

	// 创建输出数据集，格式为GeoTiff格式
	GDALDriver* pDriver = NULL;
	pDriver = GetGDALDriverManager()->GetDriverByName("Gtiff");
	GDALDataset* poDataset = pDriver->Create(outputfullname, nXSize, nYSize, 1, GDT_Byte, NULL);

	// 设置六参数
	double adfGeoTransform[6] = { dfXMin, pixResoultion, 0 , dfYMax, 0, -pixResoultion };
	poDataset->SetGeoTransform(adfGeoTransform);

	// 写入影像
	poDataset->RasterIO(GF_Write, 0, 0, nXSize, nYSize, pData, nXSize, nYSize, GDT_Byte, 1, 0, 0, 0, 0);

	// 释放资源 关闭图像
	delete poOptions;
	delete[]pData;
	GDALClose(poDataset);
	poDataset = NULL;
}
```

