(function() {
  var LabelEditForm;

  LabelEditForm = EditForm.extend({
    data: function() {
      return {
        color: void 0,
        fontSize: void 0,
        text: void 0,
        transparent: void 0
      };
    },
    twoway: false,
    components: {
      formCheckbox: RactiveEditFormCheckbox,
      formFontSize: RactiveEditFormFontSize,
      labeledInput: RactiveEditFormLabeledInput,
      spacer: RactiveEditFormSpacer
    },
    genProps: function(form) {
      var color;
      color = window.hexStringToNetlogoColor(form.color.value);
      return {
        color: color,
        display: form.text.value,
        fontSize: parseInt(form.fontSize.value),
        transparent: form.transparent.checked
      };
    },
    partials: {
      title: "Note",
      widgetFields: "<label for=\"{{id}}-text\">Text</label><br>\n<textarea id=\"{{id}}-text\" class=\"widget-edit-textbox\"\n          name=\"text\" placeholder=\"Enter note text here...\"\n          value=\"{{text}}\" autofocus></textarea>\n\n<spacer height=\"20px\" />\n\n<div class=\"flex-row\" style=\"align-items: center;\">\n  <div style=\"width: 48%;\">\n    <formFontSize id=\"{{id}}-font-size\" name=\"fontSize\" value=\"{{fontSize}}\"/>\n  </div>\n  <spacer width=\"4%\" />\n  <div style=\"width: 48%;\">\n    <labeledInput id=\"{{id}}-text-color\" labelStr=\"Text color:\" name=\"color\" class=\"widget-edit-color-pick\" type=\"color\" value=\"{{color}}\" />\n  </div>\n</div>\n\n<spacer height=\"15px\" />\n\n<formCheckbox id=\"{{id}}-transparent-checkbox\" isChecked={{transparent}} labelText=\"Transparent background\" name=\"transparent\" />"
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
    computed: {
      hexColor: function() {
        return window.netlogoColorToHexString(this.get('widget').color);
      }
    },
    template: "{{>label}}\n{{>form}}\n{{>editorOverlay}}",
    partials: {
      label: "<pre id=\"{{id}}\" class=\"netlogo-widget netlogo-text-box{{#isEditing}} interface-unlocked{{/}}\"\n     style=\"{{dims}} font-size: {{widget.fontSize}}px; color: {{ convertColor(widget.color) }}; {{# widget.transparent}}background: transparent;{{/}}\"\n     >{{ widget.display }}</pre>",
      form: "<editForm idBasis=\"{{id}}\" color=\"{{hexColor}}\"\n          fontSize=\"{{widget.fontSize}}\" text=\"{{widget.display}}\"\n          transparent=\"{{widget.transparent}}\" />"
    }
  });

}).call(this);

//# sourceMappingURL=label.js.map
