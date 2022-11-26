using System;
using System.Runtime.InteropServices;
using OSGeo.GDAL;

namespace GDAL_Tester
{
    public class AddIn
    {
                public enum GDALGridAlgorithm {
            /*! Inverse distance to a power */
            GGA_InverseDistanceToAPower = 1,
            /*! Moving Average */
            GGA_MovingAverage = 2,
            /*! Nearest Neighbor */
            GGA_NearestNeighbor = 3,
            /*! Minimum Value (Data Metric) */
            GGA_MetricMinimum = 4,
            /*! Maximum Value (Data Metric) */
            GGA_MetricMaximum = 5,
            /*! Data Range (Data Metric) */
            GGA_MetricRange = 6,
            /*! Number of Points (Data Metric) */
            GGA_MetricCount = 7,
            /*! Average Distance (Data Metric) */
            GGA_MetricAverageDistance = 8,
            /*! Average Distance Between Data Points (Data Metric) */
            GGA_MetricAverageDistancePts = 9
        }
        public enum LDataType {
            L_Unknown = 0,
            /*! Eight bit unsigned integer */
            L_Byte = 1,
            /*! Sixteen bit unsigned integer */
            L_UInt16 = 2,
            /*! Sixteen bit signed integer */
            L_Int16 = 3,
            /*! Thirty two bit unsigned integer */
            L_UInt32 = 4,
            /*! Thirty two bit signed integer */
            L_Int32 = 5,
            /*! Thirty two bit floating point */
            L_Float32 = 6,
            /*! Sixty four bit floating point */
            L_Float64 = 7,
            /*! Complex Int16 */
            L_CInt16 = 8,
            /*! Complex Int32 */
            L_CInt32 = 9,
            /*! Complex Float32 */
            L_CFloat32 = 10,
            /*! Complex Float64 */
            L_CFloat64 = 11,
            L_TypeCount = 12,         /* maximum type # + 1 */
            L_RGB = 13,                /* 全色图像 */
            L_ARGB = 14                /* 带有透明度的全色图像 */
        }
        public delegate int GDALProgressFunc(double dfComplete, string pszMessage, IntPtr pProgressArg);
        [DllImport(@"gdal203.dll",EntryPoint = "GDALGridCreate",CallingConvention = CallingConvention.Cdecl)]
        public static extern unsafe CPLErr GDALGridCreate(
                GDALGridAlgorithm alg, IntPtr poOptions,
                UInt32 nPoints,
                // double[] padfX, double[] padfY, double[] padfZ,
                IntPtr padfX, IntPtr padfY, IntPtr padfZ,
                double dfXMin, double dfXMax, double dfYMin, double dfYMax,
                UInt32 nXSize, UInt32 nYSize, LDataType eType, 
                IntPtr pData,
                // void* pData,
                GDALProgressFunc pfnProgress, IntPtr pProgressArg);
    }
}