(function() {
  var MonitorEditForm;

  MonitorEditForm = EditForm.extend({
    data: function() {
      return {
        display: void 0,
        fontSize: void 0,
        precision: void 0,
        source: void 0
      };
    },
    components: {
      formCode: RactiveEditFormMultilineCode,
      formFontSize: RactiveEditFormFontSize,
      labeledInput: RactiveEditFormLabeledInput,
      spacer: RactiveEditFormSpacer
    },
    twoway: false,
    genProps: function(form) {
      var fontSize;
      fontSize = parseInt(form.fontSize.value);
      return {
        display: (form.display.value !== "" ? form.display.value : void 0),
        fontSize: fontSize,
        bottom: this.parent.get('widget.top') + (2 * fontSize) + 23,
        precision: parseInt(form.precision.value),
        source: this.findComponent('formCode').findComponent('codeContainer').get('code')
      };
    },
    partials: {
      title: "Monitor",
      widgetFields: "<formCode id=\"{{id}}-source\" name=\"source\" value=\"{{source}}\" label=\"Reporter\" />\n\n<spacer height=\"15px\" />\n\n<div class=\"flex-row\" style=\"align-items: center;\">\n  <labeledInput id=\"{{id}}-display\" labelStr=\"Display name:\" name=\"display\" class=\"widget-edit-inputbox\" type=\"text\" value=\"{{display}}\" />\n</div>\n\n<spacer height=\"15px\" />\n\n<div class=\"flex-row\" style=\"align-items: center; justify-content: space-between;\">\n\n  <label for=\"{{id}}\">Decimal places: </label>\n  <input  id=\"{{id}}\" name=\"precision\" placeholder=\"(Required)\"\n          class=\"widget-edit-inputbox\" style=\"width: 70px;\"\n          type=\"number\" value=\"{{precision}}\" min=-30 max=17 step=1 required />\n  <spacer width=\"50px\" />\n  <formFontSize id=\"{{id}}-font-size\" name=\"fontSize\" value=\"{{fontSize}}\"/>\n\n</div>"
    }
  });

  window.RactiveMonitor = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit, this.standardOptions(this)["delete"]],
        errorClass: void 0,
        resizeDirs: ['left', 'right']
      };
    },
    components: {
      editForm: MonitorEditForm
    },
    eventTriggers: function() {
      return {
        source: [this._weg.recompile]
      };
    },
    minWidth: 20,
    minHeight: 45,
    template: "{{>editorOverlay}}\n{{>monitor}}\n<editForm idBasis=\"{{id}}\" display=\"{{widget.display}}\" fontSize=\"{{widget.fontSize}}\"\n          precision=\"{{widget.precision}}\" source=\"{{widget.source}}\" />",
    partials: {
      monitor: "<div id=\"{{id}}\" class=\"netlogo-widget netlogo-monitor netlogo-output {{classes}}\"\n     style=\"{{dims}} font-size: {{widget.fontSize}}px;\">\n  <label class=\"netlogo-label {{errorClass}}\" on-click=\"show-errors\">{{widget.display || widget.source}}</label>\n  <output class=\"netlogo-value\">{{widget.currentValue}}</output>\n</div>"
    }
  });

}).call(this);

//# sourceMappingURL=monitor.js.map
