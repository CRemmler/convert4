(function() {
  var InputEditForm;

  InputEditForm = EditForm.extend({
    data: function() {
      return {
        boxtype: void 0,
        display: void 0,
        isMultiline: void 0,
        value: void 0
      };
    },
    components: {
      formCheckbox: RactiveEditFormCheckbox,
      formDropdown: RactiveEditFormDropdown,
      formVariable: RactiveEditFormVariable,
      spacer: RactiveEditFormSpacer
    },
    twoway: false,
    genProps: function(form) {
      var boxedValueBasis, boxtype, value, variable;
      boxtype = form.boxtype.value;
      variable = form.variable.value;
      value = (function() {
        if (boxtype === this.get('boxtype')) {
          return this.get('value');
        } else {
          switch (boxtype) {
            case "Color":
              return 0;
            case "Number":
              return 0;
            default:
              return "";
          }
        }
      }).call(this);
      boxedValueBasis = boxtype !== "Color" && boxtype !== "Number" ? {
        multiline: form.multiline.checked
      } : {};
      return {
        boxedValue: Object.assign(boxedValueBasis, {
          type: boxtype,
          value: value
        }),
        currentValue: value,
        display: variable,
        variable: variable.toLowerCase()
      };
    },
    partials: {
      title: "Input",
      widgetFields: "<formVariable id=\"{{id}}-varname\" name=\"variable\" value=\"{{display}}\" />\n<spacer height=\"15px\" />\n<div class=\"flex-row\" style=\"align-items: center;\">\n  <formDropdown id=\"{{id}}-boxtype\" name=\"boxtype\" label=\"Type\" selected=\"{{boxtype}}\"\n                choices=\"['String', 'Number', 'Color', 'String (reporter)', 'String (commands)']\" />\n  <formCheckbox id=\"{{id}}-multiline-checkbox\" isChecked={{isMultiline}} labelText=\"Multiline\"\n                name=\"multiline\" disabled=\"typeof({{isMultiline}}) === 'undefined'\" />\n</div>\n<spacer height=\"10px\" />"
    }
  });

  window.RactiveInput = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit, this.standardOptions(this)["delete"]]
      };
    },
    components: {
      colorInput: RactiveColorInput,
      editForm: InputEditForm,
      editor: RactiveCodeContainerMultiline
    },
    eventTriggers: function() {
      var amProvingSelf, recompileEvent;
      amProvingSelf = this.findComponent('editForm').get('amProvingMyself');
      recompileEvent = amProvingSelf ? this._weg.recompileLite : this._weg.recompile;
      return {
        currentValue: [this._weg.updateEngineValue],
        variable: [recompileEvent, this._weg.rename]
      };
    },
    on: {
      'code-changed': function(_, newValue) {
        if (this.get('widget').boxedValue.type.includes("String ")) {
          this.set('widget.currentValue', newValue);
        }
        return false;
      },
      'handle-keypress': function(arg) {
        var keyCode, ref, target;
        ref = arg.original, keyCode = ref.keyCode, target = ref.target;
        if ((!this.get('widget.boxedValue.multiline')) && keyCode === 13) {
          target.blur();
          return false;
        }
      },
      render: function() {
        return this.observe('widget.currentValue', function(newValue) {
          var elem, ref, scrollToBottom;
          elem = this.find('.netlogo-multiline-input');
          if (elem != null) {
            scrollToBottom = function() {
              return elem.scrollTop = elem.scrollHeight;
            };
            setTimeout(scrollToBottom, 0);
          }
          if ((ref = this.findComponent('editor')) != null) {
            ref.setCode(newValue);
          }
        });
      }
    },
    minWidth: 70,
    minHeight: 43,
    template: "{{>editorOverlay}}\n{{>input}}\n<editForm idBasis=\"{{id}}\" boxtype=\"{{widget.boxedValue.type}}\" display=\"{{widget.display}}\"\n          {{# widget.boxedValue.type !== 'Color' && widget.boxedValue.type !== 'Number' }}\n            isMultiline=\"{{widget.boxedValue.multiline}}\"\n          {{/}} value=\"{{widget.currentValue}}\"\n          />",
    partials: {
      input: "<label id=\"{{id}}\" class=\"netlogo-widget netlogo-input-box netlogo-input {{classes}}\" style=\"{{dims}}\">\n  <div class=\"netlogo-label\">{{widget.variable}}</div>\n  {{# widget.boxedValue.type === 'Number'}}\n    <input class=\"netlogo-multiline-input\" type=\"number\" value=\"{{widget.currentValue}}\" lazy=\"true\" {{# isEditing }}disabled{{/}} />\n  {{/}}\n  {{# widget.boxedValue.type === 'String'}}\n    <textarea class=\"netlogo-multiline-input\" value=\"{{widget.currentValue}}\" on-keypress=\"handle-keypress\" lazy=\"true\" {{# isEditing }}disabled{{/}} ></textarea>\n  {{/}}\n  {{# widget.boxedValue.type === 'String (reporter)' || widget.boxedValue.type === 'String (commands)' }}\n    <editor extraClasses=\"['netlogo-multiline-input']\" id=\"{{id}}-code\" injectedConfig=\"{ scrollbarStyle: 'null' }\" style=\"height: 50%;\" initialCode=\"{{widget.currentValue}}\" isDisabled=\"{{isEditing}}\" />\n  {{/}}\n  {{# widget.boxedValue.type === 'Color'}}\n    <colorInput class=\"netlogo-multiline-input\" style=\"margin: 0; width: 100%;\" value=\"{{widget.currentValue}}\" isEnabled=\"{{!isEditing}}\" />\n  {{/}}\n</label>"
    }
  });

}).call(this);

//# sourceMappingURL=input.js.map
