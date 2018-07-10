(function() {
  var Drawer, DrawingLayer, FOLLOW, ImageLayer, OBSERVE, PatchDrawer, RIDE, SpotlightDrawer, TurtleDrawer, View, WATCH,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  window.ViewController = (function() {
    function ViewController(container, fontSize) {
      this.container = container;
      this.mouseYcor = bind(this.mouseYcor, this);
      this.mouseXcor = bind(this.mouseXcor, this);
      this.view = new View(fontSize);
      this.turtleDrawer = new TurtleDrawer(this.view);
      this.imageLayer = new ImageLayer(this.view);
      this.drawingLayer = new DrawingLayer(this.view, this.turtleDrawer);
      this.patchDrawer = new PatchDrawer(this.view);
      this.spotlightDrawer = new SpotlightDrawer(this.view);
      this.container.appendChild(this.view.visibleCanvas);
      this.mouseDown = false;
      this.mouseInside = false;
      this.mouseX = 0;
      this.mouseY = 0;
      this.initMouseTracking();
      this.initTouchTracking();
      this.model = new AgentModel();
      this.model.world.turtleshapelist = defaultShapes;
      this.repaint();
    }

    ViewController.prototype.mouseXcor = function() {
      return this.view.xPixToPcor(this.mouseX);
    };

    ViewController.prototype.mouseYcor = function() {
      return this.view.yPixToPcor(this.mouseY);
    };

    ViewController.prototype.initMouseTracking = function() {
      this.view.visibleCanvas.addEventListener('mousedown', (function(_this) {
        return function(e) {
          return _this.mouseDown = true;
        };
      })(this));
      document.addEventListener('mouseup', (function(_this) {
        return function(e) {
          return _this.mouseDown = false;
        };
      })(this));
      this.view.visibleCanvas.addEventListener('mouseenter', (function(_this) {
        return function(e) {
          return _this.mouseInside = true;
        };
      })(this));
      this.view.visibleCanvas.addEventListener('mouseleave', (function(_this) {
        return function(e) {
          return _this.mouseInside = false;
        };
      })(this));
      return this.view.visibleCanvas.addEventListener('mousemove', (function(_this) {
        return function(e) {
          var rect;
          rect = _this.view.visibleCanvas.getBoundingClientRect();
          _this.mouseX = e.clientX - rect.left;
          return _this.mouseY = e.clientY - rect.top;
        };
      })(this));
    };

    ViewController.prototype.initTouchTracking = function() {
      var endTouch, trackTouch;
      endTouch = (function(_this) {
        return function(e) {
          _this.mouseDown = false;
          _this.mouseInside = false;
        };
      })(this);
      trackTouch = (function(_this) {
        return function(arg) {
          var bottom, clientX, clientY, left, ref, right, top;
          clientX = arg.clientX, clientY = arg.clientY;
          ref = _this.view.visibleCanvas.getBoundingClientRect(), bottom = ref.bottom, left = ref.left, top = ref.top, right = ref.right;
          if (((left <= clientX && clientX <= right)) && ((top <= clientY && clientY <= bottom))) {
            _this.mouseInside = true;
            _this.mouseX = clientX - left;
            _this.mouseY = clientY - top;
          } else {
            _this.mouseInside = false;
          }
        };
      })(this);
      document.addEventListener('touchend', endTouch);
      document.addEventListener('touchcancel', endTouch);
      this.view.visibleCanvas.addEventListener('touchmove', (function(_this) {
        return function(e) {
          e.preventDefault();
          trackTouch(e.changedTouches[0]);
        };
      })(this));
      this.view.visibleCanvas.addEventListener('touchstart', (function(_this) {
        return function(e) {
          _this.mouseDown = true;
          trackTouch(e.touches[0]);
        };
      })(this));
    };

    ViewController.prototype.repaint = function() {
      this.view.transformToWorld(this.model.world);
      <!-- GBCC -->
      if (drawPatches) {
        this.patchDrawer.repaint(this.model);
      }
      <!-- END GBCC -->

      //this.patchDrawer.repaint(this.model);
      this.imageLayer.repaint();
      this.drawingLayer.repaint(this.model);
      this.turtleDrawer.repaint(this.model);
      this.spotlightDrawer.repaint(this.model);
      return this.view.repaint(this.model);
    };

    ViewController.prototype.applyUpdate = function(modelUpdate) {
      return this.model.update(modelUpdate);
    };

    ViewController.prototype.update = function(modelUpdate) {
      var k, len, u, updates;
      updates = Array.isArray(modelUpdate) ? modelUpdate : [modelUpdate];
      for (k = 0, len = updates.length; k < len; k++) {
        u = updates[k];
        
        <!-- GBCC -->
        if (socket && activityType === "hubnet") {
          socket.emit("update", {turtles: modelUpdate[k].turtles}); 
          socket.emit("update", {patches: modelUpdate[k].patches});
        }
        universe = this;
        <!-- END GBCC -->

        this.applyUpdate(u);
      }
      return this.repaint();
    };

    return ViewController;

  })();

  OBSERVE = 0;

  RIDE = 1;

  FOLLOW = 2;

  WATCH = 3;

  View = (function() {
    function View(fontSize1) {
      this.fontSize = fontSize1;
      this.usePatchCoordinates = bind(this.usePatchCoordinates, this);
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.visibleCanvas = document.createElement('canvas');
      this.visibleCanvas.classList.add('netlogo-canvas', 'unselectable');
      this.visibleCanvas.width = 500;
      this.visibleCanvas.height = 500;
      this.visibleCanvas.style.width = "100%";
      this.visibleCtx = this.visibleCanvas.getContext('2d');
      this._zoomLevel = null;
    }

    View.prototype.transformToWorld = function(world) {
      return this.transformCanvasToWorld(world, this.canvas, this.ctx);
    };

    View.prototype.transformCanvasToWorld = function(world, canvas, ctx) {
      var ref;
      this.quality = Math.max((ref = window.devicePixelRatio) != null ? ref : 2, 2);
      this.maxpxcor = world.maxpxcor != null ? world.maxpxcor : 25;
      this.minpxcor = world.minpxcor != null ? world.minpxcor : -25;
      this.maxpycor = world.maxpycor != null ? world.maxpycor : 25;
      this.minpycor = world.minpycor != null ? world.minpycor : -25;
      this.patchsize = world.patchsize != null ? world.patchsize : 9;
      this.wrapX = world.wrappingallowedinx;
      this.wrapY = world.wrappingallowediny;
      this.onePixel = 1 / this.patchsize;
      this.worldWidth = this.maxpxcor - this.minpxcor + 1;
      this.worldHeight = this.maxpycor - this.minpycor + 1;
      this.worldCenterX = (this.maxpxcor + this.minpxcor) / 2;
      this.worldCenterY = (this.maxpycor + this.minpycor) / 2;
      this.centerX = this.worldWidth / 2;
      this.centerY = this.worldHeight / 2;
      canvas.width = this.worldWidth * this.patchsize * this.quality;
      canvas.height = this.worldHeight * this.patchsize * this.quality;
      canvas.style.width = this.worldWidth * this.patchsize;
      canvas.style.height = this.worldHeight * this.patchsize;
      ctx.font = this.fontSize + 'px "Lucida Grande", sans-serif';
      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.oImageSmoothingEnabled = false;
      return ctx.msImageSmoothingEnabled = false;
    };

    View.prototype.usePatchCoordinates = function(ctx) {
      if (ctx == null) {
        ctx = this.ctx;
      }
      return (function(_this) {
        return function(drawFn) {
          var h, w;
          ctx.save();
          w = _this.canvas.width;
          h = _this.canvas.height;
          ctx.setTransform(w / _this.worldWidth, 0, 0, -h / _this.worldHeight, -(_this.minpxcor - .5) * w / _this.worldWidth, (_this.maxpycor + .5) * h / _this.worldHeight);
          drawFn();
          return ctx.restore();
        };
      })(this);
    };

    View.prototype.withCompositing = function(gco, ctx) {
      if (ctx == null) {
        ctx = this.ctx;
      }
      return function(drawFn) {
        var oldGCO;
        oldGCO = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = gco;
        drawFn();
        return ctx.globalCompositeOperation = oldGCO;
      };
    };

    View.prototype.offsetX = function() {
      return this.worldCenterX - this.centerX;
    };

    View.prototype.offsetY = function() {
      return this.worldCenterY - this.centerY;
    };

    View.prototype.xPixToPcor = function(x) {
      return (this.worldWidth * x / this.visibleCanvas.clientWidth + this.worldWidth - this.offsetX()) % this.worldWidth + this.minpxcor - .5;
    };

    View.prototype.yPixToPcor = function(y) {
      return (-this.worldHeight * y / this.visibleCanvas.clientHeight + 2 * this.worldHeight - this.offsetY()) % this.worldHeight + this.minpycor - .5;
    };
    
    View.prototype.xPcorToPix = function(x) {
      return ((((this.worldWidth / 2) - this.centerX) + x) / this.worldWidth) * this.visibleCanvas.clientWidth;
    };

    View.prototype.yPcorToPix = function(y) {
      return ( (1 - ( ( ( (this.worldHeight / 2) - this.centerY) + y) / this.worldHeight)) * this.visibleCanvas.clientHeight);
    };

    View.prototype.xPcorToCanvas = function(x) {
      return (x - this.minpxcor + .5) / this.worldWidth * this.visibleCanvas.width;
    };

    View.prototype.yPcorToCanvas = function(y) {
      return (this.maxpycor + .5 - y) / this.worldHeight * this.visibleCanvas.height;
    };

    View.prototype.drawLabel = function(xcor, ycor, label, color, ctx) {
      if (ctx == null) {
        ctx = this.ctx;
      }
      label = label != null ? label.toString() : '';
      if (label.length > 0) {
        return this.drawWrapped(xcor, ycor, label.length * this.fontSize / this.onePixel, (function(_this) {
          return function(x, y) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(_this.onePixel, -_this.onePixel);
            ctx.textAlign = 'end';
            ctx.fillStyle = netlogoColorToCSS(color);
            ctx.fillText(label, 0, 0);
            return ctx.restore();
          };
        })(this));
      }
    };

    View.prototype.drawWrapped = function(xcor, ycor, size, drawFn) {
      var k, l, len, len1, x, xs, y, ys;
      xs = this.wrapX ? [xcor - this.worldWidth, xcor, xcor + this.worldWidth] : [xcor];
      ys = this.wrapY ? [ycor - this.worldHeight, ycor, ycor + this.worldHeight] : [ycor];
      for (k = 0, len = xs.length; k < len; k++) {
        x = xs[k];
        if ((x + size / 2) > this.minpxcor - 0.5 && (x - size / 2) < this.maxpxcor + 0.5) {
          for (l = 0, len1 = ys.length; l < len1; l++) {
            y = ys[l];
            if ((y + size / 2) > this.minpycor - 0.5 && (y - size / 2) < this.maxpycor + 0.5) {
              drawFn(x, y);
            }
          }
        }
      }
    };

    View.prototype.turtleType = 1;

    View.prototype.patchType = 2;

    View.prototype.linkType = 3;

    View.prototype.watch = function(model) {
      var id, links, observer, patches, ref, turtles, type;
      observer = model.observer, turtles = model.turtles, links = model.links, patches = model.patches;
      if (model.observer.perspective !== OBSERVE && observer.targetagent && observer.targetagent[1] >= 0) {
        ref = observer.targetagent, type = ref[0], id = ref[1];
        switch (type) {
          case this.turtleType:
            return model.turtles[id];
          case this.patchType:
            return model.patches[id];
          case this.linkType:
            return model.links[id];
        }
      } else {
        return null;
      }
    };

    View.prototype.follow = function(model) {
      var persp;
      persp = model.observer.perspective;
      if (persp === FOLLOW || persp === RIDE) {
        return this.watch(model);
      } else {
        return null;
      }
    };

    View.prototype.setZoom = function(zoomLevel) {
      this._zoomLevel = Number.isInteger(zoomLevel) ? Math.min(Math.max(0, zoomLevel), Math.floor(this.worldWidth / 2), Math.floor(this.worldHeight / 2)) : null;
    };

    View.prototype.repaint = function(model) {
      var dx, dy, height, k, l, len, len1, target, width, x, xs, y, ys;
      target = this.follow(model);
      this.visibleCanvas.width = this.canvas.width;
      this.visibleCanvas.height = this.canvas.height;
      this.visibleCanvas.style.width = this.canvas.style.width;
      this.visibleCanvas.style.height = this.canvas.style.height;
      if (target != null) {
        width = this.visibleCanvas.width;
        height = this.visibleCanvas.height;
        this.centerX = target.xcor;
        this.centerY = target.ycor;
        x = -this.xPcorToCanvas(this.centerX) + width / 2;
        y = -this.yPcorToCanvas(this.centerY) + height / 2;
        xs = this.wrapX ? [x - width, x, x + width] : [x];
        ys = this.wrapY ? [y - height, y, y + height] : [y];
        for (k = 0, len = xs.length; k < len; k++) {
          dx = xs[k];
          for (l = 0, len1 = ys.length; l < len1; l++) {
            dy = ys[l];
            this.visibleCtx.drawImage(this.canvas, dx, dy);
          }
        }
      } else {
        this.centerX = this.worldCenterX;
        this.centerY = this.worldCenterY;
        this.visibleCtx.drawImage(this.canvas, 0, 0);
      }
      return this._handleZoom();
    };

    View.prototype._handleZoom = function() {
      var left, length, tempCanvas, top;
      if (this._zoomLevel !== null) {
        length = ((2 * this._zoomLevel) + 1) * (2 * this.patchsize);
        left = (this.visibleCanvas.width / 2) - (length / 2);
        top = (this.visibleCanvas.height / 2) - (length / 2);
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.visibleCanvas.width;
        tempCanvas.height = this.visibleCanvas.height;
        tempCanvas.getContext('2d').drawImage(this.visibleCanvas, 0, 0);
        this.visibleCtx.save();
        this.visibleCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.visibleCtx.clearRect(0, 0, this.visibleCanvas.width, this.visibleCanvas.height);
        this.visibleCtx.drawImage(tempCanvas, left, top, length, length, 0, 0, this.visibleCanvas.width, this.visibleCanvas.height);
        this.visibleCtx.restore();
      }
    };

    return View;

  })();

  Drawer = (function() {
    function Drawer(view) {
      this.view = view;
    }

    return Drawer;

  })();


  /*
  Possible drawing events:
  
  { type: "clear-drawing" }
  
  { type: "line", fromX, fromY, toX, toY, rgb, size, penMode }
  
  { type: "stamp-image", agentType: "turtle", stamp: {x, y, size, heading, color, shapeName, stampMode} }
  
  { type: "stamp-image", agentType: "link", stamp: {
      x1, y1, x2, y2, midpointX, midpointY, heading, color, shapeName, thickness, 'directed?', size, 'hidden?', stampMode
    }
  }
  
  { type: "import-drawing", sourcePath }
  
  { type: "zoom", scale }
  
  { type: "reset-zoom" }
   */

  ImageLayer = (function(superClass) {
    extend(ImageLayer, superClass);

    function ImageLayer(view) {
      this.view = view;
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'ilayer';
      this.ctx = this.canvas.getContext('2d');
    }

    ImageLayer.prototype.repaint = function() {
      var img;
      img = document.getElementById("imageLayer");
      if ($("#imageLayer").prop("src")) {
        return this.view.ctx.drawImage(img, 0, 0, this.view.canvas.width, this.view.canvas.height);
      } else {
        return this.view.ctx.drawImage(this.canvas, 0, 0);
      }
    };

    return ImageLayer;

  })(Drawer);

  DrawingLayer = (function(superClass) {
    extend(DrawingLayer, superClass);

    function DrawingLayer(view, turtleDrawer, repaintView) {
      this.view = view;
      this.turtleDrawer = turtleDrawer;
      this.repaintView = repaintView;
      this.drawLine = bind(this.drawLine, this);
      this.importDrawing = bind(this.importDrawing, this);
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'dlayer';
      this.ctx = this.canvas.getContext('2d');
    }

    DrawingLayer.prototype.resizeCanvas = function() {
      this.canvas.width = this.view.canvas.width;
      return this.canvas.height = this.view.canvas.height;
    };

    DrawingLayer.prototype.clearDrawing = function() {
      return this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    DrawingLayer.prototype.importDrawing = function(sourcePath) {
      var image;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      image = new Image();
      image.onload = (function(_this) {
        return function() {
          var canvasRatio, height, imageRatio, width;
          canvasRatio = _this.canvas.width / _this.canvas.height;
          imageRatio = image.width / image.height;
          width = _this.canvas.width;
          height = _this.canvas.height;
          if (canvasRatio >= imageRatio) {
            width = (imageRatio / canvasRatio) * _this.canvas.width;
          } else {
            height = (canvasRatio / imageRatio) * _this.canvas.height;
          }
          _this.ctx.drawImage(image, (_this.canvas.width - width) / 2, (_this.canvas.height - height) / 2, width, height);
          _this.repaintView();
        };
      })(this);
      image.src = sourcePath;
    };

    DrawingLayer.prototype._rgbToCss = function(arg) {
      var b, g, r;
      r = arg[0], g = arg[1], b = arg[2];
      return "rgb(" + r + ", " + g + ", " + b + ")";
    };

    DrawingLayer.prototype.makeMockTurtleObject = function(arg) {
      var color, heading, shape, size, xcor, ycor;
      xcor = arg.x, ycor = arg.y, shape = arg.shapeName, size = arg.size, heading = arg.heading, color = arg.color;
      return {
        xcor: xcor,
        ycor: ycor,
        shape: shape,
        size: size,
        heading: heading,
        color: color
      };
    };

    DrawingLayer.prototype.makeMockLinkObject = function(arg) {
      var color, end1, end2, heading, isDirected, isHidden, midpointX, midpointY, mockLink, shapeName, size, thickness, x1, x2, y1, y2;
      x1 = arg.x1, y1 = arg.y1, x2 = arg.x2, y2 = arg.y2, shapeName = arg.shapeName, color = arg.color, heading = arg.heading, size = arg.size, isDirected = arg['directed?'], isHidden = arg['hidden?'], midpointX = arg.midpointX, midpointY = arg.midpointY, thickness = arg.thickness;
      end1 = {
        xcor: x1,
        ycor: y1
      };
      end2 = {
        xcor: x2,
        ycor: y2
      };
      mockLink = {
        shape: shapeName,
        color: color,
        heading: heading,
        size: size,
        'directed?': isDirected,
        'hidden?': isHidden,
        midpointX: midpointX,
        midpointY: midpointY,
        thickness: thickness
      };
      return [mockLink, end1, end2];
    };

    DrawingLayer.prototype.stampTurtle = function(turtleStamp) {
      var mockTurtleObject;
      mockTurtleObject = this.makeMockTurtleObject(turtleStamp);
      return this.view.usePatchCoordinates(this.ctx)((function(_this) {
        return function() {
          return _this.view.withCompositing(_this.compositingOperation(turtleStamp.stampMode), _this.ctx)(function() {
            return _this.turtleDrawer.drawTurtle(mockTurtleObject, _this.ctx, true);
          });
        };
      })(this));
    };

    DrawingLayer.prototype.stampLink = function(linkStamp) {
      var mockLinkObject;
      mockLinkObject = this.makeMockLinkObject(linkStamp);
      return this.view.usePatchCoordinates(this.ctx)((function(_this) {
        return function() {
          return _this.view.withCompositing(_this.compositingOperation(linkStamp.stampMode), _this.ctx)(function() {
            var ref;
            return (ref = _this.turtleDrawer.linkDrawer).draw.apply(ref, slice.call(mockLinkObject).concat([_this.wrapX], [_this.wrapY], [_this.ctx], [true]));
          });
        };
      })(this));
    };

    DrawingLayer.prototype.compositingOperation = function(mode) {
      if (mode === 'erase') {
        return 'destination-out';
      } else {
        return 'source-over';
      }
    };

    DrawingLayer.prototype.drawStamp = function(arg) {
      var agentType, stamp;
      agentType = arg.agentType, stamp = arg.stamp;
      if (agentType === 'turtle') {
        return this.stampTurtle(stamp);
      } else if (agentType === 'link') {
        return this.stampLink(stamp);
      }
    };

    DrawingLayer.prototype.drawLine = function(arg) {
      var color, penColor, penMode, size, x1, x2, y1, y2;
      color = arg.rgb, size = arg.size, penMode = arg.penMode, x1 = arg.fromX, y1 = arg.fromY, x2 = arg.toX, y2 = arg.toY;
      if (penMode !== 'up') {
        penColor = color;
        return this.view.usePatchCoordinates(this.ctx)((function(_this) {
          return function() {
            _this.ctx.save();
            _this.ctx.strokeStyle = _this._rgbToCss(penColor);
            _this.ctx.lineWidth = _this.view.onePixel;
            _this.ctx.beginPath();
            _this.ctx.moveTo(x1, y1);
            _this.ctx.lineTo(x2, y2);
            _this.view.withCompositing(_this.compositingOperation(penMode), _this.ctx)(function() {
              return _this.ctx.stroke();
            });
            return _this.ctx.restore();
          };
        })(this));
      }
    };

    DrawingLayer.prototype.draw = function() {
      return this.events.forEach((function(_this) {
        return function(event) {
          switch (event.type) {
            case 'clear-drawing':
              return _this.clearDrawing();
            case 'line':
              return _this.drawLine(event);
            case 'stamp-image':
              return _this.drawStamp(event);
            case 'import-drawing':
              return _this.importDrawing(event.sourcePath);
            case 'zoom':
              return _this.view.setZoom(event.scale);
            case 'reset-zoom':
              return _this.view.setZoom(Math.floor(_this.view.worldWidth / 2));
          }
        };
      })(this));
    };

    DrawingLayer.prototype.repaint = function(model) {
      var world;
      world = model.world;
      this.wrapX = world.wrappingallowedinx;
      this.wrapY = world.wrappingallowediny;
      this.events = model.drawingEvents;
      model.drawingEvents = [];
      if (this.canvas.width !== this.view.canvas.width || this.canvas.height !== this.view.canvas.height) {
        this.resizeCanvas();
      }
      this.draw();
      return this.view.ctx.drawImage(this.canvas, 0, 0);
    };

    return DrawingLayer;

  })(Drawer);

  SpotlightDrawer = (function(superClass) {
    extend(SpotlightDrawer, superClass);

    function SpotlightDrawer(view) {
      this.view = view;
    }

    SpotlightDrawer.prototype.dimmed = "rgba(0, 0, 50, " + (100 / 255) + ")";

    SpotlightDrawer.prototype.spotlightInnerBorder = "rgba(200, 255, 255, " + (100 / 255) + ")";

    SpotlightDrawer.prototype.spotlightOuterBorder = "rgba(200, 255, 255, " + (50 / 255) + ")";

    SpotlightDrawer.prototype.clear = 'white';

    SpotlightDrawer.prototype.outer = function() {
      return 10 / this.view.patchsize;
    };

    SpotlightDrawer.prototype.middle = function() {
      return 8 / this.view.patchsize;
    };

    SpotlightDrawer.prototype.inner = function() {
      return 4 / this.view.patchsize;
    };

    SpotlightDrawer.prototype.drawCircle = function(x, y, innerDiam, outerDiam, color) {
      var ctx;
      ctx = this.view.ctx;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, outerDiam / 2, 0, 2 * Math.PI);
      ctx.arc(x, y, innerDiam / 2, 0, 2 * Math.PI, true);
      return ctx.fill();
    };

    SpotlightDrawer.prototype.drawSpotlight = function(xcor, ycor, size, dimOther) {
      var ctx;
      ctx = this.view.ctx;
      ctx.lineWidth = this.view.onePixel;
      ctx.beginPath();
      if (dimOther) {
        this.view.drawWrapped(xcor, ycor, size + this.outer(), (function(_this) {
          return function(x, y) {
            ctx.moveTo(x, y);
            return ctx.arc(x, y, (size + _this.outer()) / 2, 0, 2 * Math.PI, true);
          };
        })(this));
        ctx.rect(this.view.minpxcor - 0.5, this.view.minpycor - 0.5, this.view.worldWidth, this.view.worldHeight);
        ctx.fillStyle = this.dimmed;
        ctx.fill();
      }
      return this.view.drawWrapped(xcor, ycor, size + this.outer(), (function(_this) {
        return function(x, y) {
          _this.drawCircle(x, y, size, size + _this.outer(), _this.dimmed);
          _this.drawCircle(x, y, size, size + _this.middle(), _this.spotlightOuterBorder);
          return _this.drawCircle(x, y, size, size + _this.inner(), _this.spotlightInnerBorder);
        };
      })(this));
    };

    SpotlightDrawer.prototype.adjustSize = function(size) {
      return Math.max(size, this.view.worldWidth / 16, this.view.worldHeight / 16);
    };

    SpotlightDrawer.prototype.dimensions = function(agent) {
      if (agent.xcor != null) {
        return [agent.xcor, agent.ycor, 2 * agent.size];
      } else if (agent.pxcor != null) {
        return [agent.pxcor, agent.pycor, 2];
      } else {
        return [agent.midpointx, agent.midpointy, agent.size];
      }
    };

    SpotlightDrawer.prototype.repaint = function(model) {
      return this.view.usePatchCoordinates()((function(_this) {
        return function() {
          var ref, size, watched, xcor, ycor;
          watched = _this.view.watch(model);
          if (watched != null) {
            ref = _this.dimensions(watched), xcor = ref[0], ycor = ref[1], size = ref[2];
            return _this.drawSpotlight(xcor, ycor, _this.adjustSize(size), model.observer.perspective === WATCH);
          }
        };
      })(this));
    };

    return SpotlightDrawer;

  })(Drawer);

  TurtleDrawer = (function(superClass) {
    extend(TurtleDrawer, superClass);

    function TurtleDrawer(view) {
      this.view = view;
      this.turtleShapeDrawer = new ShapeDrawer({}, this.view.onePixel);
      this.linkDrawer = new LinkDrawer(this.view, {});
    }

    TurtleDrawer.prototype.drawTurtle = function(turtle, ctx, isStamp) {
      var size, xcor, ycor;
      if (ctx == null) {
        ctx = this.view.ctx;
      }
      if (isStamp == null) {
        isStamp = false;
      }
      if (!turtle['hidden?']) {
        xcor = turtle.xcor;
        ycor = turtle.ycor;
        size = turtle.size;
        this.view.drawWrapped(xcor, ycor, size, ((function(_this) {
          return function(x, y) {
            return _this.drawTurtleAt(turtle, x, y, ctx);
          };
        })(this)));
        if (!isStamp) {
          return this.view.drawLabel(xcor + turtle.size / 2, ycor - turtle.size / 2, turtle.label, turtle['label-color'], ctx);
        }
      }
    };

    TurtleDrawer.prototype.drawTurtleAt = function(turtle, xcor, ycor, ctx) {
      var angle, heading, scale, shape, shapeName;
      heading = turtle.heading;
      scale = turtle.size;
      angle = (180 - heading) / 360 * 2 * Math.PI;
      shapeName = turtle.shape;
      shape = this.turtleShapeDrawer.shapes[shapeName] || defaultShape;
      ctx.save();
      ctx.translate(xcor, ycor);
      if (shape.rotate) {
        ctx.rotate(angle);
      } else {
        ctx.rotate(Math.PI);
      }
      ctx.scale(scale, scale);
      this.turtleShapeDrawer.drawShape(ctx, turtle.color, shapeName, 1 / scale);
      return ctx.restore();
    };

    TurtleDrawer.prototype.drawLink = function(link, end1, end2, wrapX, wrapY) {
      return this.linkDrawer.draw(link, end1, end2, wrapX, wrapY);
    };

    TurtleDrawer.prototype.repaint = function(model) {
      var links, pixelRatioChanged, ref, turtleShapeListChanged, turtles, world;
      world = model.world;
      turtles = model.turtles;
      links = model.links;
      turtleShapeListChanged = (world.turtleshapelist != null) && world.turtleshapelist !== this.turtleShapeDrawer.shapes;
      pixelRatioChanged = this.turtleShapeDrawer.onePixel !== this.view.onePixel;
      if (turtleShapeListChanged || pixelRatioChanged) {
        this.turtleShapeDrawer = new ShapeDrawer((ref = world.turtleshapelist) != null ? ref : this.turtleShapeDrawer.shapes, this.view.onePixel);
      }
      if (world.linkshapelist !== this.linkDrawer.shapes && (world.linkshapelist != null)) {
        this.linkDrawer = new LinkDrawer(this.view, world.linkshapelist);
      }
      return this.view.usePatchCoordinates()((function(_this) {
        return function() {
          _this.drawAgents(links, (world.linkbreeds != null) ? world.linkbreeds : ["LINKS"], function(link) {
            return _this.drawLink(link, turtles[link.end1], turtles[link.end2], world.wrappingallowedinx, world.wrappingallowediny);
          });
          _this.view.ctx.lineWidth = _this.onePixel;
          _this.drawAgents(turtles, (world.turtlebreeds != null) ? world.turtlebreeds : ["TURTLES"], function(turtle) {
            return _this.drawTurtle(turtle);
          });
        };
      })(this));
    };

    TurtleDrawer.prototype.drawAgents = function(agents, breeds, draw) {
      var _, agent, breedName, breededAgents, k, len, members, results;
      breededAgents = {};
      for (_ in agents) {
        agent = agents[_];
        members = [];
        breedName = agent.breed.toUpperCase();
        if (breededAgents[breedName] == null) {
          breededAgents[breedName] = members;
        } else {
          members = breededAgents[breedName];
        }
        members.push(agent);
      }
      results = [];
      for (k = 0, len = breeds.length; k < len; k++) {
        breedName = breeds[k];
        if (breededAgents[breedName] != null) {
          members = breededAgents[breedName];
          results.push((function() {
            var l, len1, results1;
            results1 = [];
            for (l = 0, len1 = members.length; l < len1; l++) {
              agent = members[l];
              results1.push(draw(agent));
            }
            return results1;
          })());
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return TurtleDrawer;

  })(Drawer);

  PatchDrawer = (function() {
    function PatchDrawer(view) {
      this.view = view;
      this.scratchCanvas = document.createElement('canvas');
      this.scratchCtx = this.scratchCanvas.getContext('2d');
    }

    PatchDrawer.prototype.colorPatches = function(patches) {
      var b, g, height, i, imageData, j, k, maxX, maxY, minX, minY, numPatches, patch, r, ref, ref1, width;
      width = this.view.worldWidth;
      height = this.view.worldHeight;
      minX = this.view.minpxcor;
      maxX = this.view.maxpxcor;
      minY = this.view.minpycor;
      maxY = this.view.maxpycor;
      this.scratchCanvas.width = width;
      this.scratchCanvas.height = height;
      imageData = this.scratchCtx.createImageData(width, height);
      numPatches = ((maxY - minY) * width + (maxX - minX)) * 4;
      for (i = k = 0, ref = numPatches; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        patch = patches[i];
        if (patch != null) {
          j = 4 * i;
          ref1 = netlogoColorToRGB(patch.pcolor), r = ref1[0], g = ref1[1], b = ref1[2];
          imageData.data[j + 0] = r;
          imageData.data[j + 1] = g;
          imageData.data[j + 2] = b;
          imageData.data[j + 3] = 255;
        }
      }
      this.scratchCtx.putImageData(imageData, 0, 0);
      return this.view.ctx.drawImage(this.scratchCanvas, 0, 0, this.view.canvas.width, this.view.canvas.height);
    };

    PatchDrawer.prototype.labelPatches = function(patches) {
      return this.view.usePatchCoordinates()((function(_this) {
        return function() {
          var ignore, patch, results;
          results = [];
          for (ignore in patches) {
            patch = patches[ignore];
            results.push(_this.view.drawLabel(patch.pxcor + .5, patch.pycor - .5, patch.plabel, patch['plabel-color']));
          }
          return results;
        };
      })(this));
    };

    PatchDrawer.prototype.clearPatches = function() {
      this.view.ctx.fillStyle = "black";
      return this.view.ctx.fillRect(0, 0, this.view.canvas.width, this.view.canvas.height);
    };

    PatchDrawer.prototype.repaint = function(model) {
      var patches, world;
      world = model.world;
      patches = model.patches;
      if (world.patchesallblack) {
        this.clearPatches();
      } else {
        this.colorPatches(patches);
      }
      if (world.patcheswithlabels) {
        return this.labelPatches(patches);
      }
    };

    return PatchDrawer;

  })();

}).call(this);

//# sourceMappingURL=view-controller.js.map
