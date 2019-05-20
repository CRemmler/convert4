(function() {
  // All callers of this should have the properties `view: Element` and `lastUpdateMs: Number`,
  // and these functions should be called with `call(<Ractive>, <args...>)` --JAB (11/23/17)
  window.CommonDrag = {
    dragstart: function({original}, checkIsValid, callback) {
      var clientX, clientY, dataTransfer, invisiGIF, view;
      ({clientX, clientY, dataTransfer, view} = original);
      if (checkIsValid(clientX, clientY)) {
        // The invisible GIF is used to hide the ugly "ghost" images that appear by default when dragging
        // The `setData` thing is done because, without it, Firefox feels that the drag hasn't really begun
        // So we give them some bogus drag data and get on with our lives. --JAB (11/22/17)
        invisiGIF = document.createElement('img');
        invisiGIF.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        if (typeof dataTransfer.setDragImage === "function") {
          dataTransfer.setDragImage(invisiGIF, 0, 0);
        }
        dataTransfer.setData('text/plain', '');
        this.view = view;
        this.lastUpdateMs = (new Date).getTime();
        callback(clientX, clientY);
      } else {
        original.preventDefault();
        false;
      }
    },
    drag: function({
        original: {clientX, clientY, view}
      }, callback) {
      var ref, ref1, root, x, y;
      if (this.view != null) {
        // Thanks, Firefox! --JAB (11/23/17)
        root = (function(r) {
          if (r.parent != null) {
            return arguments.callee(r.parent);
          } else {
            return r;
          }
        })(this);
        x = clientX !== 0 ? clientX : (ref = root.get('lastDragX')) != null ? ref : -1;
        y = clientY !== 0 ? clientY : (ref1 = root.get('lastDragY')) != null ? ref1 : -1;
        // When dragging stops, `client(X|Y)` tend to be very negative nonsense values
        // We only take non-negative values here, to avoid the widget disappearing --JAB (3/22/16, 10/29/17)

        // Only update drag coords 60 times per second.  If we don't throttle,
        // all of this `set`ing murders the CPU --JAB (10/29/17)
        if (this.view === view && x > 0 && y > 0 && ((new Date).getTime() - this.lastUpdateMs) >= (1000 / 60)) {
          this.lastUpdateMs = (new Date).getTime();
          callback(x, y);
        }
      }
      return true;
    },
    dragend: function(callback) {
      var root;
      if (this.view != null) {
        root = (function(r) {
          if (r.parent != null) {
            return arguments.callee(r.parent);
          } else {
            return r;
          }
        })(this);
        root.set('lastDragX', void 0);
        root.set('lastDragY', void 0);
        this.view = void 0;
        this.lastUpdateMs = void 0;
        callback();
      }
    }
  };

  // Ugh.  Single inheritance is a pox.  --JAB (10/29/17)
  window.RactiveDraggableAndContextable = RactiveContextable.extend({
    lastUpdateMs: void 0, // Number
    startLeft: void 0, // Number
    startRight: void 0, // Number
    startTop: void 0, // Number
    startBottom: void 0, // Number
    view: void 0, // Element
    data: function() {
      return {
        left: void 0, // Number
        right: void 0, // Number
        top: void 0, // Number
        bottom: void 0 // Number
      };
    },
    nudge: function(direction) {
      switch (direction) {
        case "up":
          if (this.get('top') > 0) {
            this.set('top', this.get('top') - 1);
            return this.set('bottom', this.get('bottom') - 1);
          }
          break;
        case "down":
          this.set('top', this.get('top') + 1);
          return this.set('bottom', this.get('bottom') + 1);
        case "left":
          if (this.get('left') > 0) {
            this.set('left', this.get('left') - 1);
            return this.set('right', this.get('right') - 1);
          }
          break;
        case "right":
          this.set('left', this.get('left') + 1);
          return this.set('right', this.get('right') + 1);
        default:
          return console.log(`'${direction}' is an impossible direction for nudging...`);
      }
    },
    on: {
      'start-widget-drag': function(event) {
        return CommonDrag.dragstart.call(this, event, (function() {
          return true;
        }), (x, y) => {
          this.fire('select-component', event.component);
          this.startLeft = this.get('left') - x;
          this.startRight = this.get('right') - x;
          this.startTop = this.get('top') - y;
          return this.startBottom = this.get('bottom') - y;
        });
      },
      'drag-widget': function(event) {
        var isMac, isSnapping;
        isMac = window.navigator.platform.startsWith('Mac');
        isSnapping = (!isMac && !event.original.ctrlKey) || (isMac && !event.original.metaKey);
        return CommonDrag.drag.call(this, event, (x, y) => {
          var findAdjustment, newLeft, newTop, xAdjust, yAdjust;
          findAdjustment = function(n) {
            return n - (Math.round(n / 5) * 5);
          };
          xAdjust = isSnapping ? findAdjustment(this.startLeft + x) : 0;
          yAdjust = isSnapping ? findAdjustment(this.startTop + y) : 0;
          newLeft = this.startLeft + x - xAdjust;
          newTop = this.startTop + y - yAdjust;
          if (newLeft < 0) {
            this.set('left', 0);
            this.set('right', this.startRight - this.startLeft);
          } else {
            this.set('left', newLeft);
            this.set('right', this.startRight + x - xAdjust);
          }
          if (newTop < 0) {
            this.set('top', 0);
            return this.set('bottom', this.startBottom - this.startTop);
          } else {
            this.set('top', newTop);
            return this.set('bottom', this.startBottom + y - yAdjust);
          }
        });
      },
      'stop-widget-drag': function() {
        return CommonDrag.dragend.call(this, () => {
          this.startLeft = void 0;
          this.startRight = void 0;
          this.startTop = void 0;
          return this.startBottom = void 0;
        });
      }
    }
  });

}).call(this);

//# sourceMappingURL=draggable.js.map
