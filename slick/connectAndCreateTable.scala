/*
resources/postGis.conf 内容如下
db {
  user = "root"
  password = "root"
  database = "second"
  host = "127.0.0.1:5432"
}
*/

package slick

import java.io.File

import com.typesafe.config.ConfigFactory
import slick.jdbc.PostgresProfile.api._
import slick.jdbc.PostgresProfile

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global

object tablesAndDB {
    // Definition of the SUPPLIERS table
    class Suppliers(tag: Tag) extends Table[(Int, String, String, String, String, String)](tag, "SUPPLIERS") {
        def id = column[Int]("SUP_ID", O.PrimaryKey) // This is the primary key column
        def name = column[String]("SUP_NAME")
        def street = column[String]("STREET")
        def city = column[String]("CITY")
        def state = column[String]("STATE")
        def zip = column[String]("ZIP")
        // Every table needs a * projection with the same type as the table's type parameter
        def * = (id, name, street, city, state, zip)
    }
    val suppliers = TableQuery[Suppliers]

    // Definition of the COFFEES table
    class Coffees(tag: Tag) extends Table[(String, Int, Double, Int, Int)](tag, "COFFEES") {
        def name = column[String]("COF_NAME", O.PrimaryKey)
        def supID = column[Int]("SUP_ID")
        def price = column[Double]("PRICE")
        def sales = column[Int]("SALES")
        def total = column[Int]("TOTAL")
        def * = (name, supID, price, sales, total)
        // A reified foreign key relation that can be navigated to create a join
        def supplier = foreignKey("SUP_FK", supID, suppliers)(_.id)
    }
    val coffees = TableQuery[Coffees]

    // 在数据库创建表
    def crateTableMap(db:PostgresProfile.backend.DatabaseDef) = {
        Await.result(
            db.run(coffees.schema.createIfNotExists),
            Duration.Inf)
    }
    // 在数据库创建表 并 插入数据
    def crateTableMapAndInsert(db:PostgresProfile.backend.DatabaseDef) = {

        val setup = DBIO.seq(
            (coffees.schema ++ suppliers.schema).createIfNotExists,
            // Insert some suppliers
            suppliers += (101, "Acme, Inc.",      "99 Market Street", "Groundsville", "CA", "95199"),
            suppliers += ( 49, "Superior Coffee", "1 Party Place",    "Mendocino",    "CA", "95460"),
            suppliers += (150, "The High Ground", "100 Coffee Lane",  "Meadows",      "CA", "93966"),

            coffees ++= Seq(
                ("Colombian",         101, 7.99, 0, 0),
                ("French_Roast",       49, 8.99, 0, 0),
                ("Espresso",          150, 9.99, 0, 0),
                ("Colombian_Decaf",   101, 8.99, 0, 0),
                ("French_Roast_Decaf", 49, 9.99, 0, 0)
            )
        )
        Await.result(db.run(setup),Duration.Inf)
    }
    def dbInstance(configPath:String): PostgresProfile.backend.DatabaseDef = {
        val config = ConfigFactory.parseFile(new File(configPath))
        val pguser = config.getString("db.user")
        val pgpass = config.getString("db.password")
        val pgdb = config.getString("db.database")
        val pghost = config.getString("db.host")

        val s = s"jdbc:postgresql://$pghost/$pgdb"
        println(s"Connecting to $s")

        Database.forURL(
            "jdbc:postgresql://" + pghost + "/" + pgdb,
            driver = "org.postgresql.Driver",
            user = pguser,
            password = pgpass
        )
    }
}
import tablesAndDB._

object SlickOne {
    val configPath:String = "resources/postGis.conf"
//    var db:PostgresProfile.backend.DatabaseDef
    def main(args: Array[String]): Unit = {
        var db = dbInstance(configPath)
//        crateTableMapAndInsert(db)
//        testMapAndFilter(db)
//        asColumn(db)
        join(db)
    }

    def join(db:PostgresProfile.backend.DatabaseDef): Unit = {
        val q = for {
            c <- coffees if c.price < 9.0
            // 因为这里定义了 外键，所以可以省略
            // s <- suppliers if s.id === c.supID
            s <- c.supplier
        } yield (c.name, s.name)

        Await.result(db.stream(q.result).foreach(println),Duration.Inf)
    }

    def asColumn(db:PostgresProfile.backend.DatabaseDef): Unit = {
        val q = for (c <- coffees)
            yield LiteralColumn("**") ++
                c.name.asColumnOf[String] ++
                "\t" ++
                c.price.asColumnOf[String]

        Await.result(db.stream(q.result).foreach(println),Duration.Inf)
    }

    def queryAll(db:PostgresProfile.backend.DatabaseDef): Unit = {
        val task = db.run(coffees.result).map(_.foreach{
            case (name,_,price,_,_) => {
                println(s"name=${name}\tprice=${price}")
            }
        })
        Await.result(task,Duration.Inf)
    }

    def testMapAndFilter(db:PostgresProfile.backend.DatabaseDef): Unit = {
        var m = coffees.map(_.name)
        // coffees.filter(_.price < 10)
        println(Await.result(
            db.run(m.result),
            Duration.Inf))

        var f = coffees.filter(_.price < 3.0)
        println(Await.result(
            db.run(f.result),
            Duration.Inf))

        var mm = coffees.map(f => {
            (f.price,f.name)
        }).filter(_._1 > 1.0)
        println(Await.result(
            db.run(mm.result),
            Duration.Inf))
    }
}
