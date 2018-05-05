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
    template: "<label for=\"{{id}}\">Global variable: </label>\n<input id=\"{{id}}\" class=\"widget-edit-text\" name=\"{{name}}\" placeholder=\"(Required)\"\n       type=\"text\" value=\"{{value}}\"\n       autofocus autocomplete=\"off\"\n       pattern=\"[=*!<>:#+/%'&$^.?\\-_a-zA-Z][=*!<>:#+/%'&$^.?\\-\\w]*\"\n       title=\"A variable name to be used for the switch's value in your model.\n\nMust contain at least one valid character.  Valid characters are alphanumeric characters and all the special characters in (( $^.?=*!<>:#+/%'&-_ )), but cannot start with a number.\"\n       required />"
  });

}).call(this);

//# sourceMappingURL=variable.js.map
