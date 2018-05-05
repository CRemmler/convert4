(function() {
  window.RactiveEditFormSpacer = Ractive.extend({
    data: function() {
      return {
        height: void 0,
        width: void 0
      };
    },
    template: "<div style=\"{{>height}} {{>width}}\"></div>",
    partials: {
      height: "{{ #height }}height: {{height}};{{/}}",
      width: "{{ #width  }}width:  {{width }};{{/}}"
    }
  });

}).call(this);

//# sourceMappingURL=spacer.js.map
