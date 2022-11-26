static void Main(string[] args) { TestHdf4(); }
static void TestHdf4() {
        string hdf4File = @"D:\testhdf\MOD09A1.hdf";
        int status = 0, sd_id = Hdf4Lib.SDstart(hdf4File, 1); // 只读方式打开HDF4文件;
        if (sd_id != -1) {
                int sds_indes = Hdf4Lib.SDnametoindex(sd_id, "sur_refl_b01"); // 查找数据集DATA的索引号
                int sds_id = Hdf4Lib.SDselect(sd_id, sds_indes);   // 选中数据集
                if (sds_id != -1) {
                        StringBuilder sds_name = new StringBuilder();        // 数据集名称
                        int[] rank = new int[1];                             // 秩数()
                        int[] dimsizes = new int[2];                         // 行列数
                        int[] ntype = new int[1];                            // 数据类型
                        int[] num_attrs = new int[1];                        // 属性数目
                        // 读取数据集信息
                        status = Hdf4Lib.SDgetinfo(sds_id, sds_name, rank, dimsizes, ntype, num_attrs);
                        Console.WriteLine("数据集名称:" + sds_name);
                        Console.WriteLine("行:" + dimsizes[0] + "\t列:" + dimsizes[1]);
                        Console.WriteLine("数据类型:" + ntype[0]);
                        Console.WriteLine("属性个数:" + num_attrs[0]);
                        // 结束数据集访问
                        status = Hdf4Lib.SDendaccess(sds_id);
                }
                
                // 关闭HDF4文件
                status = Hdf4Lib.SDend(sd_id);
        }
}