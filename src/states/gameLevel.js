/*
 *game level1
*/
(function (core, animation, lv, et, renderer) {

    //base game level state
    core.GameLevelState = function () {
        core.State.call(this);

        this.level = undefined;
        this.player = undefined;
        this.rayCaster = undefined;
        this.game = undefined;
        this.stage = new animation.Stage();
        this.font = '17px 微软雅黑';
    }

    Alistuff.ext(core.GameLevelState, core.State, {

        textFadeInOut: function (text, x, y, duration, stay, color, callback) {

            x = x || 0;
            y = y || 0;
            color = color || 0xffffff;

            var r = color >> 16 & 0xff;
            var g = color >> 8 & 0xff;
            var b = color & 0xff;

            var self = this;
            var actor = new animation.TextActor(text, function (context, actor) {
                context.save();
                context.fillStyle = actor.getRGBA();
                context.font = self.font;
                context.fillText(text, x, y);
                context.restore();
            }, x, y, r, g, b, 0);

            var time = this.stage.getElapsedTime();
            var endTime = time + duration * 2 + stay;
            actor.addAnimation(time, endTime, new animation.EmptyAnimation());
            actor.addAnimation(time, time + duration, new animation.AlphaAnimation(1));
            actor.addAnimation(time + duration + stay, endTime, new animation.AlphaAnimation(-1));

            this.stage.addActor(actor);
            this.makeAnimationCallback(endTime, callback);
        },

        fadeIn: function (duration, color, callback) {
            color = color || 0x000000;

            var r = color >> 16 & 0xff;
            var g = color >> 8 & 0xff;
            var b = color & 0xff;

            var actor = new animation.Actor(function (context, actor) {
                context.save();
                context.fillStyle = actor.getRGBA();
                context.fillRect(0, 0, context.canvas.width, context.canvas.height);
                context.restore();
            }, 0, 0, r, g, b, 1);

            var time = this.stage.getElapsedTime();
            actor.addAnimation(time, time + duration, new animation.AlphaAnimation(-1));
            this.stage.addActor(actor);
            this.makeAnimationCallback(time + duration, callback);
        },

        fadeOut: function (duration, color, callback) {
            color = color || 0x000000;

            var r = color >> 16 & 0xff;
            var g = color >> 8 & 0xff;
            var b = color & 0xff;

            var actor = new animation.Actor(function (context, actor) {
                context.save();
                context.fillStyle = actor.getRGBA();
                context.fillRect(0, 0, context.canvas.width, context.canvas.height);
                context.restore();
            }, 0, 0, r, g, b, 0);

            var time = this.stage.getElapsedTime();
            actor.addAnimation(time, time + duration, new animation.AlphaAnimation(1));
            this.stage.addActor(actor);
            this.makeAnimationCallback(time + duration, callback);
        },

        makeAnimationCallback: function (endTime, callback) {
            if (callback) {
                var callbackActor = new animation.Actor();
                callbackActor.addAnimation(endTime, endTime + 100, new animation.CallbackAnimation(callback, true));
                this.stage.addActor(callbackActor);
            }
        },

        nextLevel: function () { },

        playSound: function (file, loop) {
            var url = this.game.canPlayOgg() ? 'res/snd/' + file + '.ogg' : 'res/snd/' + file + '.mp3';  
            return this.game.playSound(url, loop);
        },

        stopSound: function (audio) {
            return this.game.stopSound(audio);
        },
    });
	
    //game level1 state
    core.GameLevel1State = function () {
        core.GameLevelState.call(this);

		this.handX=0;
		this.handY=0;
		this.handWave=0;
    }

    Alistuff.ext(core.GameLevel1State, core.GameLevelState, {

        start: function (game) {
            this.game = game;

            this.level = new lv.DungeonLevel(this);
            this.player = new et.Player(this.level.spawnX, this.level.spawnY, this.level);
            this.player.height = this.level.gridSize / 2;
            this.player.speed = 2;
            this.level.player = this.player;

            this.rayCaster = new renderer.RayCaster();
            this.rayCaster.init(0, 0, 480, 320, game, this.level, new renderer.PerPixelRenderer());

            var self = this;
            game.addKeyListener('w', function () { self.player.turnUp(); });
            game.addKeyListener('s', function () { self.player.turnDown(); });
            game.addKeyListener('a', function () { self.player.turnLeft(); });
            game.addKeyListener('d', function () { self.player.turnRight(); });
            game.addKeyListener('q', function () { self.player.rotateLeft(); });
            game.addKeyListener('e', function () { self.player.rotateRight(); });
            game.addMouseListener('mousedown', function () { });
            game.addMouseListener('mousemove', function (e) {
                var client = game.windowToCanvas(e.clientX, e.clientY);
                self.player.lookAround(client.x, client.y, self.rayCaster.width, self.rayCaster.height);
            });
        },

        end: function (game) {
            game.removeKeyListener('w');
            game.removeKeyListener('s');
            game.removeKeyListener('a');
            game.removeKeyListener('d');
            game.removeKeyListener('q');
            game.removeKeyListener('e');
            game.removeMouseListener('mousedown');
            game.removeMouseListener('mousemove');
        },

        update: function (deltaTime) {
            this.player.update(deltaTime);
            this.level.update(deltaTime);
            this.rayCaster.update(deltaTime);
            this.stage.update(deltaTime);
			this.updateMyHand(deltaTime);
        },
		
		updateMyHand:function(deltaTime){
			if(this.player.vx!==0||this.player.vy!==0){
				this.handWave+=1.5 *deltaTime;
				this.handX=Math.sin(this.handWave)*25;
				this.handY=Math.sin(this.handWave)*10;
			}else{
				this.handX=this.handX/2;
				this.handY=this.handY/2;
				this.handWave=0;
			}
		},

        render: function (context) {
            this.rayCaster.render(context);
            this.renderMyHand(context);
            this.stage.render(context);
        },

        transitionRender: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
        },
		
		renderMyHand:function(context){
			var leftHand=this.game.getImage('left_hand');
			var rightHand=this.game.getImage('right_hand');
			var viewWidth=this.rayCaster.width;
			var viewHeight=this.rayCaster.height;
			
			context.drawImage(
			    leftHand,
				130+this.handX/4,
				viewHeight-leftHand.height*0.45+40-this.handY/4,
			    leftHand.width*0.45,
				leftHand.height*0.45
		    );
				
			context.drawImage(
			    rightHand,
				viewWidth-rightHand.width*0.5+this.handX-30,
			    viewHeight-rightHand.height*0.5+this.handY+45,
			    rightHand.width*0.5,
				rightHand.height*0.5
		    );			
		},

		nextLevel: function () {
		    this.game.setState(new core.GameAnimationState(core.GameAnimationState.CLIP_2));
        },
    });

    //game level2 state
    core.GameLevel2State = function () {
        core.GameLevelState.call(this);
    }

    Alistuff.ext(core.GameLevel2State, core.GameLevelState, {

        start: function (game) {
            this.game = game;
            this.level = new lv.OutsideLevel(this);
            this.player = new et.Player(this.level.spawnX, this.level.spawnY, this.level);
            this.player.height = this.level.gridSize / 2;
            this.player.speed = 2;
            this.level.player = this.player;

            this.rayCaster = new renderer.RayCaster();
            this.rayCaster.init(0, 0, 480, 320, game, this.level, new renderer.TextureRenderer());

            var self = this;
            this.fadeIn(5);

            game.addKeyListener('w', function () { self.player.turnUp(); });
            game.addKeyListener('s', function () { self.player.turnDown(); });
            game.addKeyListener('a', function () { self.player.turnLeft(); });
            game.addKeyListener('d', function () { self.player.turnRight(); });
            game.addKeyListener('q', function () { self.player.rotateLeft(); });
            game.addKeyListener('e', function () { self.player.rotateRight(); });
            game.addMouseListener('mousedown', function () { });
            game.addMouseListener('mousemove', function (e) {
                var client = game.windowToCanvas(e.clientX, e.clientY);
                self.player.lookAround(client.x, client.y, self.rayCaster.width, self.rayCaster.height);
            });
        },

        end: function (game) {
            game.removeKeyListener('w');
            game.removeKeyListener('s');
            game.removeKeyListener('a');
            game.removeKeyListener('d');
            game.removeKeyListener('q');
            game.removeKeyListener('e');
            game.removeMouseListener('mousedown');
            game.removeMouseListener('mousemove');
        },

        update: function (deltaTime) {
            this.player.update(deltaTime);
            this.level.update(deltaTime);
            this.rayCaster.update(deltaTime);
            this.stage.update(deltaTime);
        },

        render: function (context) {
            this.rayCaster.render(context);
            this.stage.render(context);
        },

        transitionRender: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
        },

        nextLevel: function () {
            var self = this;
            this.fadeOut(5, 0xffffff, function () {
                self.game.setState(new core.GameAnimationState(core.GameAnimationState.CLIP_3));
            })
        },
    });

    //game end state
    core.GameEndState = function () {
        core.State.call(this);
        this.stage = undefined;
        this.game = undefined;
        
        this.words = [
            { title: 'Programming', items: ['Ali               alistuff@163.com'] },
            {
                title: 'Thank Technology',
                items: [
                    'HTML5',
                    'RayCasting        http://www.permadi.com/tutorial/raycast/index.html',
                ]
            },
            { title: 'Thank Graphics', items: ['http://www.opengameart.org'] },
            {
                title: 'Thank Audio',
                items: [
                    'So You Code       https://www.youtube.com/watch?v=hJbW2v_4CpY',
                    'Dark Long Hits    http://marcelofernandez.tk/ Marcelo -Fernandez',
                    'Dungeon Ambient   http://www.opengameart.org',
                    'Evil Chanting     http://opengameart.org/users/teckpow -teckpow',
                    'Horror Ambient    http://opengameart.org/content/horror-ambient -Vinrax',
                    'Zombie Pain       http://opengameart.org/content/zombie-pain -Vinrax',
                ]
            },
            { title: 'Thank Github', items: [''] },
        ];
    }

    Alistuff.ext(core.GameEndState, core.State, {
        start: function (game) {
            this.game = game;
            this.stage = new animation.Stage();
            var height = game.getHeight()+120;
            var t = 0;
            var speed = 20;
            for (var i = 0; i < this.words.length; i++) {
                var title = this.words[i].title;
                var x = 10;
                var y = height;
                var titleActor = new animation.TextActor(title, this.makeTextRenderer('20px 微软雅黑'), x, y, 255, 255, 255, 0);
                titleActor.addAnimation(t, t + speed, new animation.TranslateAnimation(0, -height));
                titleActor.addAnimation(t+2, t + 4, new animation.AlphaAnimation(1));
                titleActor.addAnimation(t + speed - 2, t + speed, new animation.AlphaAnimation(-1));
                
                for (var j = 0; j < this.words[i].items.length; j++) {
                    t += 1.5;
                    var item = this.words[i].items[j];
                    var itemActor = new animation.TextActor(item, this.makeTextRenderer('12.5px 微软雅黑'), x + 10, height, 255, 255, 255, 0);
                    itemActor.addAnimation(t, t + speed, new animation.TranslateAnimation(0, -height));
                    itemActor.addAnimation(t + 2, t + 4, new animation.AlphaAnimation(1));
                    itemActor.addAnimation(t + speed - 2, t + speed, new animation.AlphaAnimation(-1))
                    this.stage.addActor(itemActor);
                }

                t += 3;
                this.stage.addActor(titleActor);
            }

            this.playSound();
        },

        end: function (game) { },

        update: function (deltaTime) {
            this.stage.update(deltaTime);
        },

        render: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
            this.stage.render(context);
            if (this.stage.getActorCount() === 0) {
                var col = Math.floor(Math.random() * 255);
                context.fillStyle = 'rgb(' + col + ',' + col + ',' + col + ')';
                context.font = '40px 微软雅黑';
                context.fillText('So you code', 100, 150 + Math.sin(col)*5);
            }
        },

        transitionRender: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
        },

        makeTextRenderer: function (font) {
            return function (context, actor) {
                context.save();
                context.font = font;
                context.fillStyle = actor.getRGBA();
                context.fillText(actor.text, actor.x, actor.y);
                context.restore()
            };
        },

        playSound: function () {
            if (this.game.canPlayOgg()) {
                this.game.playSound('res/snd/So You Code.ogg');
                console.log('ogg');
            } else {
                this.game.playSound('res/snd/So You Code.mp3');
                console.log('mp3');
            }
        },
    });

})(Alistuff.fps,Alistuff.animation,Alistuff.fps.level,Alistuff.fps.entities,Alistuff.fps.renderer);