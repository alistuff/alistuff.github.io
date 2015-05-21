//////////////////////
//renderer
//////////////////////


//stroke and fill
var StrokeRenderer = function () {

};

StrokeRenderer.prototype = {
    render: function (context, raycaster) {

        var width = raycaster.projectionWidth;
        var height = raycaster.projectionHeight;

        context.save();

        context.beginPath();
        context.rect(raycaster.x, raycaster.y, width, height);
        context.clip();
        context.closePath();
        //draw sky
        context.fillStyle = 'skyblue';
        context.fillRect(raycaster.x, raycaster.y, width, raycaster.centerY);

        //draw floor
        context.fillStyle = 'gray';
        context.fillRect(raycaster.x, raycaster.y + raycaster.centerY, width, height - raycaster.centerY);

        //context.fillStyle = 'blue';
        //draw walls
        var rays = raycaster.cast();
        for (var i = 0; i < rays.length; i++) {
            var ray = rays[i];
            if (ray != null) {
                var offsetAngle = (width / 2 - i) * raycaster.dtAnglePerProjection;
                var distViewerToObject = Math.abs(ray.length * Math.cos(offsetAngle * PI_DIV_180));
                var projection = raycaster.distanceViewerToPlane / distViewerToObject * raycaster.map.gridSize;
                var offset = raycaster.centerY - projection / 2;
                ////if (offset < -20) {
                ////    offset = 0;
                ////    projection = height;
                ////}
                var light = (Math.min(1, projection / height)) * 255;
                context.fillStyle = 'hsl(120,70%,' + light / 255 * 40 + '%)';
                context.fillRect(i + raycaster.x, offset, 1, projection);
            }
        }
        
        context.restore();
    },
};


//texture mapping
var TextureRenderer = function () {
    this.skyColor;
    this.floorColor;
};

TextureRenderer.prototype = {
    render: function (context, raycaster) {

    },
};

//per-pixel mapping
var PerPixelRenderer = function () {

};

PerPixelRenderer.prototype = {
    render: function (context, raycaster) {

    },
};