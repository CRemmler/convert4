(function() {
  window.RactiveResizer = Ractive.extend({
    _isLocked: false,
    _xAdjustment: void 0,
    _yAdjustment: void 0,
    data: function() {
      return {
        isEnabled: false,
        isVisible: true,
        target: null
      };
    },
    computed: {
      dims: function() {
        return "position: absolute;\nleft: " + (this.get('left')) + "px; top: " + (this.get('top')) + "px;\nwidth: " + (this.get('width')) + "px; height: " + (this.get('height')) + "px;";
      },
      midX: function() {
        return (this.get('width') / 2) - 5;
      },
      midY: function() {
        return (this.get('height') / 2) - 5;
      },
      left: function() {
        return this.get('target').get('left') - 5;
      },
      right: function() {
        return this.get('target').get('right') + 5;
      },
      top: function() {
        return this.get('target').get('top') - 5;
      },
      bottom: function() {
        return this.get('target').get('bottom') + 5;
      },
      height: function() {
        return this.get('bottom') - this.get('top');
      },
      width: function() {
        return this.get('right') - this.get('left');
      }
    },
    clearTarget: function() {
      var target;
      target = this.get('target');
      if (!this._isLocked && (target != null)) {
        if (!target.destroyed) {
          target.set('isSelected', false);
        }
        this.set('target', null);
      }
    },
    setTarget: function(newTarget) {
      if (!this._isLocked) {
        setTimeout(((function(_this) {
          return function() {
            _this.clearTarget();
            _this.set('target', newTarget);
            return newTarget.set('isSelected', true);
          };
        })(this)), 0);
      }
    },
    lockTarget: function(newTarget) {
      if (!this._isLocked && (newTarget != null)) {
        this.setTarget(newTarget);
        this._isLocked = true;
      }
    },
    unlockTarget: function() {
      this._isLocked = false;
    },
    on: {
      'start-handle-drag': function(event) {
        return CommonDrag.dragstart.call(this, event, (function() {
          return true;
        }), (function(_this) {
          return function(x, y) {
            var left, ref, top;
            ref = _this.find('.widget-resizer').getBoundingClientRect(), left = ref.left, top = ref.top;
            _this._xAdjustment = left - _this.get('left');
            return _this._yAdjustment = top - _this.get('top');
          };
        })(this));
      },
      'drag-handle': function(event) {
        return CommonDrag.drag.call(this, event, (function(_this) {
          return function(x, y) {
            var adjusters, bottom, clamp, dirCoordPairs, direction, isMac, isSnapping, left, newChanges, newCoords, oldBottom, oldCoords, oldLeft, oldRight, oldTop, ref, right, snapToGrid, snappedX, snappedY, target, top, xCoord, yCoord;
            snapToGrid = function(n) {
              return n - (n - (Math.round(n / 10) * 10));
            };
            isMac = window.navigator.platform.startsWith('Mac');
            isSnapping = (!isMac && !event.original.ctrlKey) || (isMac && !event.original.metaKey);
            ref = isSnapping ? [x, y].map(snapToGrid) : [x, y], snappedX = ref[0], snappedY = ref[1];
            xCoord = snappedX - _this._xAdjustment;
            yCoord = snappedY - _this._yAdjustment;
            target = _this.get('target');
            oldLeft = target.get('left');
            oldRight = target.get('right');
            oldTop = target.get('top');
            oldBottom = target.get('bottom');
            left = ['left', xCoord];
            right = ['right', xCoord];
            top = ['top', yCoord];
            bottom = ['bottom', yCoord];
            direction = event.original.target.dataset.direction;
            adjusters = (function() {
              switch (direction) {
                case "Bottom":
                  return [bottom];
                case "BottomLeft":
                  return [bottom, left];
                case "BottomRight":
                  return [bottom, right];
                case "Left":
                  return [left];
                case "Right":
                  return [right];
                case "Top":
                  return [top];
                case "TopLeft":
                  return [top, left];
                case "TopRight":
                  return [top, right];
                default:
                  throw new Error("What the heck resize direction is '" + direction + "'?");
              }
            })();
            clamp = function(dir, value) {
              var opposite, oppositeValue;
              opposite = (function() {
                switch (dir) {
                  case 'left':
                    return 'right';
                  case 'right':
                    return 'left';
                  case 'top':
                    return 'bottom';
                  case 'bottom':
                    return 'top';
                  default:
                    throw new Error("What the heck opposite direction is '" + dir + "'?");
                }
              })();
              oppositeValue = target.get(opposite);
              switch (opposite) {
                case 'left':
                  return Math.max(value, oppositeValue + target.minWidth);
                case 'top':
                  return Math.max(value, oppositeValue + target.minHeight);
                case 'right':
                  return Math.min(value, oppositeValue - target.minWidth);
                case 'bottom':
                  return Math.min(value, oppositeValue - target.minHeight);
                default:
                  throw new Error("No, really, what the heck opposite direction is '" + opposite + "'?");
              }
            };
            dirCoordPairs = adjusters.map(function(arg) {
              var currentCor, dir;
              dir = arg[0], currentCor = arg[1];
              return [dir, clamp(dir, currentCor)];
            });
            newChanges = dirCoordPairs.every(function(arg) {
              var coord, dir;
              dir = arg[0], coord = arg[1];
              return !(((dir === 'left') || (dir === 'top')) && (coord < 0));
            }) ? dirCoordPairs.reduce((function(acc, arg) {
              var coord, dir;
              dir = arg[0], coord = arg[1];
              acc[dir] = coord;
              return acc;
            }), {}) : {};
            oldCoords = {
              left: oldLeft,
              top: oldTop,
              bottom: oldBottom,
              right: oldRight
            };
            newCoords = Object.assign(oldCoords, newChanges);
            return _this.get('target').handleResize(newCoords);
          };
        })(this));
      },
      'stop-handle-drag': function() {
        return CommonDrag.dragend.call(this, (function(_this) {
          return function() {
            _this._xAdjustment = void 0;
            _this._yAdjustment = void 0;
            return _this.get('target').handleResizeEnd();
          };
        })(this));
      }
    },
    template: "{{# isEnabled && isVisible && target !== null }}\n<div class=\"widget-resizer\" style=\"{{dims}}\">\n  {{ #target.get(\"resizeDirs\").includes(\"bottom\")      }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Bottom\"      style=\"cursor:  s-resize; bottom:          0; left:   {{midX}};\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"bottomLeft\")  }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"BottomLeft\"  style=\"cursor: sw-resize; bottom:          0; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"bottomRight\") }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"BottomRight\" style=\"cursor: se-resize; bottom:          0; right:         0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"left\")        }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Left\"        style=\"cursor:  w-resize; bottom:   {{midY}}; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"right\")       }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Right\"       style=\"cursor:  e-resize; bottom:   {{midY}}; right:         0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"top\")         }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Top\"         style=\"cursor:  n-resize; top:             0; left:   {{midX}};\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"topLeft\")     }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"TopLeft\"     style=\"cursor: nw-resize; top:             0; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"topRight\")    }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"TopRight\"    style=\"cursor: ne-resize; top:             0; right:         0;\"></div>{{/}}\n</div>\n{{/}}"
  });

}).call(this);

//# sourceMappingURL=resizer.js.map
