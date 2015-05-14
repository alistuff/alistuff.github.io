//
var Game = function (canvasid) {
    self = this;
    var canvas = document.getElementById(canvasid);
    this.context = canvas.getContext("2d");

    this.startTime = 0;
    this.lastTime = 0;
    this.gameTime = 0;
    this.fps = 0;

    this.contentRoot = '';
    this.textures = {};

    this.keyboardListeners = [];
    window.onkeydown = function (e) { self.keyPressed(e); };
  //  window.onkeypress = function (e) { self.keyPressed(e); };

    return this;
}

Game.prototype = {

    //get current time
    getCurrentTime: function () {
        return +new Date();
    },

    getFps: function () {
        return this.fps;
    },

    windowToCanvas: function (x, y) {
        var bounding = this.context.canvas.getBoundingClientRect();

        return {
            x: x - bounding.left * (this.context.canvas.width / bounding.width),
            y: y - bounding.top * (this.context.canvas.height / bounding.height)
        };
    },

    //start the game loop
    start: function () {
        var self = this;
        this.startTime = this.getCurrentTime();
        this.init(this.context);

        window.requestNextAnimationFrame(function (time) {
            self.animate.call(self, time);
        });
    },

    //game animate
    animate: function (time) {
        var self = this;

        if (this.lastTime == 0)
            this.fps = 60;
        else
            this.fps = 1000 / (time - this.lastTime);

        this.gameTime = this.getCurrentTime() - this.startTime;
        this.lastTime = time;

        this.update(time);
        this.clearCanvas();
        this.render(this.context);

        window.requestNextAnimationFrame(function (time) {
            self.animate.call(self, time);
        });
    },

    //clear canvas
    clearCanvas: function () {
        this.context.clearRect(0, 0,
            this.context.canvas.width, this.context.canvas.height);
    },

    //load texture
    loadTexture: function (textureUrl) {
        var image = new Image();
        image.src = this.contentRoot + '/' + textureUrl;
        self = this;

        //image.addEventListener('load', function (e) {
        //    self.textureLoadEvent(e);
        //});

        image.addEventListener('error', function (e) {
            self.textureErrorEvent(textureUrl, e);
        });

        this.textures[textureUrl] = image;
    },

    //get texture
    getTexture: function (textureUrl) {
        return this.textures[textureUrl];
    },

    //delegates
    init: function (context) { },
    update: function (time) { },
    render: function (context) { },

    //events
    textureLoadedEvent: function (e) { },
    textureErrorEvent: function (url, e) { alert(url + e); },

    //input

    addMouseListener: function (type, listener) {
        this.context.canvas.addEventListener(type, listener, false);
    },

    addKeyListener: function (key,listener) {
        this.keyboardListeners.push({key:key,listener:listener });
    },

    keyPressed: function (e) {
        var key = undefined;
        var listener = undefined;

        switch (e.keyCode) {
            case 87: key = 'w'; break; 
            case 65: key = 'a'; break; 
            case 83: key = 's'; break; 
            case 68: key = 'd'; break;
            case 90: key = 'z'; break;
            case 88: key = 'x'; break;
            case 74: key = 'j'; break;
            case 75: key = 'k'; break;
            case 82: key = 'r'; break;
            case 37: key = 'left'; break;
            case 39: key = 'right'; break;
            case 38: key = 'up'; break;
            case 40: key = 'down'; break;
            case 32: key = 'space'; break;
            case 13: key = 'enter'; break;
        }

        for (var i = 0; i < this.keyboardListeners.length; i++) {
            var pair = this.keyboardListeners[i];
            if (pair.key === key && pair.listener) {
                pair.listener();
                window.returnValue = false;
                break;
            }
        }
    },
};