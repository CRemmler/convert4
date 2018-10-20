(function() {
  var isMac, keyRow, keyTable, platformCtrlHtml;

  isMac = window.navigator.platform.startsWith('Mac');

  platformCtrlHtml = isMac ? "&#8984;" : "ctrl";

  keyRow = function(keys, explanation) {
    return "<tr>\n  <td class=\"help-keys\">" + (keys.map(function(key) {
      return "<kbd>" + key + "</kbd>";
    }).join('')) + "</td>\n  <td class=\"help-explanation\">" + explanation + "</td>\n</tr>";
  };

  keyTable = function(entries) {
    return "<table class=\"help-key-table\">\n  " + (entries.map(function(arg) {
      var explanation, keys;
      keys = arg[0], explanation = arg[1];
      return keyRow(keys, explanation);
    }).join('\n')) + "\n</table>";
  };

  window.RactiveHelpDialog = Ractive.extend({
    data: function() {
      return {
        isOverlayUp: void 0,
        isVisible: void 0,
        stateName: void 0,
        wareaHeight: void 0,
        wareaWidth: void 0
      };
    },
    observe: {
      isVisible: function(newValue, oldValue) {
        this.set('isOverlayUp', newValue);
        if (newValue) {
          setTimeout(((function(_this) {
            return function() {
              return _this.find("#help-dialog").focus();
            };
          })(this)), 0);
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
      'handle-key': function(arg) {
        var keyCode;
        keyCode = arg.original.keyCode;
        if (keyCode === 27) {
          this.fire('close-popup');
          return false;
        }
      }
    },
    template: "<div id=\"help-dialog\" class=\"help-popup\"\n     style=\"{{# !isVisible }}display: none;{{/}} top: {{(wareaHeight * .1) + 150}}px; left: {{wareaWidth * .1}}px; width: {{wareaWidth * .8}}px; {{style}}\"\n     on-keydown=\"handle-key\" tabindex=\"0\">\n  <div id=\"{{id}}-closer\" class=\"widget-edit-closer\" on-click=\"close-popup\">X</div>\n  <div>{{>helpText}}</div>\n</div>",
    partials: {
      helpAuthoringEditWidget: keyTable([[["enter"], "submit form"], [["escape"], "close form and ignore any changes made"]]),
      helpAuthoringStandard: keyTable([[[platformCtrlHtml, "shift", "l"], "switch to interactive mode"], [[platformCtrlHtml, "shift", "h"], "toggle resizer visibility"], [["escape"], "close context menu if it is open, or deselect any selected widget"], [[platformCtrlHtml], "hold to ignore \"snap to grid\" while moving or resizing the selected widget"], [["&uarr;", "&darr;", "&larr;", "&rarr;"], "move widget, irrespective of the grid"]].concat(!isMac ? [[["delete"], "delete the selected widget"]] : [])),
      helpInteractive: keyTable([[[platformCtrlHtml, "shift", "l"], "switch to authoring mode"], [[platformCtrlHtml, "u"], "find all usages of selected text (when in NetLogo Code editor)"], [[platformCtrlHtml, ";"], "comment/uncomment a line of code (when in NetLogo Code editor)"]]),
      helpText: "<table>\n  {{# stateName === 'interactive' }}\n    {{>helpInteractive}}\n  {{elseif stateName === 'authoring - plain' }}\n    {{>helpAuthoringStandard}}\n  {{elseif stateName === 'authoring - editing widget' }}\n    {{>helpAuthoringEditWidget}}\n  {{else}}\n    Invalid help state.\n  {{/}}\n</table>"
    }
  });

}).call(this);

//# sourceMappingURL=help-dialog.js.map
