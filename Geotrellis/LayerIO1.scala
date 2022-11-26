package Catalogs

import Catalogs.ReadWrite.layerId
import geotrellis.proj4.{LatLng, WebMercator}
import geotrellis.raster.{ArrayTile, ByteCellType, DoubleCellType, MultibandTile, MutableArrayTile, ShortCellType, Tile, TileLayout}
import geotrellis.spark.{MultibandTileLayerRDD, _}
import geotrellis.spark.store._
import geotrellis.spark.store.file._
import geotrellis.store.index.{Index, KeyIndex, ZCurveKeyIndexMethod}
import geotrellis.layer._
import geotrellis.layer.stitch.TileLayoutStitcher
import geotrellis.raster.io.geotiff.GeoTiff
import geotrellis.raster.io.geotiff.writer.GeoTiffWriter
import geotrellis.raster.render.{ColorMap, ColorRamps}
import geotrellis.raster.resample.Bilinear
import geotrellis.spark.pyramid.Pyramid
import geotrellis.spark.store.cog.{COGLayerReader, COGLayerWriter}
import geotrellis.spark.store.file.cog.{FileCOGLayerReader, FileCOGLayerWriter}
import geotrellis.spark.store.file.geotiff.FileGeoTiffLayerReader
import geotrellis.store.{AttributeStore, LayerId}
import geotrellis.store.file.FileAttributeStore
import geotrellis.vector.{Extent, ProjectedExtent}
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.SparkSession
import org.apache.spark.{SparkConf, SparkContext}

import scala.reflect.io.File
import scala.util.Random

object ReadWrite {
	// http://hadoop-namenode:50070/explorer.html#/
	val conf = new SparkConf()
		.setIfMissing("spark.master", "local[*]")
		.setAppName("GeoTrellis SimpleIngest")
		.set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
		.set("spark.kryo.registrator", "geotrellis.spark.store.kryo.KryoRegistrator")
	implicit val spark = SparkSession.builder.config(conf).getOrCreate
	implicit val sc = spark.sparkContext
	val FilePath: String = "H:\\temp\\geo"
	val FileStore: FileAttributeStore = FileAttributeStore(FilePath)
	val HdfsPath: String = "hdfs://hadoop-namenode:9820/jiayu"
	val HdfsStore: FileAttributeStore = FileAttributeStore(HdfsPath)
	var LayerName:String = "myLayer"
	var Zoom:Int = 3
	var layerId = LayerId("myLayer2",2)
	var outPngPath:String = ""
	val width = 1<<2;
	val height = 1<<3;
	val cellWidth = 16;
	val cellHeight = 16;
	val colorMap = ColorMap(
		(0 to 100 by 1).toArray,
		ColorRamps.HeatmapBlueToYellowToRedSpectrum
	)
	def main(args: Array[String]): Unit = {
		TestFileReadWriteMultiTile(true)
		sc.stop()
	}

	def ReadOrWrite(): Unit = {
		val StoreType:String = "FILE" // "FILE"、"HDFS"
		val FileType:String = "COG" // "COG"、"GEOTIFF"
		val read = false
		LayerName = StoreType + "_" + FileType
		layerId = LayerId(LayerName,Zoom)
		outPngPath = FilePath + "\\" + layerId.name + ".png"

		if (StoreType == "HDFS") {
			if (FileType == "GEOTIFF") {
				HdfsFileReadWrite(read)
			} else {
				HdfsCOGFileReadWrite(read)
			}
		} else {
			if (FileType == "GEOTIFF") {
				FileReadWrite(read)
			} else {
				COGFileReadWrite(read)
			}
		}
	}

	def COGFileReadWrite(read:Boolean): Unit = {
		val reader = FileCOGLayerReader(FilePath)
		val writer = FileCOGLayerWriter(FilePath)
		if (read) {
			val sLayer:TileLayerRDD[SpatialKey] = reader.read(layerId)
			val tileList:Array[(SpatialKey,Tile)] = sLayer.collect
			val tile = TileLayoutStitcher.stitch(tileList)._1
			tile.renderPng(colorMap).write(outPngPath)
		} else {
			val (rdd,index) = createTileLayerRDD
			writer.write(LayerName,rdd,Zoom,ZCurveKeyIndexMethod)
		}
	}
	def HdfsCOGFileReadWrite(read:Boolean): Unit = {
		val reader = COGLayerReader(HdfsPath)
		val writer = COGLayerWriter(HdfsPath)
		if (read) {
			val sLayer:TileLayerRDD[SpatialKey] = reader.read(layerId)
			val tileList:Array[(SpatialKey,Tile)] = sLayer.collect
			val tile = TileLayoutStitcher.stitch(tileList)._1
			tile.renderPng(colorMap).write(outPngPath)
		} else {
			val (rdd,index) = createTileLayerRDD
			writer.write(LayerName,rdd,Zoom,ZCurveKeyIndexMethod)
		}
	}
	def FileReadWrite(read:Boolean): Unit = {
		val reader = FileLayerReader(FilePath)
		val writer = FileLayerWriter(FilePath)
		if (read) {
			val sLayer:TileLayerRDD[SpatialKey] = reader.read(layerId)
			val tileList:Array[(SpatialKey,Tile)] = sLayer.collect
			val tile = TileLayoutStitcher.stitch(tileList)._1
			tile.renderPng(colorMap).write(outPngPath)
		} else {
			val (rdd,_) = createTileLayerRDD
			writer.write(layerId,rdd,ZCurveKeyIndexMethod)
		}
	}
	def HdfsFileReadWrite(read:Boolean): Unit = {
		val reader = LayerReader(HdfsPath)
		val writer = LayerWriter(HdfsPath)
		if (read) {
			val sLayer:TileLayerRDD[SpatialKey] = reader.read(layerId)
			val tileList:Array[(SpatialKey,Tile)] = sLayer.collect
			val tile = TileLayoutStitcher.stitch(tileList)._1
			tile.renderPng(colorMap).write(outPngPath)
		} else {
			val (rdd,index) = createTileLayerRDD
			writer.write(layerId,rdd,ZCurveKeyIndexMethod)
		}
	}

	def createTileLayerRDD(): (TileLayerRDD[SpatialKey],KeyIndex[SpatialKey]) = {
		val extent = Extent(-20, -20, 20, 20)
		val tl = TileLayout(width,height,cellWidth,cellHeight)
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
				val x = i / tl.layoutRows
				val y = i % tl.layoutCols
				val tile = ArrayTile.empty(DoubleCellType, ld.tileCols, ld.tileRows)
				for (i <- 0 to ld.tileRows - 1) {
					for (j <- 0 to ld.tileCols - 1) {
						tile.setDouble(j,i,Random.nextDouble * 100)
					}
				}
				(SpatialKey(x,y),tile)
			}
		val tilesRdd = sc.parallelize(tiles, 10)
			.mapValues{ tile: MutableArrayTile => tile.asInstanceOf[Tile] }
		val rdd = TileLayerRDD(tilesRdd,metadata);
		val b0 : KeyBounds[SpatialKey] = rdd.metadata.bounds.get
		val index : KeyIndex[SpatialKey] = ZCurveKeyIndexMethod.createIndex(b0)
		(rdd,index)
	}

	def TestWriteRand(): Unit = {
		val tile = ArrayTile.empty(DoubleCellType, 100,100)
		for (i <- 0 to 99) {
			for (j <- 0 to 99) {
				tile.setDouble(j,i,Random.nextDouble * 100)
			}
		}
		val colorMap = ColorMap(
			(0 to 100 by 1).toArray,
			ColorRamps.HeatmapBlueToYellowToRedSpectrum
		)
		tile.renderPng(colorMap).write("out/test.png")
	}

	def TestWriteCOG(): Unit ={
		val (rdd,_) = createTileLayerRDD
		val layoutScheme =
			ZoomedLayoutScheme(rdd.metadata.crs,rdd.metadata.layout.tileRows)
		val (_zoom,prjRdd): (Int, TileLayerRDD[SpatialKey]) =
			rdd.reproject(LatLng, layoutScheme, Bilinear)
		val writer = FileCOGLayerWriter(FilePath)
		writer.write(LayerName,prjRdd,_zoom,ZCurveKeyIndexMethod)
	}

	/**
	 * 这个可以只做某一层的金字塔，或者重做某一层的金字塔
	 * */
	def TestPyramid(read:Boolean): Unit = {
		val layerName: String = "pyramid_select"
		val select:Int = 1
		val attributeStore = FileAttributeStore(FilePath)
		val reader = FileLayerReader(FilePath)
		val writer = FileLayerWriter(FilePath)
		outPngPath = FilePath + "\\" + layerName + ".png"
		if (read) {
			layerId = LayerId(layerName,select)
			val sLayer:TileLayerRDD[SpatialKey] = reader.read(layerId)
			val tileList:Array[(SpatialKey,Tile)] = sLayer.collect
			val tile = TileLayoutStitcher.stitch(tileList)._1
			tile.renderPng(colorMap).write(outPngPath)
		} else {
			val (rdd,_) = createTileLayerRDD
			val layoutScheme =
				ZoomedLayoutScheme(rdd.metadata.crs,rdd.metadata.layout.tileRows)
			val (_zoom,prjRdd): (Int, TileLayerRDD[SpatialKey]) =
				rdd.reproject(LatLng, layoutScheme, Bilinear)
			Pyramid.upLevels(prjRdd,layoutScheme,1,_zoom,Bilinear) {
				(rdd,z) => {
					layerId = LayerId(layerName,z)
					if (FileStore.layerExists(layerId)) {
						attributeStore.delete(layerId)
					}
					if (select == z) {
						writer.write(layerId,rdd,ZCurveKeyIndexMethod)
					}
				}
			}
		}
	}
	
	// 创建多条带 layerRDD
	def createMultiTileLayerRDD(): (MultibandTileLayerRDD[SpatialKey],KeyIndex[SpatialKey]) = {
		val extent = Extent(-20, -20, 20, 20)
		val tl = TileLayout(width,height,cellWidth,cellHeight)
		val ld = LayoutDefinition(extent, tl)
		val metadata = TileLayerMetadata(DoubleCellType,
			ld,
			ld.extent,
			LatLng,
			KeyBounds(SpatialKey(0,0),
				SpatialKey(ld.layoutCols-1,
					ld.layoutRows-1)))

		def createRandTile(): ArrayTile = {
			val tile = ArrayTile.empty(ShortCellType, ld.tileCols, ld.tileRows)
			for (i <- 0 to ld.tileRows - 1) {
				for (j <- 0 to ld.tileCols - 1) {
					tile.set(j,i,Random.nextInt(255))
				}
			}
			tile
		}

		val tiles = for (i <- 0 to tl.layoutCols * tl.layoutRows - 1)
			yield {
				val x = i / tl.layoutRows
				val y = i % tl.layoutCols
				val tile = MultibandTile(createRandTile(),createRandTile(),createRandTile())
				(SpatialKey(x,y),tile)
			}
		val tilesRdd = sc.parallelize(tiles, 10)
			.mapValues{ tile: MultibandTile => tile.asInstanceOf[MultibandTile] }
		val rdd = MultibandTileLayerRDD(tilesRdd,metadata);
		val b0 : KeyBounds[SpatialKey] = rdd.metadata.bounds.get
		val index : KeyIndex[SpatialKey] = ZCurveKeyIndexMethod.createIndex(b0)
		(rdd,index)
	}

	// 测试读写多条带 layerRDD
	def TestFileReadWriteMultiTile(read:Boolean): Unit = {
		val reader = FileLayerReader(FilePath)
		val writer = FileLayerWriter(FilePath)
		layerId = LayerId("testMulti",2)
		val outTifPath = FilePath + "\\" + layerId.name + ".tif"
		val outTifPathOne = FilePath + "\\" + layerId.name + "_1.tif"
		if (read) {
			val sLayer:MultibandTileLayerRDD[SpatialKey] = reader.read(layerId)
			val tileList:Array[(SpatialKey,MultibandTile)] = sLayer.collect
			val tile:MultibandTile = TileLayoutStitcher.stitch(tileList)._1
			GeoTiff(tile,Extent(-20, -20, 20, 20),LatLng).write(outTifPath)
			GeoTiff(tile.band(1),Extent(-20, -20, 20, 20),LatLng)
				.write(outTifPathOne)
//			tile.renderPng(colorMap).write(outPngPath)
		} else {
			val (rdd,_) = createMultiTileLayerRDD
			writer.write(layerId,rdd,ZCurveKeyIndexMethod)
		}
	}
}