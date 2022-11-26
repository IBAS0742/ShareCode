namespace GDAL_Tester
{
    internal class Program
    {
	    public static void Main(string[] args)
        {
	        // Gdal.SetConfigOption("GDAL_FILENAME_IS_UTF8", "Yes");
	        GdalConfiguration.ConfigureGdal();
	        GdalConfiguration.ConfigureOgr();
	        
	        // 测试使用 调用 gdal_grid 的方法
	        TestGridCreate.TestGdalGridWrap();
	        // 测试调用 dll 中 gdalCreateGrid 的方法（失败）
	        // TestGridCreate.TestGdalGrid();
        }

    }
}