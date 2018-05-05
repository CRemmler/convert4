(function() {
  window.RactiveEditFormCheckbox = Ractive.extend({
    data: function() {
      return {
        disabled: void 0,
        id: void 0,
        isChecked: void 0,
        labelText: void 0,
        name: void 0
      };
    },
    twoway: false,
    template: "<div class=\"widget-edit-checkbox-wrapper\">\n  <input id=\"{{id}}\" class=\"widget-edit-checkbox\"\n         name=\"[[name]]\" type=\"checkbox\" checked=\"{{isChecked}}\"\n         {{# disabled === true }} disabled {{/}} />\n  <label for=\"{{id}}\" class=\"widget-edit-input-label\">{{labelText}}</label>\n</div>"
  });

}).call(this);

//# sourceMappingURL=checkbox.js.map
