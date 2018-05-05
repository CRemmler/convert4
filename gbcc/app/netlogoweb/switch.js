(function() {
  var SwitchEditForm;

  SwitchEditForm = EditForm.extend({
    data: function() {
      return {
        display: void 0
      };
    },
    twoway: false,
    components: {
      formVariable: RactiveEditFormVariable
    },
    genProps: function(form) {
      var variable;
      variable = form.variable.value;
      return {
        display: variable,
        variable: variable.toLowerCase()
      };
    },
    partials: {
      title: "Switch",
      widgetFields: "<formVariable id=\"{{id}}-varname\" name=\"variable\" value=\"{{display}}\"/>"
    }
  });

  window.RactiveSwitch = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit, this.standardOptions(this)["delete"]],
        resizeDirs: ['left', 'right']
      };
    },
    oninit: function() {
      this._super();
      return Object.defineProperty(this.get('widget'), "on", {
        get: function() {
          return this.currentValue;
        },
        set: function(x) {
          return this.currentValue = x;
        }
      });
    },
    components: {
      editForm: SwitchEditForm
    },
    eventTriggers: function() {
      return {
        variable: [this._weg.recompile, this._weg.rename]
      };
    },
    template: "{{>switch}}\n<editForm idBasis=\"{{id}}\" display=\"{{widget.display}}\" />\n{{>editorOverlay}}",
    partials: {
      "switch": "<label id=\"{{id}}\" class=\"netlogo-widget netlogo-switcher netlogo-input{{#isEditing}} interface-unlocked{{/}}\" style=\"{{dims}}\">\n  <input type=\"checkbox\" checked=\"{{ widget.currentValue }}\" {{# isEditing }} disabled{{/}} />\n  <span class=\"netlogo-label\">{{ widget.display }}</span>\n</label>"
    }
  });

}).call(this);

//# sourceMappingURL=switch.js.map
