/*
 *level
*/
(function (lv, et) {

    lv.GridMap = function () {
        // 0      entity 
        // 1234   floor
        // 56789  wall
        this.grids =
            [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 5, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 5, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 5, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 5, 1, 1, 5, 1, 5, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 9, 5,
                5, 1, 1, 1, 1, 1, 5, 0, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 5, 1, 1, 1, 1, 1, 5, 1, 1, 1, 0, 1, 5,
                5, 1, 5, 5, 5, 5, 1, 1, 5, 1, 1, 0, 1, 1, 5,
                5, 0, 1, 1, 1, 5, 1, 1, 1, 1, 0, 1, 1, 1, 5,
                5, 1, 0, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 5, 5, 5, 1, 5, 1, 1, 1, 1, 1, 7, 7, 1, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 1, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 1, 1, 0, 1, 1, 6, 1, 1, 1, 8, 8, 1, 5,
                5, 1, 1, 1, 1, 1, 6, 6, 6, 1, 1, 8, 1, 1, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 5, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ];

        //map stuff
        this.width = 15;
        this.height = 25;
        this.gridSize = 32;
        this.realWidth = this.width * this.gridSize;
        this.realHeight = this.height * this.gridSize;

        this.entities = [];
        for (var i = 0; i < this.width * this.height; i++) {
            var x = Math.floor(i % this.width);
            var y = Math.floor(i / this.width);
            var grid = this.getGrid(x, y);
            if (grid === 0) {
                var entity;
                var dx = x * this.gridSize + this.gridSize / 2;
                var dy = y * this.gridSize + this.gridSize / 2;
                if (Math.random() < 0.3) {
                    entity = new et.Html5Enemy(dx,dy);
                }
                else if(Math.random()<0.6) {
                    entity = new et.JavaEnemy(dx, dy);
                }
                else {
                    entity = new et.AndroidEnemy(dx, dy);
                }
                entity.level = this;
                this.entities.push(entity);
            }
        }

        this.player = undefined;

        return this;
    };

    lv.GridMap.prototype = {

        getGrid: function (x, y) {
            return this.grids[x + y * this.width];
        },

        setGrid: function (x, y, value) {
            this.grids[x + y * this.width] = value;
        },

        isBlock: function (x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                return true;
            return this.getGrid(x, y) > 4;
        },

        getTexture:function(x,y){
            return undefined;
        },

        isOutOfMap: function (x, y) {
            return x < 0 || y < 0 || x >= this.realWidth || y >= this.realHeight;
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
    };

})(Alistuff.fps.level, Alistuff.fps.entities);