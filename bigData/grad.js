// 重写数字
class MyNumber {
    static instanceof(a) {
        return a instanceof MyNumber;
    }
    constructor(n) {
        this.n = n; // 数值，例如 1，2，3
        this.chain = null; // 最后被谁调用，理解为指针
        this.grad_fn = () => 1; // 求导方法
    }
    get grad() {
        if (this.chain) {
            let $this = this;
            let t = 1;
            while ($this.chain) {
                let tmp = $this.chain.grad_fn($this);
                t *= tmp;
                $this = $this.chain;
            }
            return t;
        } else {
            return n;
        }
    }
    // 用于简化代码，方便实现数值计算
    // a = new MyNumber(10); b = a * 2; // b = 20
    valueOf() {
        return this.n;
    }
}

// 重写加减乘除
class Functioner {
    static check(a,b) {
        if (MyNumber.instanceof(a) && MyNumber.instanceof(b)) {
        } else {
            throw new Error("type is no MyNumber");
        }
    }

    static plus(a,b,cut) {
        Functioner.check(a,b);
        // c = a + b 正常的数值计算
        let c = new MyNumber(a + (cut ? -1 : 1) * b);
        // 定义 a b 的调用者
        a.chain = b.chain = c;
        // 定义求导函数，因为加法的导数是 1
        // 例如 y = x + b ，则 dy/dx = 1;dy/db = 1;
        c.grad_fn = function () {
            return 1;
        }
        // 严谨的做法应该是 return new MyNumber(c);
        return c;
    }

    static multi(a,b,div) {
        Functioner.check(a,b);
        let ret = a * b;
        if (div) {
            ret = a / b;
        } // 判断除
        let c = new MyNumber(ret);
        a.chain = b.chain = c;
        if (a === b) {
            let grad = a.n * 2;
            if (div) {
                grad = 0;
            }
            c.grad_fn = function () {
                return grad;
            }
        }
        else {
            let aGrad = b.n;
            let bGrad = a.n;
            if (div) {
                aGrad = 1 / b.n;
                bGrad = - a.n / b.n / b.n;
            }
            c.grad_fn = (function (a,b,c) {
                if (a === c) {
                    return aGrad;
                } else {
                    return bGrad;
                }
            }).bind(null,a,b);
        }
        return c;
    }

    static cut(a,b) {
        return Functioner.plus(a,b,true);
    }

    static div(a,b) {
        return Functioner.multi(a,b,true);
    }

    static square(a) {
        return Functioner.multi(a,a);
    }
}

function test1() {
    // y = (a * x + b) ^ 2
    // a.grad = 2 * (a * x + b) * x
    // b.grad = 2 * (a * x + b)
    // x.grad = 2 * (a * x + b) * a
    let a = new MyNumber(2);
    let x = new MyNumber(3);
    let b = new MyNumber(5);
    let y = Functioner.square(
        Functioner.plus(
            Functioner.multi(a,x),
            b
        )
    );
    console.log(`x.grad = ${x.grad}`);
    console.log(`a.grad = ${a.grad}`);
    console.log(`b.grad = ${b.grad}`);
}
test1();

function test2() {
    // d = ((a^2 + b) * c) ^ 2
    // a.grad = 2 * ((a^2 + b) * c) * c * (2 * a)
    // b.grad = 2 * ((a^2 + b) * c) * c
    // c.grad = 2 * ((a^2 + b) * c) * (a^2 + b)
    let a = new MyNumber(2);
    let b = new MyNumber(3);
    let c = new MyNumber(5);
    let d = Functioner.square(
        Functioner.multi(
            Functioner.plus(
                Functioner.square(a),
                b
            ),
            c
        )
    )
    console.log(`a.grad = ${a.grad}`);
    let aGrad = 2 * ((a^2 + b) * c) * c * (2 * a);
    console.log(`a.grad = ${aGrad}`);
    console.log(`b.grad = ${b.grad}`);
    let bGrad = 2 * ((a^2 + b) * c) * c;
    console.log(`b.grad = ${bGrad}`);
    console.log(`c.grad = ${c.grad}`);
    let cGrad = 2 * ((a^2 + b) * c) * (a^2 + b);
    console.log(`c.grad = ${cGrad}`);
}
test2();