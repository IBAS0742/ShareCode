import cats.kernel.CommutativeMonoid
import cats.instances.list._    // for Monoid
import cats.instances.int._    // for Monoid
import cats.instances.map._     // for Monoid
import cats.syntax.semigroup._  // for |+|
import cats.syntax.foldable._   // for combineAll

object GCounterTest {
	object BoundedSemiLattice {
		implicit val intInstance:BoundedSemiLattice[Int] =
			new BoundedSemiLattice[Int] {
				def combine(a1:Int,a2:Int):Int =
					a1 max a2
				def empty:Int = 0
			}
	}
	trait BoundedSemiLattice[A] extends CommutativeMonoid[A] {
		def combine(a1:A,a2:A):A
		def empty:A
	}
	trait GCounter[F[_,_],K,V] {
		def increment(f: F[K,V])(k: K,v: V)
					 (implicit m:CommutativeMonoid[V]):F[K,V]

		def merge(f1: F[K,V],f2: F[K,V])
				 (implicit m:BoundedSemiLattice[V]):F[K,V]

		def total(f: F[K,V])
				 (implicit m:CommutativeMonoid[V]): V
	}

	object GCounter {
		def apply[F[_,_],K,V]
		(implicit counter:GCounter[F,K,V]) =
			counter
	}
	implicit def mapInstance[K,V]:GCounter[Map,K,V] =
		new GCounter[Map,K,V] {
			def increment(map: Map[K, V])(key: K,value: V)
						 (implicit m: CommutativeMonoid[V]): Map[K,V] = {
				val total = map.getOrElse(key, m.empty) |+| value
				map + (key -> total)
			}

			def merge(map1:Map[K, V],map2: Map[K,V])
					 (implicit b: BoundedSemiLattice[V]): Map[K,V] =
				map1 |+| map2

			def total(map: Map[K,V])
					 (implicit m: CommutativeMonoid[V]): V =
				map.values.toList.combineAll
		}
	def main(args: Array[String]): Unit = {
		val g1 = Map("a" -> 7,"b" -> 3)
		val g2 = Map("a" -> 2,"b" -> 5)

		val counter = GCounter[Map,String,Int]

		val merged = counter.merge(g1,g2)

		val total = counter.total(merged)
		println(merged)
		println(total)
	}
}
