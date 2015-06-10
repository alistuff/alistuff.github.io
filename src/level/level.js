/*
 *level
*/
(function (lv, et) {

    lv.Level = function () {
        this.grids = [];
        this.width = 0;
        this.height = 0;
        this.gridSize = 32;
        this.entities = [];
        this.events = [];
        this.player = undefined;
        this.spawnX = 0;
        this.spawnY = 0;
    };

    lv.Level.prototype = {

        init: function (texture) {
            this.width = texture.width;
            this.height = texture.height;

            for (var y = 0; y < texture.height; y++) {
                for (var x = 0; x < texture.width; x++) {
                    var col = texture.getRGBHex(x, y);
                    this.grids.push(col);
                }
            }

            for (var i = 0; i < this.grids.length; i++) {
                var x = Math.floor(i % this.width);
                var y = Math.floor(i / this.width);
                var col = this.getGrid(x, y);
                var dx = x * this.gridSize + this.gridSize / 2;
                var dy = y * this.gridSize + this.gridSize / 2;
                var entity = this.decorateGrid(x,y,dx, dy, col);
                if (entity) {
                    this.addEntity(entity);
                }
            }
        },

        getRealWidth:function(){
            return this.width * this.gridSize;
        },

        getRealHeight:function(){
            return this.height * this.gridSize;
        },

        getGrid: function (x, y) {
            return this.grids[x + y * this.width];
        },

        setGrid: function (x, y, value) {
            this.grids[x + y * this.width] = value;
        },

        isBlock: function (x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                return true;
            return !(this.getGrid(x, y) === 0xffffff);
        },

        decorateGrid: function (x, y,dx,dy,col) {
            return undefined;
        },

        getWall:function(x,y){
            return undefined;
        },

        getFloor:function(x,y){
            return undefined;
        },

        getCeiling:function(x,y){
            return undefined;
        },

        isOutOfMap: function (x, y) {
            return x < 0 || y < 0 || x >= this.getRealWidth() || y >= this.getRealHeight();
        },

        update: function (time) {
            for (var i = 0; i < this.entities.length; i++) {
                var entity = this.entities[i];
                entity.update(time);
                entity.col = 'rgb(0,0,255)';
                if (!entity.alive) {
                    this.entities.splice(i, 1);
                    i--;
                }
            }
        },

        getVisibleEntities: function (viewer, comparefn) {
            var visibleEntities = [];

            for (var i = 0; i < this.entities.length; i++) {
                var entity = this.entities[i];
                var dx = entity.x - viewer.x;
                var dy = entity.y - viewer.y;
                var alpha = -Math.atan2(dy, dx) * 180 / Math.PI;
                alpha = (alpha % 360 + 360) % 360;

                var offsetAngle = Math.abs(alpha - viewer.rot);
                offsetAngle = Math.min(offsetAngle, 360 - offsetAngle);

                if (offsetAngle <= viewer.fov / 2) {
                    entity.col = 'rgb(0,255,0)';
                    visibleEntities.push(entity);
                }
            }

            //default : desc
            visibleEntities.sort(comparefn || function (a, b) {
                var da = Math.sqrt((a.x - viewer.x) * (a.x - viewer.x) +
                    (a.y - viewer.y) * (a.y - viewer.y));

                var db = Math.sqrt((b.x - viewer.x) * (b.x - viewer.x) +
                    (b.y - viewer.y) * (b.y - viewer.y));

                return da > db ? -1 : 1;
            });

            return visibleEntities;
        },

        addEntity: function (entity) {
            entity.level = this;
            this.entities.push(entity);
        },

        triggerEvent: function (x, y) {
            var id = y * this.width + x;
            for (var i = 0; i < this.events.length; i++) {
                var target = this.events[i];
                if (target.event === id) {
                    target.excute.call(this);
                    this.events.splice(i--, 1);
                    break;
                }
            }
        },
    };

})(Alistuff.fps.level, Alistuff.fps.entities);