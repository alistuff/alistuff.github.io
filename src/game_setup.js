/*
 * setup scripts
*/
(function () {
    var scripts = [
        'src/requestNextAnimationFrame.js',
        'src/texture.js',
        'src/entities/entities.js',
        'src/entities/player.js',
        'src/level/gridMap.js',
        'src/renderer/rayCaster.js',
        'src/renderer/rayCasterRenderer.js',
        'src/game.js',
        'src/states/states.js',
        'src/game_main.js'
    ];

    function loadScripts() {
        for (var i = 0; i < scripts.length; i++) {
            document.write('<script src="' + scripts[i] + '"></script>');
        }
    }
    loadScripts();

})();

/*
 * setup namespaces
*/
(function (ns) {
    var namespaces = [
        'fps',
        'fps.graphics',
        'fps.renderer',
        'fps.level',
        'fps.entities'
    ];

    function registerNamespaces() {
        for (var i = 0; i < namespaces.length; i++) {
            ns.registerNamespace(namespaces[i]);
        }
    }
    registerNamespaces();

})(Alistuff);