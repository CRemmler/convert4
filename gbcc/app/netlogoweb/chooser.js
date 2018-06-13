(function() {
  var ChooserEditForm;

  ChooserEditForm = EditForm.extend({
    data: function() {
      return {
        choices: void 0,
        display: void 0,
        setHiddenInput: (function(code) {
          var elem, ex, validityStr;
          elem = this.find("#" + (this.get('id')) + "-choices-hidden");
          elem.value = code;
          validityStr = (function() {
            var error;
            try {
              Converter.stringToJSValue("[" + code + "]");
              return "";
            } catch (error) {
              ex = error;
              return "Invalid format: Must be a space-separated list of NetLogo literal values";
            }
          })();
          return elem.setCustomValidity(validityStr);
        })
      };
    },
    twoway: false,
    components: {
      formCode: RactiveEditFormMultilineCode,
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
      widgetFields: "<formVariable id=\"{{id}}-varname\" value=\"{{display}}\"        name=\"varName\" />\n<formCode     id=\"{{id}}-choices\" value=\"{{chooserChoices}}\" name=\"codeChoices\"\n              label=\"Choices\" config=\"{}\" style=\"\" onchange=\"{{setHiddenInput}}\" />\n<input id=\"{{id}}-choices-hidden\" name=\"trueCodeChoices\" class=\"all-but-hidden\"\n       style=\"margin: -5px 0 0 7px;\" type=\"text\" />\n<div class=\"widget-edit-hint-text\">Example: \"a\" \"b\" \"c\" 1 2 3</div>"
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
      var recompileEvent;
      recompileEvent = this.findComponent('editForm').get('amProvingMyself') ? this._weg.recompileLite : this._weg.recompile;
      return {
        choices: [this._weg.refreshChooser],
        variable: [recompileEvent, this._weg.rename]
      };
    },
    minWidth: 55,
    minHeight: 45,
    template: "{{>editorOverlay}}\n<label id=\"{{id}}\" class=\"netlogo-widget netlogo-chooser netlogo-input {{classes}}\" style=\"{{dims}}\">\n  <span class=\"netlogo-label\">{{widget.display}}</span>\n  <select class=\"netlogo-chooser-select\" value=\"{{widget.currentValue}}\"{{# isEditing }} disabled{{/}} >\n  {{#widget.choices}}\n    <option class=\"netlogo-chooser-option\" value=\"{{.}}\">{{>literal}}</option>\n  {{/}}\n  </select>\n</label>\n<editForm idBasis=\"{{id}}\" choices=\"{{widget.choices}}\" display=\"{{widget.display}}\" />",
    partials: {
      literal: "{{# typeof . === \"string\"}}{{.}}{{/}}\n{{# typeof . === \"number\"}}{{.}}{{/}}\n{{# typeof . === \"boolean\"}}{{.}}{{/}}\n{{# typeof . === \"object\"}}\n  [{{#.}}\n    {{>literal}}\n  {{/}}]\n{{/}}"
    }
  });

}).call(this);

//# sourceMappingURL=chooser.js.map
