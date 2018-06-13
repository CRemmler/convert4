(function() {
  var OutputEditForm;

  OutputEditForm = EditForm.extend({
    data: function() {
      return {
        fontSize: void 0
      };
    },
    twoway: false,
    components: {
      formFontSize: RactiveEditFormFontSize
    },
    genProps: function(form) {
      return {
        fontSize: parseInt(form.fontSize.value)
      };
    },
    partials: {
      title: "Output",
      widgetFields: "<formFontSize id=\"{{id}}-font-size\" name=\"fontSize\" style=\"margin-left: 0;\" value=\"{{fontSize}}\"/>"
    }
  });

  window.RactiveOutputArea = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit, this.standardOptions(this)["delete"]],
        text: void 0
      };
    },
    components: {
      editForm: OutputEditForm,
      printArea: RactivePrintArea
    },
    eventTriggers: function() {
      return {};
    },
    appendText: function(str) {
      this.set('text', this.get('text') + str);
    },
    setText: function(str) {
      this.set('text', str);
    },
    minWidth: 15,
    minHeight: 25,
    template: "{{>editorOverlay}}\n{{>output}}\n<editForm idBasis=\"{{id}}\" fontSize=\"{{widget.fontSize}}\" style=\"width: 285px;\" />",
    partials: {
      output: "<div id=\"{{id}}\" class=\"netlogo-widget netlogo-output netlogo-output-widget {{classes}}\" style=\"{{dims}}\">\n  <printArea id=\"{{id}}-print-area\" fontSize=\"{{widget.fontSize}}\" output=\"{{text}}\" />\n</div>"
    }
  });

}).call(this);

//# sourceMappingURL=output.js.map
