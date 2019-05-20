(function() {
  // This exists to address some trickiness.  Here are the relevant constraints:

  //   1. HTML color pickers have higher color space resolution than the NetLogo color system
  //   2. The color picker must be automatically updated when a color value updates in the engine
  //   3. The engine must be automatically updated when a new color is chosen

  // The logical solution for (2) and (3) is to do the normal two-way binding that we do for the all other
  // NetLogo variables.  However, if we do that, the new color will be continually clobbered by the one from
  // the engine, since the picker won't get updated until the color picker is closed (and you'll never close it,
  // except out of frustration from the fact that your color choice is getting clobbered).  So, okay, we use
  // `on-input` instead of `on-change` to update the color before closing the picker.  But then (1) comes into
  // play.

  // So you have this enormous space for visually choosing colors--tens of thousands of points.  However,
  // only maybe 20 of those points are valid NetLogo colors.  So, with the variables bound together, you
  // pick a color in the picker, and then the picker jumps to the nearest NetLogo-expressible color (which can
  // be a pretty far jump).  NetLogo just keeps doing this, ad infinitum.  The user experience feels awful.
  // So the solution that I've chosen here is to establish kind of a buffer zone, so that we only update the
  // picker when a new value comes in from the engine.

  // --JAB (4/111/18)
  window.RactiveColorInput = Ractive.extend({
    data: function() {
      return {
        class: void 0, // String
        id: void 0, // String
        isEnabled: true, // Boolean
        name: void 0, // String
        style: void 0, // String
        value: void 0 // String
      };
    },
    on: {
      'handle-color-change': function({
          node: {
            value: hexValue
          }
        }) {
        var color, ex;
        color = (function() {
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
          var ex, hexValue, input;
          if (newValue !== oldValue) {
            hexValue = (function() {
              try {
                return netlogoColorToHexString(this.get('value'));
              } catch (error) {
                ex = error;
                return "#000000";
              }
            }).call(this);
            input = this.find('input');
            input.value = hexValue;
            // See Safari workaround comment below.  -JMB January 2019
            if ((input.jsc != null)) {
              input.style.backgroundColor = input.value;
            }
          }
        };
        this.observe('value', observeValue);
      },
      // This is a workaround for Safari's lack of support for `color` input types: https://caniuse.com/#feat=input-color
      // It relies on the `jscolor-picker` package to provide the functionality instead of the browser.
      // Once Safari and iOS Safari support `color` types properly, we can remove this code and the dependency.
      //   -JMB January 2019
      complete: function() {
        var input;
        input = this.find('input');
        if (input.type === "text") {
          input.style.color = "#00000000";
          input.style.backgroundColor = input.value;
          return input.jsc = new jscolor(input, {
            hash: true,
            styleElement: null
          });
        }
      }
    },
    template: "<input id=\"{{id}}\" class=\"{{class}}\" name=\"{{name}}\" style=\"{{style}}\" type=\"color\"\n       on-change=\"handle-color-change\"\n       {{# !isEnabled }}disabled{{/}} />"
  });

}).call(this);

//# sourceMappingURL=color-input.js.map
