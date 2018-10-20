(function() {
  window.RactiveEditFormLabeledInput = Ractive.extend({
    data: function() {
      return {
        attrs: void 0,
        "class": void 0,
        divClass: "flex-row",
        id: void 0,
        labelStr: void 0,
        labelStyle: void 0,
        max: void 0,
        min: void 0,
        name: void 0,
        onChange: void 0,
        style: void 0,
        type: void 0,
        value: void 0
      };
    },
    twoway: false,
    on: {
      'exec': function(context) {
        var event;
        event = this.get('onChange');
        if (event) {
          if (this.get('type') === 'number') {
            this.set('value', this.clampNumber(this.get('value'), this.get('min'), this.get('max')));
          }
          this.fire(event, context);
        }
      }
    },
    clampNumber: function(value, min, max) {
      if ((min != null) && value < min) {
        return min;
      } else if ((max != null) && value > max) {
        return max;
      } else {
        return value;
      }
    },
    template: "<div class=\"{{ divClass }}\">\n  <label for=\"{{ id }}\" class=\"widget-edit-input-label\" style=\"{{ labelStyle }}\">{{ labelStr }}</label>\n  <div style=\"flex-grow: 1;\">\n    <input class=\"widget-edit-text widget-edit-input {{ class }}\" id=\"{{ id }}\" name=\"{{ name }}\"\n      min=\"{{ min }}\" max=\"{{ max }}\" on-change=\"exec\"\n      type=\"{{ type }}\" value=\"{{ value }}\" style=\"{{ style }}\" {{ attrs }} />\n  </div>\n</div>"
  });

  window.RactiveTwoWayLabeledInput = RactiveEditFormLabeledInput.extend({
    data: function() {
      return {
        attrs: 'lazy step="any"'
      };
    },
    twoway: true
  });

}).call(this);

//# sourceMappingURL=labeled-input.js.map
