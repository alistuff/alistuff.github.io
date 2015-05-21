var PI_DIV_180 = Math.PI / 180;

var GridMap = function (game) {
    //10*10
    this.grids =
        [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 1, 1, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 1, 0, 1, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ];

    this.game = game;
    //map stuff
    this.width = 10;
    this.height = 15;
    this.gridSize = 32;
    this.realWidth = this.width * this.gridSize;
    this.realHeight = this.height * this.gridSize;

    //viewer stuff
    this.viewerX = 146;
    this.viewerY = 106
    this.viewerR = 6;
    this.viewerHeight = this.gridSize/2;
    this.viewerAngle = 0;

    //plane stuff
    this.planeWidth = 640;
    this.planeHeight = 480;
    this.fov = 60;
    this.halfFov = this.fov / 2;
    this.distViewerToPlane = this.planeWidth / 2 / Math.tan(this.fov / 2 * PI_DIV_180);
    this.anglePerPixels = this.fov / this.planeWidth;



    this.tick = 0;

    return this;
};

GridMap.prototype = {

    getGrid: function (x, y) {
        return this.grids[x + y * this.width];
    },

    setGrid:function(x,y,value){
        this.grids[x + y * this.width] = value;
    },

    isBlockGrid:function(x,y){
        return this.getGrid(x, y) > 0;
    },

    isBlock: function (x, y) {
        return this.getGrid(Math.floor(x / this.gridSize), Math.floor(y / this.gridSize)) > 0;
    },

    isOutOfMap:function(x,y){
        return x < 0 || y < 0 || x >= this.realWidth || y >= this.realHeight;
    },

    checkHorizontalIntersection: function (x, y, angle) {
        if (this.isOutOfMap(x, y)) {
            return null;
        }

        var faceUp = angle >= 0 && angle <= 180;
        var startX, startY = 0;

        if (faceUp)
            startY = Math.floor(y / this.gridSize) * this.gridSize - 0.1;
        else
            startY = Math.floor(y / this.gridSize) * this.gridSize + this.gridSize;
        startX = x + (y - startY) / Math.tan(angle * PI_DIV_180);

        var ya = faceUp ? -this.gridSize : this.gridSize;
        var xa = -ya / Math.tan(angle * PI_DIV_180);

        while (!this.isOutOfMap(startX, startY)) {
            if (this.isBlock(startX, startY) || this.findCorner(x, y, startX, startY)) {
                return {
                    x0: x,
                    y0: y,
                    x1: startX,
                    y1: startY,
                    offset: startX % this.gridSize,
                    length: Math.sqrt((x - startX) * (x - startX) + (y - startY) * (y - startY))
                };
            }
            startX += xa;
            startY += ya;
        }

        return null;
    },

    checkVerticalIntersection: function (x, y, angle) {
        if (this.isOutOfMap(x, y)) {
            return null;
        }

        var faceLeft = angle >= 90 && angle <= 270;
        var startX, startY = 0;
        
        if (faceLeft)
            startX = Math.floor(x/ this.gridSize) * this.gridSize - 0.1;
        else
            startX = Math.floor(x/ this.gridSize) * this.gridSize + this.gridSize;
        startY = y + (x - startX) * Math.tan(angle * PI_DIV_180);

        xa = faceLeft ? -this.gridSize : this.gridSize;
        ya = -xa * Math.tan(angle * PI_DIV_180);

        while (!this.isOutOfMap(startX, startY)) {
            if (this.isBlock(startX, startY) ||this.findCorner(x,y,startX,startY)) {
                return {
                    x0: x,
                    y0: y,
                    x1: startX,
                    y1: startY,
                    offset: startY % this.gridSize,
                    length: Math.sqrt((x - startX) * (x - startX) + (y - startY) * (y - startY))
                };
            }
            startX += xa;
            startY += ya;
        }

        return null;
    },

    findCorner:function(x0,y0,x1,y1){
        var dx = x0 - x1;
        var dy = y0 - y1;

        var ix = Math.floor(x1/this.gridSize);
        var iy = Math.floor(y1 / this.gridSize);

        var tmpx = 0;
        var tmpy = 0;
        var result = false;

        //left up
        if (dx > 0 && dy > 0) {
            tmpx = ix + 1;
            tmpy = iy;

            result = tmpx < this.width && this.isBlockGrid(tmpx, tmpy);

            tmpx = ix;
            tmpy = iy + 1;

            result = result && tmpy < this.height && this.isBlockGrid(tmpx, tmpy);

            if (result) {
                return true;
            }
        }

        //left bottom
        if (dx > 0 && dy < 0) {
            tmpx = ix + 1;
            tmpy = iy;

            result = tmpx < this.width && this.isBlockGrid(tmpx, tmpy);

            tmpx = ix;
            tmpy = iy - 1;

            result = result && tmpy >= 0 && this.isBlockGrid(tmpx, tmpy);

            if (result) {
                return true;
            }
        }

        //right up
        if (dx < 0 && dy > 0) {
            tmpx = ix - 1;
            tmpy = iy;

            result = tmpx >= 0 && this.isBlockGrid(tmpx, tmpy);

            tmpx = ix;
            tmpy = iy + 1;

            result = result && tmpy < this.height && this.isBlockGrid(tmpx, tmpy);

            if (result) {
                return true;
            }
        }

        //right bottom
        if (dx < 0 && dy < 0) {
            tmpx = ix - 1;
            tmpy = iy;

            result = tmpx >= 0 && this.isBlockGrid(tmpx, tmpy);

            tmpx = ix;
            tmpy = iy - 1;

            result = result && tmpy >= 0 && this.isBlockGrid(tmpx, tmpy);

            if (result) {
                return true;
            }
        }

        return false;
    },

    cast: function (density) {
        var startAngle = this.viewerAngle + this.halfFov;
        var adjustAngle = function (a) { return (a % 360 + 360) % 360; };
        var factor = this.fov / density;

        var rays = [];
        for (var i = 0; i < density; i++) {

            var hray = this.checkHorizontalIntersection(this.viewerX,this.viewerY,adjustAngle(startAngle));
            var vray = this.checkVerticalIntersection(this.viewerX, this.viewerY, adjustAngle(startAngle));

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

    update: function (time) {
    },

    draw2D: function (context) {
        context.fillStyle = 'rgba(20,20,20,1)';
        context.fillRect(0, 0, this.realWidth, this.realHeight);

        //draw gird
        context.strokeStyle = 'rgb(60,60,60)';
        context.lineWidth = 1;
        
        for (var i = 0; i <=this.width; i++) {
            var step = i * this.gridSize + 0.5;
            context.beginPath();
            context.moveTo(step, 0);
            context.lineTo(step, this.realHeight);
            context.stroke();
        }
      
        for (var i = 0; i <=this.height; i++) {
            var step = i * this.gridSize + 0.5;
            context.beginPath();
            context.moveTo(0, step);
            context.lineTo(this.realWidth, step);
            context.stroke();
        }

        //draw solid grid
        context.fillStyle = 'skyblue';

        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                if (this.isBlockGrid(x, y)) {
                    context.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                }
            }
        }

        //draw viewer
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(this.viewerX, this.viewerY, this.viewerR, 0, 2 * Math.PI, false);
        context.fill();   
    },

    draw3D: function (context) {
        //draw 2d rays
        context.fillStyle = 'rgba(255,255,255,0.6)';

        var rays = this.cast(this.planeWidth);
        var i = 0;

        context.save();
        context.beginPath();

        var pre = 0;
        for (i = 0; i < rays.length; i++) {
            if (rays[i] != null) {
                context.moveTo(rays[i].x0,rays[i].y0);
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
        context.restore();

        context.fillStyle = 'skyblue';
        context.fillRect(this.realWidth, 0, this.planeWidth, this.planeHeight/2);
        //context.fillStyle = 'black';
        //context.fillRect(this.realWidth, this.planeHeight/2, this.planeWidth, this.planeHeight/2);
        context.lineWidth = 2;

        this.tick += 1;
        var texture = this.game.getTexture('tex1.png');
        var floor = this.game.getTexture('flo1.png');
        var fw = floor.width;
        var fh = floor.height;

        for (i = 0; i < rays.length; i++) {
            var ray = rays[i];
            if (ray != null) {
                var offsetAngle = (this.planeWidth / 2 - i) * this.anglePerPixels;
                var distViewerToObject = Math.abs(ray.length * Math.cos(offsetAngle * PI_DIV_180));
                var projection = (this.distViewerToPlane / distViewerToObject) * this.gridSize;
                var offset = (this.planeHeight - projection) / 2;

                //context.strokeStyle = 'hsl(200,50%,' + (50 * (projection / this.planeHeight)) + '%)';
                //context.beginPath();
                //context.moveTo(i + this.realWidth, offset);
                //context.lineTo(i + this.realWidth, projection + offset);
                //context.stroke();

                context.drawImage(texture,
                    ray.offset, 0, 1, texture.height, i + this.realWidth, offset, 1, projection);

                for (var j = Math.floor(offset + projection) ; j < this.planeHeight; j++) {
                    var distViewerToFloor = this.distViewerToPlane * this.viewerHeight / (j - this.planeHeight / 2);
                    distViewerToFloor /= Math.abs(Math.cos(offsetAngle * PI_DIV_180));

                    var floorX = this.viewerX + Math.cos(-(this.viewerAngle + offsetAngle) * PI_DIV_180)*distViewerToFloor;
                    var floorY = this.viewerY + Math.sin(-(this.viewerAngle + offsetAngle) * PI_DIV_180)*distViewerToFloor;

                   context.drawImage(floor, floorX % fw, floorY % fh, 1, 1, i + this.realWidth, j, 1, 1);
                  //  context.drawImage(floor, floorX % fw, floorY % fh, 1, 1, i + this.realWidth, this.planeHeight-j, 1, 1);
                   
                }
            }
        }
    },
};

//viewer
var Viewer = function () {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.angle = 0;
    this.fov = 0;
    this.height = 0;
};

Viewer.prototype = {

    move: function () {

    },

    rotate: function () {

    },
};