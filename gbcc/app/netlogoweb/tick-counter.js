(function() {
  window.RactiveTickCounter = Ractive.extend({
    data: function() {
      return {
        isVisible: void 0,
        label: void 0,
        value: void 0
      };
    },
    twoway: false,
    template: "<span class=\"netlogo-label\">\n  {{ # isVisible }}\n    {{label}}: {{value}}\n  {{else}}\n    &nbsp;\n  {{/}}\n</span>"
  });

}).call(this);

//# sourceMappingURL=tick-counter.js.map
