/*
 *renderer
*/
(function (ns) {

    ns.BaseRenderer = function () { }
    ns.BaseRenderer.prototype = {
        render: function (context, raycaster) { },
    };

    ns.StrokeRenderer = function () { }
    Alistuff.ext(ns.StrokeRenderer, ns.BaseRenderer, {
        render: function (context, raycaster) {
            
            var x = raycaster.x;
            var y = raycaster.y;
            var width = raycaster.width;
            var height = raycaster.height;
            var rotz = raycaster.rotz;
            var projections = raycaster.projections;
            
            //draw sky
            context.fillStyle = 'skyblue';
            context.fillRect(x, y, width, rotz);

            //draw floor
            context.fillStyle = 'gray';
            context.fillRect(x, y + rotz, width, height - rotz);
            context.lineWidth = 2.5;

            for (var i = 0; i < projections.length; i++) {
                var projection = projections[i];
                if (projection != null) {
                    var light = (Math.min(1, projection.length / height)) * 255;
                    context.strokeStyle = 'hsl(200,70%,' + light / 255 * 50 + '%)';
                    context.beginPath();
                    context.moveTo(x+projection.x, y+projection.y);
                    context.lineTo(x + projection.x, y+projection.y + projection.length);
                    context.stroke();
                }
            }

            var entitiesProjections = raycaster.getEntitiesProjections();
            for (var i = 0; i < entitiesProjections.length; i++) {
                var ep = entitiesProjections[i];
                var entity = ep.entity;
                if (entity.tex) {
                    var texture = raycaster.game.getImage(entity.tex);
                    var scalew = texture.width / ep.projectionWidth;
                    var scaleh = texture.height / ep.projectionHeight;
                    var ps = ep.projections;

                    for (var j = 0; j < ps.length; j++) {
                        var proj = ps[j];
                        context.drawImage(texture,
                            Math.floor(proj.offset * scalew), 0, 1, proj.length * scaleh,
                            proj.x + x, proj.y + y, 1, proj.length);
                    }
                }
            }
        }
    });

    ns.TextureRenderer = function () { }
    Alistuff.ext(ns.TextureRenderer, ns.BaseRenderer, {
        render: function (context, raycaster) {
            var x = raycaster.x;
            var y = raycaster.y;
            var width = raycaster.width;
            var height = raycaster.height;
            var rotz = raycaster.rotz;

            var rays = raycaster.rays;
            var projections = raycaster.projections;

            var map = raycaster.level;
            var viewer = map.player;        

            //draw sky
            this.render_sky(context, x, y, width, rotz);
            //draw floor
            this.render_floor(context, x, y + rotz, width, height - rotz);

            for (var i = 0, j = projections.length; i < j; i++) {
                var projection = projections[i];
                if (projection != null) {
                    var ray = projection.ray;
                    var texture = raycaster.game.getImage(
                      map.getGrid(Math.floor((ray.x1) / map.gridSize), Math.floor((ray.y1) / map.gridSize) + ''));
                    context.drawImage(texture,
                        ray.offset, 0, 1, texture.height,
                        x + projection.x, projection.y, 1, projection.length);
                }
            }


            //render entities
            var entitiesProjections = raycaster.getEntitiesProjections();
            for (var i = 0; i < entitiesProjections.length; i++) {
                var ep = entitiesProjections[i];
                var entity = ep.entity;
                if (entity.tex) {
                    var texture = raycaster.game.getImage(entity.tex);
                    var scalew = texture.width / ep.projectionWidth;
                    var scaleh = texture.height / ep.projectionHeight;
                    var ps = ep.projections;
                    for (var j = 0; j < ps.length; j++) {
                        var proj = ps[j];
                        context.drawImage(texture,
                            Math.floor(proj.offset * scalew), 0, 1, proj.length * scaleh,
                            proj.x + x, proj.y + y, 1, proj.length);
                    }
                }
            }

            //weapon
            var weapontex = raycaster.game.getImage(viewer.weapon.tex);
            context.drawImage(weapontex,
                raycaster.width - weapontex.width + viewer.weapon.x, raycaster.height - weapontex.height + viewer.weapon.y + 10,
                weapontex.width, weapontex.height);

            //cross
            context.strokeStyle = 'rgb(0,255,0)';
            context.beginPath();

            context.moveTo(raycaster.width / 2 - 10, raycaster.height / 2);
            context.lineTo(raycaster.width / 2 + 10, raycaster.height / 2);

            context.moveTo(raycaster.width / 2, raycaster.height / 2 - 10);
            context.lineTo(raycaster.width / 2, raycaster.height / 2 + 10);
            context.stroke();

            //2d rays
            context.fillStyle = 'rgba(255,255,255,0.8)';
            context.lineWidth = 2;
            context.strokeStyle = 'white';
            var i = 0;

            context.beginPath();
            for (; i < rays.length; i++) {
                if (rays[i] != null) {
                    context.moveTo((rays[i].x0 * 0.3), rays[i].y0 * 0.3);
                    break;
                }
            }

            for (; i < rays.length; i++) {
                var ray = rays[i];
                if (ray != null) {
                    context.lineTo((ray.x1 * 0.3), ray.y1 * 0.3);
                }
            }

            context.closePath();
            context.fill();
        },

        render_sky: function (context, x,y,width,height) {
            context.fillStyle = 'skyblue';
            context.fillRect(x, y, width, height);
        },

        render_floor: function (context, x, y, width, height) {
            context.fillStyle = 'gray';
            context.fillRect(x, y, width, height);
        },
    });

    ns.PerPixelRenderer = function () { }

    Alistuff.ext(ns.PerPixelRenderer, ns.BaseRenderer, {

        render: function (context, raycaster) {

            var x = raycaster.x;
            var y = raycaster.y;
            var width = raycaster.width;
            var height = raycaster.height;
            var deltaAngle=raycaster.dtAnglePerProjection;
            var distViewerToPlane=raycaster.distanceViewerToPlane;
            var level = raycaster.level;
            var viewpoint = raycaster.height / 2 - level.player.rotz;
            var rays = raycaster.rays;
            var projections=raycaster.projections;

            var wall = raycaster.game.getTexture('Wall+Blood');
            var floor = raycaster.game.getTexture('Floor');
            var sky = raycaster.game.getTexture('Roof');

            var imagedata = context.getImageData(x, y, width, height);
            var buffer = imagedata.data;
            var fx = imagedata.width / width;
            var fy = imagedata.height / height;

            var lightness = 90;

            for (var i = 0; i < projections.length; i++) {
                var rayAngle = (width / 2 - i) * deltaAngle;
                var start, end;
                var proj = projections[i];
                if (proj != null) {
                    start = proj.y;
                    end = proj.y + proj.length;

                    var light = 1 - Math.max(0, Math.min(1, proj.ray.length / lightness));
                    for (var j = Math.max(0, Math.floor(start)), k = Math.min(Math.floor(end), height) ; j <= k; j++) {

                        var pixel = wall.getPixel(proj.ray.offset*wall.width/level.gridSize % wall.width,
                            (j - Math.floor(proj.y)) * wall.height / proj.length % wall.height);

                        var index = Math.floor((j * imagedata.width * fy + i * fx) * 4);
                        var alpha = pixel.a / 255;
                        buffer[index] = (pixel.r * light) * alpha + (1 - alpha) * buffer[index];
                        buffer[index + 1] = (pixel.g * light) * alpha + (1 - alpha) * buffer[index + 1];
                        buffer[index + 2] = (pixel.b * light) * alpha + (1 - alpha) * buffer[index + 2];
                        buffer[index + 3] = pixel.a * alpha + (1 - alpha) * buffer[index + 3];
                    }
                }

                for (var j = 0; j < height; j++) {

                    if (start && end && j > start && j < end) continue;

                    var distViewerToFloor = distViewerToPlane * level.player.height / (j - viewpoint);
                 
                    distViewerToFloor = Math.abs(distViewerToFloor / Math.cos(rayAngle * PI_DIV_180));

                    var floorx = level.player.x +
                        Math.cos((level.player.rot + rayAngle) * PI_DIV_180) * distViewerToFloor%level.gridSize;
                    var floory = level.player.y -
                        Math.sin((level.player.rot + rayAngle) * PI_DIV_180) * distViewerToFloor % level.gridSize;

                    var rgba;
                    if (j > viewpoint)
                        rgba = floor.getPixel(floorx * floor.width / level.gridSize % floor.width, floory * floor.height / level.gridSize % floor.height);
                    else
                        rgba = sky.getPixel(floorx * sky.width / level.gridSize % sky.width, floory * sky.height / level.gridSize % sky.height);

                    var light = 1 - Math.max(0, Math.min(1, distViewerToFloor / lightness));
                    var index = Math.floor((j * imagedata.width * fy + i * fx) * 4);

                    buffer[index] = rgba.r * light;
                    buffer[index + 1] = rgba.g * light;
                    buffer[index + 2] = rgba.b * light;
                    buffer[index + 3] = rgba.a;
                }
            }

            //render entities
            var entitiesProjections = raycaster.getEntitiesProjections();
            for (var i = 0; i < entitiesProjections.length; i++) {
                var ep = entitiesProjections[i];
                var entity = ep.entity;
                if (entity.tex) {
                    var texture = raycaster.game.getTexture(entity.tex);
                    var scalew = texture.width / ep.projectionWidth;
                    var scaleh = texture.height / ep.projectionHeight;
                    var ps = ep.projections;
                    var dist = Math.sqrt((entity.x - level.player.x) * (entity.x - level.player.x) + (entity.y - level.player.y) * (entity.y - level.player.y));
                    var light = 1 - Math.max(0, Math.min(1, dist / lightness));
                    for (var j = 0; j < ps.length; j++) {
                        var proj = ps[j];

                        for (var k = Math.floor(proj.y) ; k < Math.floor(proj.y + proj.length) ; k++) {

                            if (k < 0 || k >= height) continue;

                            var pixel = texture.getPixel(proj.offset * scalew, (k - Math.floor(proj.y)) * scaleh);
                            var index = Math.floor((k * imagedata.width * fy + proj.x * fx) * 4);
                            var alpha = pixel.a / 255;
                            buffer[index] = (pixel.r * light) * alpha + (1 - alpha) * buffer[index];
                            buffer[index + 1] = (pixel.g * light) * alpha + (1 - alpha) * buffer[index + 1];
                            buffer[index + 2] = (pixel.b * light) * alpha + (1 - alpha) * buffer[index + 2];
                            buffer[index + 3] = pixel.a * alpha + (1 - alpha) * buffer[index + 3];
                        }
                    }
                }
            }

            context.putImageData(imagedata, x, y);


        },
    });

})(Alistuff.fps.renderer);