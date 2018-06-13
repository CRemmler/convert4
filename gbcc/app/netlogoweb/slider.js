(function() {
  var FlexColumn, SliderEditForm;

  FlexColumn = Ractive.extend({
    template: "<div class=\"flex-column\" style=\"align-items: center; flex-grow: 1; max-width: 140px;\">\n  {{ yield }}\n</div>"
  });

  SliderEditForm = EditForm.extend({
    data: function() {
      return {
        bottom: void 0,
        direction: void 0,
        left: void 0,
        maxCode: void 0,
        minCode: void 0,
        right: void 0,
        stepCode: void 0,
        top: void 0,
        units: void 0,
        value: void 0,
        variable: void 0
      };
    },
    twoway: false,
    components: {
      column: FlexColumn,
      formCheckbox: RactiveEditFormCheckbox,
      formMaxCode: RactiveEditFormOneLineCode,
      formMinCode: RactiveEditFormOneLineCode,
      formStepCode: RactiveEditFormOneLineCode,
      formVariable: RactiveEditFormVariable,
      labeledInput: RactiveEditFormLabeledInput,
      spacer: RactiveEditFormSpacer
    },
    genProps: function(form) {
      var bottom, oldBottom, oldLeft, oldRight, oldTop, ref, right, value;
      value = form.value.valueAsNumber;
      oldTop = this.get('top');
      oldRight = this.get('right');
      oldBottom = this.get('bottom');
      oldLeft = this.get('left');
      ref = (this.get('direction') === 'horizontal' && form.vertical.checked) || (this.get('direction') === 'vertical' && !form.vertical.checked) ? [oldLeft + (oldBottom - oldTop), oldTop + (oldRight - oldLeft)] : [oldRight, oldBottom], right = ref[0], bottom = ref[1];
      return {
        bottom: bottom,
        currentValue: value,
        "default": value,
        direction: (form.vertical.checked ? "vertical" : "horizontal"),
        display: form.variable.value,
        max: this.findComponent('formMaxCode').findComponent('codeContainer').get('code'),
        min: this.findComponent('formMinCode').findComponent('codeContainer').get('code'),
        right: right,
        step: this.findComponent('formStepCode').findComponent('codeContainer').get('code'),
        units: (form.units.value !== "" ? form.units.value : void 0),
        variable: form.variable.value.toLowerCase()
      };
    },
    partials: {
      title: "Slider",
      widgetFields: "<formVariable id=\"{{id}}-varname\" name=\"variable\" value=\"{{variable}}\"/>\n\n<spacer height=\"15px\" />\n\n<div class=\"flex-row\" style=\"align-items: stretch; justify-content: space-around\">\n  <column>\n    <formMinCode id=\"{{id}}-min-code\" label=\"Minimum\" name=\"minCode\" config=\"{ scrollbarStyle: 'null' }\"\n                 style=\"width: 100%;\" value=\"{{minCode}}\" />\n  </column>\n  <column>\n    <formStepCode id=\"{{id}}-step-code\" label=\"Increment\" name=\"stepCode\" config=\"{ scrollbarStyle: 'null' }\"\n                  style=\"width: 100%;\" value=\"{{stepCode}}\" />\n  </column>\n  <column>\n    <formMaxCode id=\"{{id}}-max-code\" label=\"Maximum\" name=\"maxCode\" config=\"{ scrollbarStyle: 'null' }\"\n                 style=\"width: 100%;\" value=\"{{maxCode}}\" />\n  </column>\n</div>\n\n<div class=\"widget-edit-hint-text\" style=\"margin-left: 4px; margin-right: 4px;\">min, increment, and max may be numbers or reporters</div>\n\n<div class=\"flex-row\" style=\"align-items: center;\">\n  <labeledInput id=\"{{id}}-value\" labelStr=\"Default value:\" name=\"value\" type=\"number\" value=\"{{value}}\" attrs=\"required step='any'\"\n                style=\"flex-grow: 1; text-align: right;\" />\n  <labeledInput id=\"{{id}}-units\" labelStr=\"Units:\" labelStyle=\"margin-left: 10px;\" name=\"units\" type=\"text\" value=\"{{units}}\"\n                style=\"flex-grow: 1; padding: 4px;\" />\n</div>\n\n<spacer height=\"15px\" />\n\n<formCheckbox id=\"{{id}}-vertical\" isChecked=\"{{ direction === 'vertical' }}\" labelText=\"Vertical?\"\n              name=\"vertical\" />"
    }
  });

  window.RactiveSlider = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit, this.standardOptions(this)["delete"]],
        errorClass: void 0
      };
    },
    on: {
      'reset-if-invalid': function(context) {
        if (context.node.validity.rangeOverflow) {
          return this.set('widget.currentValue', this.get('widget.maxValue'));
        } else if (context.node.validity.rangeUnderflow) {
          return this.set('widget.currentValue', this.get('widget.minValue'));
        }
      }
    },
    computed: {
      resizeDirs: {
        get: function() {
          if (this.get('widget.direction') !== 'vertical') {
            return ['left', 'right'];
          } else {
            return ['top', 'bottom'];
          }
        },
        set: (function() {})
      }
    },
    components: {
      editForm: SliderEditForm
    },
    eventTriggers: function() {
      return {
        currentValue: [this._weg.updateEngineValue],
        max: [this._weg.recompile],
        min: [this._weg.recompile],
        step: [this._weg.recompile],
        variable: [this._weg.recompile, this._weg.rename]
      };
    },
    minWidth: 60,
    minHeight: 33,
    template: "{{>editorOverlay}}\n{{>slider}}\n<editForm direction=\"{{widget.direction}}\" idBasis=\"{{id}}\" maxCode=\"{{widget.max}}\"\n          minCode=\"{{widget.min}}\" stepCode=\"{{widget.step}}\" units=\"{{widget.units}}\"\n          top=\"{{widget.top}}\" right=\"{{widget.right}}\" bottom=\"{{widget.bottom}}\"\n          left=\"{{widget.left}}\" value=\"{{widget.default}}\" variable=\"{{widget.variable}}\" />",
    partials: {
      slider: "<label id=\"{{id}}\" class=\"netlogo-widget netlogo-slider netlogo-input {{errorClass}} {{classes}}\"\n       style=\"{{ #widget.direction !== 'vertical' }}{{dims}}{{else}}{{>verticalDims}}{{/}}\">\n  <input type=\"range\"\n         max=\"{{widget.maxValue}}\" min=\"{{widget.minValue}}\"\n         step=\"{{widget.stepValue}}\" value=\"{{widget.currentValue}}\"\n         {{# isEditing }}disabled{{/}} />\n  <div class=\"netlogo-slider-label\">\n    <span class=\"netlogo-label\" on-click=\"show-errors\">{{widget.display}}</span>\n    <span class=\"netlogo-slider-value\">\n      <input type=\"number\" on-change=\"reset-if-invalid\"\n             style=\"width: {{widget.currentValue.toString().length + 3.0}}ch\"\n             min=\"{{widget.minValue}}\" max=\"{{widget.maxValue}}\"\n             value=\"{{widget.currentValue}}\" step=\"{{widget.stepValue}}\"\n             {{# isEditing }}disabled{{/}} />\n      {{#widget.units}}{{widget.units}}{{/}}\n    </span>\n  </div>\n</label>",
      verticalDims: "position: absolute;\nleft: {{ left }}px; top: {{ top }}px;\nwidth: {{ bottom - top }}px; height: {{ right - left }}px;\ntransform: translateY({{ bottom - top }}px) rotate(270deg);\ntransform-origin: top left;"
    }
  });

}).call(this);

//# sourceMappingURL=slider.js.map
