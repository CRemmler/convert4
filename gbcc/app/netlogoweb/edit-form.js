(function() {
  window.EditForm = Ractive.extend({
    lastUpdateMs: void 0,
    startX: void 0,
    startY: void 0,
    view: void 0,
    data: function() {
      return {
        amProvingMyself: false,
        idBasis: void 0,
        style: void 0,
        visible: void 0,
        xLoc: void 0,
        yLoc: void 0
      };
    },
    computed: {
      id: (function() {
        return (this.get('idBasis')) + "-edit-window";
      })
    },
    twoway: false,
    lazy: true,
    on: {
      submit: function(arg) {
        var newProps, node;
        node = arg.node;
        try {
          newProps = this.genProps(node);
          if (newProps != null) {
            return this.fire('update-widget-value', {}, newProps);
          }
        } finally {
          this.set('amProvingMyself', false);
          this.fire('activate-cloaking-device');
          return false;
        }
      },
      'show-yourself': function() {
        var container, containerMidX, containerMidY, dialogHalfHeight, dialogHalfWidth, elem, findParentByClass;
        findParentByClass = function(clss) {
          return function(arg) {
            var parent;
            parent = arg.parentElement;
            if (parent != null) {
              if (parent.classList.contains(clss)) {
                return parent;
              } else {
                return findParentByClass(clss)(parent);
              }
            } else {
              return void 0;
            }
          };
        };
        this.set('visible', true);
        elem = this.getElem();
        elem.focus();
        this.fire('lock-selection', this.parent);
        this.fire('edit-form-opened', this);
        container = findParentByClass('netlogo-widget-container')(elem);
        containerMidX = container.offsetWidth / 2;
        containerMidY = container.offsetHeight / 2;
        dialogHalfWidth = elem.offsetWidth / 2;
        dialogHalfHeight = elem.offsetHeight / 2;
        this.set('xLoc', containerMidX - dialogHalfWidth);
        this.set('yLoc', containerMidY - dialogHalfHeight);
        this.resetPartial('widgetFields', this.partials.widgetFields);
        return false;
      },
      'activate-cloaking-device': function() {
        this.set('visible', false);
        this.fire('unlock-selection');
        this.fire('edit-form-closed', this);
        if (this.get('amProvingMyself')) {
          this.fire('has-been-proven-unworthy');
        }
        return false;
      },
      'prove-your-worth': function() {
        this.fire('show-yourself');
        this.set('amProvingMyself', true);
        return false;
      },
      'start-edit-drag': function(event) {
        var checkIsValid;
        checkIsValid = function(x, y) {
          var elem;
          elem = document.elementFromPoint(x, y);
          switch (elem.tagName.toLowerCase()) {
            case "input":
              return elem.type.toLowerCase() !== "number" && elem.type.toLowerCase() !== "text";
            case "textarea":
              return false;
            default:
              return true;
          }
        };
        return CommonDrag.dragstart.call(this, event, checkIsValid, (function(_this) {
          return function(x, y) {
            _this.startX = _this.get('xLoc') - x;
            return _this.startY = _this.get('yLoc') - y;
          };
        })(this));
      },
      'drag-edit-dialog': function(event) {
        return CommonDrag.drag.call(this, event, (function(_this) {
          return function(x, y) {
            _this.set('xLoc', _this.startX + x);
            return _this.set('yLoc', _this.startY + y);
          };
        })(this));
      },
      'stop-edit-drag': function() {
        return CommonDrag.dragend.call(this, (function() {}));
      },
      'cancel-edit': function() {
        this.fire('activate-cloaking-device');
      },
      'handle-key': function(arg) {
        var keyCode;
        keyCode = arg.original.keyCode;
        if (keyCode === 27) {
          this.fire('cancel-edit');
          false;
        }
      }
    },
    getElem: function() {
      return this.find("#" + (this.get('id')));
    },
    template: "{{# visible }}\n<div class=\"widget-edit-form-overlay\">\n  <div id=\"{{id}}\"\n       class=\"widget-edit-popup widget-edit-text\"\n       style=\"top: {{yLoc}}px; left: {{xLoc}}px; {{style}}\"\n       on-keydown=\"handle-key\"\n       draggable=\"true\" on-drag=\"drag-edit-dialog\" on-dragstart=\"start-edit-drag\"\n       on-dragend=\"stop-edit-drag\"\n       tabindex=\"0\">\n    <div id=\"{{id}}-closer\" class=\"widget-edit-closer\" on-click=\"cancel-edit\">X</div>\n    <form class=\"widget-edit-form\" on-submit=\"submit\">\n      <div class=\"widget-edit-form-title\">{{>title}}</div>\n      {{>widgetFields}}\n      <div class=\"widget-edit-form-button-container\">\n        <input class=\"widget-edit-text\" type=\"submit\" value=\"OK\" />\n        <input class=\"widget-edit-text\" type=\"button\" on-click=\"cancel-edit\" value=\"Cancel\" />\n      </div>\n    </form>\n  </div>\n</div>\n{{/}}",
    partials: {
      widgetFields: void 0
    }
  });

}).call(this);

//# sourceMappingURL=edit-form.js.map
