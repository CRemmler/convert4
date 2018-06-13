(function() {
  window.RactiveEditFormVariable = Ractive.extend({
    data: function() {
      return {
        id: void 0,
        name: void 0,
        value: void 0
      };
    },
    twoway: false,
    on: {
      validate: function(arg) {
        var node, validityStr, varName;
        node = arg.node;
        varName = node.value.toLowerCase();
        validityStr = window.keywords.all.some(function(kw) {
          return kw.toLowerCase() === varName;
        }) ? "'" + node.value + "' is a reserved name" : "";
        node.setCustomValidity(validityStr);
        return false;
      }
    },
    template: "<label for=\"{{id}}\">Global variable: </label>\n<input id=\"{{id}}\" class=\"widget-edit-text\" name=\"{{name}}\" placeholder=\"(Required)\"\n       type=\"text\" value=\"{{value}}\"\n       autofocus autocomplete=\"off\" on-input=\"validate\"\n       pattern=\"[=*!<>:#+/%'&$^.?\\-_a-zA-Z][=*!<>:#+/%'&$^.?\\-\\w]*\"\n       title=\"One or more alphanumeric characters and characters in (( $^.?=*!<>:#+/%'&-_ )).  Cannot start with a number\"\n       required />"
  });

}).call(this);

//# sourceMappingURL=variable.js.map
