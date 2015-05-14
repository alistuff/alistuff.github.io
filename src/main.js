//
//2d grid map ray-casting renderer version1.0
//programming by hwl 2015/5/11
//

var game = new Game('canvas');
var map = new MapRayCaster();
var keydown = false;
var w = false;
var s = false;
var v = 1.5;

game.init = function (context) {
    context.font = '30px Arial';
    context.fillStyle = "skyblue";
    context.strokeStyle = 'blue';

    game.contentRoot = "textures";
    game.loadTexture("tex1.png");
};

game.addKeyListener('w', function () {
    var vx = Math.cos(map.viewerAngle * Math.PI / 180) * v;
    var vy = Math.sin(map.viewerAngle * Math.PI / 180) * v;
    if (!map.isBlock(map.viewerX+vx, map.viewerY-vy)) {
        map.viewerX += vx;
        map.viewerY -= vy;
    }
});

game.addKeyListener('s', function () {
    var vx = Math.cos(map.viewerAngle * Math.PI / 180) * v;
    var vy = Math.sin(map.viewerAngle * Math.PI / 180) * v;
    if (!map.isBlock(map.viewerX - vx, map.viewerY + vy)) {
        map.viewerX -= vx;
        map.viewerY += vy;
    }
});

game.addKeyListener('a', function () {
   // map.viewerX -= Math.cos(map.viewerAngle * Math.PI / 180)*v;
});

game.addKeyListener('d', function () {
   // map.viewerX += Math.cos(map.viewerAngle * Math.PI / 180) * v;
});

game.addMouseListener('mousedown', function (e) {
    var l = game.windowToCanvas(e.clientX, e.clientY);
    map.viewerX = l.x;
    map.viewerY = l.y;
})
game.addMouseListener('mousemove', function (e) {
    var l = game.windowToCanvas(e.clientX, e.clientY);
    map.viewerAngle = -Math.atan((l.y - map.viewerY) / (l.x - map.viewerX)) * 180 / Math.PI;
    if (l.x < map.viewerX) {
        map.viewerAngle = 180 + map.viewerAngle;
    }
})

game.update = function (time) {
};

game.render = function (context) {
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.strokeRect(0, 0, canvas.width, canvas.height);

    map.draw2D(context);
    map.draw3D(context);
};

game.start();