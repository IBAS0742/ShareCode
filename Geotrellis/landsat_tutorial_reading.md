[代码讲解](https://www.bilibili.com/read/cv14612873)

```scala
package tutorial

import org.apache.spark.broadcast
import geotrellis.layer.{FloatingLayoutScheme, Metadata, SpatialKey, TileLayerMetadata, ZoomedLayoutScheme}
import geotrellis.raster._
import geotrellis.raster.io.geotiff._
import geotrellis.raster.render._
import geotrellis.raster.resample._
import geotrellis.raster.reproject._
import geotrellis.proj4._
import geotrellis.spark._
import geotrellis.spark.store._
import geotrellis.spark.store.file._
import geotrellis.spark.store.hadoop._
import geotrellis.store.LayerId
import geotrellis.store.file.FileAttributeStore
import geotrellis.store.index.ZCurveKeyIndexMethod
import org.apache.spark.broadcast.Broadcast

import scala.collection.mutable.ListBuffer
//import geotrellis.spark.io.index._
import geotrellis.spark.pyramid._
import geotrellis.spark.reproject._
import geotrellis.spark.tiling._
import geotrellis.spark.render._

import geotrellis.vector._

import org.apache.spark._
import org.apache.spark.rdd._

import scala.io.StdIn
import java.io.File

object TestRDD {
    // Setup Spark to use Kryo serializer.
    implicit val conf =
        new SparkConf()
            .setMaster("local[*]")
            .setAppName("Spark Tiler")
    implicit val sc = new SparkContext(conf)
    def main(args: Array[String]): Unit = {
        testRdd()
    }


    def testRdd()(implicit sc: SparkContext): Unit = {
        val data: ListBuffer[(Int,Array[Int])] = new ListBuffer[(Int,Array[Int])]()
        for (i <- 1 to 10) {
            data += ((scala.util.Random.nextInt(10),
                ListBuffer[Int](
                    scala.util.Random.nextInt(10),
                    scala.util.Random.nextInt(10)).toArray))
        }
        val rdd:RDD[(Int,Array[Int])] = sc.makeRDD(data)
        val bb:Broadcast[Array[Int]] = sc.broadcast(Array(0))

        rdd
            .flatMap(ai => {
                ai._2.map((_,1 + ai._1))
            })
            .reduceByKey(_ + _)
            .collect()
            .foreach(kn => {
                println(kn._1 + "\t" + kn._2)
                bb.value(0) += kn._2
            })

        println("======================================")

        val second = MyContextRDD(rdd,new MyMetadataR)
        import MyRddReProjectMethodsImplicits._
        print("second.metadata = " + second.metadata.metadata + "\n")
        second
            .reprojected(1.toInt,_+_)
            .flatMap(ai => {
                ai._2.map((_,1 + ai._1))
            })
            .reduceByKey(_ + _)
            .collect()
            .foreach(kn => {
                println(kn._1 + "\t" + kn._2)
                bb.value(0) -= kn._2
            })

        println(bb.value(0)) // -20

        println("over")
    }
}

object MyRddReProjectMethodsImplicits extends MyRddReProjectMethodsImplicits

trait MyRddReProjectMethodsImplicits {
    implicit class withMyRddReProjectMethods[K,V,M](self: RDD[(K,V)] with MyMetadata[M])
        extends MyRddReProjectMethods[K,V,M](self)
}

class MyRddReProjectMethods[K,V,M](val self:RDD[(K,V)] with MyMetadata[M]) {
    def reprojected(v: K,f: (K,K) => K):RDD[(K,V)] = {
        self.map(kv => {
            (f(kv._1,v),kv._2)
        })
    }
}

trait MyMetadata[M] {
    val metadata: M
}
class MyMetadataR extends MyMetadata[Int] with Serializable {
    override val metadata: Int = 1
}

object MyContextRDD {
    def apply[K,V,M](rdd: RDD[(K,V)],metadata: M) = new MyContextRDD[K,V,M](rdd,metadata)
}

class MyContextRDD[K,V,M](val rdd: RDD[(K,V)],val metadata: M) extends RDD[(K,V)](rdd) with MyMetadata[M] {
    override val partitioner = rdd.partitioner

    override def compute(split: Partition, context: TaskContext): Iterator[(K, V)] = rdd.iterator(split, context)

    override protected def getPartitions: Array[Partition] = rdd.partitions
}

```