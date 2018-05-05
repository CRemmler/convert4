(function() {
  window.RactiveResizer = Ractive.extend({
    isLocked: false,
    lastUpdateMs: void 0,
    lastX: void 0,
    lastY: void 0,
    view: void 0,
    data: function() {
      return {
        isEnabled: false,
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
      if (!this.isLocked && (target != null)) {
        if (!target.destroyed) {
          target.find('.netlogo-widget').classList.remove('widget-selected');
        }
        this.set('target', null);
      }
    },
    setTarget: function(newTarget) {
      if (!this.isLocked) {
        setTimeout(((function(_this) {
          return function() {
            _this.clearTarget();
            _this.set('target', newTarget);
            return newTarget.find('.netlogo-widget').classList.add('widget-selected');
          };
        })(this)), 0);
      }
    },
    lockTarget: function(newTarget) {
      if (!this.isLocked && (newTarget != null)) {
        this.setTarget(newTarget);
        this.isLocked = true;
      }
    },
    unlockTarget: function() {
      this.isLocked = false;
    },
    on: {
      'start-handle-drag': function(event) {
        return CommonDrag.dragstart.call(this, event, (function() {
          return true;
        }), (function(_this) {
          return function(x, y) {
            _this.lastX = x;
            return _this.lastY = y;
          };
        })(this));
      },
      'drag-handle': function(event) {
        return CommonDrag.drag.call(this, event, (function(_this) {
          return function(x, y) {
            var adjusted, adjusters, adjustment, bottom, currentCor, dir, direction, exceedsOpposite, findAdjustment, i, lastCor, left, len, newValue, oldBottom, oldLeft, oldRight, oldTop, ref, right, target, top;
            target = _this.get('target');
            oldLeft = target.get('left');
            oldRight = target.get('right');
            oldTop = target.get('top');
            oldBottom = target.get('bottom');
            left = ['left', _this.lastX, x];
            right = ['right', _this.lastX, x];
            top = ['top', _this.lastY, y];
            bottom = ['bottom', _this.lastY, y];
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
            exceedsOpposite = function(dir, value) {
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
              oppositeValue = _this.get(opposite);
              return ((opposite === 'left' || opposite === 'top') && newValue <= (oppositeValue + 26)) || ((opposite === 'right' || opposite === 'bottom') && newValue >= (oppositeValue - 26));
            };
            findAdjustment = function(n) {
              return n - (Math.round(n / 10) * 10);
            };
            for (i = 0, len = adjusters.length; i < len; i++) {
              ref = adjusters[i], dir = ref[0], lastCor = ref[1], currentCor = ref[2];
              newValue = target.get(dir) - (lastCor - currentCor);
              adjustment = findAdjustment(newValue);
              adjusted = newValue - adjustment;
              if (!exceedsOpposite(dir, adjusted)) {
                target.set(dir, adjusted);
              }
            }
            _this.lastX = x;
            _this.lastY = y;
            return _this.get('target').fire('widget-resized', oldLeft, oldRight, oldTop, oldBottom, target.get('left'), target.get('right'), target.get('top'), target.get('bottom'));
          };
        })(this));
      },
      'stop-handle-drag': function() {
        return CommonDrag.dragend.call(this, (function(_this) {
          return function() {
            _this.lastX = void 0;
            return _this.lastY = void 0;
          };
        })(this));
      }
    },
    template: "{{# isEnabled && target !== null }}\n<div class=\"widget-resizer\" style=\"{{dims}}\">\n  {{ #target.get(\"resizeDirs\").includes(\"bottom\")      }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Bottom\"      style=\"cursor:  s-resize; bottom:          0; left:   {{midX}};\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"bottomLeft\")  }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"BottomLeft\"  style=\"cursor: sw-resize; bottom:          0; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"bottomRight\") }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"BottomRight\" style=\"cursor: se-resize; bottom:          0; right:         0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"left\")        }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Left\"        style=\"cursor:  w-resize; bottom:   {{midY}}; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"right\")       }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Right\"       style=\"cursor:  e-resize; bottom:   {{midY}}; right:         0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"top\")         }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Top\"         style=\"cursor:  n-resize; top:             0; left:   {{midX}};\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"topLeft\")     }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"TopLeft\"     style=\"cursor: nw-resize; top:             0; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"topRight\")    }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"TopRight\"    style=\"cursor: ne-resize; top:             0; right:         0;\"></div>{{/}}\n</div>\n{{/}}"
  });

}).call(this);

//# sourceMappingURL=resizer.js.map
