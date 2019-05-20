(function() {
  var Drawer, DrawingLayer, FOLLOW, OBSERVE, PatchDrawer, RIDE, SpotlightDrawer, TurtleDrawer, View, WATCH,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  window.ViewController = class ViewController {
    constructor(container, fontSize) {
      this.mouseXcor = this.mouseXcor.bind(this);
      this.mouseYcor = this.mouseYcor.bind(this);
      this.container = container;
      this.view = new View(fontSize);
      this.turtleDrawer = new TurtleDrawer(this.view);
      this.drawingLayer = new DrawingLayer(this.view, this.turtleDrawer, () => {
        return this.repaint();
      });
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
      // <!-- GBCC -->
      universe = this;
      // <!-- END GBCC -->
    }

    mouseXcor() {
      return this.view.xPixToPcor(this.mouseX);
    }

    mouseYcor() {
      return this.view.yPixToPcor(this.mouseY);
    }

    initMouseTracking() {
      this.view.visibleCanvas.addEventListener('mousedown', (e) => {
        return this.mouseDown = true;
      });
      document.addEventListener('mouseup', (e) => {
        return this.mouseDown = false;
      });
      this.view.visibleCanvas.addEventListener('mouseenter', (e) => {
        return this.mouseInside = true;
      });
      this.view.visibleCanvas.addEventListener('mouseleave', (e) => {
        return this.mouseInside = false;
      });
      return this.view.visibleCanvas.addEventListener('mousemove', (e) => {
        var rect;
        rect = this.view.visibleCanvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        return this.mouseY = e.clientY - rect.top;
      });
    }

    // Unit -> Unit
    initTouchTracking() {
      var endTouch, trackTouch;
      endTouch = (e) => {
        this.mouseDown = false;
        this.mouseInside = false;
      };
      trackTouch = ({clientX, clientY}) => {
        var bottom, left, right, top;
        ({bottom, left, top, right} = this.view.visibleCanvas.getBoundingClientRect());
        if (((left <= clientX && clientX <= right)) && ((top <= clientY && clientY <= bottom))) {
          this.mouseInside = true;
          this.mouseX = clientX - left;
          this.mouseY = clientY - top;
        } else {
          this.mouseInside = false;
        }
      };
      document.addEventListener('touchend', endTouch);
      document.addEventListener('touchcancel', endTouch);
      this.view.visibleCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        trackTouch(e.changedTouches[0]);
      });
      this.view.visibleCanvas.addEventListener('touchstart', (e) => {
        this.mouseDown = true;
        trackTouch(e.touches[0]);
      });
    }

    repaint() {
      this.view.transformToWorld(this.model.world);
      
      // <!-- GBCC -->
      if (drawPatches)
      {
        this.patchDrawer.repaint(this.model);
      }
      if (drawDrawing)
      {
        
        this.drawingLayer.repaint(this.model);
      }
      // <!-- END GBCC -->
      //this.patchDrawer.repaint(this.model);
      //this.drawingLayer.repaint(this.model);
      this.turtleDrawer.repaint(this.model);
      this.spotlightDrawer.repaint(this.model);
      return this.view.repaint(this.model);
    }

    applyUpdate(modelUpdate) {
      return this.model.update(modelUpdate);
    }

    update(modelUpdate) {
      var k, len, u, updates;
      updates = Array.isArray(modelUpdate) ? modelUpdate : [modelUpdate];
      for (k = 0, len = updates.length; k < len; k++) {
        u = updates[k];
        // <!-- GBCC -->
        if (socket && myUserType == "teacher" && mirroringEnabled)
        {
          socket.emit("send mirror reporter",
          {
            hubnetMessageSource: "server",
            hubnetMessageTag: "",
            hubnetMessage: modelUpdate[k]
          });
        }
        // <!-- END GBCC -->
        this.applyUpdate(u);
      }
      return this.repaint();
    }

  };

  // Perspective constants:
  OBSERVE = 0;

  RIDE = 1;

  FOLLOW = 2;

  WATCH = 3;

  View = (function() {
    class View {
      constructor(fontSize1) {
        this.usePatchCoordinates = this.usePatchCoordinates.bind(this);
        this.fontSize = fontSize1;
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

      transformToWorld(world) {
        return this.transformCanvasToWorld(world, this.canvas, this.ctx);
      }

      transformCanvasToWorld(world, canvas, ctx) {
        var ref;
        // 2 seems to look significantly better even on devices with devicePixelratio < 1. BCH 7/12/2015
        this.quality = Math.max((ref = window.devicePixelRatio) != null ? ref : 2, 2);
        this.maxpxcor = world.maxpxcor != null ? world.maxpxcor : 25;
        this.minpxcor = world.minpxcor != null ? world.minpxcor : -25;
        this.maxpycor = world.maxpycor != null ? world.maxpycor : 25;
        this.minpycor = world.minpycor != null ? world.minpycor : -25;
        this.patchsize = world.patchsize != null ? world.patchsize : 9;
        this.wrapX = world.wrappingallowedinx;
        this.wrapY = world.wrappingallowediny;
        this.onePixel = 1 / this.patchsize; // The size of one pixel in patch coords
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
      }

      usePatchCoordinates(ctx = this.ctx) {
        return (drawFn) => {
          var h, w;
          ctx.save();
          w = this.canvas.width;
          h = this.canvas.height;
          // Argument rows are the standard transformation matrix columns. See spec.
          // http://www.w3.org/TR/2dcontext/#dom-context-2d-transform
          // BCH 5/16/2015
          ctx.setTransform(w / this.worldWidth, 0, 0, -h / this.worldHeight, -(this.minpxcor - .5) * w / this.worldWidth, (this.maxpycor + .5) * h / this.worldHeight);
          drawFn();
          return ctx.restore();
        };
      }

      withCompositing(gco, ctx = this.ctx) {
        return function(drawFn) {
          var oldGCO;
          oldGCO = ctx.globalCompositeOperation;
          ctx.globalCompositeOperation = gco;
          drawFn();
          return ctx.globalCompositeOperation = oldGCO;
        };
      }

      offsetX() {
        return this.worldCenterX - this.centerX;
      }

      offsetY() {
        return this.worldCenterY - this.centerY;
      }

      // These convert between model coordinates and position in the canvas DOM element
      // This will differ from untransformed canvas position if @quality != 1. BCH 5/6/2015
      xPixToPcor(x) {
        return (this.worldWidth * x / this.visibleCanvas.clientWidth + this.worldWidth - this.offsetX()) % this.worldWidth + this.minpxcor - .5;
      }

      yPixToPcor(y) {
        return (-this.worldHeight * y / this.visibleCanvas.clientHeight + 2 * this.worldHeight - this.offsetY()) % this.worldHeight + this.minpycor - .5;
      }

      // Unlike the above functions, this accounts for @quality. This intentionally does not account
      // for situations like follow (as it's used to make that calculation). BCH 5/6/2015
      xPcorToCanvas(x) {
        return (x - this.minpxcor + .5) / this.worldWidth * this.visibleCanvas.width;
      }

      yPcorToCanvas(y) {
        return (this.maxpycor + .5 - y) / this.worldHeight * this.visibleCanvas.height;
      }

      // Wraps text
      drawLabel(xcor, ycor, label, color, ctx) {
        if (ctx == null) {
          ctx = this.ctx;
        }
        label = label != null ? label.toString() : '';
        if (label.length > 0) {
          return this.drawWrapped(xcor, ycor, label.length * this.fontSize / this.onePixel, (x, y) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(this.onePixel, -this.onePixel);
            ctx.textAlign = 'end';
            ctx.fillStyle = netlogoColorToCSS(color);
            ctx.fillText(label, 0, 0);
            return ctx.restore();
          });
        }
      }

      // drawFn: (xcor, ycor) ->
      drawWrapped(xcor, ycor, size, drawFn) {
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
      }

      // Returns the agent being watched, or null.
      watch(model) {
        var id, links, observer, patches, turtles, type;
        ({observer, turtles, links, patches} = model);
        if (model.observer.perspective !== OBSERVE && observer.targetagent && observer.targetagent[1] >= 0) {
          [type, id] = observer.targetagent;
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
      }

      // Returns the agent being followed, or null.
      follow(model) {
        var persp;
        persp = model.observer.perspective;
        if (persp === FOLLOW || persp === RIDE) {
          return this.watch(model);
        } else {
          return null;
        }
      }

      // (Number) => Unit
      setZoom(zoomLevel) {
        this._zoomLevel = Number.isInteger(zoomLevel) ? Math.min(Math.max(0, zoomLevel), Math.floor(this.worldWidth / 2), Math.floor(this.worldHeight / 2)) : null;
      }

      repaint(model) {
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
      }

      // A very naïve and unaesthetic implementation!
      // I'm just throwing this together for a janky `hubnet-send-follow`.
      // Do better! --JAB (10/21/17)

      // () => Unit
      _handleZoom() {
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
      }

    };

    // IDs used in watch and follow
    View.prototype.turtleType = 1;

    View.prototype.patchType = 2;

    View.prototype.linkType = 3;

    return View;

  }).call(this);

  Drawer = class Drawer {
    constructor(view1) {
      this.view = view1;
    }

  };

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
  DrawingLayer = class DrawingLayer extends Drawer {
    constructor(view, turtleDrawer, repaintView) {
      super();
      this.importDrawing = this.importDrawing.bind(this);
      this.drawLine = this.drawLine.bind(this);
      this.view = view;
      this.turtleDrawer = turtleDrawer;
      this.repaintView = repaintView;
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'dlayer';
      this.ctx = this.canvas.getContext('2d');
      // <!-- GBCC -->
      myCanvas = this.canvas;
      // <!-- END GBCC -->
    }

    resizeCanvas() {
      this.canvas.width = this.view.canvas.width;
      return this.canvas.height = this.view.canvas.height;
    }

    clearDrawing() {
      return this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    importDrawing(base64) {
      var image;
      boundMethodCheck(this, DrawingLayer);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      image = new Image();
      image.onload = () => {
        var canvasRatio, height, imageRatio, width;
        canvasRatio = this.canvas.width / this.canvas.height;
        imageRatio = image.width / image.height;
        width = this.canvas.width;
        height = this.canvas.height;
        if (canvasRatio >= imageRatio) {
          // canvas is "wider" than the image, use full image height and partial width
          width = (imageRatio / canvasRatio) * this.canvas.width;
        } else {
          // canvas is "thinner" than the image, use full image width and partial height
          height = (canvasRatio / imageRatio) * this.canvas.height;
        }
        this.ctx.drawImage(image, (this.canvas.width - width) / 2, (this.canvas.height - height) / 2, width, height);
        this.repaintView();
      };
      image.src = base64;
    }

    _rgbToCss([r, g, b]) {
      return `rgb(${r}, ${g}, ${b})`;
    }

    makeMockTurtleObject({
        x: xcor,
        y: ycor,
        shapeName: shape,
        size,
        heading,
        color
      }) {
      return {xcor, ycor, shape, size, heading, color};
    }

    makeMockLinkObject({
        x1,
        y1,
        x2,
        y2,
        shapeName,
        color,
        heading,
        size,
        'directed?': isDirected,
        'hidden?': isHidden,
        midpointX,
        midpointY,
        thickness
      }) {
      var end1, end2, mockLink;
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
        color,
        heading,
        size,
        'directed?': isDirected,
        'hidden?': isHidden,
        midpointX,
        midpointY,
        thickness
      };
      return [mockLink, end1, end2];
    }

    stampTurtle(turtleStamp) {
      var mockTurtleObject;
      mockTurtleObject = this.makeMockTurtleObject(turtleStamp);
      return this.view.usePatchCoordinates(this.ctx)(() => {
        return this.view.withCompositing(this.compositingOperation(turtleStamp.stampMode), this.ctx)(() => {
          return this.turtleDrawer.drawTurtle(mockTurtleObject, this.ctx, true);
        });
      });
    }

    stampLink(linkStamp) {
      var mockLinkObject;
      mockLinkObject = this.makeMockLinkObject(linkStamp);
      return this.view.usePatchCoordinates(this.ctx)(() => {
        return this.view.withCompositing(this.compositingOperation(linkStamp.stampMode), this.ctx)(() => {
          return this.turtleDrawer.linkDrawer.draw(...mockLinkObject, this.wrapX, this.wrapY, this.ctx, true);
        });
      });
    }

    compositingOperation(mode) {
      if (mode === 'erase') {
        return 'destination-out';
      } else {
        return 'source-over';
      }
    }

    drawStamp({agentType, stamp}) {
      if (agentType === 'turtle') {
        return this.stampTurtle(stamp);
      } else if (agentType === 'link') {
        return this.stampLink(stamp);
      }
    }

    drawLine({
        rgb: color,
        size,
        penMode,
        fromX: x1,
        fromY: y1,
        toX: x2,
        toY: y2
      }) {
      var penColor;
      boundMethodCheck(this, DrawingLayer);
      if (penMode !== 'up') {
        penColor = color;
        return this.view.usePatchCoordinates(this.ctx)(() => {
          this.ctx.save();
          this.ctx.strokeStyle = this._rgbToCss(penColor);
          this.ctx.lineWidth = size * this.view.onePixel;
          this.ctx.lineCap = 'round';
          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.view.withCompositing(this.compositingOperation(penMode), this.ctx)(() => {
            return this.ctx.stroke();
          });
          return this.ctx.restore();
        });
      }
    }

    draw() {
      return this.events.forEach((event) => {
        switch (event.type) {
          case 'clear-drawing':
            return this.clearDrawing();
          case 'line':
            return this.drawLine(event);
          case 'stamp-image':
            return this.drawStamp(event);
          case 'import-drawing':
            return this.importDrawing(event.imageBase64);
          case 'zoom':
            return this.view.setZoom(event.scale);
          case 'reset-zoom':
            return this.view.setZoom(Math.floor(this.view.worldWidth / 2));
        }
      });
    }

    repaint(model) {
      var world;
      // Potato --JTT 5/29/15
      // I think Jordan makes a good point here. --JAB (8/6/15)
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
    }

  };

  SpotlightDrawer = (function() {
    class SpotlightDrawer extends Drawer {
      constructor(view) {
        super();
        this.view = view;
      }

      outer() {
        return 10 / this.view.patchsize;
      }

      middle() {
        return 8 / this.view.patchsize;
      }

      inner() {
        return 4 / this.view.patchsize;
      }

      drawCircle(x, y, innerDiam, outerDiam, color) {
        var ctx;
        ctx = this.view.ctx;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, outerDiam / 2, 0, 2 * Math.PI);
        ctx.arc(x, y, innerDiam / 2, 0, 2 * Math.PI, true);
        return ctx.fill();
      }

      drawSpotlight(xcor, ycor, size, dimOther) {
        var ctx;
        ctx = this.view.ctx;
        ctx.lineWidth = this.view.onePixel;
        ctx.beginPath();
        // Draw arc anti-clockwise so that it's subtracted from the fill. See the
        // fill() documentation and specifically the "nonzero" rule. BCH 3/17/2015
        if (dimOther) {
          this.view.drawWrapped(xcor, ycor, size + this.outer(), (x, y) => {
            ctx.moveTo(x, y); // Don't want the context to draw a path between the circles. BCH 5/6/2015
            return ctx.arc(x, y, (size + this.outer()) / 2, 0, 2 * Math.PI, true);
          });
          ctx.rect(this.view.minpxcor - 0.5, this.view.minpycor - 0.5, this.view.worldWidth, this.view.worldHeight);
          ctx.fillStyle = this.dimmed;
          ctx.fill();
        }
        return this.view.drawWrapped(xcor, ycor, size + this.outer(), (x, y) => {
          this.drawCircle(x, y, size, size + this.outer(), this.dimmed);
          this.drawCircle(x, y, size, size + this.middle(), this.spotlightOuterBorder);
          return this.drawCircle(x, y, size, size + this.inner(), this.spotlightInnerBorder);
        });
      }

      adjustSize(size) {
        return Math.max(size, this.view.worldWidth / 16, this.view.worldHeight / 16);
      }

      dimensions(agent) {
        if (agent.xcor != null) {
          return [agent.xcor, agent.ycor, 2 * agent.size];
        } else if (agent.pxcor != null) {
          return [agent.pxcor, agent.pycor, 2];
        } else {
          return [agent.midpointx, agent.midpointy, agent.size];
        }
      }

      repaint(model) {
        return this.view.usePatchCoordinates()(() => {
          var size, watched, xcor, ycor;
          watched = this.view.watch(model);
          if (watched != null) {
            [xcor, ycor, size] = this.dimensions(watched);
            return this.drawSpotlight(xcor, ycor, this.adjustSize(size), model.observer.perspective === WATCH);
          }
        });
      }

    };

    // Names and values taken from org.nlogo.render.SpotlightDrawer
    SpotlightDrawer.prototype.dimmed = `rgba(0, 0, 50, ${100 / 255})`;

    SpotlightDrawer.prototype.spotlightInnerBorder = `rgba(200, 255, 255, ${100 / 255})`;

    SpotlightDrawer.prototype.spotlightOuterBorder = `rgba(200, 255, 255, ${50 / 255})`;

    SpotlightDrawer.prototype.clear = 'white'; // for clearing with 'destination-out' compositing

    return SpotlightDrawer;

  }).call(this);

  TurtleDrawer = class TurtleDrawer extends Drawer {
    constructor(view) {
      super();
      this.view = view;
      this.turtleShapeDrawer = new ShapeDrawer({}, this.view.onePixel);
      this.linkDrawer = new LinkDrawer(this.view, {});
    }

    drawTurtle(turtle, ctx = this.view.ctx, isStamp = false) {
      var size, xcor, ycor;
      if (!turtle['hidden?']) {
        xcor = turtle.xcor;
        ycor = turtle.ycor;
        size = turtle.size;
        this.view.drawWrapped(xcor, ycor, size, ((x, y) => {
          return this.drawTurtleAt(turtle, x, y, ctx);
        }));
        if (!isStamp) {
          return this.view.drawLabel(xcor + turtle.size / 2, ycor - turtle.size / 2, turtle.label, turtle['label-color'], ctx);
        }
      }
    }

    drawTurtleAt(turtle, xcor, ycor, ctx) {
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
    }

    drawLink(link, end1, end2, wrapX, wrapY) {
      return this.linkDrawer.draw(link, end1, end2, wrapX, wrapY);
    }

    repaint(model) {
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
      return this.view.usePatchCoordinates()(() => {
        this.drawAgents(links, (world.linkbreeds != null) ? world.linkbreeds : ["LINKS"], (link) => {
          return this.drawLink(link, turtles[link.end1], turtles[link.end2], world.wrappingallowedinx, world.wrappingallowediny);
        });
        this.view.ctx.lineWidth = this.onePixel;
        this.drawAgents(turtles, (world.turtlebreeds != null) ? world.turtlebreeds : ["TURTLES"], (turtle) => {
          return this.drawTurtle(turtle);
        });
      });
    }

    drawAgents(agents, breeds, draw) {
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
    }

  };

  // Works by creating a scratchCanvas that has a pixel per patch. Those pixels
  // are colored accordingly. Then, the scratchCanvas is drawn onto the main
  // canvas scaled. This is very, very fast. It also prevents weird lines between
  // patches.
  PatchDrawer = class PatchDrawer {
    constructor(view1) {
      this.view = view1;
      this.scratchCanvas = document.createElement('canvas');
      this.scratchCtx = this.scratchCanvas.getContext('2d');
    }

    colorPatches(patches) {
      var b, g, height, i, imageData, j, k, maxX, maxY, minX, minY, numPatches, patch, r, ref, width;
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
      for (i = k = 0, ref = numPatches; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
        patch = patches[i];
        if (patch != null) {
          j = 4 * i;
          [r, g, b] = netlogoColorToRGB(patch.pcolor);
          imageData.data[j + 0] = r;
          imageData.data[j + 1] = g;
          imageData.data[j + 2] = b;
          imageData.data[j + 3] = 255;
        }
      }
      this.scratchCtx.putImageData(imageData, 0, 0);
      return this.view.ctx.drawImage(this.scratchCanvas, 0, 0, this.view.canvas.width, this.view.canvas.height);
    }

    labelPatches(patches) {
      return this.view.usePatchCoordinates()(() => {
        var ignore, patch, results;
        results = [];
        for (ignore in patches) {
          patch = patches[ignore];
          results.push(this.view.drawLabel(patch.pxcor + .5, patch.pycor - .5, patch.plabel, patch['plabel-color']));
        }
        return results;
      });
    }

    clearPatches() {
      this.view.ctx.fillStyle = "black";
      return this.view.ctx.fillRect(0, 0, this.view.canvas.width, this.view.canvas.height);
    }

    repaint(model) {
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
    }

  };

}).call(this);

//# sourceMappingURL=view-controller.js.map
