(function() {
  window.RactiveColorInput = Ractive.extend({
    data: function() {
      return {
        "class": void 0,
        id: void 0,
        isEnabled: true,
        name: void 0,
        style: void 0,
        value: void 0
      };
    },
    on: {
      'handle-color-change': function(arg) {
        var color, ex, hexValue;
        hexValue = arg.node.value;
        color = (function() {
          var error;
          try {
            return hexStringToNetlogoColor(hexValue);
          } catch (error) {
            ex = error;
            return 0;
          }
        })();
        this.set('value', color);
        return false;
      },
      render: function() {
        var observeValue;
        observeValue = function(newValue, oldValue) {
          var ex, hexValue;
          if (newValue !== oldValue) {
            hexValue = (function() {
              var error;
              try {
                return netlogoColorToHexString(this.get('value'));
              } catch (error) {
                ex = error;
                return "#000000";
              }
            }).call(this);
            return this.find('input').value = hexValue;
          }
        };
        this.observe('value', observeValue);
      }
    },
    template: "<input id=\"{{id}}\" class=\"{{class}}\" name=\"{{name}}\" style=\"{{style}}\" type=\"color\"\n       on-change=\"handle-color-change\"\n       {{# !isEnabled }}disabled{{/}} />"
  });

}).call(this);

//# sourceMappingURL=color-input.js.map
