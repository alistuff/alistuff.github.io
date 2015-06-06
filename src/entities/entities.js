/*
 *Entities
*/
(function (ns) {
    //entity
    ns.Entity = function (x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rot = 0;
        this.rotz = 0;
        this.speed = 0;
        this.tex = undefined;
        this.width = undefined;
        this.height = undefined;
        this.level = undefined;
        this.alive = true;
        this.col = 'rgb(0,0,255)';
    }

    ns.Entity.prototype = {
        update: function (time) { },
        move: function (blockCallback) {

            var angle = this.rot*Math.PI/180;
            this.vx = Math.cos(angle) * this.speed;
            this.vy = -Math.sin(angle) * this.speed;

            var newx = this.x + this.vx;
            var newy = this.y + this.vy;

            if (!this.level.isBlock(Math.floor(newx / this.level.gridSize),
                Math.floor(newy / this.level.gridSize))) {
                this.x = newx;
                this.y = newy;
            }
            else {
                blockCallback && blockCallback.call(this);
            }
        },
        rotate:function(value){
            this.rot += value;
            this.rot = (this.rot % 360 + 360) % 360;
        },
        collide: function (entity) {
            return false;
        },
    };

    //enemy
    ns.Enemy = function (x, y) {
        ns.Entity.call(this, x, y);
        this.x = x;
        this.y = y;
        this.hp = 0;
        this.speed = 0.5;
        this.weapon = new ns.Weapon(this);
    }

    Alistuff.ext(ns.Enemy, ns.Entity, {
        update:function(time){
            if (Math.random()<0.01) {
                this.rotate(Math.random() * 360);
            }
            if (Math.random() < 0.01) {
                var dx = this.level.player.x - this.x;
                var dy = this.level.player.y - this.y;
                var alpha = -Math.atan2(dy, dx) * 180 / Math.PI;
                alpha = (alpha % 360 + 360) % 360;
                var offsetAngle = alpha - this.rot;
                var testAngle = Math.min(Math.abs(offsetAngle), 360 - Math.abs(offsetAngle));
                if (testAngle <= this.level.player.fov / 2) {
                    this.rotate(offsetAngle /*+ (5 - Math.random() * 10)*/);
                    this.weapon.shoot();
                }         
            }

            this.weapon.update(time);
            this.move(function () { this.rotate(this.rot + 90 - Math.random() * 180); });
        },

        hurt: function (dam) {
            this.hp -= dam;
            if (this.hp < 0) {
                this.hp = 0;
                this.alive = false;
            }
        },
    });

    ns.Html5Enemy = function (x, y) {
        ns.Enemy.call(this, x, y);
        this.hp = 100;
        this.tex = 'html5';
        this.width = 16;
        this.height = 16;
    }

    Alistuff.ext(ns.Html5Enemy, ns.Enemy);

    ns.JavaEnemy = function (x, y) {
        ns.Enemy.call(this, x, y);
        this.hp = 100;
        this.tex = 'java';
        this.width = 16;
        this.height = 16;
        this.rotz = -16;
    }

    Alistuff.ext(ns.JavaEnemy, ns.Enemy);

    ns.AndroidEnemy = function (x, y) {
        ns.Enemy.call(this, x, y);
        this.hp = 100;
        this.tex = 'android';
        this.width = 8;
        this.height = 8;
       // this.rotz = 64;
    }

    Alistuff.ext(ns.AndroidEnemy, ns.Enemy);

    //weapon
    ns.Weapon = function (owner) {
        ns.Entity.call(this, 0, 0);
        this.tex = 'awp';
        this.owner = owner;
        this.ticks = 0;
        this.shooting = -1;
    }

    Alistuff.ext(ns.Weapon, ns.Entity, {
        update: function (time) {
            if (this.shooting >= -5) {
                this.x = Math.cos(this.shooting / Math.PI) * 5;
                this.y = Math.sin(this.shooting / Math.PI) * 5;
                this.shooting--;
            } else {
                var ismoving = this.owner.vx !== 0 || this.owner.vy !== 0;
                if (ismoving) {
                    this.x = Math.cos(this.ticks / Math.PI) * 1;
                    this.y = Math.sin(this.ticks / Math.PI) * 5;
                    this.ticks += 0.3;
                }
            }
        },

        shoot: function () {
            var e = this.owner;
            if (e) {
                e.level.addEntity(new ns.Bullet(
                    e.x,
                    e.y,
                    e.rot,
                    e.rotz,
                    e
                ));
                this.shooting = 5;
            }
        },
    });

    //bullet
    ns.Bullet = function (x, y, rot,rotz, owner) {
        ns.Entity.call(this, x, y);
     //   this.tex = 'bullet';
        this.width = 1;
        this.height = 1;
        this.rot = rot;
        this.rotz = rotz;
        this.speed = 20;
        this.owner = owner;
        this.level = this.owner.level;
        this.aliveTime = 100;
    }

    Alistuff.ext(ns.Bullet, ns.Entity, {
        update: function (time) {

            if (this.aliveTime > 0) {
                this.aliveTime--;
                this.move(function () {
                    this.explode();
                });

                if (this.level.isOutOfMap(this.x, this.y)) {
                    this.destroy();
                }

            } else {
                this.destroy();
            }
        },

        explode: function () {
            this.destroy();
        },

        destroy: function () {
            this.aliveTime = 0;
            this.alive = false;
        },

    });

})(Alistuff.fps.entities);