(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Line = (function() {
    function Line(x11, y11, x21, y21) {
      this.x1 = x11;
      this.y1 = y11;
      this.x2 = x21;
      this.y2 = y21;
    }

    Line.prototype.midpoint = function() {
      var midpointX, midpointY;
      midpointX = (this.x1 + this.x2) / 2;
      midpointY = (this.y1 + this.y2) / 2;
      return [midpointX, midpointY];
    };

    return Line;

  })();

  window.LinkDrawer = (function() {
    function LinkDrawer(view, shapes) {
      var directionIndicators, name, ref, shape;
      this.view = view;
      this.shapes = shapes;
      this._drawLinkLine = bind(this._drawLinkLine, this);
      this.traceCurvedLine = bind(this.traceCurvedLine, this);
      directionIndicators = {};
      ref = this.shapes;
      for (name in ref) {
        shape = ref[name];
        directionIndicators[name] = shape['direction-indicator'];
      }
      this.linkShapeDrawer = new ShapeDrawer(directionIndicators, this.view.onePixel);
    }

    LinkDrawer.prototype.traceCurvedLine = function(x1, y1, x2, y2, cx, cy, ctx) {
      ctx.moveTo(x1, y1);
      return ctx.quadraticCurveTo(cx, cy, x2, y2);
    };

    LinkDrawer.prototype.shouldWrapInDim = function(canWrap, dimensionSize, cor1, cor2) {
      var distance;
      distance = Math.abs(cor1 - cor2);
      return canWrap && distance > dimensionSize / 2;
    };

    LinkDrawer.prototype.calculateShortestLineAngle = function(x1, y1, x2, y2) {
      var shortestX, shortestY;
      shortestX = Math.min(x1 - x2, x2 - x1);
      shortestY = Math.min(y1 - y2, y2 - y1);
      return Math.atan2(shortestY, shortestX);
    };

    LinkDrawer.prototype.calculateComps = function(x1, y1, x2, y2, size) {
      var xcomp, ycomp;
      xcomp = (y2 - y1) / size;
      ycomp = (x1 - x2) / size;
      return [xcomp, ycomp];
    };

    LinkDrawer.prototype.calculateSublineOffset = function(centerOffset, thickness, xcomp, ycomp) {
      var thicknessFactor, xOff, yOff;
      thicknessFactor = thickness / this.view.onePixel;
      xOff = centerOffset * thicknessFactor * xcomp;
      yOff = centerOffset * thicknessFactor * ycomp;
      return [xOff, yOff];
    };

    LinkDrawer.prototype.getOffsetSubline = function(x1, y1, x2, y2, xOff, yOff) {
      var lx1, lx2, ly1, ly2;
      lx1 = x1 + xOff;
      lx2 = x2 + xOff;
      ly1 = y1 + yOff;
      ly2 = y2 + yOff;
      return new Line(lx1, ly1, lx2, ly2);
    };

    LinkDrawer.prototype.calculateControlPoint = function(midpointX, midpointY, curviness, xcomp, ycomp) {
      var controlX, controlY;
      controlX = midpointX - curviness * xcomp;
      controlY = midpointY - curviness * ycomp;
      return [controlX, controlY];
    };

    LinkDrawer.prototype.drawSubline = function(arg, dashPattern, thickness, color, isCurved, controlX, controlY, ctx) {
      var x1, x2, y1, y2;
      x1 = arg.x1, y1 = arg.y1, x2 = arg.x2, y2 = arg.y2;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(dashPattern.map((function(_this) {
        return function(x) {
          return x * _this.view.onePixel;
        };
      })(this)));
      ctx.strokeStyle = netlogoColorToCSS(color);
      ctx.lineWidth = thickness;
      ctx.lineCap = isCurved ? 'round' : 'square';
      this.traceCurvedLine(x1, y1, x2, y2, controlX, controlY, ctx);
      ctx.stroke();
      ctx.setLineDash([1, 0]);
      return ctx.restore();
    };

    LinkDrawer.prototype.drawShape = function(x, y, cx, cy, heading, color, thickness, linkShape, shapeName, ctx) {
      var realThickness, scale, shapeTheta, shift, shiftCoefficientX, shiftCoefficientY, sx, sy, theta, thicknessFactor;
      ctx.save();
      theta = this.calculateShortestLineAngle(x, y, cx, cy);
      shiftCoefficientX = x - cx > 0 ? -1 : 1;
      shiftCoefficientY = y - cy > 0 ? -1 : 1;
      shift = this.view.onePixel * 20;
      sx = x + shift * Math.abs(Math.cos(theta)) * shiftCoefficientX;
      sy = y + shift * Math.abs(Math.sin(theta)) * shiftCoefficientY;
      shapeTheta = Math.atan2(sy - y, sx - x) - Math.PI / 2;
      ctx.translate(sx, sy);
      if (linkShape['direction-indicator'].rotate) {
        ctx.rotate(shapeTheta);
      } else {
        ctx.rotate(Math.PI);
      }
      thicknessFactor = thickness / this.view.onePixel;
      if (thickness <= 1) {
        scale = 1 / this.view.onePixel / 5;
        realThickness = thickness * 10;
      } else {
        scale = thicknessFactor / 2;
        realThickness = 0.5;
      }
      ctx.scale(scale, scale);
      this.linkShapeDrawer.drawShape(ctx, color, shapeName, realThickness);
      return ctx.restore();
    };

    LinkDrawer.prototype.drawLabel = function(x, y, labelText, color) {
      return this.view.drawLabel(x - 3 * this.view.onePixel, y + 3 * this.view.onePixel, labelText, color);
    };

    LinkDrawer.prototype.draw = function(link, end1, end2, canWrapX, canWrapY, ctx, isStamp) {
      var adjustedThickness, color, theta, thickness, wrapX, wrapY, x1, x2, y1, y2;
      if (ctx == null) {
        ctx = this.view.ctx;
      }
      if (isStamp == null) {
        isStamp = false;
      }
      if (!link['hidden?']) {
        color = link.color, thickness = link.thickness;
        x1 = end1.xcor, y1 = end1.ycor;
        x2 = end2.xcor, y2 = end2.ycor;
        theta = this.calculateShortestLineAngle(x1, y1, x2, y2);
        adjustedThickness = thickness > this.view.onePixel ? thickness : this.view.onePixel;
        wrapX = this.shouldWrapInDim(canWrapX, this.view.worldWidth, x1, x2);
        wrapY = this.shouldWrapInDim(canWrapY, this.view.worldHeight, y1, y2);
        return this.getWrappedLines(x1, y1, x2, y2, wrapX, wrapY).forEach(this._drawLinkLine(link, adjustedThickness, ctx, isStamp));
      }
    };

    LinkDrawer.prototype._drawLinkLine = function(arg, thickness, ctx, isStamp) {
      var color, heading, isDirected, label, labelColor, shapeName, size;
      color = arg.color, size = arg.size, heading = arg.heading, isDirected = arg['directed?'], shapeName = arg.shape, label = arg.label, labelColor = arg['label-color'];
      return (function(_this) {
        return function(arg1) {
          var curviness, lines, linkShape, x1, x2, y1, y2;
          x1 = arg1.x1, y1 = arg1.y1, x2 = arg1.x2, y2 = arg1.y2;
          linkShape = _this.shapes[shapeName];
          curviness = linkShape.curviness, lines = linkShape.lines;
          return lines.forEach(function(line) {
            var centerOffset, controlX, controlY, dashPattern, hasLabel, isCurved, isMiddleLine, midpointX, midpointY, offsetSubline, ref, ref1, ref2, ref3, visible, xOff, xcomp, yOff, ycomp;
            centerOffset = line['x-offset'], dashPattern = line['dash-pattern'], visible = line['is-visible'];
            if (visible) {
              ref = _this.calculateComps(x1, y1, x2, y2, size), xcomp = ref[0], ycomp = ref[1];
              ref1 = _this.calculateSublineOffset(centerOffset, thickness, xcomp, ycomp), xOff = ref1[0], yOff = ref1[1];
              offsetSubline = _this.getOffsetSubline(x1, y1, x2, y2, xOff, yOff);
              isMiddleLine = line === lines[1];
              isCurved = curviness > 0;
              hasLabel = label != null;
              ref2 = offsetSubline.midpoint(), midpointX = ref2[0], midpointY = ref2[1];
              ref3 = _this.calculateControlPoint(midpointX, midpointY, curviness, xcomp, ycomp), controlX = ref3[0], controlY = ref3[1];
              _this.drawSubline(offsetSubline, dashPattern, thickness, color, isCurved, controlX, controlY, ctx);
              if (isMiddleLine) {
                if (isDirected && size > (.25 * _this.view.onePixel)) {
                  _this.drawShape(x2, y2, controlX, controlY, heading, color, thickness, linkShape, shapeName, ctx);
                }
                if (hasLabel && !isStamp) {
                  return _this.drawLabel(controlX, controlY, label, labelColor);
                }
              }
            }
          });
        };
      })(this);
    };

    LinkDrawer.prototype.getWrappedLines = function(x1, y1, x2, y2, lineWrapsX, lineWrapsY) {
      var worldHeight, worldWidth;
      worldWidth = this.view.worldWidth;
      worldHeight = this.view.worldHeight;
      if (lineWrapsX && lineWrapsY) {
        if (x1 < x2) {
          if (y1 < y2) {
            return [new Line(x1, y1, x2 - worldWidth, y2 - worldHeight), new Line(x1 + worldWidth, y1, x2, y2 - worldHeight), new Line(x1 + worldWidth, y1 + worldHeight, x2, y2), new Line(x1, y1 + worldHeight, x2 - worldWidth, y2)];
          } else {
            return [new Line(x1, y1, x2 - worldWidth, y2 + worldHeight), new Line(x1 + worldWidth, y1, x2, y2 + worldHeight), new Line(x1 + worldWidth, y1 - worldHeight, x2, y2), new Line(x1, y1 - worldHeight, x2 - worldWidth, y2)];
          }
        } else {
          if (y1 < y2) {
            return [new Line(x1, y1, x2 + worldWidth, y2 - worldHeight), new Line(x1 - worldWidth, y1, x2, y2 - worldHeight), new Line(x1 - worldWidth, y1 + worldHeight, x2, y2), new Line(x1, y1 + worldHeight, x2 + worldWidth, y2)];
          } else {
            return [new Line(x1, y1, x2 + worldWidth, y2 + worldHeight), new Line(x1 - worldWidth, y1, x2, y2 + worldHeight), new Line(x1 - worldWidth, y1 - worldHeight, x2, y2), new Line(x1, y1 - worldHeight, x2 + worldWidth, y2)];
          }
        }
      } else if (lineWrapsX) {
        if (x1 < x2) {
          return [new Line(x1, y1, x2 - worldWidth, y2), new Line(x1 + worldWidth, y1, x2, y2)];
        } else {
          return [new Line(x1, y1, x2 + worldWidth, y2), new Line(x1 - worldWidth, y1, x2, y2)];
        }
      } else if (lineWrapsY) {
        if (y1 < y2) {
          return [new Line(x1, y1, x2, y2 - worldHeight), new Line(x1, y1 + worldHeight, x2, y2)];
        } else {
          return [new Line(x1, y1 - worldHeight, x2, y2), new Line(x1, y1, x2, y2 + worldHeight)];
        }
      } else {
        return [new Line(x1, y1, x2, y2)];
      }
    };

    return LinkDrawer;

  })();

}).call(this);

//# sourceMappingURL=link-drawer.js.map
