(function() {
  var ChooserEditForm;

  ChooserEditForm = EditForm.extend({
    data: function() {
      return {
        choices: void 0,
        display: void 0
      };
    },
    twoway: false,
    components: {
      formCode: RactiveEditFormCodeContainer,
      formVariable: RactiveEditFormVariable
    },
    computed: {
      chooserChoices: {
        get: function() {
          return this.get('choices').map(function(x) {
            return workspace.dump(x, true);
          }).join('\n');
        }
      }
    },
    genProps: function(form) {
      var choices, choicesArr, varName;
      varName = form.varName.value;
      choices = this.findComponent('formCode').findComponent('codeContainer').get('code');
      choicesArr = Converter.stringToJSValue("[" + choices + "]");
      return {
        choices: choicesArr,
        display: varName,
        variable: varName.toLowerCase()
      };
    },
    partials: {
      title: "Chooser",
      widgetFields: "<formVariable id=\"{{id}}-varname\" value=\"{{display}}\"        name=\"varName\" />\n<formCode     id=\"{{id}}-choices\" value=\"{{chooserChoices}}\" name=\"codeChoices\"\n              label=\"Choices\" config=\"{}\" style=\"\" />"
    }
  });

  window.RactiveChooser = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit, this.standardOptions(this)["delete"]],
        resizeDirs: ['left', 'right']
      };
    },
    components: {
      editForm: ChooserEditForm
    },
    eventTriggers: function() {
      return {
        choices: [this._weg.refreshChooser],
        variable: [this._weg.recompile, this._weg.rename]
      };
    },
    template: "<label id=\"{{id}}\" class=\"netlogo-widget netlogo-chooser netlogo-input{{#isEditing}} interface-unlocked{{/}}\" style=\"{{dims}}\">\n  <span class=\"netlogo-label\">{{widget.display}}</span>\n  <select class=\"netlogo-chooser-select\" value=\"{{widget.currentValue}}\"{{# isEditing }} disabled{{/}} >\n  {{#widget.choices}}\n    <option class=\"netlogo-chooser-option\" value=\"{{.}}\">{{>literal}}</option>\n  {{/}}\n  </select>\n</label>\n<editForm idBasis=\"{{id}}\" choices=\"{{widget.choices}}\" display=\"{{widget.display}}\" />\n{{>editorOverlay}}",
    partials: {
      literal: "{{# typeof . === \"string\"}}{{.}}{{/}}\n{{# typeof . === \"number\"}}{{.}}{{/}}\n{{# typeof . === \"boolean\"}}{{.}}{{/}}\n{{# typeof . === \"object\"}}\n  [{{#.}}\n    {{>literal}}\n  {{/}}]\n{{/}}"
    }
  });

}).call(this);

//# sourceMappingURL=chooser.js.map
