(function() {
  window.RactiveEditFormDropdown = Ractive.extend({
    data: function() {
      return {
        changeEvent: void 0,
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
    on: {
      '*.changed': function(_) {
        var event;
        event = this.get('changeEvent');
        if ((event != null)) {
          this.fire(event);
        }
      }
    },
    twoway: false,
    template: "<div class=\"{{ divClass }}\">\n  <label for=\"{{ id }}\" class=\"widget-edit-input-label\">{{ label }}</label>\n  <select id=\"{{ id }}\" name=\"{{ name }}\" class=\"widget-edit-dropdown\" value=\"{{ selected }}\">\n    {{#choices }}\n      <option value=\"{{ this }}\" {{# checkIsDisabled(this) }} disabled {{/}}>{{ this }}</option>\n    {{/}}\n  </select>\n</div>"
  });

  window.RactiveTwoWayDropdown = window.RactiveEditFormDropdown.extend({
    twoway: true
  });

}).call(this);

//# sourceMappingURL=dropdown.js.map
