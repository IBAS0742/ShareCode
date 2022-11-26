    package testCirce

import io.circe._
import io.circe.generic.JsonCodec
import io.circe.syntax._

import io.circe.parser._
import geotrellis.vector.{Geometry, Point }
import geotrellis.vector.io.json.{Implicits => GeoJsonImplicits}
object impl extends GeoJsonImplicits{
    implicit val theGeometryEncoder: Encoder[Geometry] =
        new Encoder[Geometry] {
            def apply(g: Geometry): Json = {
                parse(g.toGeoJson) match {
                    case Right(js: Json) => js
                    case Left(e)         => throw e
                }
            }
        }
    implicit val theGeometryDecoder: Decoder[Geometry] =
        Decoder[Json] map { js => js.spaces4.parseGeoJson[Geometry]
    }
}
import impl._

@JsonCodec
case class About(skill : String,
                 location: Point)

object TestEncoder {

    def parseString(string: String): Json = {
        parse(string) match {
            case Right(json) => {
                json
            }
            case Left(_) => {
                null
            }
        }
    }

    def main(args: Array[String]): Unit = {
        val ab = About("haha",Point(1,2))
        println(ab.asJson)
        println(parseString(
            """{
              |  "skill": "haha",
              |  "location" : {
              |    "type" : "Point",
              |    "coordinates" : [
              |      1.0,
              |      2.0
              |    ]
              |  }
              |}""".stripMargin).as[About])

    }


    @JsonCodec
    case class People(
                       name: String,
                       description: Option[String],
                       location: Point
                     )

    def o(): Unit = {
        val p = People("ibas",Some(""),Point(1,2))
        val json = p.asJson
        println(json)

        println(json.as[People])
        val p_str = """{
                      |  "name" : "ibas",
                      |  "description" : "",
                      |  "location" : {
                      |    "type" : "Point",
                      |    "coordinates" : [
                      |      1.0,
                      |      2.0
                      |    ]
                      |  }
                      |}""".stripMargin
        parse(p_str) match {
            case Right(x) => {
                println(x.as[People])
            }
            case Left(e) => {
                println(e)
            }
        }
        parse("") match {
            case Right(_) => {}
            case Left(e) => {
                print(e)
            }
        }
    }
}
