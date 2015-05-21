//consts
var PI_DIV_180 = Math.PI / 180;
//

var RayCaster = function () {

    this.x = 0;
    this.y = 0;
    this.projectionWidth = 0;
    this.projectionHeight = 0;
    this.distanceViewerToPlane = 0;
    this.dtAnglePerProjection = 0;

    this.game=undefined;
    this.map = undefined;
    this.viewer = undefined;

    this.wallTexture;
    this.floorTexture = undefined;

    this.renderer = undefined;
    this.centerY = 0;

    return this;
};

RayCaster.prototype = {

    init: function (x, y, width, height, game, map, viewer,renderer) {
       
        this.x = x;
        this.y = y;
        this.projectionWidth = width;
        this.projectionHeight = height;
        this.distanceViewerToPlane = width / 2 / Math.tan(viewer.fov / 2 * PI_DIV_180);
        this.dtAnglePerProjection = viewer.fov / width;

        this.game = game;
        this.map = map;
        this.viewer = viewer;

        this.wallTexture = Texture.fromImage(game.getTexture('tex1.png'));
        this.floorTexture = Texture.fromImage(game.getTexture('flo1.png'));

        this.renderer = renderer;
        this.centerY = this.projectionHeight / 2;
    },

    cast: function () {
        var startAngle = this.viewer.angle + this.viewer.fov / 2;
        var adjustAngle = function (a) { return (a % 360 + 360) % 360; };
        var factor = this.dtAnglePerProjection;

        var rays = [];
        for (var i = 0; i < this.projectionWidth; i++) {

            var hray = this.checkHorizontalIntersection(this.map, this.viewer.x, this.viewer.y, adjustAngle(startAngle));
            var vray = this.checkVerticalIntersection(this.map, this.viewer.x, this.viewer.y, adjustAngle(startAngle));

            if (hray != null && vray != null) {
                var hdist = Math.abs((hray.x0 - hray.x1) / Math.cos(startAngle * PI_DIV_180));
                var vdist = Math.abs((vray.x0 - vray.x1) / Math.cos(startAngle * PI_DIV_180));
                if (hdist < vdist)
                    rays.push(hray);
                else
                    rays.push(vray);
            } else if (hray != null) {
                rays.push(hray);
            }
            else if (vray != null) {
                rays.push(vray);
            } else {
                rays.push(null);
            }

            startAngle -= factor;
        }

        return rays;
    },

    checkHorizontalIntersection: function (map, x, y, angle) {
        if (map.isOutOfMap(x, y)) {
            return null;
        }

        var faceUp = angle >= 0 && angle <= 180;
        var startX, startY = 0;

        if (faceUp)
            startY = Math.floor(y / map.gridSize) * map.gridSize - 0.1;
        else
            startY = Math.floor(y / map.gridSize) * map.gridSize + map.gridSize;
        startX = x + (y - startY) / Math.tan(angle * PI_DIV_180);

        var ya = faceUp ? -map.gridSize : map.gridSize;
        var xa = -ya / Math.tan(angle * PI_DIV_180);

        while (!map.isOutOfMap(startX, startY)) {
            if (map.isBlock(startX, startY) || this.findCorner(map, x, y, startX, startY)) {
                return {
                    x0: x,
                    y0: y,
                    x1: startX,
                    y1: startY,
                    offset: startX % map.gridSize,
                    length: Math.sqrt((x - startX) * (x - startX) + (y - startY) * (y - startY))
                };
            }
            startX += xa;
            startY += ya;
        }

        return null;
    },

    checkVerticalIntersection: function (map, x, y, angle) {
        if (map.isOutOfMap(x, y)) {
            return null;
        }

        var faceLeft = angle >= 90 && angle <= 270;
        var startX, startY = 0;

        if (faceLeft)
            startX = Math.floor(x / map.gridSize) * map.gridSize - 0.1;
        else
            startX = Math.floor(x / map.gridSize) * map.gridSize + map.gridSize;
        startY = y + (x - startX) * Math.tan(angle * PI_DIV_180);

        xa = faceLeft ? -map.gridSize : map.gridSize;
        ya = -xa * Math.tan(angle * PI_DIV_180);

        while (!map.isOutOfMap(startX, startY)) {
            if (map.isBlock(startX, startY) || this.findCorner(map, x, y, startX, startY)) {
                return {
                    x0: x,
                    y0: y,
                    x1: startX,
                    y1: startY,
                    offset: startY % map.gridSize,
                    length: Math.sqrt((x - startX) * (x - startX) + (y - startY) * (y - startY))
                };
            }
            startX += xa;
            startY += ya;
        }

        return null;
    },

    findCorner: function (map, x0, y0, x1, y1) {
        var dx = x0 - x1;
        var dy = y0 - y1;

        var ix = Math.floor(x1 / map.gridSize);
        var iy = Math.floor(y1 / map.gridSize);

        var tmpx = 0;
        var tmpy = 0;
        var result = false;

        //left up
        if (dx > 0 && dy > 0) {
            tmpx = ix + 1;
            tmpy = iy;

            result = tmpx < map.width && map.isBlockGrid(tmpx, tmpy);

            tmpx = ix;
            tmpy = iy + 1;

            result = result && tmpy < map.height && map.isBlockGrid(tmpx, tmpy);

            if (result) {
                return true;
            }
        }

        //left bottom
        if (dx > 0 && dy < 0) {
            tmpx = ix + 1;
            tmpy = iy;

            result = tmpx < map.width && map.isBlockGrid(tmpx, tmpy);

            tmpx = ix;
            tmpy = iy - 1;

            result = result && tmpy >= 0 && map.isBlockGrid(tmpx, tmpy);

            if (result) {
                return true;
            }
        }

        //right up
        if (dx < 0 && dy > 0) {
            tmpx = ix - 1;
            tmpy = iy;

            result = tmpx >= 0 && map.isBlockGrid(tmpx, tmpy);

            tmpx = ix;
            tmpy = iy + 1;

            result = result && tmpy < map.height && map.isBlockGrid(tmpx, tmpy);

            if (result) {
                return true;
            }
        }

        //right bottom
        if (dx < 0 && dy < 0) {
            tmpx = ix - 1;
            tmpy = iy;

            result = tmpx >= 0 && map.isBlockGrid(tmpx, tmpy);

            tmpx = ix;
            tmpy = iy - 1;

            result = result && tmpy >= 0 && map.isBlockGrid(tmpx, tmpy);

            if (result) {
                return true;
            }
        }

        return false;
    },

    lookup: function () {
        this.centerY++;
        if (this.centerY > this.projectionHeight)
            this.centerY = this.projectionHeight;
    },

    lookdown: function () {
        this.centerY--;
        if (this.centerY < 0)
            this.centerY = 0;
    },

    //crouching: function () {

    //},

    //flying: function () { },

    render2d: function (context) {
        context.fillStyle = 'rgba(20,20,20,1)';
        context.fillRect(0, 0, this.map.realWidth, this.map.realHeight);

        //draw gird
        context.strokeStyle = 'rgb(60,60,60)';
        context.lineWidth = 1;

        for (var i = 0; i <= this.map.width; i++) {
            var step = i * this.map.gridSize + 0.5;
            context.beginPath();
            context.moveTo(step, 0);
            context.lineTo(step, this.map.realHeight);
            context.stroke();
        }

        for (var i = 0; i <= this.map.height; i++) {
            var step = i * this.map.gridSize + 0.5;
            context.beginPath();
            context.moveTo(0, step);
            context.lineTo(this.map.realWidth, step);
            context.stroke();
        }

        //draw solid grid
        context.fillStyle = 'skyblue';

        for (var y = 0; y < this.map.height; y++) {
            for (var x = 0; x < this.map.width; x++) {
                if (this.map.isBlockGrid(x, y)) {
                    context.fillRect(x * this.map.gridSize, y * this.map.gridSize, this.map.gridSize, this.map.gridSize);
                }
            }
        }

        //draw viewer
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(this.viewer.x, this.viewer.y, 6, 0, 2 * Math.PI, false);
        context.fill();
    },

    render3d: function (context) {

        //2d rays
        context.fillStyle = 'rgba(255,255,255,0.6)';
        context.lineWidth = 2;
        context.strokeStyle = 'white';
        var rays = this.cast();
        var i = 0;

        context.save();
        context.beginPath();
        for (; i < rays.length; i++) {
            if (rays[i] != null) {
                context.moveTo(rays[i].x0, rays[i].y0);
                break;
            }
        }

        for (; i < rays.length; i++) {
            var ray = rays[i];
            if (ray != null) {
                context.lineTo(ray.x1, ray.y1);
            }
        }

        context.closePath();
        context.fill();
      //  context.restore();

        //3d projection

       // context.save();
        context.beginPath();
        context.rect(this.map.realWidth, 0, this.projectionWidth, this.projectionHeight);
        context.clip();

        //var texture = this.game.getTexture('tex1.png');
        //var floor = this.game.getTexture('flo1.png');
        //var fw = floor.width;
        //var fh = floor.height;
       

        //for (i = 0; i < rays.length; i++) {
        //    var ray = rays[i];
          
        //    if (ray != null) {
        //        var offsetAngle = (this.projectionWidth / 2 - i) * this.dtAnglePerProjection;
        //        var distViewerToObject = Math.abs(ray.length * Math.cos(offsetAngle * PI_DIV_180));
        //        var projection = (this.distanceViewerToPlane / distViewerToObject) * this.map.gridSize;
        //        var offset = (this.projectionHeight - projection) / 2;

        //        //context.strokeStyle = 'hsl(200,50%,' + (50 * (projection / this.projectionHeight)) + '%)';
        //        //context.beginPath();
        //        //context.moveTo(i + this.map.realWidth, offset);
        //        //context.lineTo(i + this.map.realWidth, projection + offset);
        //        //context.stroke();

        //        context.drawImage(texture,
        //            ray.offset, 0, 1, texture.height, i + this.map.realWidth, offset, 1, projection);

        //        var light = (1-Math.min(1, projection / this.projectionHeight)) * 128;

        //        context.fillStyle = 'rgba(' + 0 + ',' + 255 + ',' + 0 + ',' + light/255 + ')';
          
        //        context.fillRect(i+this.map.realWidth,offset,1,projection);
             
        //        for (var j = Math.floor(offset + projection) ; j < this.projectionHeight; j++) {
        //            var distViewerToFloor = this.distanceViewerToPlane * this.viewer.height / (j - this.projectionHeight / 2);
        //            distViewerToFloor = Math.abs(distViewerToFloor / Math.cos(offsetAngle * PI_DIV_180));

        //          //  var floorX = this.viewer.x + Math.cos((this.viewer.angle + offsetAngle) * PI_DIV_180) * distViewerToFloor;
        //           // var floorY = this.viewer.y - Math.sin((this.viewer.angle + offsetAngle) * PI_DIV_180) * distViewerToFloor;

        //            // context.drawImage(floor, floorX % fw, floorY % fh, 1, 1, i + this.map.realWidth, j, 1, 1);

        //           // var xxx = context.getImageData(i, j, 1, 1);
        //           // var ddd = xxx.data;
        //           // var floorX = Math.floor(this.viewer.x + Math.cos((this.viewer.angle + offsetAngle) * PI_DIV_180) * distViewerToFloor);
        //           // var floorY = Math.floor(this.viewer.y - Math.sin((this.viewer.angle + offsetAngle) * PI_DIV_180) * distViewerToFloor);

        //           ////  if (this.map.isOutOfMap(floorX, floorY))
        //           //    //   continue;

        //           //  //var rgba = this.floorTexture.getPixel(floorX%this.floorTexture.width,floorY%this.floorTexture.height);

        //           //  var indexx = Math.floor(j * xxx.width + i)*4;
        //           //  ddd[indexx] = 255;
        //           //  ddd[indexx + 1] = 0;
        //           //  ddd[indexx + 2] = 0;
        //           //  ddd[indexx + 3] = 255;


        //           // context.putImageData(xxx, i, j);
        //        }
        //    } 
        //}

        //context.restore();
        //return;

        var imagedata = context.getImageData(this.x, this.y, this.projectionWidth, this.projectionHeight);
        var data = imagedata.data;

        var dd = imagedata.width / this.projectionWidth;
        var hh = imagedata.height / this.projectionHeight;

        for (i = 0; i < rays.length; i++) {
            var ray = rays[i];

            if (ray != null) {
                var offsetAngle = (this.projectionWidth / 2 - i) * this.dtAnglePerProjection;
                var distViewerToObject = Math.abs(ray.length * Math.cos(offsetAngle * PI_DIV_180));
                var projection = (this.distanceViewerToPlane / distViewerToObject) * this.map.gridSize;
                var offset = (this.projectionHeight - projection) / 2;

                //
                var perpixel = this.wallTexture.height / projection;
                for (var k = Math.floor(offset) ; k <=Math.floor(offset + projection); k++) {
                    if (k < 0 || k >= this.projectionHeight)
                        continue;
                    var rgba = this.wallTexture.getPixel(ray.offset, (k - Math.floor(offset)) * perpixel % this.wallTexture.height);
                    //var hsla = HSLA.fromRGBA(rgba);
                   // hsla.l = (1-distViewerToObject/(this.map.realHeight*2))*120;
                    // rgba = HSLA.toRGBA(hsla);

                    var light = (1-Math.min(1, projection / this.projectionHeight)) * 180;

                    var index = Math.floor(4 * ((k) * imagedata.width * hh + (i) * dd));
                    data[index] = rgba.r - light;
                    data[index + 1] = rgba.g - light;
                    data[index + 2] = rgba.b - light;
                    data[index + 3] = rgba.a;
                }

                for (var j = Math.floor(offset + projection) ; j < this.projectionHeight; j++) {
                    var distViewerToFloor = this.distanceViewerToPlane * this.viewer.height / (j - this.projectionHeight / 2);
                    distViewerToFloor = Math.abs(distViewerToFloor / Math.cos(offsetAngle * PI_DIV_180));

                    var ag = this.viewer.angle + offsetAngle;
                    

                    var floorX = Math.floor(this.viewer.x + Math.cos((this.viewer.angle + offsetAngle) * PI_DIV_180) * distViewerToFloor);
                    var floorY = Math.floor(this.viewer.y - Math.sin((this.viewer.angle + offsetAngle) * PI_DIV_180) * distViewerToFloor);

                    if (this.map.isOutOfMap(floorX, floorY))
                        continue;

                    var rgba = this.floorTexture.getPixel(floorX%this.floorTexture.width,floorY%this.floorTexture.height);
                    //var hsla = HSLA.fromRGBA(rgba);
                    //hsla.l = (1 - distViewerToFloor / 600) * 120;
                    //rgba = HSLA.toRGBA(hsla);

                    var light = (1-Math.min(1, distViewerToFloor / this.distanceViewerToPlane)) * 255;

                    var index = Math.floor(4 * (j * imagedata.width * hh + (i) * dd));
                    data[index] = rgba.r - light;
                    data[index + 1] = rgba.g - light;
                    data[index + 2] = rgba.b - light;
                    data[index + 3] = rgba.a;

                    index=Math.floor(4 * ((this.projectionHeight-j) * imagedata.width * hh + ( i) * dd));
                    data[index] = rgba.r - light;
                    data[index + 1] = rgba.g - light;
                    data[index + 2] = rgba.b - light;
                    data[index + 3] = rgba.a;
                }
            }
        }

        context.putImageData(imagedata,this.x, 0);


        context.restore();
    },

    render: function (context) {
        this.renderer.render(context,this);
    },

    //
};