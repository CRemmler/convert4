(function() {
  var ButtonEditForm;

  ButtonEditForm = EditForm.extend({
    data: function() {
      return {
        actionKey: void 0,
        display: void 0,
        isForever: void 0,
        source: void 0,
        startsDisabled: void 0,
        type: void 0
      };
    },
    computed: {
      displayedType: {
        get: function() {
          return this._typeToDisplay(this.get('type'));
        }
      }
    },
    on: {
      'handle-action-key-press': function(arg) {
        var key, node, ref;
        (ref = arg.event, key = ref.key), node = arg.node;
        if (key !== "Enter") {
          return node.value = "";
        }
      }
    },
    twoway: false,
    components: {
      formCheckbox: RactiveEditFormCheckbox,
      formCode: RactiveEditFormMultilineCode,
      formDropdown: RactiveEditFormDropdown,
      labeledInput: RactiveEditFormLabeledInput,
      spacer: RactiveEditFormSpacer
    },
    genProps: function(form) {
      var key, source;
      key = form.actionKey.value;
      source = this.findComponent('formCode').findComponent('codeContainer').get('code');
      return {
        actionKey: (key.length === 1 ? key.toUpperCase() : null),
        buttonKind: this._displayToType(form.type.value),
        disableUntilTicksStart: form.startsDisabled.checked,
        display: (form.display.value !== "" ? form.display.value : void 0),
        forever: form.forever.checked,
        source: (source !== "" ? source : void 0)
      };
    },
    partials: {
      title: "Button",
      widgetFields: "<div class=\"flex-row\" style=\"align-items: center;\">\n  <formDropdown id=\"{{id}}-type\" choices=\"['observer', 'turtles', 'patches', 'links']\" name=\"type\" label=\"Agent(s):\" selected=\"{{displayedType}}\" />\n  <formCheckbox id=\"{{id}}-forever-checkbox\" isChecked={{isForever}} labelText=\"Forever\" name=\"forever\" />\n</div>\n\n<spacer height=\"15px\" />\n\n<formCheckbox id=\"{{id}}-start-disabled-checkbox\" isChecked={{startsDisabled}} labelText=\"Disable until ticks start\" name=\"startsDisabled\" />\n\n<spacer height=\"15px\" />\n\n<formCode id=\"{{id}}-source\" name=\"source\" value=\"{{source}}\" label=\"Commands\" />\n\n<spacer height=\"15px\" />\n\n<div class=\"flex-row\" style=\"align-items: center;\">\n  <labeledInput id=\"{{id}}-display\" labelStr=\"Display name:\" name=\"display\" class=\"widget-edit-inputbox\" type=\"text\" value=\"{{display}}\" />\n</div>\n\n<spacer height=\"15px\" />\n\n<div class=\"flex-row\" style=\"align-items: center;\">\n  <label for=\"{{id}}-action-key\">Action key:</label>\n  <input  id=\"{{id}}-action-key\" name=\"actionKey\" type=\"text\" value=\"{{actionKey}}\"\n          class=\"widget-edit-inputbox\" style=\"text-transform: uppercase; width: 33px;\"\n          on-keypress=\"handle-action-key-press\" />\n</div>"
    },
    _displayToType: function(display) {
      return {
        observer: "Observer",
        turtles: "Turtle",
        patches: "Patch",
        links: "Link"
      }[display];
    },
    _typeToDisplay: function(type) {
      return {
        Observer: "observer",
        Turtle: "turtles",
        Patch: "patches",
        Link: "links"
      }[type];
    }
  });

  window.RactiveButton = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit, this.standardOptions(this)["delete"]],
        errorClass: void 0,
        ticksStarted: void 0
      };
    },
    computed: {
      isEnabled: {
        get: function() {
          return (this.get('ticksStarted') || (!this.get('widget').disableUntilTicksStart)) && (!this.get('isEditing'));
        }
      }
    },
    oninit: function() {
      this._super();
      return this.on('activate-button', function(_, run) {
        if (this.get('isEnabled')) {
          return run();
        }
      });
    },
    components: {
      editForm: ButtonEditForm
    },
    eventTriggers: function() {
      return {
        buttonKind: [this._weg.recompile],
        source: [this._weg.recompile]
      };
    },
    minWidth: 35,
    minHeight: 30,
    template: "{{>editorOverlay}}\n{{>button}}\n<editForm actionKey=\"{{widget.actionKey}}\" display=\"{{widget.display}}\"\n          idBasis=\"{{id}}\" isForever=\"{{widget.forever}}\" source=\"{{widget.source}}\"\n          startsDisabled=\"{{widget.disableUntilTicksStart}}\" type=\"{{widget.buttonKind}}\" />",
    partials: {
      button: "{{# widget.forever }}\n  {{>foreverButton}}\n{{ else }}\n  {{>standardButton}}\n{{/}}",
      standardButton: "<button id=\"{{id}}\" type=\"button\" style=\"{{dims}}\"\n        class=\"netlogo-widget netlogo-button netlogo-command{{# !isEnabled }} netlogo-disabled{{/}} {{errorClass}} {{classes}}\"\n        on-click=\"@this.fire('activate-button', @this.get('widget.run'))\">\n  {{>buttonContext}}\n  {{>label}}\n  {{>actionKeyIndicator}}\n</button>",
      foreverButton: "<label id=\"{{id}}\" style=\"{{dims}}\"\n       class=\"netlogo-widget netlogo-button netlogo-forever-button{{#widget.running}} netlogo-active{{/}} netlogo-command{{# !isEnabled }} netlogo-disabled{{/}} {{errorClass}} {{classes}}\">\n  {{>buttonContext}}\n  {{>label}}\n  {{>actionKeyIndicator}}\n  <input type=\"checkbox\" checked={{ widget.running }} {{# !isEnabled }}disabled{{/}}/>\n  <div class=\"netlogo-forever-icon\"></div>\n</label>",
      buttonContext: "<div class=\"netlogo-button-agent-context\">\n{{#if widget.buttonKind === \"Turtle\" }}\n  T\n{{elseif widget.buttonKind === \"Patch\" }}\n  P\n{{elseif widget.buttonKind === \"Link\" }}\n  L\n{{/if}}\n</div>",
      label: "<span class=\"netlogo-label\">{{widget.display || widget.source}}</span>",
      actionKeyIndicator: "{{# widget.actionKey }}\n  <span class=\"netlogo-action-key {{# widget.hasFocus }}netlogo-focus{{/}}\">\n    {{widget.actionKey}}\n  </span>\n{{/}}"
    }
  });

}).call(this);

//# sourceMappingURL=button.js.map
