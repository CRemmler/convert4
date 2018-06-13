(function() {
  var LabelEditForm;

  LabelEditForm = EditForm.extend({
    data: function() {
      return {
        color: void 0,
        fontSize: void 0,
        text: void 0,
        transparent: void 0,
        _color: void 0
      };
    },
    twoway: false,
    components: {
      colorInput: RactiveColorInput,
      formCheckbox: RactiveEditFormCheckbox,
      formFontSize: RactiveEditFormFontSize,
      labeledInput: RactiveEditFormLabeledInput,
      spacer: RactiveEditFormSpacer
    },
    genProps: function(form) {
      return {
        color: this.findComponent('colorInput').get('value'),
        display: form.text.value,
        fontSize: parseInt(form.fontSize.value),
        transparent: form.transparent.checked
      };
    },
    on: {
      init: function() {
        this.set('_color', this.get('color'));
      }
    },
    partials: {
      title: "Note",
      widgetFields: "<label for=\"{{id}}-text\">Text</label><br>\n<textarea id=\"{{id}}-text\" class=\"widget-edit-textbox\"\n          name=\"text\" placeholder=\"Enter note text here...\"\n          value=\"{{text}}\" autofocus></textarea>\n\n<spacer height=\"20px\" />\n\n<div class=\"flex-row\" style=\"align-items: center;\">\n  <div style=\"width: 48%;\">\n    <formFontSize id=\"{{id}}-font-size\" name=\"fontSize\" value=\"{{fontSize}}\"/>\n  </div>\n  <spacer width=\"4%\" />\n  <div style=\"width: 48%;\">\n    <div class=\"flex-row\" style=\"align-items: center;\">\n      <label for=\"{{id}}-text-color\" class=\"widget-edit-input-label\">Text color:</label>\n      <div style=\"flex-grow: 1;\">\n        <colorInput id=\"{{id}}-text-color\" name=\"color\" class=\"widget-edit-text widget-edit-input widget-edit-color-pick\" value=\"{{_color}}\" />\n      </div>\n    </div>\n  </div>\n</div>\n\n<spacer height=\"15px\" />\n\n<formCheckbox id=\"{{id}}-transparent-checkbox\" isChecked={{transparent}} labelText=\"Transparent background\" name=\"transparent\" />"
    }
  });

  window.RactiveLabel = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit, this.standardOptions(this)["delete"]],
        convertColor: netlogoColorToCSS
      };
    },
    components: {
      editForm: LabelEditForm
    },
    eventTriggers: function() {
      return {};
    },
    minWidth: 13,
    minHeight: 13,
    template: "{{>editorOverlay}}\n{{>label}}\n{{>form}}",
    partials: {
      label: "<pre id=\"{{id}}\" class=\"netlogo-widget netlogo-text-box {{classes}}\"\n     style=\"{{dims}} font-size: {{widget.fontSize}}px; color: {{ convertColor(widget.color) }}; {{# widget.transparent}}background: transparent;{{/}}\"\n     >{{ widget.display }}</pre>",
      form: "<editForm idBasis=\"{{id}}\" color=\"{{widget.color}}\"\n          fontSize=\"{{widget.fontSize}}\" text=\"{{widget.display}}\"\n          transparent=\"{{widget.transparent}}\" />"
    }
  });

}).call(this);

//# sourceMappingURL=label.js.map
