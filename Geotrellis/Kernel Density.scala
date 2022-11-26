package demo


import geotrellis.proj4.LatLng
import geotrellis.raster._
import geotrellis.raster.density.KernelStamper
import geotrellis.raster.io.geotiff.GeoTiff
import geotrellis.vector._
import geotrellis.raster.mapalgebra.focal.{Kernel, Square}
import geotrellis.raster.mapalgebra.local.LocalTileBinaryOp
import geotrellis.raster.render.{ColorMap, ColorRamps}
import geotrellis.spark.SpatialKey
import geotrellis.spark.stitch.TileLayoutStitcher
import geotrellis.spark.tiling._
import org.apache.spark.rdd.RDD
import org.apache.spark.{SparkConf, SparkContext}

import scala.util.Random

object Main {
	def helloSentence = "Hello GeoTrellis"

	//  def main(args: Array[String]): Unit = {
	//    println(helloSentence)
	//  }
	def main(args: Array[String]): Unit = {
		KernelDensityRdd()
	}

	def QuickStart():Unit = {
		val nd = NODATA
		var input = Array[Int](
			nd, 7, 1, 1, 3, 5, 9, 8, 2,
			9, 1, 1, 2, 2, 2, 4, 3, 5,
			3, 8, 1, 3, 3, 3, 1, 2, 2,
			2, 4, 7, 1, nd, 1, 8, 4, 3)
		var iat = IntArrayTile(input, 9, 4)
		print(iat.asciiDraw())
		val focalNeighborood = Square(1)
		val meanTile = iat.focalMean(focalNeighborood)
		print(meanTile.asciiDraw())
		meanTile.foreachDouble(d => print(d," "))
	}

	def KernelDensity() : Unit = {
		val extent = Extent(-109,37,-102,41)
		def randomPointFeature(extent: Extent): PointFeature[Double] = {
			def randInRange (low: Double, high: Double): Double = {
				val x = Random.nextDouble
				low * (1-x) + high * x
			}
			Feature(
				Point(
					randInRange(extent.xmin, extent.xmax),      // the geometry
					randInRange(extent.ymin, extent.ymax)
				),
				Random.nextInt % 16 + 16)                         // the weight (attribute)
		}

		val pts = (for (i <- 1 to 1000) yield randomPointFeature(extent)).toList
		val kernelWidth: Int = 9
		val kern: Kernel = Kernel.gaussian(kernelWidth, 1.5, 25)
		val kde: Tile = pts.kernelDensity(kern, RasterExtent(extent, 700, 400))

		val colorMap = ColorMap(
			(0 to kde.findMinMax._2 by 4).toArray,
			ColorRamps.HeatmapBlueToYellowToRedSpectrum
		)
//		kde.renderPng(colorMap).write("out\\test.png")
//		GeoTiff(kde, extent, LatLng).write("out\\test.tif")
		val tl = TileLayout(7, 4, 100, 100)
		val ld = LayoutDefinition(extent, tl)
		def pointFeatureToExtent[D](kwidth: Double, ld: LayoutDefinition, ptf: PointFeature[D]): Extent = {
			val p = ptf.geom

			Extent(p.x - kwidth * ld.cellwidth / 2,
				p.y - kwidth * ld.cellheight / 2,
				p.x + kwidth * ld.cellwidth / 2,
				p.y + kwidth * ld.cellheight / 2)
		}
		def ptfToExtent[D](p: PointFeature[D]) = pointFeatureToExtent(kernelWidth, ld, p)

		def ptfToSpatialKey[D](ptf: PointFeature[D]): Iterator[(SpatialKey,PointFeature[D])] = {
			val ptextent = ptfToExtent(ptf)
			val gridBounds = ld.mapTransform(ptextent)
			println(tl.totalRows,"\t",tl.totalCols)
			for {
				(c, r) <- gridBounds.coordsIter
//				if r < tl.totalRows
//				if c < tl.totalCols
			} yield (SpatialKey(c,r), ptf)
		}
		val keyfeatures: Map[SpatialKey, List[PointFeature[Double]]] =
			pts.flatMap(ptfToSpatialKey)
			.groupBy(_._1)
			.map { case (sk, v) => (sk, v.unzip._2) }
		val keytiles = keyfeatures.map { case (sk, pfs) =>
			(sk, pfs.kernelDensity(
				kern,
				RasterExtent(ld.mapTransform(sk), tl.tileDimensions._1, tl.tileDimensions._2)
			))
		}
		val tileList =
			for {
				r <- 0 until ld.layoutRows
				c <- 0 until ld.layoutCols
			} yield {
				val k = SpatialKey(c,r)
				(k, keytiles.getOrElse(k, IntArrayTile.empty(tl.tileCols, tl.tileRows)))
			}

		val stitched = TileLayoutStitcher.stitch(tileList)._1
		stitched.renderPng(colorMap).write("out/test.png")
	}

	def TestAggregateByKey(): Unit = {
		val conf = new SparkConf().setMaster("local").setAppName("Kernel Density")
		val sc = new SparkContext(conf)
		var data = sc.parallelize(List((1,(284,4)),(1,(300,4)),(3,(273,4)),(4,(323,4)),(5,(286,4))))
//		def seq(a:Int,b:Int):Int = {
//			println("seq:" + a + "\t" + b)
//			math.max(a,b)
//		}
//		def comb(a:Int,b:Int):Int = {
//			println("comb:" + a + "\t" + b)
//			a + b
//		}
		def seq(x: (Int,Int),y:(Int,Int)) : (Int,Int) = {
			(x._1 + y._2,x._2 + 1)
		}
		def comb(x: (Int,Int),y:(Int,Int)) : (Int,Int) = {
			(x._1 + y._1,x._2 + y._2)
		}

		data.aggregateByKey((10,0))(seq,comb).collect.foreach(a => {
			println(a._1,"\t",a._2)
		})
	}
	object Adder extends LocalTileBinaryOp {
		def combine(z1: Int, z2: Int) = {
			if (isNoData(z1)) {
				z2
			} else if (isNoData(z2)) {
				z1
			} else {
				z1 + z2
			}
		}

		def combine(r1: Double, r2:Double) = {
			if (isNoData(r1)) {
				r2
			} else if (isNoData(r2)) {
				r1
			} else {
				r1 + r2
			}
		}
	}
	def KernelDensityRdd(): Unit = {
		val extent = Extent(-109,37,-102,41)
		def randomPointFeature(extent: Extent): PointFeature[Double] = {
			def randInRange (low: Double, high: Double): Double = {
				val x = Random.nextDouble
				low * (1-x) + high * x
			}
			Feature(
				Point(
					randInRange(extent.xmin, extent.xmax),      // the geometry
					randInRange(extent.ymin, extent.ymax)
				),
				Random.nextInt % 16 + 16)                         // the weight (attribute)
		}

		val pts = (for (i <- 1 to 1000) yield randomPointFeature(extent)).toList
		val kernelWidth: Int = 9
		val kern: Kernel = Kernel.gaussian(kernelWidth, 1.5, 25)
		val kde: Tile = pts.kernelDensity(kern, RasterExtent(extent, 700, 400))


		val colorMap = ColorMap(
			(0 to kde.findMinMax._2 by 4).toArray,
			ColorRamps.HeatmapBlueToYellowToRedSpectrum
		)

		//		kde.renderPng(colorMap).write("out\\test.png")
		//		GeoTiff(kde, extent, LatLng).write("out\\test.tif")
		val tl = TileLayout(7, 4, 100, 100)
		val ld = LayoutDefinition(extent, tl)
		def pointFeatureToExtent[D](kwidth: Double, ld: LayoutDefinition, ptf: PointFeature[D]): Extent = {
			val p = ptf.geom
//			val d = ptf.data.asInstanceOf[Double]

			Extent(p.x - kwidth * ld.cellwidth / 2,
				p.y - kwidth * ld.cellheight / 2,
				p.x + kwidth * ld.cellwidth / 2,
				p.y + kwidth * ld.cellheight / 2)
		}
		def ptfToExtent[D](p: PointFeature[D]) = pointFeatureToExtent(kernelWidth, ld, p)

		def ptfToSpatialKey[D](ptf: PointFeature[D]): Iterator[(SpatialKey,PointFeature[D])] = {
			val ptextent = ptfToExtent(ptf)
			val gridBounds = ld.mapTransform(ptextent)
			for {
				(c, r) <- gridBounds.coordsIter
				if r < tl.totalRows
				if c < tl.totalCols
			} yield (SpatialKey(c,r), ptf)
		}

		// 和前一个函数是一样的

		val conf = new SparkConf().setMaster("local[*]").setAppName("Kernel Density")
		val sc = new SparkContext(conf)
		val pointRdd = sc.parallelize(pts, 10)
		def stampPointFeature(
								 tile: MutableArrayTile,
								 tup: (SpatialKey, PointFeature[Double])
							 ): MutableArrayTile = {
			val (spatialKey, pointFeature) = tup
			val tileExtent = ld.mapTransform(spatialKey)
			val re = RasterExtent(tileExtent, tile)
			val result = tile.copy.asInstanceOf[MutableArrayTile]

			KernelStamper(result, kern)
				.stampKernelDouble(re.mapToGrid(pointFeature.geom), pointFeature.data)

			result
		}



		def sumTiles(t1: MutableArrayTile, t2: MutableArrayTile): MutableArrayTile = {
			Adder(t1, t2).asInstanceOf[MutableArrayTile]
		}

		val tileRdd: RDD[(SpatialKey, Tile)] =
			pointRdd
				.flatMap(ptfToSpatialKey)
				.mapPartitions({ partition =>
					partition.map { case (spatialKey, pointFeature) =>
						(spatialKey, (spatialKey, pointFeature))
					}
				}, preservesPartitioning = true)
				.aggregateByKey(
					ArrayTile.empty(DoubleCellType, ld.tileCols, ld.tileRows)
				)(stampPointFeature, sumTiles)
			.mapValues{ tile: MutableArrayTile => tile.asInstanceOf[Tile] }

		var tileList:Array[(SpatialKey,Tile)] = tileRdd.filter(st => {
			st._1._1 >= 0 && st._1._1 < 7 /*ld.layoutRows*/ &&
				st._1._2 >= 0 && st._1._2 < 4 /*ld.layoutCols*/
		}).collect()
		val stitched = TileLayoutStitcher.stitch(tileList)._1

		stitched.renderPng(colorMap).write("out\\test.png")

//		val metadata = TileLayerMetadata(DoubleCellType,
//			ld,
//			ld.extent,
//			LatLng,
//			KeyBounds(SpatialKey(0,0),
//				SpatialKey(ld.layoutCols-1,
//					ld.layoutRows-1)))
	}
}
