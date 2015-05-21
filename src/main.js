//
//2d grid map ray-casting renderer version1.0
//programming by hwl 2015/5/11
//

var game = new Game('canvas');
var map = new GridMap(game);
var viewer = new Viewer();
var raycaster = new RayCaster();
var texture;
var texture1;
var lastmousex = 0;

game.init = function (context) {
    context.font = '30px Arial';
    context.fillStyle = 'skyblue';
    context.strokeStyle = 'blue';

    game.contentRoot = 'textures';
    game.loadTexture('tex1.png');
    game.loadTexture('flo1.png');
    game.loadTexture('tex2.png');
  
    viewer.x = 146;
    viewer.y = 106;
    viewer.angle = 0;
    viewer.fov = 60;
    viewer.speed = 2.5;
    viewer.height = map.gridSize / 2;

    raycaster.init(0, 0, 480, 320, game, map, viewer,new StrokeRenderer());
    
    initDebugInfo();
   
    texture = Texture.fromUrl('textures/tex1.png');
    texture.setEmboss();

    texture.onload = function () {
        alert(texture.width);
    };

    texture1 = Texture.fromColor(70, 80, { r: 255, g: 0, b: 0, a: 255 });
    texture1.setAlpha(0.5);

    lastmousex = raycaster.x + raycaster.projectionWidth / 2;
};

game.addKeyListener('w', function () {
    var vx = Math.cos(viewer.angle * Math.PI / 180) * viewer.speed;
    var vy = Math.sin(viewer.angle * Math.PI / 180) * viewer.speed;
    if (!map.isBlock(viewer.x+vx, viewer.y-vy)) {
        viewer.x+= vx;
        viewer.y -= vy;
    }
});

game.addKeyListener('s', function () {
    var vx = Math.cos(viewer.angle * Math.PI / 180) * viewer.speed;
    var vy = Math.sin(viewer.angle * Math.PI / 180) * viewer.speed;
    if (!map.isBlock(viewer.x - vx, viewer.y + vy)) {
        viewer.x-= vx;
        viewer.y += vy;
    }
});

game.addMouseListener('mousedown', function (e) {
   // var l = game.windowToCanvas(e.clientX, e.clientY);
   // viewer.x = l.x;
   // viewer.y = l.y;
});

game.addMouseListener('mousemove', function (e) {
    var l = game.windowToCanvas(e.clientX, e.clientY);
    //viewer.angle = -Math.atan((l.y - viewer.y) / (l.x - viewer.x)) * 180 / Math.PI;
    //if (l.x < viewer.x)
    //    viewer.angle = 180 + viewer.angle;
    //else
    //    viewer.angle = (viewer.angle % 360 + 360) % 360;

    //if (l.y > raycaster.projectionHeight / 2+20 )
    //    raycaster.lookdown();
    //else if (l.y < raycaster.projectionHeight / 2-20)
    //    raycaster.lookup();

    viewer.angle += lastmousex-l.x;
    lastmousex = l.x;
    viewer.angle = (viewer.angle % 360 + 360) % 360;


    raycaster.centerY = raycaster.projectionHeight-l.y;

});

game.update = function (time) {
    updateDebugInfo();
};

game.render = function (context) {

   
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.strokeRect(0, 0, context.canvas.width, context.canvas.height);
    
        //raycaster.render2d(context);
    //  raycaster.render3d(context);
        raycaster.render(context);

      //  context.fillRect(50,50,100,100)
      //  texture.render(context, 100, 100);
    //  texture1.render(context, 50, 50);
};

/*************************************************/
//print debug info
/*************************************************/
function $(a) { return document.getElementById(a); }

var fpsvalue = $('fpsvalue'),
gametime = $('gametime'),
planex = $('planex'),
planey = $('planey'),
planeWidth = $('planewidth'),
planeHeight = $('planeheight'),
distanceViewerToPlane = $('planetoviewer'),
deltaRayAngle = $('planeray'),
viewerx = $('viewerx'),
viewery = $('viewery'),
viewerAngle = $('viewera'),
viewerFov = $('viewerf'),
viewerHeight = $('viewerh'),
mapWidth = $('mapwidth'),
mapHeight = $('mapheight'),
mapGridSize = $('gridsize');

function initDebugInfo() {
    fpsvalue.innerText = 60;
    gametime.innerText = 0;
    planex.innerText = 0;
    planey.innerText = 0;
    planeWidth.innerText = 0;
    planeHeight.innerText = 0;
    distanceViewerToPlane.innerText = 0;
    deltaRayAngle.innerText = 0;
    viewerx.innerText = 0;
    viewery.innerText = 0;
    viewerAngle.innerText = 0;
    viewerFov.innerText = 0;
    viewerHeight.innerText = 0;
    mapWidth.innerText = 0;
    mapHeight.innerText = 0;
    mapGridSize.innerText = 0;
};

function updateDebugInfo() {
    fpsvalue.innerText = game.getFps();
    gametime.innerText = game.getGameTime();
    planex.innerText = raycaster.x;
    planey.innerText = raycaster.y;
    planeWidth.innerText = raycaster.projectionWidth;
    planeHeight.innerText = raycaster.projectionHeight;
    distanceViewerToPlane.innerText = raycaster.distanceViewerToPlane.toFixed(2);
    deltaRayAngle.innerText = raycaster.dtAnglePerProjection.toFixed(2);
    viewerx.innerText = viewer.x.toFixed(2);
    viewery.innerText = viewer.y.toFixed(2)
    viewerAngle.innerText = viewer.angle.toFixed(2);
    viewerFov.innerText = viewer.fov;
    viewerHeight.innerText = viewer.height;
    mapWidth.innerText = map.width+'/'+map.realWidth;
    mapHeight.innerText = map.height + '/' + map.realHeight;
    mapGridSize.innerText = map.gridSize;
};

game.start();