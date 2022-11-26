import numpy as np
from rasterio.enums import Resampling
from affine import Affine
SUPPORTED_RESAMPLING = [r for r in Resampling if r.value < 7]
from math import ceil, floor
import rasterio

from rasterio.transform import array_bounds
from rasterio._warp import _calculate_default_transform, _reproject, _transform_geom

def reproject(source, destination=None, src_transform=None, gcps=None,
              src_crs=None, src_nodata=None, dst_transform=None, dst_crs=None,
              dst_nodata=None, dst_resolution=None, src_alpha=0, dst_alpha=0,
              resampling=Resampling.nearest, num_threads=1,
              init_dest_nodata=True, warp_mem_limit=0, **kwargs):
    """Reproject a source raster to a destination raster.

    If the source and destination are ndarrays, coordinate reference
    system definitions and affine transformation parameters or ground
    control points (gcps) are required for reprojection.

    If the source and destination are rasterio Bands, shorthand for
    bands of datasets on disk, the coordinate reference systems and
    transforms or GCPs will be read from the appropriate datasets.

    Parameters
    ------------
    source: ndarray or Band
        The source is a 2 or 3-D ndarray, or a single or a multiple
        Rasterio Band object. The dimensionality of source
        and destination must match, i.e., for multiband reprojection
        the lengths of the first axes of the source and destination
        must be the same.
    destination: ndarray or Band, optional
        The destination is a 2 or 3-D ndarray, or a single or a multiple
        Rasterio Band object. The dimensionality of source
        and destination must match, i.e., for multiband reprojection
        the lengths of the first axes of the source and destination
        must be the same.
    src_transform: affine.Affine(), optional
        Source affine transformation. Required if source and
        destination are ndarrays. Will be derived from source if it is
        a rasterio Band. An error will be raised if this parameter is
        defined together with gcps.
    gcps: sequence of GroundControlPoint, optional
        Ground control points for the source. An error will be raised
        if this parameter is defined together with src_transform.
    src_crs: CRS or dict, optional
        Source coordinate reference system, in rasterio dict format.
        Required if source and destination are ndarrays.
        Will be derived from source if it is a rasterio Band.
        Example: CRS({'init': 'EPSG:4326'})
    src_nodata: int or float, optional
        The source nodata value. Pixels with this value will not be
        used for interpolation. If not set, it will default to the
        nodata value of the source image if a masked ndarray or
        rasterio band, if available.
    dst_transform: affine.Affine(), optional
        Target affine transformation. Required if source and
        destination are ndarrays. Will be derived from target if it is
        a rasterio Band.
    dst_crs: CRS or dict, optional
        Target coordinate reference system. Required if source and
        destination are ndarrays. Will be derived from target if it
        is a rasterio Band.
    dst_nodata: int or float, optional
        The nodata value used to initialize the destination; it will
        remain in all areas not covered by the reprojected source.
        Defaults to the nodata value of the destination image (if set),
        the value of src_nodata, or 0 (GDAL default).
    dst_resolution: tuple (x resolution, y resolution) or float, optional
        Target resolution, in units of target coordinate reference
        system.
    src_alpha : int, optional
        Index of a band to use as the alpha band when warping.
    dst_alpha : int, optional
        Index of a band to use as the alpha band when warping.
    resampling: int
        Resampling method to use.  One of the following:
            Resampling.nearest,
            Resampling.bilinear,
            Resampling.cubic,
            Resampling.cubic_spline,
            Resampling.lanczos,
            Resampling.average,
            Resampling.mode,
            Resampling.max (GDAL >= 2.2),
            Resampling.min (GDAL >= 2.2),
            Resampling.med (GDAL >= 2.2),
            Resampling.q1 (GDAL >= 2.2),
            Resampling.q3 (GDAL >= 2.2)
        An exception will be raised for a method not supported by the running
        version of GDAL.
    num_threads : int, optional
        The number of warp worker threads. Default: 1.
    init_dest_nodata: bool
        Flag to specify initialization of nodata in destination;
        prevents overwrite of previous warps. Defaults to True.
    warp_mem_limit : int, optional
        The warp operation memory limit in MB. Larger values allow the
        warp operation to be carried out in fewer chunks. The amount of
        memory required to warp a 3-band uint8 2000 row x 2000 col
        raster to a destination of the same size is approximately
        56 MB. The default (0) means 64 MB with GDAL 2.2.
    kwargs:  dict, optional
        Additional arguments passed to transformation function.

    Returns
    ---------
    destination: ndarray or Band
        The transformed narray or Band.
    dst_transform: Affine
        THe affine transformation matrix of the destination.
    """

    # Only one type of georeferencing is permitted.
    if src_transform and gcps:
        raise ValueError("src_transform and gcps parameters may not"
                         "be used together.")

    # Guard against invalid or unsupported resampling algorithms.
    try:
        if resampling == 7:
            raise ValueError("Gauss resampling is not supported")

        Resampling(resampling)

    except ValueError:
        raise ValueError(
            "resampling must be one of: {0}".format(", ".join(
                ['Resampling.{0}'.format(r.name) for r in
                 SUPPORTED_RESAMPLING])))

    if destination is None and dst_transform is not None:
        raise ValueError("Must provide destination if dst_transform is provided.")

    # calculate the destination transform if not provided
    if dst_transform is None and (destination is None or isinstance(destination, np.ndarray)):
        if isinstance(source, np.ndarray):
            if source.ndim == 3:
                src_count, src_height, src_width = source.shape
            else:
                src_count = 1
                src_height, src_width = source.shape
            src_bounds = array_bounds(src_height, src_width, src_transform)
        else:
            src_rdr, src_bidx, _, src_shape = source
            src_bounds = src_rdr.bounds
            src_crs = src_rdr.crs
            if isinstance(src_bidx, int):
                src_bidx = [src_bidx]
            src_count = len(src_bidx)
            src_height, src_width = src_shape

        dst_height = None
        dst_width = None
        dst_count = src_count
        if isinstance(destination, np.ndarray):
            if destination.ndim == 3:
                dst_count, dst_height, dst_width = destination.shape
            else:
                dst_count = 1
                dst_height, dst_width = destination.shape

        left, bottom, right, top = src_bounds
        dst_transform, dst_width, dst_height = calculate_default_transform(
            src_crs=src_crs, dst_crs=dst_crs, width=src_width, height=src_height,
            left=left, bottom=bottom, right=right, top=top,
            gcps=gcps, dst_width=dst_width, dst_height=dst_height,
            resolution=dst_resolution)

        if destination is None:
            destination = np.empty((int(dst_count), int(dst_height), int(dst_width)),
                                   dtype=source.dtype)

    # Call the function in our extension module.
    _reproject(
        source, destination, src_transform=src_transform, gcps=gcps,
        src_crs=src_crs, src_nodata=src_nodata, dst_transform=dst_transform,
        dst_crs=dst_crs, dst_nodata=dst_nodata, dst_alpha=dst_alpha,
        src_alpha=src_alpha, resampling=resampling,
        init_dest_nodata=init_dest_nodata, num_threads=num_threads,
        warp_mem_limit=warp_mem_limit, **kwargs)

    return destination, dst_transform


def calculate_default_transform(
        src_crs, dst_crs, width, height, left=None, bottom=None, right=None,
        top=None, gcps=None, resolution=None, dst_width=None, dst_height=None):
    """Output dimensions and transform for a reprojection.

    Source and destination coordinate reference systems and output
    width and height are the first four, required, parameters. Source
    georeferencing can be specified using either ground control points
    (gcps) or spatial bounds (left, bottom, right, top). These two
    forms of georeferencing are mutually exclusive.

    The destination transform is anchored at the left, top coordinate.

    Destination width and height (and resolution if not provided), are
    calculated using GDAL's method for suggest warp output.

    Parameters
    ----------
    src_crs: CRS or dict
        Source coordinate reference system, in rasterio dict format.
        Example: CRS({'init': 'EPSG:4326'})
    dst_crs: CRS or dict
        Target coordinate reference system.
    width, height: int
        Source raster width and height.
    left, bottom, right, top: float, optional
        Bounding coordinates in src_crs, from the bounds property of a
        raster. Required unless using gcps.
    gcps: sequence of GroundControlPoint, optional
        Instead of a bounding box for the source, a sequence of ground
        control points may be provided.
    resolution: tuple (x resolution, y resolution) or float, optional
        Target resolution, in units of target coordinate reference
        system.
    dst_width, dst_height: int, optional
        Output file size in pixels and lines. Cannot be used together
        with resolution.

    Returns
    -------
    transform: Affine
        Output affine transformation matrix
    width, height: int
        Output dimensions

    Notes
    -----
    Some behavior of this function is determined by the
    CHECK_WITH_INVERT_PROJ environment variable:

        YES: constrain output raster to extents that can be inverted
             avoids visual artifacts and coordinate discontinuties.
        NO:  reproject coordinates beyond valid bound limits
    """
    if any(x is not None for x in (left, bottom, right, top)) and gcps:
        raise ValueError("Bounding values and ground control points may not"
                         "be used together.")

    if any(x is None for x in (left, bottom, right, top)) and not gcps:
        raise ValueError("Either four bounding values or ground control points"
                         "must be specified")

    if (dst_width is None) != (dst_height is None):
        raise ValueError("Either dst_width and dst_height must be specified "
                         "or none of them.")

    if all(x is not None for x in (dst_width, dst_height)):
        dimensions = (dst_width, dst_height)
    else:
        dimensions = None

    if resolution and dimensions:
        raise ValueError("Resolution cannot be used with dst_width and dst_height.")

    dst_affine, dst_width, dst_height = _calculate_default_transform(
        src_crs, dst_crs, width, height, left, bottom, right, top, gcps)

    # If resolution is specified, Keep upper-left anchored
    # adjust the transform resolutions
    # adjust the width/height by the ratio of estimated:specified res (ceil'd)
    if resolution:
        # resolutions argument into tuple
        try:
            res = (float(resolution), float(resolution))
        except TypeError:
            res = (resolution[0], resolution[0]) \
                if len(resolution) == 1 else resolution[0:2]

        # Assume yres is provided as positive,
        # needs to be negative for north-up affine
        xres = res[0]
        yres = -res[1]

        xratio = dst_affine.a / xres
        yratio = dst_affine.e / yres

        dst_affine = Affine(xres, dst_affine.b, dst_affine.c,
                            dst_affine.d, yres, dst_affine.f)

        dst_width = ceil(dst_width * xratio)
        dst_height = ceil(dst_height * yratio)

    if dimensions:
        xratio = dst_width / dimensions[0]
        yratio = dst_height / dimensions[1]

        dst_width = dimensions[0]
        dst_height = dimensions[1]

        dst_affine = Affine(dst_affine.a * xratio, dst_affine.b, dst_affine.c,
                            dst_affine.d, dst_affine.e * yratio, dst_affine.f)

    return dst_affine, dst_width, dst_height

def main():
    src_file = 'D:\\tmp\\avi.tif'
    dst_file = 'D:\\tmp\\avi.prj.tif'
    # https://epsg.io/?q=Xian+1980
    dst_crs = '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=13500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'

    with rasterio.open(src_file) as src:
        transform, width, height = calculate_default_transform(
            src.crs, dst_crs, src.width, src.height, *src.bounds)
        kwargs = src.meta.copy()
        kwargs.update({
            'crs': dst_crs,
            'transform': transform,
            'width': width,
            'height': height
        })

        with rasterio.open(dst_file, 'w', **kwargs) as dst:
            for i in range(1, src.count + 1):
                reproject(
                    source=rasterio.band(src, i),
                    destination=rasterio.band(dst, i),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=dst_crs,
                    resampling=Resampling.nearest)

main()