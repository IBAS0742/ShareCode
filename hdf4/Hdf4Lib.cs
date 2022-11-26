using System.Runtime.InteropServices;
using System.Text;

namespace MyTestHdf.HDF4 {
    public static class Hdf4Lib {
        // 定义HDF4 SD接口函数库的文件位置
        public const string MFHDF4_DLL = @"C:\Program Files (x86)\HDF_Group\HDF\4.2.14\bin\mfhdf.dll";

        // 引入SDstart方法
        [DllImport(MFHDF4_DLL, EntryPoint = "SDstart", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDstart(string filename, int access_mode);

        // 引入SDfindattr方法
        [DllImport(MFHDF4_DLL, EntryPoint = "SDfindattr", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDfindattr(int obj_id, string attr_name);

        // 引入SDreadattr方法（字符串类型属性）
        [DllImport(MFHDF4_DLL, EntryPoint = "SDreadattr", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDreadattr(int obj_id, int attr_index, StringBuilder attr_buffer);

        // 引入SDreadattr方法（单精度浮点类型属性）
        [DllImport(MFHDF4_DLL, EntryPoint = "SDreadattr", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDreadattr(int obj_id, int attr_index, float[] attr_buffer);

        // 引入SDnametoindex方法
        [DllImport(MFHDF4_DLL, EntryPoint = "SDnametoindex", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDnametoindex(int sd_id, string sds_name);

        // 引入SDselect方法
        [DllImport(MFHDF4_DLL, EntryPoint = "SDselect", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDselect(int sd_id, int sds_index);

        // 引入SDgetinfo方法
        [DllImport(MFHDF4_DLL, EntryPoint = "SDgetinfo", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDgetinfo(int sds_id, StringBuilder sds_name, int[] rank, int[] dimsizes, int[] ntype,
            int[] num_attrs);

        // 引入SDreaddata方法
        [DllImport(MFHDF4_DLL, EntryPoint = "SDreaddata", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDreaddata(int sds_id, int[] start, int[] stride, int[] edge, short[,] buffer);

        // 引入SDendaccess方法
        [DllImport(MFHDF4_DLL, EntryPoint = "SDendaccess", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDendaccess(int sds_id);

        // 引入SDend方法
        [DllImport(MFHDF4_DLL, EntryPoint = "SDend", CallingConvention = CallingConvention.Cdecl)]
        public static extern int SDend(int sd_id);
    }
}