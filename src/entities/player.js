/*
 *Player
*/
(function (ns) {

    ns.Player = function (x, y) {
        ns.Entity.call(this, x, y);
        this.fov = 60;
        this.rot = 90;
        this.rotz = 0;
        this.speed = 2;
        this.lastrot = 0;
        this.weapon = new ns.Weapon(this);
    }

    Alistuff.ext(ns.Player, ns.Entity, {
        update: function (time) {
            this.move();
            this.weapon.update(time);
        },

        move: function () {
            var newx = this.vx + this.x;
            var newy = this.vy + this.y;
            var map = this.level;

            if (!map.isBlock(Math.floor(newx / map.gridSize), Math.floor(newy / map.gridSize))) {
                this.x = newx;
                this.y = newy;
            }
      
            if (Math.abs(this.vx) > 0.01)
                this.vx *= 0.6;
            else
                this.vx = 0;

            if (Math.abs(this.vy) > 0.01)
                this.vy *= 0.6;
            else
                this.vy = 0;
        },

        turnLeft: function () {
            this.vx = Math.cos(this.rot * Math.PI / 180 + Math.PI / 2) * this.speed;
            this.vy = -Math.sin(this.rot * Math.PI / 180 + Math.PI / 2) * this.speed;
        },

        turnRight: function () {
            this.vx = Math.cos(this.rot * Math.PI / 180 - Math.PI / 2) * this.speed;
            this.vy = -Math.sin(this.rot * Math.PI / 180 - Math.PI / 2) * this.speed;
        },

        turnUp: function () {
            this.vx = Math.cos(this.rot * Math.PI / 180) * this.speed;
            this.vy = -Math.sin(this.rot * Math.PI / 180) * this.speed;
        },

        turnDown: function () {
            this.vx = -Math.cos(this.rot * Math.PI / 180) * this.speed;
            this.vy = Math.sin(this.rot * Math.PI / 180) * this.speed;
        },

        rotateLeft: function () {
            this.rotate(this.speed);
        },

        rotateRight: function () {
            this.rotate(-this.speed);
        },

        lookAround:function(x,y,width,height){
            this.rotate(this.lastrot-x);
            this.lastrot = x;
            this.rotz = y - height / 2;
        },

        shoot: function () {
            this.weapon.shoot();
            //var vx = Math.cos(this.rot * Math.PI / 180) * this.speed;
            //var vy = -Math.sin(this.rot * Math.PI / 180) * this.speed;
            //this.level.addEntity(new ns.Bullet(this.x, this.y, vx, vy, this.rotz, this));
        },
    });

})(Alistuff.fps.entities);