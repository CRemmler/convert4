(function() {
  window.CommonDrag = {
    dragstart: function(arg, checkIsValid, callback) {
      var clientX, clientY, dataTransfer, invisiGIF, original, view;
      original = arg.original;
      clientX = original.clientX, clientY = original.clientY, dataTransfer = original.dataTransfer, view = original.view;
      if (checkIsValid(clientX, clientY)) {
        invisiGIF = document.createElement('img');
        invisiGIF.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        dataTransfer.setDragImage(invisiGIF, 0, 0);
        dataTransfer.setData('text/plain', '');
        this.view = view;
        this.lastUpdateMs = (new Date).getTime();
        callback(clientX, clientY);
      } else {
        original.preventDefault();
        false;
      }
    },
    drag: function(arg, callback) {
      var clientX, clientY, ref, ref1, ref2, root, view, x, y;
      ref = arg.original, clientX = ref.clientX, clientY = ref.clientY, view = ref.view;
      if (this.view != null) {
        root = (function(r) {
          if (r.parent != null) {
            return arguments.callee(r.parent);
          } else {
            return r;
          }
        })(this);
        x = clientX !== 0 ? clientX : (ref1 = root.get('lastDragX')) != null ? ref1 : -1;
        y = clientY !== 0 ? clientY : (ref2 = root.get('lastDragY')) != null ? ref2 : -1;
        if (this.view === view && x > 0 && y > 0 && ((new Date).getTime() - this.lastUpdateMs) >= (1000 / 30)) {
          this.lastUpdateMs = (new Date).getTime();
          callback(x, y);
        }
      }
      return false;
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

  window.RactiveDraggableAndContextable = RactiveContextable.extend({
    lastUpdateMs: void 0,
    startLeft: void 0,
    startRight: void 0,
    startTop: void 0,
    startBottom: void 0,
    view: void 0,
    data: function() {
      return {
        left: void 0,
        right: void 0,
        top: void 0,
        bottom: void 0
      };
    },
    on: {
      'start-widget-drag': function(event) {
        return CommonDrag.dragstart.call(this, event, (function() {
          return true;
        }), (function(_this) {
          return function(x, y) {
            _this.fire('select-component', event.component);
            _this.startLeft = _this.get('left') - x;
            _this.startRight = _this.get('right') - x;
            _this.startTop = _this.get('top') - y;
            return _this.startBottom = _this.get('bottom') - y;
          };
        })(this));
      },
      'drag-widget': function(event) {
        return CommonDrag.drag.call(this, event, (function(_this) {
          return function(x, y) {
            var findAdjustment, xAdjust, yAdjust;
            findAdjustment = function(n) {
              return n - (Math.round(n / 5) * 5);
            };
            xAdjust = findAdjustment(_this.startLeft + x);
            yAdjust = findAdjustment(_this.startTop + y);
            _this.set('left', _this.startLeft + x - xAdjust);
            _this.set('right', _this.startRight + x - xAdjust);
            _this.set('top', _this.startTop + y - yAdjust);
            return _this.set('bottom', _this.startBottom + y - yAdjust);
          };
        })(this));
      },
      'stop-widget-drag': function() {
        return CommonDrag.dragend.call(this, (function(_this) {
          return function() {
            _this.startLeft = void 0;
            _this.startRight = void 0;
            _this.startTop = void 0;
            return _this.startBottom = void 0;
          };
        })(this));
      }
    }
  });

}).call(this);

//# sourceMappingURL=draggable.js.map
