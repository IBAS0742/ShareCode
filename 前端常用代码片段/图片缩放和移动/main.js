// 源码为 http://phrogz.net/tmp/canvas_zoom_to_cursor.html 的修改版

let DrawImage = class {
        constructor(id,delay) {
            this.delay = delay || 50;
            this.canvas = document.getElementById(id);
            this.ctx = null;
            this.imageUrl = null;
            this.image = null;
            this.init = false;
            this._onresizeId = null;
            this.trackTransforms = null;
            this.noReset = false;
            this._init();
        }
        _resetImage(imageUrl) {
            if (imageUrl === this.imageUrl) {
                return this._redraw();
            } else {
                let $this = this;
                this.image = new Image();
                this.image.src = imageUrl;
                this.imageUrl = imageUrl;
                if (!this.noReset) {
                    this.trackTransforms.reset();
                }
                this.noReset = false;
                this.image.onload = function () {
                    $this._redraw();
                }
            }
        }
        _init() {
            let $this = this;
            let canvas = this.canvas;
            var scaleFactor = 1.1;
            canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight;
            // var lastX=canvas.width/2, lastY=canvas.height/2;
            if (!this.init) {
                var lastX=canvas.width/2, lastY=canvas.height/2;
                var ctx = this.ctx = this.canvas.getContext('2d');
                this.trackTransforms = trackTransforms(ctx);
                this.init = true;
                var dragStart,dragged;
                canvas.addEventListener('mousedown',function(evt){
                    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
                    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
                    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
                    dragStart = $this.ctx.transformedPoint(lastX,lastY);
                    dragged = false;
                },false);
                canvas.addEventListener('mousemove',function(evt){
                    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
                    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
                    dragged = true;
                    if (dragStart){
                        var pt = $this.ctx.transformedPoint(lastX,lastY);
                        $this.ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
                        $this._redraw();
                    }
                },false);
                canvas.addEventListener('mouseup',function(evt){
                    dragStart = null;
                    if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
                },false);

                var zoom = function(clicks){
                    var pt = $this.ctx.transformedPoint(lastX,lastY);
                    $this.ctx.translate(pt.x,pt.y);
                    var factor = Math.pow(scaleFactor,clicks);
                    $this.ctx.scale(factor,factor);
                    $this.ctx.translate(-pt.x,-pt.y);
                    $this._redraw();
                }

                var handleScroll = function(evt){
                    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
                    if (delta) zoom(delta);
                    return evt.preventDefault() && false;
                };
                canvas.addEventListener('DOMMouseScroll',handleScroll,false);
                canvas.addEventListener('mousewheel',handleScroll,false);
            } else {
                this.trackTransforms.redraw();
                this._redraw();
            }
        }
        onresize() {
            let $this = this;
            if (this._onresizeId) {
                clearTimeout(this._onresizeId);
            }
            this._onresizeId = setTimeout(() => {
                $this._init();
                if ($this.imageUrl) {
                    let image = this.imageUrl;
                    $this.imageUrl = "";
                    this.noReset = true;
                    $this._redraw(image);
                }
            },this.delay);
        }
        _redraw(imageUrl) {
            var ctx = this.ctx;
            if (imageUrl) {
                this._resetImage(imageUrl);
                return;
            }
            // Clear the entire canvas
            var p1 = ctx.transformedPoint(0,0);
            var p2 = ctx.transformedPoint(this.canvas.width,this.canvas.height);
            ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
            ctx.drawImage(this.image,0,0);
        }
        changeImageUrl(imageUrl) {
            this._redraw(imageUrl);
            this.onresize();
        }
    };

        // Adds ctx.getTransform() - returns an SVGMatrix
    // Adds ctx.transformedPoint(x,y) - returns an SVGPoint
    function trackTransforms(ctx){
        var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        var xform = svg.createSVGMatrix();
        var callList = [];
        ctx.getTransform = function(){ return xform; };

        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(ctx);
        };
        var restore = ctx.restore;
        ctx.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function(sx,sy){
            callList.push({
                name: 'scale',
                a:sx,b:sy
            });
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(ctx,sx,sy);
        };
        var rotate = ctx.rotate;
        ctx.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            callList.push({
                name: 'rotate',
                a:radians
            });
            return rotate.call(ctx,radians);
        };
        var translate = ctx.translate;
        ctx.translate = function(dx,dy){
            callList.push({
                name: 'translate',
                a:dx,b:dy
            });
            xform = xform.translate(dx,dy);
            return translate.call(ctx,dx,dy);
        };
        var transform = ctx.transform;
        ctx.transform = function(a,b,c,d,e,f){
            callList.push({
                name: 'transform',
                a,b,c,d,e,f
            });
            var m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(ctx,a,b,c,d,e,f);
        };
        var setTransform = ctx.setTransform;
        ctx.setTransform = function(a,b,c,d,e,f){
            callList.push({
                name: 'setTransform',
                a,b,c,d,e,f
            });
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx,a,b,c,d,e,f);
        };
        var pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x,y){
            callList.push({
                name: 'transformedPoint',
                a:x,b:y
            });
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }
        return {
            redraw() {
                console.log(`redraw`);
                {
                    xform.a = 1;
                    xform.b = 0;
                    xform.c = 0;
                    xform.d = 1;
                    xform.e = 0;
                    xform.f = 0;
                }
                let callListCopy = JSON.parse(JSON.stringify(callList));
                callList = [];
                callListCopy.forEach(cl => {
                    ctx[cl.name](cl.a,cl.b,cl.c,cl.d,cl.e,cl.f);
                });
                // callList = [];
            },
            reset() {
                console.log(`reset`);
                {
                    xform.a = 1;
                    xform.b = 0;
                    xform.c = 0;
                    xform.d = 1;
                    xform.e = 0;
                    xform.f = 0;
                }
                callList = [];
            }
        };
    }