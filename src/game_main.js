/*
 *game main
*/
(function (core, level,entities, render) {

    var game = new core.Game('canvas');
    var map = new level.GridMap();
    var player=new entities.Player(196, 196);
    var raycaster = new render.RayCaster();
    var lastmousex = 0;

    function startGameCallback(result) {
        if (result) {
            game.start();
        } else {
            alert('load game error');
        }
    };

    function initGameCallback(context) {
        player.height = map.gridSize / 2;
        player.level = map;
        map.player = player;

        raycaster.init(0, 0, 480, 320, game, map, new render.PerPixelRenderer());
        lastmousex = raycaster.x + raycaster.width / 2;

        game.setState(new core.Animation1State());
    };

    function updateGameCallback(time) {
        updateDebugInfo();
        player.update(time);
        map.update(time);

        game.stateManager.update(time);
    };

    function renderGameCallback(context) {
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.strokeRect(0, 0, context.canvas.width, context.canvas.height);

        raycaster.render(context);
     //   raycaster.render2d(context);

      //  game.stateManager.render(context);
    };

    function mouseMoveCallback(e) {
        var l = game.windowToCanvas(e.clientX, e.clientY);
        player.lookAround(l.x, l.y, raycaster.width, raycaster.height);
    };

    function updateDebugInfo() {
        function $(a) { return document.getElementById(a); }
        $('fpsvalue').innerText = game.getFps();
        $('gametime').innerText = game.getGameTime();
        $('planex').innerText = raycaster.x;
        $('planey').innerText = raycaster.y;
        $('planewidth').innerText = raycaster.width;
        $('planeheight').innerText = raycaster.height;
        $('planetoviewer').innerText = raycaster.distanceViewerToPlane.toFixed(2);
        $('planeray').innerText = raycaster.dtAnglePerProjection.toFixed(2);
        $('viewerx').innerText = player.x.toFixed(2);
        $('viewery').innerText = player.y.toFixed(2)
        $('viewera').innerText = player.rot.toFixed(2);
        $('viewerf').innerText = player.fov;
        $('viewerh').innerText = player.height;
        $('mapwidth').innerText = map.width + '/' + map.realWidth;
        $('mapheight').innerText = map.height + '/' + map.realHeight;
        $('gridsize').innerText = map.gridSize;
    };

    game.queueImage('0', 'res/tex/tex1.png');
    game.queueImage('1', 'res/tex/tex1.png');
    game.queueImage('2', 'res/tex/tex2.png');
    game.queueImage('3', 'res/tex/tex3.png');
    game.queueImage('4', 'res/tex/tex4.png');
    game.queueImage('5', 'res/tex/tex5.png');
    game.queueImage('6', 'res/tex/tex6.png');
    game.queueImage('7', 'res/tex/tex7.png');
    game.queueImage('8', 'res/tex/tex8.png');
    game.queueImage('9', 'res/tex/tex9.png');
    game.queueImage('sky1', 'res/tex/tex9.png');
    game.queueImage('sky2', 'res/tex/tex9.png');
    game.queueImage('html5', 'res/tex/html5.png');
    game.queueImage('java', 'res/tex/java.png');
    game.queueImage('android', 'res/tex/android.png');
    game.queueImage('awp', 'res/tex/awp.png');
    game.queueImage('cross','res/tex/cross.png');
    game.queueImage('Floor', 'res/tex/Floor.jpg');
    game.queueImage('Wall+Blood', 'res/tex/Wall+Blood.jpg');
    game.queueImage('Roof', 'res/tex/Roof.jpg');

    game.loadImages(startGameCallback);

    game.init = initGameCallback;
    game.update = updateGameCallback;
    game.render = renderGameCallback;
    game.addKeyListener('w', function () { player.turnUp(); });
    game.addKeyListener('s', function () { player.turnDown(); });
    game.addKeyListener('a', function () { player.turnLeft(); });
    game.addKeyListener('d', function () { player.turnRight(); });
    game.addKeyListener('q', function () { player.rotateLeft(); });
    game.addKeyListener('e', function () { player.rotateRight(); });
    game.addMouseListener('mousedown', function () { player.shoot(); });
    game.addMouseListener('mousemove', mouseMoveCallback);

})(Alistuff.fps, Alistuff.fps.level,Alistuff.fps.entities, Alistuff.fps.renderer);
