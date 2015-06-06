﻿/*
 * game states
*/
(function (core,animation) {

    function renderer_mask(context, actor) {
        context.fillStyle = '#000';
        context.fillRect(0, 0, context.canvas.width, 50);
        context.fillRect(0, context.canvas.height - 50, context.canvas.width, 50);
    };

    function renderer_transition(context, actor) {
        context.save();
        context.fillStyle = actor.getRGBA();
        context.fillRect(1, 1, 478, 318);
        context.restore();
    };

    function renderer_movie(context, actor) {
        context.save();
        context.fillStyle = 'rgba(10,10,10,'+actor.alpha+')';
        context.fillRect(1, 1, 478, 318);
        context.fillStyle = '#fff';
        context.beginPath();
        for (var i = 0; i < 1000; i++) {
            context.rect(1 + Math.random() * 478, 1 + Math.random() * 318, 2, 2);
        }
        context.fill();
        context.restore();
    };

    function renderer_dynamicText(context, actor) {
        context.save();
        context.font = '25px 微软雅黑';
        context.fillStyle = actor.getRGBA();
        context.fillText(actor.dynamicText, actor.x, actor.y);
        context.restore();
    };

    function renderer_text20px(context, actor) {
        context.save();
        context.font = '20px 微软雅黑';
        context.fillStyle = actor.getRGBA();
        context.fillText(actor.text, actor.x, actor.y);
        context.restore();
    };

    function renderer_text(context, actor) {
        context.save();
        context.font = '150px 微软雅黑';
        context.fillStyle = actor.getRGBA();
        context.fillText(actor.text, actor.x, actor.y);
        context.restore();
    };

    function renderer_me(context, actor) {
        context.save();
        context.fillStyle = actor.getRGBA();
        context.fillRect(actor.x, actor.y, 20, 30);
        context.restore();
    };

    function renderer_trees(context, actor) {
        context.save();
       
        for (var i = 0; i < 10; i++) {
            var x = actor.x + Math.sin(i) * 60 + 20;
            var y = actor.y - 15 * i;
            var height = actor.y - y + 30;

            context.fillStyle = actor.getRGBA();
            context.fillRect(x, y, 20, 20);
            context.fillRect(x + 20, y + 5, 20, 20);
            context.fillRect(x + 10, y - 10, 20, 20);
            context.fillRect(x + y / 2, 265, 1, 5);
            context.fillRect(x + y, 265, 1, 5);
            context.fillStyle = 'rgba(124,68,0,' + actor.alpha + ')';
            context.fillRect(x + 15, y + 20, 5, height);
        }
       
        context.restore();
    };

    function renderer_city(context, actor) {
        context.save();
        var x = actor.x;
        var y = actor.y;
        context.fillStyle = 'rgba(90,90,90,' + actor.alpha + ')';
        context.fillRect(x + 80, y - 70, 80, 70);
        context.fillStyle = 'rgba(70,70,70,' + actor.alpha + ')';
        context.fillRect(x, y - 90, 80, 90);
        context.fillRect(x + 60, y - 150, 80, 150);
        context.fillStyle = 'rgba(50,50,50,' + actor.alpha + ')';
        context.fillRect(x - 10, y - 80, 50, 80);
        context.fillRect(x + 20, y - 60, 50, 60);
        context.fillRect(x + 80, y - 120, 40, 120);
        context.restore();
    };

    function renderer_friends(context, actor) {
        context.save();
        for (var i = 0; i < 15; i++) {
            context.fillStyle = 'rgba(' + i * 10 + ',' + i * 10 + ',' + i * 10 + ',' + actor.alpha + ')';
            var x = actor.x + Math.sin(i) * 80;
            var y = actor.y;
            var height = 30 + Math.sin(i/2) * 10;
            context.fillRect(x, y - height, 20, height);
        }
        context.restore();
    };

    function renderer_floor1(context, actor) {
        context.save();
        context.fillStyle = actor.getRGBA();
        context.fillRect(0, context.canvas.height - 50, context.canvas.width, 50);
        context.restore();
    };

    function renderer_floor2(context, actor) {
        context.save();
        context.fillStyle = actor.getRGBA();
        context.fillRect(120, context.canvas.height - 50,  240, 50);
        context.restore();
    };

    function renderer_floor3(context, actor) {
        context.save();
        context.fillStyle = actor.getRGBA();
        context.fillRect(190, context.canvas.height - 50, 120, 50);
        context.restore();
    };

    function renderer_wall(context, actor) {
        context.save();
        context.fillStyle = 'rgba(10,10,10,' + actor.alpha + ')';
        context.fillRect(actor.x, actor.y - 60, 20, 60);
        context.restore();
    };

    function make_renderer_end() {
        var tick = 0;
        var objs = [];
        for (var i = 0; i < 50; i++) {
            var r = 50 + Math.random() * 200;
            var t = Math.random()*Math.PI*2;
            objs.push({
                x: 240 + Math.cos(t) * r,
                y: 160 + Math.sin(t) * r,
                r: r,
                s: 20 + Math.random() * 20,
                t:t
            });
        }

        return function (context, actor) {
            context.save();

            var scale = tick / 2;
            for (var i = 0; i < objs.length; i++) {
                var obj = objs[i];
                obj.x = 240 + Math.cos(obj.t+tick) * obj.r;
                obj.y = 160 + Math.sin(obj.t + tick) * obj.r;

                var col = Math.floor(obj.s);
                context.fillStyle = 'rgba(' + col + ',' + col + ',' + col + ','+actor.alpha*2+')';
                context.fillRect(obj.x, obj.y, obj.s, obj.s);
            }
            
            context.fillStyle = 'rgba(0,0,0,'+actor.alpha+')';
            context.fillRect(240 + scale, 160 + scale, Math.max(0.1, 20 - scale), Math.max(0.1, 30 - scale));
            context.restore();
            tick += 0.10;
        };
    };

    //game animation state
    core.Animation1State = function () {
        core.State.call(this);
        this.game = undefined;
        this.stage = undefined;
        this.transitionAnimation = [];
    }

    Alistuff.ext(core.Animation1State, core.State, {

        start: function (game) {
            this.game = game;
            this.stage = new animation.Stage();
            //没有编写动画生成程序，硬编码代替，以后会采用json/xml等文件格式载入
            this.stage
                .addActor(new animation.TextActor('《自从得了神经病  整个人精神多了》', renderer_dynamicText, 35, 160, 0, 0, 0, 0)
                .addAnimation(1, 3, new animation.TextAnimation(animation.TEXT_ANIMATION_NORMAL))
                .addAnimation(1, 3, new animation.AlphaAnimation(1))
                .addAnimation(3, 5, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('程序：alistuff@ali', renderer_dynamicText, 40, 160, 0, 0, 0, 0)
                .addAnimation(5, 7, new animation.TextAnimation(animation.TEXT_ANIMATION_NORMAL))
                .addAnimation(5, 7, new animation.AlphaAnimation(1))
                .addAnimation(7, 11, new animation.AlphaAnimation(-1))
                .addAnimation(7, 9, new animation.TranslateAnimation(0, -50))
                .addAnimation(9, 11, new animation.TranslateAnimation(200, 0)))
                .addActor(new animation.TextActor('设计：alistuff@ali', renderer_dynamicText, 40, 160, 0, 0, 0, 0)
                .addAnimation(11, 13, new animation.TextAnimation(animation.TEXT_ANIMATION_NORMAL))
                .addAnimation(11, 13, new animation.AlphaAnimation(1))
                .addAnimation(13, 17, new animation.AlphaAnimation(-1))
                .addAnimation(13, 15, new animation.TranslateAnimation(0, -50))
                .addAnimation(15, 17, new animation.TranslateAnimation(200, 0)))
                .addActor(new animation.TextActor('音效：alistuff@ali', renderer_dynamicText, 40, 160, 0, 0, 0, 0)
                .addAnimation(17, 19, new animation.TextAnimation(animation.TEXT_ANIMATION_NORMAL))
                .addAnimation(17, 19, new animation.AlphaAnimation(1))
                .addAnimation(19, 23, new animation.AlphaAnimation(-1))
                .addAnimation(19, 21, new animation.TranslateAnimation(0, -50))
                .addAnimation(21, 23, new animation.TranslateAnimation(200, 0)))
                .addActor(new animation.TextActor('美术：alistuff@ali', renderer_dynamicText, 40, 160, 0, 0, 0, 0)
                .addAnimation(23, 25, new animation.TextAnimation(animation.TEXT_ANIMATION_NORMAL))
                .addAnimation(23, 25, new animation.AlphaAnimation(1))
                .addAnimation(25, 29, new animation.AlphaAnimation(-1))
                .addAnimation(25, 27, new animation.TranslateAnimation(0, -50))
                .addAnimation(27, 29, new animation.TranslateAnimation(200, 0)))
                .addActor(new animation.TextActor('本片如有雷同  不属巧合', renderer_dynamicText, 40, 160, 0, 0, 0, 0)
                .addAnimation(29, 31, new animation.TextAnimation(animation.TEXT_ANIMATION_NORMAL))
                .addAnimation(29, 31, new animation.AlphaAnimation(1))
                .addAnimation(31, 34, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_transition, 0, 0, 255, 255, 255)
                .addAnimation(34, 43, new animation.EmptyAnimation())
                .addAnimation(34, 38, new animation.TweenAnimation(-240, -240, -240)))
                .addActor(new animation.Actor(renderer_movie)
                .addAnimation(38, 57, new animation.EmptyAnimation()))
                .addActor(new animation.TextActor('5', renderer_text, 180, 200, 255, 255, 255, 0)
                .addAnimation(38, 42, new animation.ShakeAnimation(30))
                .addAnimation(38, 40, new animation.AlphaAnimation(1))
                .addAnimation(40, 42, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('4', renderer_text, 180, 200, 255, 255, 255, 0)
                .addAnimation(41, 45, new animation.ShakeAnimation(30))
                .addAnimation(41, 43, new animation.AlphaAnimation(1))
                .addAnimation(43, 45, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('3', renderer_text, 180, 200, 255, 255, 255, 0)
                .addAnimation(44, 48, new animation.ShakeAnimation(30))
                .addAnimation(44, 46, new animation.AlphaAnimation(1))
                .addAnimation(46, 48, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('2', renderer_text, 180, 200, 255, 255, 255, 0)
                .addAnimation(47, 51, new animation.ShakeAnimation(30))
                .addAnimation(47, 49, new animation.AlphaAnimation(1))
                .addAnimation(49, 51, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('1', renderer_text, 180, 200, 255, 255, 255, 0)
                .addAnimation(50, 54, new animation.ShakeAnimation(30))
                .addAnimation(50, 52, new animation.AlphaAnimation(1))
                .addAnimation(52, 54, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_transition, 0, 0, 0, 0, 0, 0)
                .addAnimation(52, 60, new animation.EmptyAnimation())
                .addAnimation(52, 57, new animation.AlphaAnimation(1))
                .addAnimation(57, 60, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_city, 480, 270)
                .addAnimation(105, 121, new animation.EmptyAnimation())
                .addAnimation(105, 120, new animation.TranslateAnimation(-600))
                .addAnimation(116, 120, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_friends, 550, 270)
                .addAnimation(120, 135, new animation.EmptyAnimation())
                .addAnimation(120, 135, new animation.TranslateAnimation(-600))
                .addAnimation(128, 133, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_me, 200, 240, 0, 0, 0, 0)
                .addAnimation(57, 200, new animation.EmptyAnimation())
                .addAnimation(57, 60, new animation.AlphaAnimation(1))
                .addAnimation(60, 65, new animation.TranslateAnimation(100, 0))
                .addAnimation(65, 70, new animation.TranslateAnimation(-100, 0))
                .addAnimation(74, 78, new animation.TweenAnimation(255, 0, 0))
                .addAnimation(78, 82, new animation.TweenAnimation(-255, 0, 0))
                .addAnimation(133, 140, new animation.AlphaAnimation(-1))
                .addAnimation(143, 145, new animation.AlphaAnimation(1))
                .addAnimation(140, 142, new animation.TranslateAnimation(40, 0))
                .addAnimation(147, 151, new animation.TranslateAnimation(-100, 0))
                .addAnimation(151, 159, new animation.TranslateAnimation(200, 0))
                .addAnimation(159, 163, new animation.TranslateAnimation(-100, 0))
                .addAnimation(163, 165, new animation.TranslateAnimation(-50, 0))
                .addAnimation(165, 169, new animation.TranslateAnimation(100, 0))
                .addAnimation(169, 172, new animation.TranslateAnimation(-50, 0))
                .addAnimation(195, 196, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_trees, 50, 230, 0, 255, 0, 0)
                .addAnimation(57, 180, new animation.EmptyAnimation())
                .addAnimation(57, 60, new animation.AlphaAnimation(1))
                .addAnimation(95, 99, new animation.TweenAnimation(0, -255, 0))
                .addAnimation(98, 113, new animation.TranslateAnimation(-600)))
                .addActor(new animation.Actor(renderer_floor1)
                .addAnimation(143, 187, new animation.EmptyAnimation())
                .addAnimation(185, 187, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_floor2)
                .addAnimation(143, 190, new animation.EmptyAnimation())
                .addAnimation(188, 190, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_floor3)
                .addAnimation(143, 194, new animation.EmptyAnimation())
                .addAnimation(192, 194, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_wall,140,270,0,0,0,0)
                .addAnimation(151, 200, new animation.EmptyAnimation())
                .addAnimation(151, 153, new animation.AlphaAnimation(1))
                .addAnimation(163, 164, new animation.AlphaAnimation(-1))
                .addAnimation(165, 168, new animation.AlphaAnimation(1))
                .addAnimation(164, 165, new animation.TranslateAnimation(50, 0))
                .addAnimation(186, 188, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_wall, 340, 270, 0, 0, 0, 0)
                .addAnimation(159, 200, new animation.EmptyAnimation())
                .addAnimation(159, 161, new animation.AlphaAnimation(1))
                .addAnimation(167, 168, new animation.AlphaAnimation(-1))
                .addAnimation(169, 172, new animation.AlphaAnimation(1))
                .addAnimation(168, 169, new animation.TranslateAnimation(-50, 0))
                .addAnimation(186, 188, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我得了神经病', renderer_text20px, 260, 150, 0, 0, 0, 0)
                .addAnimation(70, 78, new animation.EmptyAnimation())
                .addAnimation(71, 73, new animation.AlphaAnimation(1))
                .addAnimation(74, 76, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我对一切都失去了热情', renderer_text20px, 220, 150, 0, 0, 0, 0)
                .addAnimation(76, 84, new animation.EmptyAnimation())
                .addAnimation(77, 80, new animation.AlphaAnimation(1))
                .addAnimation(81, 84, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我的生活不再有意义', renderer_text20px, 220, 150, 0, 0, 0, 0)
                .addAnimation(84, 92, new animation.EmptyAnimation())
                .addAnimation(85, 88, new animation.AlphaAnimation(1))
                .addAnimation(89, 92, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我拼命逃离', renderer_text20px, 100, 120, 0, 0, 0, 0)
                .addAnimation(102, 108, new animation.EmptyAnimation())
                .addAnimation(102, 104, new animation.AlphaAnimation(1))
                .addAnimation(106, 108, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我逃离社会', renderer_text20px, 300, 150, 0, 0, 0, 0)
                .addAnimation(100, 118, new animation.EmptyAnimation())
                .addAnimation(113, 115, new animation.AlphaAnimation(1))
                .addAnimation(116, 118, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我逃离人群', renderer_text20px, 300, 150, 0, 0, 0, 0)
                .addAnimation(122, 128, new animation.EmptyAnimation())
                .addAnimation(122, 124, new animation.AlphaAnimation(1))
                .addAnimation(126, 128, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我逃离自己', renderer_text20px, 260, 150, 0, 0, 0, 0)
                .addAnimation(132, 143, new animation.EmptyAnimation())
                .addAnimation(132, 136, new animation.AlphaAnimation(1)))
                .addActor(new animation.TextActor('我筑起围城禁锢自己', renderer_text20px, 230, 120, 0, 0, 0, 0)
                .addAnimation(170, 179, new animation.EmptyAnimation())
                .addAnimation(170, 173, new animation.AlphaAnimation(1))
                .addAnimation(173, 177, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我的世界开始变得越来越小', renderer_text20px, 200, 120, 0, 0, 0, 0)
                .addAnimation(177, 186, new animation.EmptyAnimation())
                .addAnimation(177, 181, new animation.AlphaAnimation(1))
                .addAnimation(182, 186, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我变得无立足之地', renderer_text20px, 230, 120, 0, 0, 0, 0)
                .addAnimation(186, 194, new animation.EmptyAnimation())
                .addAnimation(187, 190, new animation.AlphaAnimation(1))
                .addAnimation(191, 194, new animation.AlphaAnimation(-1)))
                .addActor(new animation.TextActor('我坠入了万丈深渊', renderer_text20px, 150, 150, 0, 0, 0, 0)
                .addAnimation(186, 208, new animation.EmptyAnimation())
                .addAnimation(199, 203, new animation.AlphaAnimation(1)))
                .addActor(new animation.Actor(make_renderer_end(), 0, 0, 0, 0, 0, 1)
                .addAnimation(208, 220, new animation.EmptyAnimation())
                .addAnimation(208, 220, new animation.AlphaAnimation(-1))) 
                .addActor(new animation.Actor(renderer_transition, 0, 0, 0, 0, 0, 0)
                .addAnimation(92, 300, new animation.EmptyAnimation())
                .addAnimation(92, 95, new animation.AlphaAnimation(1))
                .addAnimation(95, 98, new animation.AlphaAnimation(-0.7))
                .addAnimation(141, 143, new animation.AlphaAnimation(1))
                .addAnimation(144, 146, new animation.AlphaAnimation(-0.7))
                .addAnimation(194, 196, new animation.AlphaAnimation(1))
                .addAnimation(197, 199, new animation.AlphaAnimation(-0.7))
                .addAnimation(205, 208, new animation.AlphaAnimation(1))
                .addAnimation(209, 211, new animation.AlphaAnimation(-0.3))
                .addAnimation(215, 217, new animation.AlphaAnimation(1)))
                .addActor(new animation.TextActor('我被黑暗吞噬了', renderer_text20px, 160, 150, 255, 255, 255, 0)
                .addAnimation(218, 228, new animation.EmptyAnimation())
                .addAnimation(218, 222, new animation.AlphaAnimation(1))
                .addAnimation(224, 228, new animation.AlphaAnimation(-1)))
                .addActor(new animation.Actor(renderer_mask)
                .addAnimation(0, 143, new animation.EmptyAnimation()))
        },

        end: function (game) {

        },

        update: function (deltaTime) {
            this.stage.update(deltaTime);
            if (this.stage.getElapsedTime() > 2) {
                this.game.setState(new core.Animation2State());
            }
        },

        render: function (context) {
            this.stage.render(context);
        },

    });

    //game play state
    core.Animation2State = function () {

    }

    Alistuff.ext(core.Animation2State, core.State, {

        start: function (game) {
            
        },

        end: function (game) {

        },

        update: function (deltaTime) {

        },

        render: function (context) {
            context.fillStyle = '#f00';
            context.fillText('hello state2',20,50);
        },

    });

})(Alistuff.fps,Alistuff.animation);