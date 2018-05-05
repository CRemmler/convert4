(function() {
  window.RactiveEditFormFontSize = RactiveEditFormLabeledInput.extend({
    data: function() {
      return {
        attrs: "min=0 step=1 required",
        labelStr: "Font size:",
        style: "width: 70px;",
        type: "number"
      };
    },
    twoway: false
  });

}).call(this);

//# sourceMappingURL=font-size.js.map
