(function() {
  window.RactiveResizer = Ractive.extend({
    _isLocked: false, // Boolean
    _xAdjustment: void 0, // Number
    _yAdjustment: void 0, // Number
    data: function() {
      return {
        isEnabled: false, // Boolean
        isVisible: true, // Boolean
        target: null // Ractive
      };
    },
    computed: {
      dims: function() {
        return `position: absolute;\nleft: ${this.get('left')}px; top: ${this.get('top')}px;\nwidth: ${this.get('width')}px; height: ${this.get('height')}px;`;
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
    // () => Unit
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
    // (Ractive) => Unit
    setTarget: function(newTarget) {
      if (!this._isLocked) {
        setTimeout((() => { // Use `setTimeout`, so any pending `clearTarget` resolves first --JAB (12/6/17)
          this.clearTarget();
          this.set('target', newTarget);
          return newTarget.set('isSelected', true);
        }), 0);
      }
    },
    // (Ractive) => Unit
    lockTarget: function(newTarget) {
      if (!this._isLocked && (newTarget != null)) {
        this.setTarget(newTarget);
        this._isLocked = true;
      }
    },
    // () => Unit
    unlockTarget: function() {
      this._isLocked = false;
    },
    on: {
      'start-handle-drag': function(event) {
        return CommonDrag.dragstart.call(this, event, (function() {
          return true;
        }), (x, y) => {
          var left, top;
          ({left, top} = this.find('.widget-resizer').getBoundingClientRect());
          this._xAdjustment = left - this.get('left');
          return this._yAdjustment = top - this.get('top');
        });
      },
      'drag-handle': function(event) {
        return CommonDrag.drag.call(this, event, (x, y) => {
          var adjusters, bottom, clamp, dirCoordPairs, direction, isMac, isSnapping, left, newChanges, newCoords, oldBottom, oldCoords, oldLeft, oldRight, oldTop, right, snapToGrid, snappedX, snappedY, target, top, xCoord, yCoord;
          snapToGrid = function(n) {
            return n - (n - (Math.round(n / 10) * 10));
          };
          isMac = window.navigator.platform.startsWith('Mac');
          isSnapping = (!isMac && !event.original.ctrlKey) || (isMac && !event.original.metaKey);
          [snappedX, snappedY] = isSnapping ? [x, y].map(snapToGrid) : [x, y];
          xCoord = snappedX - this._xAdjustment;
          yCoord = snappedY - this._yAdjustment;
          target = this.get('target');
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
                throw new Error(`What the heck resize direction is '${direction}'?`);
            }
          })();
          clamp = (dir, value) => {
            var newValue, opposite, oppositeValue;
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
                  throw new Error(`What the heck opposite direction is '${dir}'?`);
              }
            })();
            oppositeValue = target.get(opposite);
            newValue = (function() {
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
                  throw new Error(`No, really, what the heck opposite direction is '${opposite}'?`);
              }
            })();
            return Math.round(newValue);
          };
          dirCoordPairs = adjusters.map(function([dir, currentCor]) {
            return [dir, clamp(dir, currentCor)];
          });
          newChanges = dirCoordPairs.every(function([dir, coord]) {
            return !(((dir === 'left') || (dir === 'top')) && (coord < 0));
          }) ? dirCoordPairs.reduce((function(acc, [dir, coord]) {
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
          return this.get('target').handleResize(newCoords);
        });
      },
      'stop-handle-drag': function() {
        return CommonDrag.dragend.call(this, () => {
          this._xAdjustment = void 0;
          this._yAdjustment = void 0;
          return this.get('target').handleResizeEnd();
        });
      }
    },
    // coffeelint: disable=max_line_length
    template: "{{# isEnabled && isVisible && target !== null }}\n<div class=\"widget-resizer\" style=\"{{dims}}\">\n  {{ #target.get(\"resizeDirs\").includes(\"bottom\")      }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Bottom\"      style=\"cursor:  s-resize; bottom:          0; left:   {{midX}};\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"bottomLeft\")  }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"BottomLeft\"  style=\"cursor: sw-resize; bottom:          0; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"bottomRight\") }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"BottomRight\" style=\"cursor: se-resize; bottom:          0; right:         0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"left\")        }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Left\"        style=\"cursor:  w-resize; bottom:   {{midY}}; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"right\")       }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Right\"       style=\"cursor:  e-resize; bottom:   {{midY}}; right:         0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"top\")         }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"Top\"         style=\"cursor:  n-resize; top:             0; left:   {{midX}};\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"topLeft\")     }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"TopLeft\"     style=\"cursor: nw-resize; top:             0; left:          0;\"></div>{{/}}\n  {{ #target.get(\"resizeDirs\").includes(\"topRight\")    }}<div draggable=\"true\" on-drag=\"drag-handle\" on-dragstart=\"start-handle-drag\" on-dragend=\"stop-handle-drag\" class=\"widget-resize-handle\" data-direction=\"TopRight\"    style=\"cursor: ne-resize; top:             0; right:         0;\"></div>{{/}}\n</div>\n{{/}}"
  });

  // coffeelint: enable=max_line_length

}).call(this);

//# sourceMappingURL=resizer.js.map
