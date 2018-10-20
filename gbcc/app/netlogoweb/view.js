(function() {
  var RactiveEditFormCoordBoundInput, ViewEditForm;

  RactiveEditFormCoordBoundInput = Ractive.extend({
    data: function() {
      return {
        id: void 0,
        hint: void 0,
        label: void 0,
        max: void 0,
        min: void 0,
        name: void 0,
        value: void 0
      };
    },
    isolated: true,
    twoway: false,
    components: {
      labeledInput: RactiveEditFormLabeledInput
    },
    template: "<div>\n  <labeledInput id=\"{{id}}\" labelStr=\"{{label}}\"\n                labelStyle=\"min-width: 100px; white-space: nowrap;\"\n                name=\"{{name}}\" style=\"text-align: right;\" type=\"number\"\n                attrs=\"min='{{min}}' max='{{max}}' step=1 required\"\n                value=\"{{value}}\" />\n  <div class=\"widget-edit-hint-text\">{{hint}}</div>\n</div>"
  });

  ViewEditForm = EditForm.extend({
    data: function() {
      return {
        framerate: void 0,
        isShowingTicks: void 0,
        maxX: void 0,
        maxY: void 0,
        minX: void 0,
        minY: void 0,
        patchSize: void 0,
        tickLabel: void 0,
        turtleLabelSize: void 0,
        wrapsInX: void 0,
        wrapsInY: void 0
      };
    },
    computed: {
      topology: {
        get: function() {
          if (this.get('wrapsInX')) {
            if (this.get('wrapsInY')) {
              return "Torus";
            } else {
              return "Horizontal Cylinder";
            }
          } else if (this.get('wrapsInY')) {
            return "Vertical Cylinder";
          } else {
            return "Box";
          }
        }
      }
    },
    twoway: false,
    components: {
      coordInput: RactiveEditFormCoordBoundInput,
      formCheckbox: RactiveEditFormCheckbox,
      formFontSize: RactiveEditFormFontSize,
      labeledInput: RactiveEditFormLabeledInput,
      spacer: RactiveEditFormSpacer
    },
    genProps: function(form) {
      return {
        'dimensions.maxPxcor': Number.parseInt(form.maxX.value),
        'dimensions.maxPycor': Number.parseInt(form.maxY.value),
        'dimensions.minPxcor': Number.parseInt(form.minX.value),
        'dimensions.minPycor': Number.parseInt(form.minY.value),
        'dimensions.patchSize': Number.parseInt(form.patchSize.value),
        'dimensions.wrappingAllowedInX': form.wrapsInX.checked,
        'dimensions.wrappingAllowedInY': form.wrapsInY.checked,
        fontSize: Number.parseInt(form.turtleLabelSize.value),
        frameRate: Number.parseInt(form.framerate.value),
        showTickCounter: form.isShowingTicks.checked,
        tickCounterLabel: form.tickLabel.value
      };
    },
    partials: {
      title: "Model Settings",
      widgetFields: "{{>worldSet}}\n<spacer height=\"10px\" />\n{{>viewSet}}\n<spacer height=\"10px\" />\n{{>tickCounterSet}}",
      worldSet: "<fieldset class=\"widget-edit-fieldset\">\n  <legend class=\"widget-edit-legend\">World</legend>\n  <div class=\"flex-row\">\n    {{>coordColumn}}\n    <spacer width=\"8%\" />\n    {{>wrappingColumn}}\n  </div>\n</fieldset>",
      coordColumn: "<div class=\"flex-column\">\n\n  <coordInput id=\"{{id}}-min-x\" label=\"min-pxcor:\" name=\"minX\" value=\"{{minX}}\"\n              min=\"-50000\" max=\"0\" hint=\"minimum x coordinate for patches\" />\n\n  <coordInput id=\"{{id}}-max-x\" label=\"max-pxcor:\" name=\"maxX\" value=\"{{maxX}}\"\n              min=\"0\" max=\"50000\" hint=\"maximum x coordinate for patches\" />\n\n  <coordInput id=\"{{id}}-min-y\" label=\"min-pycor:\" name=\"minY\" value=\"{{minY}}\"\n              min=\"-50000\" max=\"0\" hint=\"minimum y coordinate for patches\" />\n\n  <coordInput id=\"{{id}}-max-y\" label=\"max-pycor:\" name=\"maxY\" value=\"{{maxY}}\"\n              min=\"0\" max=\"50000\" hint=\"maximum y coordinate for patches\" />\n\n</div>",
      wrappingColumn: "<div class=\"flex-column\">\n  <formCheckbox id=\"{{id}}-wraps-in-x\" isChecked=\"{{ wrapsInX }}\"\n                labelText=\"Wraps horizontally\" name=\"wrapsInX\" />\n  <spacer height=\"10px\" />\n  <formCheckbox id=\"{{id}}-wraps-in-y\" isChecked=\"{{ wrapsInY }}\"\n                labelText=\"Wraps vertically\" name=\"wrapsInY\" />\n</div>",
      viewSet: "<fieldset class=\"widget-edit-fieldset\">\n  <legend class=\"widget-edit-legend\">View</legend>\n  <div class=\"flex-row\">\n    <div class=\"flex-column\" style=\"flex-grow: 1;\">\n      <labeledInput id=\"{{id}}-patch-size\" labelStr=\"Patch size:\"\n                    name=\"patchSize\" type=\"number\" value=\"{{patchSize}}\"\n                    attrs=\"min=-1 step='any' required\" />\n      <div class=\"widget-edit-hint-text\">measured in pixels</div>\n    </div>\n    <spacer width=\"20px\" />\n    <div class=\"flex-column\" style=\"flex-grow: 1;\">\n      <formFontSize id=\"{{id}}-turtle-label-size\" name=\"turtleLabelSize\" value=\"{{turtleLabelSize}}\"/>\n      <div class=\"widget-edit-hint-text\">of labels on agents</div>\n    </div>\n  </div>\n\n  <spacer height=\"10px\" />\n\n  <labeledInput id=\"{{id}}-framerate\" labelStr=\"Frame rate:\" name=\"framerate\"\n                style=\"text-align: right;\" type=\"number\" value=\"{{framerate}}\"\n                attrs=\"min=0 step='any' required\" />\n  <div class=\"widget-edit-hint-text\">Frames per second at normal speed</div>\n\n</fieldset>",
      tickCounterSet: "<fieldset class=\"widget-edit-fieldset\">\n  <legend class=\"widget-edit-legend\">Tick Counter</legend>\n  <formCheckbox id=\"{{id}}-is-showing-ticks\" isChecked=\"{{ isShowingTicks }}\"\n                labelText=\"Show tick counter\" name=\"isShowingTicks\" />\n  <spacer height=\"10px\" />\n  <labeledInput id=\"{{id}}-tick-label\" labelStr=\"Tick counter label:\" name=\"tickLabel\"\n                style=\"width: 230px;\" type=\"text\" value=\"{{tickLabel}}\" />\n</fieldset>"
    }
  });

  window.RactiveView = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this).edit],
        resizeDirs: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
        ticks: void 0
      };
    },
    components: {
      editForm: ViewEditForm
    },
    eventTriggers: function() {
      return {
        fontSize: [this._weg.redrawView],
        'dimensions.maxPxcor': [this._weg.resizeView, this._weg.redrawView],
        'dimensions.maxPycor': [this._weg.resizeView, this._weg.redrawView],
        'dimensions.minPxcor': [this._weg.resizeView, this._weg.redrawView],
        'dimensions.minPycor': [this._weg.resizeView, this._weg.redrawView],
        'dimensions.patchSize': [this._weg.resizePatches, this._weg.redrawView],
        'dimensions.wrappingAllowedInX': [this._weg.updateTopology, this._weg.redrawView],
        'dimensions.wrappingAllowedInY': [this._weg.updateTopology, this._weg.redrawView]
      };
    },
    handleResize: function(arg) {
      var bottom, dHeight, dWidth, dx, dy, left, movedLeft, movedUp, newBottom, newHeight, newLeft, newRight, newTop, newWidth, oldBottom, oldHeight, oldLeft, oldRight, oldTop, oldWidth, patchSize, ratio, ref, ref1, right, scaledHeight, scaledWidth, top;
      newLeft = arg.left, newRight = arg.right, newTop = arg.top, newBottom = arg.bottom;
      if (newLeft >= 0 && newTop >= 0) {
        oldLeft = this.get('left');
        oldRight = this.get('right');
        oldTop = this.get('top');
        oldBottom = this.get('bottom');
        oldWidth = oldRight - oldLeft;
        oldHeight = oldBottom - oldTop;
        newWidth = newRight - newLeft;
        newHeight = newBottom - newTop;
        dWidth = Math.abs(oldWidth - newWidth);
        dHeight = Math.abs(oldHeight - newHeight);
        ratio = dWidth > dHeight ? newHeight / oldHeight : newWidth / oldWidth;
        patchSize = parseFloat((this.get('widget.dimensions.patchSize') * ratio).toFixed(2));
        scaledWidth = patchSize * (this.get('widget.dimensions.maxPxcor') - this.get('widget.dimensions.minPxcor') + 1);
        scaledHeight = patchSize * (this.get('widget.dimensions.maxPycor') - this.get('widget.dimensions.minPycor') + 1);
        dx = scaledWidth - oldWidth;
        dy = scaledHeight - oldHeight;
        movedLeft = newLeft !== oldLeft;
        movedUp = newTop !== oldTop;
        ref = movedUp ? [oldTop - dy, newBottom] : [newTop, oldBottom + dy], top = ref[0], bottom = ref[1];
        ref1 = movedLeft ? [oldLeft - dx, newRight] : [newLeft, oldRight + dx], left = ref1[0], right = ref1[1];
        if (left >= 0 && top >= 0) {
          this.set('widget.top', Math.round(top));
          this.set('widget.bottom', Math.round(bottom));
          this.set('widget.left', Math.round(left));
          this.set('widget.right', Math.round(right));
          this.findComponent('editForm').set('patchSize', patchSize);
        }
      }
    },
    handleResizeEnd: function() {
      this.fire('set-patch-size', this.findComponent('editForm').get('patchSize'));
    },
    minWidth: 10,
    minHeight: 10,
    template: "{{>editorOverlay}}\n{{>view}}\n<editForm idBasis=\"view\" style=\"width: 510px;\"\n          maxX=\"{{widget.dimensions.maxPxcor}}\" maxY=\"{{widget.dimensions.maxPycor}}\"\n          minX=\"{{widget.dimensions.minPxcor}}\" minY=\"{{widget.dimensions.minPycor}}\"\n          wrapsInX=\"{{widget.dimensions.wrappingAllowedInX}}\" wrapsInY=\"{{widget.dimensions.wrappingAllowedInY}}\"\n          patchSize=\"{{widget.dimensions.patchSize}}\" turtleLabelSize=\"{{widget.fontSize}}\"\n          framerate=\"{{widget.frameRate}}\"\n          isShowingTicks=\"{{widget.showTickCounter}}\" tickLabel=\"{{widget.tickCounterLabel}}\" />",
    partials: {
      view: "<div id=\"{{id}}\" class=\"netlogo-widget netlogo-view-container {{classes}}\" style=\"{{dims}}\"></div>"
    }
  });

}).call(this);

//# sourceMappingURL=view.js.map
