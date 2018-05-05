(function() {
  window.RactiveEditFormLabeledInput = Ractive.extend({
    data: function() {
      return {
        attrs: void 0,
        "class": void 0,
        id: void 0,
        labelStr: void 0,
        labelStyle: void 0,
        name: void 0,
        style: void 0,
        type: void 0,
        value: void 0
      };
    },
    twoway: false,
    template: "<div class=\"flex-row\" style=\"align-items: center;\">\n  <label for=\"{{id}}\" class=\"widget-edit-input-label\" style=\"{{labelStyle}}\">{{labelStr}}</label>\n  <div style=\"flex-grow: 1;\">\n    <input class=\"widget-edit-text widget-edit-input {{class}}\" id=\"{{id}}\" name=\"{{name}}\"\n           type=\"{{type}}\" value=\"{{value}}\" style=\"{{style}}\" {{attrs}} />\n  </div>\n</div>"
  });

}).call(this);

//# sourceMappingURL=labeled-input.js.map
