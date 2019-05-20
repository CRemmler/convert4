(function() {
  var None, maybe;

  ({maybe, None} = tortoise_require('brazier/maybe'));

  window.RactiveAsyncUserDialog = Ractive.extend({
    lastUpdateMs: void 0, // Number
    startX: void 0, // Number
    startY: void 0, // Number
    view: void 0, // Element
    data: function() {
      return {
        isVisible: void 0, // Boolean
        state: void 0, // Object[Any]
        wareaHeight: void 0, // Number
        wareaWidth: void 0, // Number
        xLoc: 0, // Number
        yLoc: 0 // Number
      };
    },
    observe: {
      isVisible: function(newValue, oldValue) {
        if (newValue) {
          this.set('xLoc', this.get('wareaWidth') * .1);
          this.set('yLoc', (this.get('wareaHeight') * .1) + 150);
          setTimeout((() => {
            return this.find("#async-user-dialog").focus();
          }), 0); // Can't focus dialog until visible --JAB (4/10/19)
          this.fire('dialog-opened', this);
        } else {
          this.fire('dialog-closed', this);
        }
      }
    },
    on: {
      'close-popup': function() {
        this.set('isVisible', false);
        return false;
      },
      'handle-key': function({
          original: {keyCode}
        }) {
        var buttonID;
        if (keyCode === 13) { // Enter
          buttonID = (function() {
            switch (this.get('state').type) {
              case 'chooser':
                return "async-dialog-chooser-ok";
              case 'message':
                return "async-dialog-message-ok";
              case 'text-input':
                return "async-dialog-input-ok";
              case 'yes-or-no':
                return "async-dialog-yon-yes";
              default:
                throw new Error(`Unknown async dialog type: ${(this.get('state').type)}`);
            }
          }).call(this);
          document.getElementById(buttonID).click();
          return false;
        } else if (keyCode === 27) { // Esc
          return this.fire('close-popup');
        }
      },
      'perform-halt': function() {
        this.fire('close-popup');
        this.get('state').callback(None);
        return false;
      },
      'perform-chooser-ok': function() {
        var elem, index;
        this.fire('close-popup');
        elem = document.getElementById('async-dialog-chooser');
        index = elem.selectedIndex;
        elem.selectedIndex = 0;
        this.get('state').callback(maybe(index));
        return false;
      },
      'perform-input-ok': function() {
        var elem, value;
        this.fire('close-popup');
        elem = document.getElementById('async-dialog-text-input');
        value = elem.value;
        elem.value = "";
        this.get('state').callback(maybe(value));
        return false;
      },
      'perform-message-ok': function() {
        this.fire('close-popup');
        this.get('state').callback(maybe(0));
        return false;
      },
      'perform-no': function() {
        this.fire('close-popup');
        this.get('state').callback(maybe(false));
        return false;
      },
      'perform-yes': function() {
        this.fire('close-popup');
        this.get('state').callback(maybe(true));
        return false;
      },
      'show-state': function(event, state) {
        this.set('state', state);
        this.set('isVisible', true);
        return false;
      },
      'show-chooser': function(event, message, choices, callback) {
        this.fire('show-state', {}, {
          type: 'chooser',
          message,
          choices,
          callback
        });
        return false;
      },
      'show-text-input': function(event, message, callback) {
        this.fire('show-state', {}, {
          type: 'text-input',
          message,
          callback
        });
        return false;
      },
      'show-yes-or-no': function(event, message, callback) {
        this.fire('show-state', {}, {
          type: 'yes-or-no',
          message,
          callback
        });
        return false;
      },
      'show-message': function(event, message, callback) {
        this.fire('show-state', {}, {
          type: 'message',
          message,
          callback
        });
        return false;
      },
      'start-drag': function(event) {
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
      'drag-dialog': function(event) {
        return CommonDrag.drag.call(this, event, (x, y) => {
          this.set('xLoc', this.startX + x);
          return this.set('yLoc', this.startY + y);
        });
      },
      'stop-drag': function() {
        return CommonDrag.dragend.call(this, (function() {}));
      }
    },
    // coffeelint: disable=max_line_length
    template: "<div id=\"async-user-dialog\" class=\"async-popup\"\n     style=\"{{# !isVisible }}display: none;{{/}} top: {{yLoc}}px; left: {{xLoc}}px; max-width: {{wareaWidth * .4}}px; {{style}}\"\n     draggable=\"true\" on-drag=\"drag-dialog\" on-dragstart=\"start-drag\" on-dragend=\"stop-drag\"\n     on-keydown=\"handle-key\" tabindex=\"0\">\n  <div id=\"{{id}}-closer\" class=\"widget-edit-closer\" on-click=\"perform-halt\">X</div>\n  <div class=\"async-dialog-message\">{{state.message}}</div>\n  <div id=\"async-dialog-controls\" class=\"async-dialog-controls\">{{>controls}}</div>\n</div>",
    partials: {
      controls: "{{# state.type === 'message' }}\n  <div class=\"async-dialog-button-row\">\n    <input id=\"async-dialog-message-ok\" type=\"button\" on-click=\"perform-message-ok\" value=\"OK\"/>\n  </div>\n\n{{ elseif state.type === 'text-input' }}\n  <input id=\"async-dialog-text-input\" class=\"async-dialog-text-input\" type=\"text\" />\n  <div class=\"async-dialog-button-row\">\n    <input id=\"async-dialog-input-ok\" type=\"button\" on-click=\"perform-input-ok\" value=\"OK\"/>\n  </div>\n\n{{ elseif state.type === 'chooser' }}\n  <div class=\"h-center-flexbox\">\n    <select id=\"async-dialog-chooser\" class=\"async-dialog-chooser\" style=\"max-width: {{wareaWidth * .3}}px\">\n    {{#state.choices:i}}\n      <option {{# i === 0}} selected{{/}}>{{state.choices[i]}}</option>\n    {{/}}\n    </select>\n  </div>\n  <div class=\"async-dialog-button-row\">\n    <input id=\"async-dialog-chooser-ok\" type=\"button\" on-click=\"perform-chooser-ok\" value=\"OK\"/>\n  </div>\n\n{{ elseif state.type === 'yes-or-no' }}\n  <div class=\"async-dialog-button-row\">\n    <input id=\"async-dialog-yon-no\"  type=\"button\"                           on-click=\"perform-no\"  value=\"No\" />\n    <input id=\"async-dialog-yon-yes\" type=\"button\" style=\"margin-left: 5px;\" on-click=\"perform-yes\" value=\"Yes\"/>\n  </div>\n\n{{else}}\n  Invalid dialog state.\n\n{{/}}"
    }
  });

  // coffeelint: enable=max_line_length

}).call(this);

//# sourceMappingURL=async-user-dialog.js.map
