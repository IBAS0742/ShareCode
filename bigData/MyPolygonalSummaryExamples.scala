package UsingRasters

import geotrellis.layer.{KeyBounds, LayoutDefinition, SpatialKey, TileLayerMetadata}
import geotrellis.proj4.LatLng
import geotrellis.raster.{ArrayTile, DoubleCellType, MutableArrayTile, RasterizerOptions, Tile, TileLayout}
import geotrellis.raster.summary.polygonal.PolygonalSummaryResult
import geotrellis.raster.summary.polygonal.visitors.SumVisitor
import geotrellis.raster.summary.types.SumValue
import geotrellis.spark.TileLayerRDD
import geotrellis.store.index.{KeyIndex, ZCurveKeyIndexMethod}
import geotrellis.vector.{Extent, Feature, Geometry, Point, Polygon}
import org.apache.spark.SparkConf
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.SparkSession
import geotrellis.spark.summary.polygonal._

import scala.util.Random

object sparkSummary {
	val conf = new SparkConf()
		.setIfMissing("spark.master", "local[*]")
		.setAppName("GeoTrellis SimpleIngest")
		.set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
		.set("spark.kryo.registrator", "geotrellis.spark.store.kryo.KryoRegistrator")
	implicit val spark = SparkSession.builder.config(conf).getOrCreate
	implicit val sc = spark.sparkContext
	def main(args: Array[String]): Unit = {
		testSum
	}
	def createTileLayerRDD(): TileLayerRDD[SpatialKey] = {
		val extent = Extent(0,0,4,4)
		val tl = TileLayout(1,1,4,4)
		val ld = LayoutDefinition(extent, tl)
		val metadata = TileLayerMetadata(DoubleCellType,
			ld,
			ld.extent,
			LatLng,
			KeyBounds(SpatialKey(0,0),
				SpatialKey(ld.layoutCols-1,
					ld.layoutRows-1)))

		val tiles = for (i <- 0 to tl.layoutCols * tl.layoutRows - 1)
			yield {
				val y = i / tl.layoutCols
				val x = i % tl.layoutCols
				val tile = ArrayTile.empty(DoubleCellType, ld.tileCols, ld.tileRows)
				for (k <- 0 to ld.tileRows - 1) {
					for (j <- 0 to ld.tileCols - 1) {
						tile.setDouble(j,k,Random.nextInt(4))
					}
				}
				(SpatialKey(x,y),tile)
			}
		val tilesRdd:RDD[(SpatialKey,Tile)] = sc.parallelize(tiles, 10)
			.mapValues{ tile: MutableArrayTile => tile.asInstanceOf[Tile] }
		val rdd = TileLayerRDD(tilesRdd,metadata);
		val b0 : KeyBounds[SpatialKey] = rdd.metadata.bounds.get
		val index : KeyIndex[SpatialKey] = ZCurveKeyIndexMethod.createIndex(b0)
		rdd
	}

	def testSum(): Unit = {
		val points:Seq[Point] =
			Seq(Point(0,0),Point(0,3),Point(3,3),Point(3,0),Point(0,0))
		val polygons: Seq[Polygon] = Seq(Polygon(points))
		val rasterRdd = createTileLayerRDD // 创建一个随机的充满 0~3 数值的瓦片
		rasterRdd.collect.foreach(st => {
			println(st._2.asciiDraw())
		})
		// summaryRdd holds polygonal summary results in the Feature data property
		val summaryRdd: RDD[Feature[Geometry, PolygonalSummaryResult[SumValue]]] =
			rasterRdd.polygonalSummary(polygons, SumVisitor, RasterizerOptions.DEFAULT)
		summaryRdd.collect.toList.foreach(f => {
			println(f.data)
		})
	}
}
