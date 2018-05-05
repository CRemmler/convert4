(function() {
  window.RactiveEditFormDropdown = Ractive.extend({
    data: function() {
      return {
        choices: void 0,
        disableds: void 0,
        name: void 0,
        id: void 0,
        label: void 0,
        selected: void 0,
        checkIsDisabled: function(item) {
          var ref;
          return ((ref = this.get('disableds')) != null ? ref : []).indexOf(item) !== -1;
        }
      };
    },
    twoway: false,
    template: "<label for=\"{{id}}\">{{label}}</label>\n<select id=\"{{id}}\" name=\"{{name}}\" class=\"widget-edit-dropdown\">\n  {{#choices}}\n    <option value=\"{{this}}\"\n            {{# this === selected }} selected{{/}}\n            {{# checkIsDisabled(this) }} disabled {{/}}>{{this}}</option>\n  {{/}}\n</select>"
  });

}).call(this);

//# sourceMappingURL=dropdown.js.map
