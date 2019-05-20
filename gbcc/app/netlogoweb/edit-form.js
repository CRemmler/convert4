(function() {
  window.EditForm = Ractive.extend({
    lastUpdateMs: void 0, // Number
    startX: void 0, // Number
    startY: void 0, // Number
    view: void 0, // Element
    data: function() {
      return {
        parentClass: 'netlogo-widget-container', // String
        submitLabel: 'OK', // String
        cancelLabel: 'Cancel', // String
        horizontalOffset: void 0, // Number
        verticalOffset: void 0, // Number
        amProvingMyself: false, // Boolean
        idBasis: void 0, // String
        style: void 0, // String
        visible: void 0, // Boolean
        xLoc: void 0, // Number
        yLoc: void 0, // Number
        draggable: true // Boolean
      };
    },
    computed: {
      id: (function() {
        return `${this.get('idBasis')
    // () => String
}-edit-window`;
      })
    },
    twoway: false,
    // We make the bound values lazy and then call `resetPartials` when showing, so as to
    // prevent the perpetuation of values after a change-and-cancel. --JAB (4/1/16)
    lazy: true,
    on: {
      submit: function({node}) {
        var newProps;
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
        var container, containerMidX, containerMidY, dialogHalfHeight, dialogHalfWidth, elem, findParentByClass, ref, ref1, whatADrag;
        findParentByClass = function(clss) {
          return function({
              parentElement: parent
            }) {
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
        // Must unhide before measuring --JAB (3/21/16)
        this.set('visible', true);
        elem = this.getElem();
        elem.focus();
        this.fire('lock-selection', this.parent);
        this.fire('edit-form-opened', this);
        container = findParentByClass(this.get('parentClass'))(elem);
        containerMidX = container.offsetWidth / 2;
        containerMidY = container.offsetHeight / 2;
        dialogHalfWidth = elem.offsetWidth / 2;
        dialogHalfHeight = elem.offsetHeight / 2;
        this.set('xLoc', (ref = this.get('horizontalOffset')) != null ? ref : containerMidX - dialogHalfWidth);
        this.set('yLoc', (ref1 = this.get('verticalOffset')) != null ? ref1 : containerMidY - dialogHalfHeight);
        this.resetPartial('widgetFields', this.partials.widgetFields);
        // This is awful, but it's the least invasive way I have come up with to workaround a 3 year old Firefox bug.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1189486
        // -JMB 10/18.
        whatADrag = (el) => {
          el.addEventListener('focus', (_) => {
            this.set('draggable', false);
          });
          return el.addEventListener('blur', (_) => {
            this.set('draggable', true);
          });
        };
        this.findAll('textarea').forEach(whatADrag);
        this.findAll('input').forEach(whatADrag);
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
        return CommonDrag.dragstart.call(this, event, checkIsValid, (x, y) => {
          this.startX = this.get('xLoc') - x;
          return this.startY = this.get('yLoc') - y;
        });
      },
      'drag-edit-dialog': function(event) {
        return CommonDrag.drag.call(this, event, (x, y) => {
          this.set('xLoc', this.startX + x);
          return this.set('yLoc', this.startY + y);
        });
      },
      'stop-edit-drag': function() {
        return CommonDrag.dragend.call(this, (function() {}));
      },
      'cancel-edit': function() {
        this.fire('activate-cloaking-device');
      },
      'handle-key': function({
          original: {keyCode}
        }) {
        if (keyCode === 27) {
          this.fire('cancel-edit');
          false;
        }
      }
    },
    getElem: function() {
      return this.find(`#${this.get('id')}`);
    },
    template: "{{# visible }}\n<div class=\"widget-edit-form-overlay\">\n  <div id=\"{{id}}\"\n       class=\"widget-edit-popup widget-edit-text\"\n       style=\"top: {{yLoc}}px; left: {{xLoc}}px; {{style}}\"\n       on-keydown=\"handle-key\"\n       draggable=\"{{draggable}}\" on-drag=\"drag-edit-dialog\" on-dragstart=\"start-edit-drag\"\n       on-dragend=\"stop-edit-drag\"\n       tabindex=\"0\">\n    <div id=\"{{id}}-closer\" class=\"widget-edit-closer\" on-click=\"cancel-edit\">X</div>\n    <form class=\"widget-edit-form\" on-submit=\"submit\">\n      <div class=\"widget-edit-form-title\">{{>title}}</div>\n      {{>widgetFields}}\n      <div class=\"widget-edit-form-button-container\">\n        <input class=\"widget-edit-text\" type=\"submit\" value=\"{{ submitLabel }}\" />\n        <input class=\"widget-edit-text\" type=\"button\" on-click=\"cancel-edit\" value=\"{{ cancelLabel }}\" />\n      </div>\n    </form>\n  </div>\n</div>\n{{/}}",
    partials: {
      widgetFields: void 0
    }
  });

}).call(this);

//# sourceMappingURL=edit-form.js.map
