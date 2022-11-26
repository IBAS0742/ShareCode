/*
libraryDependencies ++= Seq(
  "org.locationtech.geotrellis" %% "geotrellis-spark" % "3.3.0",
  "org.apache.spark"      %% "spark-core"       % "2.4.0",
  "org.scalatest"         %%  "scalatest"       % "2.2.0" % Test,
  "org.apache.spark" %% "spark-sql" % "2.4.0"
)
*/
package KeyAndIndex

import geotrellis.proj4.LatLng
import geotrellis.raster.density.KernelStamper
import geotrellis.raster.mapalgebra.focal.Kernel
import geotrellis.raster.mapalgebra.local.LocalTileBinaryOp
import geotrellis.raster.render.{ColorMap, ColorRamps}
import geotrellis.raster.{ArrayTile, DoubleCellType, IntArrayTile, IntConstantNoDataCellType, IntUserDefinedNoDataCellType, MutableArrayTile, RasterExtent, Tile, TileLayout, isNoData}
import geotrellis.store.index.{HilbertKeyIndexMethod, KeyIndex, ZCurveKeyIndexMethod}
import geotrellis.layer.{FloatingLayoutScheme, LayoutDefinition}
import geotrellis.layer.{KeyBounds, SpatialKey, TileLayerMetadata}
import geotrellis.spark.TileLayerRDD
import geotrellis.vector.{Extent, Feature, Point, PointFeature}
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.spark.rdd.RDD

import scala.util.Random

object Main {
	val width = 3
	val height = 3
	val conf = new SparkConf().setMaster("local[*]")
		.setAppName("Kernel Density")
	val sc = new SparkContext(conf)
	def main(args: Array[String]): Unit = {
		TestZCurve()
	}

	def createTileLayerRdd(tl:TileLayout,ld:LayoutDefinition)
		:TileLayerRDD[SpatialKey] = {
		val metadata = TileLayerMetadata(DoubleCellType,
			ld,
			ld.extent,
			LatLng,
			KeyBounds(SpatialKey(0,0),
				SpatialKey(ld.layoutCols-1,
					ld.layoutRows-1)))
		val tiles = for (i <- 0 to tl.layoutCols * tl.layoutRows - 1)
			yield {
				val x = i / width
				val y = i % height
				(SpatialKey(x,y),
					ArrayTile.empty(DoubleCellType, ld.tileCols, ld.tileRows))
			}
		val tilesRdd = sc.parallelize(tiles, 10)
			.mapValues{ tile: MutableArrayTile => tile.asInstanceOf[Tile] }

		TileLayerRDD(tilesRdd,metadata)
	}

	def TestZCurve():Unit = {
		val extent = Extent(0,0,10,10)
		val tl = TileLayout(width,height, 100, 100)
		val ld = LayoutDefinition(extent, tl)

		val tileLayerRDD = createTileLayerRdd(tl,ld)
		val b0 : KeyBounds[SpatialKey] = tileLayerRDD.metadata.bounds.get
		val i0 : KeyIndex[SpatialKey] = ZCurveKeyIndexMethod.createIndex(b0)
		for (i <- 0 to ld.layoutRows - 1) {
			for (j <- 0 to ld.layoutCols - 1) {
				val oneD: BigInt = i0.toIndex(SpatialKey(i,j))
				println(i,j,oneD)
			}
		}
	}
	def TestHilbert():Unit = {
		val extent = Extent(0,0,10,10)
		val tl = TileLayout(width,height, 100, 100)
		val ld = LayoutDefinition(extent, tl)
		val tileLayerRDD = createTileLayerRdd(tl,ld)

		val b0 : KeyBounds[SpatialKey] = tileLayerRDD.metadata.bounds.get
		val i0 : KeyIndex[SpatialKey] = HilbertKeyIndexMethod.createIndex(b0)
		for (i <- 0 to ld.layoutRows - 1) {
			for (j <- 0 to ld.layoutCols - 1) {
				val oneD: BigInt = i0.toIndex(SpatialKey(i,j))
				println(i,j,oneD)
			}
		}
	}
}
