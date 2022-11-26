using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using OSGeo.GDAL;
using OSGeo.OSR;
using OGR = OSGeo.OGR;

namespace GDAL_Tester
{
    public class TestGridCreate
    {
	    // 投影（可能不能适合所有情况）
	    private static string Prj =
		    "GEOGCS[\"WGS 84\",DATUM[\"WGS_1984\",SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],AUTHORITY[\"EPSG\",\"6326\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.01745329251994328,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4326\"]]";

	    /**
	     * 读取文本，并执行处理函数
	     * @param filename 文本中每行有三个浮点数值
	     * @param doNums(double[] nums,int index)
	     *		@param nums 每行的三个数值
	     *		@param index 第几行
	     */
	    static void ReadText(string filename,Action<double[],int> doNums)
	    {
		    #region 读取文本文件
		    char[] splitChart = new char[] { ',' };
		    // 将每一行处理为三个浮点数
		    Func<string,double[]> DearLine = delegate (string line) {
			    string[] numStr = line.Split(splitChart);
			    double[] nums = new double[3];
			    for (int i = 0;i < 3;i++) {
				    // Console.WriteLine(numStr[i]);
				    nums[i] = Double.Parse(numStr[i]);
			    }
			    return nums;

		    };
		    // 读取文本文件
		    //将文本文件读入数组并统计出最大最小值
		    using (StreamReader sr = new StreamReader(filename)) {
			    string line;
			    int lineIndex = 0;
			    double[] nums = new double[3];
			    // 从文件读取并显示行，直到文件的末尾 
			    while ((line = sr.ReadLine()) != null) {
				    if (string.IsNullOrEmpty(line)) {
					    continue;
				    }
				    nums = DearLine(line);
				    doNums(nums,lineIndex);
				    lineIndex++;
			    }
		    }
		    #endregion
	    }

	    static void SaveLine2Shp(string filename,string shp,string fieldName)
	    {
		    #region 创建点类型的矢量 shp 文件，并定义一个 fieldName 存放 z 值
		    OGR.Driver odriver = OGR.Ogr.GetDriverByName("ESRI Shapefile");
		    OGR.DataSource dataSource = odriver.CreateDataSource(shp, null);
		    SpatialReference sr = new SpatialReference(Prj);
		    OGR.Layer lay = dataSource.CreateLayer(
			    "layer",
			    sr,
			    OGR.wkbGeometryType.wkbPoint,
			    null
		    );
		    var pFieldDefn = new OSGeo.OGR.FieldDefn(fieldName, OGR.FieldType.OFTReal);
		    lay.CreateField(pFieldDefn,1);
		    #endregion
		    // 读取文本，并将 nums[0],nums[1] 作为经纬度 nums[3] 作为 z 值写入到 shp 文件中
		    ReadText(filename, (nums, index) =>
		    {
			    OGR.Feature feature = new OGR.Feature(lay.GetLayerDefn());
			    OSGeo.OGR.Geometry geometry = OSGeo.OGR.Geometry.CreateFromWkt("POINT(" + nums[0] + " " + nums[1] + ")");
			    feature.SetGeometry(geometry);
			    feature.SetField(fieldName,nums[2]);
			    lay.CreateFeature(feature);
		    });
		    // 释放文件（必须）
		    dataSource.Dispose();
	    }
	    public static void TestGdalGridWrap()
	    {
		    string fieldName = "fvalue";
		    string filename = @"D:\tmp\test.txt";
		    string outputfullname = @"D:\tmp\test_out.warp.tif";
		    string shpFileName = @"D:\tmp\test_out.shp";
		    SaveLine2Shp(filename, shpFileName, fieldName);
		    var ds = Gdal.OpenEx(shpFileName, 0, null, null, null);
		    // 参数详细见  https://gdal.org/programs/gdal_grid.html
		    var gridDS =  Gdal.wrapper_GDALGrid(outputfullname, ds, new GDALGridOptions(new string[]
		    {
			    "-of", "gtiff", "-ot", "Float64","-zfield",fieldName,
			    "-a", "invdist:power=2.0:radius1=20.0:radius2=15.0" // 
		    }), null, string.Empty);
	    }
        // 获取 double 数组的头指针
        public static IntPtr double2IntPtr(double[] d)
        {
	        IntPtr p = Marshal.AllocCoTaskMem(sizeof(double)*d.Length);
	        Marshal.Copy(d, 0, p, d.Length);
	        return p;
        }
		// https://liminlu.blog.csdn.net/article/details/8138382
		public static unsafe void TestGdalGrid() {

				#region 基础变量
				string filename = @"D:\tmp\test.txt";
				string outputfullname = @"D:\tmp\test_out.tif";

				//计算最大最小值
				double dfXMin = 0;
				double dfXMax = 0;
				double dfYMin = 0;
				double dfYMax = 0;
				double dfZMin = 0;
				double dfZMax = 0;

				UInt32 nPoints = 126;
				double[] padfX = new double[nPoints];
				double[] padfY = new double[nPoints];
				double[] padfZ = new double[nPoints];
				#endregion

				#region 读取文本文件
				ReadText(filename, (nums,lineIndex) =>
				{
					padfX[lineIndex] = nums[0];
					padfY[lineIndex] = nums[1];
					padfZ[lineIndex] = nums[2];
					if (lineIndex == 0) {
						dfXMin = nums[0];
						dfXMax = nums[0];
						dfYMin = nums[1];
						dfYMax = nums[1];
						dfZMin = nums[2];
						dfZMax = nums[2];
					} else {
						dfXMin = dfXMin < nums[0] ? dfXMin : nums[0];
						dfXMax = dfXMax > nums[0] ? dfXMax : nums[0];
						dfYMin = dfYMin < nums[1] ? dfYMin : nums[1];
						dfYMax = dfYMax > nums[1] ? dfYMax : nums[1];
						dfZMin = dfZMin < nums[2] ? dfZMin : nums[2];
						dfZMax = dfZMax > nums[2] ? dfZMax : nums[2];
					}
				});
				#endregion

				#region 基础变量
				//计算图像大小
				double pixResoultion = 0.5; //设置分辨率为0.5
				UInt32 nXSize = (UInt32)((dfXMax - dfXMin) / pixResoultion);
				UInt32 nYSize = (UInt32)((dfYMax - dfYMin) / pixResoultion);
				double[] adfGeoTransform = new double[6] {
					dfXMin, pixResoultion, 0, dfYMax, 0, -pixResoultion
				};
				#endregion

				IntPtr pData = Marshal.AllocHGlobal((int)(nXSize * nYSize) * 16);
				var pointer = pData.ToPointer();
				Int16[] pDataByte = new Int16[(int)(nXSize * nYSize)];
				string parameters = "invdist:power=2.0:radius1=20.0:radius2=15.0";
			
				AddIn.GDALGridCreate(
					AddIn.GDALGridAlgorithm.GGA_InverseDistanceToAPower, 
					Marshal.StringToHGlobalAnsi(parameters),
					nPoints,
					double2IntPtr(padfX),
					double2IntPtr(padfY),
					double2IntPtr(padfZ),
					// padfX, padfY, padfZ,
					dfXMin, dfXMax, dfYMin, dfYMax,
					nXSize, nYSize,
					AddIn.LDataType.L_Int16,pData,
					null,IntPtr.Zero);
				Marshal.Copy(pData, pDataByte, 0, (int)(nXSize * nYSize));
			
				OSGeo.GDAL.Driver driver = Gdal.GetDriverByName("GTiff");
			
				Dataset nds = driver.Create(
					outputfullname,
					(int)nXSize,
					(int)nYSize,
					1,
					DataType.GDT_Int16,
					null);
			
				nds.SetProjection(Prj);
				nds.SetGeoTransform(adfGeoTransform);
				nds.GetRasterBand(1).WriteRaster(0, 0, (int)nXSize, (int)nYSize,pDataByte,
					(int)nXSize, (int)nYSize, 0, 0);
				Dictionary<Int16,int> bs = new Dictionary<Int16, int>();
				for (int i = 0; i < pDataByte.Length; i++)
				{
					if (bs.ContainsKey(pDataByte[i]))
					{
						bs[pDataByte[i]]++;
					}
					else
					{
						bs.Add(pDataByte[i],1);
					}
				}
				foreach (var keyValuePair in bs)
				{
					Console.WriteLine(keyValuePair.Key + "\t" + keyValuePair.Value);
				}
				nds.Dispose();
				Marshal.FreeHGlobal(pData);
		}
    }
}