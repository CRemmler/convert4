(function() {
  window.RactivePrintArea = Ractive.extend({
    data: function() {
      return {
        fontSize: void 0,
        id: void 0,
        output: void 0
      };
    },
    observe: {
      output: function() {
        return this.update('output').then((function(_this) {
          return function() {
            var outputElem;
            outputElem = _this.find("#" + _this.get("id"));
            return outputElem != null ? outputElem.scrollTop = outputElem.scrollHeight : void 0;
          };
        })(this));
      }
    },
    template: "<pre id='{{id}}' class='netlogo-output-area'\n     style=\"font-size: {{fontSize}}px;\">{{output}}</pre>"
  });

}).call(this);

//# sourceMappingURL=print-area.js.map
