(function() {
  var alreadyHasA, defaultOptions, genWidgetCreator;

  genWidgetCreator = function(name, widgetType, isEnabled, enabler) {
    if (isEnabled == null) {
      isEnabled = true;
    }
    if (enabler == null) {
      enabler = (function() {
        return false;
      });
    }
    return {
      text: "Create " + name,
      enabler: enabler,
      isEnabled: isEnabled,
      action: function(context, mouseX, mouseY) {
        return context.fire('create-widget', widgetType, mouseX, mouseY);
      }
    };
  };

  alreadyHasA = function(componentName) {
    return function(ractive) {
      if (ractive.parent != null) {
        return alreadyHasA(componentName)(ractive.parent);
      } else {
        return ractive.findComponent(componentName) == null;
      }
    };
  };

  defaultOptions = [["Button", "button"], ["Chooser", "chooser"], ["Input", "inputBox"], ["Label", "textBox"], ["Monitor", "monitor"], ["Output", "output", false, alreadyHasA('outputWidget')], ["Plot", "plot", false], ["Slider", "slider"], ["Switch", "switch"]].map(function(args) {
    return genWidgetCreator.apply(null, args);
  });

  window.RactiveContextable = Ractive.extend({
    data: function() {
      return {
        contextMenuOptions: void 0
      };
    },
    standardOptions: function(component) {
      return {
        "delete": {
          text: "Delete",
          isEnabled: true,
          action: function() {
            component.fire('hide-context-menu');
            return component.fire('unregister-widget', component.get('widget').id);
          }
        },
        edit: {
          text: "Edit",
          isEnabled: true,
          action: function() {
            return component.fire('edit-widget');
          }
        }
      };
    }
  });

  window.RactiveContextMenu = Ractive.extend({
    data: function() {
      return {
        options: void 0,
        mouseX: 0,
        mouseY: 0,
        target: void 0,
        visible: false
      };
    },
    on: {
      'ignore-click': function() {
        return false;
      },
      'cover-thineself': function() {
        this.set('visible', false);
        this.fire('unlock-selection');
      },
      'reveal-thineself': function(_, component, x, y) {
        var ref;
        this.set('target', component);
        this.set('options', (ref = component != null ? component.get('contextMenuOptions') : void 0) != null ? ref : defaultOptions);
        this.set('visible', true);
        this.set('mouseX', x);
        this.set('mouseY', y);
        if (component instanceof RactiveWidget) {
          this.fire('lock-selection', component);
        }
      }
    },
    template: "{{# visible }}\n<div id=\"netlogo-widget-context-menu\" class=\"widget-context-menu\" style=\"top: {{mouseY}}px; left: {{mouseX}}px;\">\n  <div id=\"{{id}}-context-menu\" class=\"netlogo-widget-editor-menu-items\">\n    <ul class=\"context-menu-list\">\n      {{# options }}\n        {{# (..enabler !== undefined && ..enabler(target)) || ..isEnabled }}\n          <li class=\"context-menu-item\" on-mouseup=\"..action(target, mouseX, mouseY)\">{{..text}}</li>\n        {{ else }}\n          <li class=\"context-menu-item disabled\" on-mouseup=\"ignore-click\">{{..text}}</li>\n        {{/}}\n      {{/}}\n    </ul>\n  </div>\n</div>\n{{/}}"
  });

}).call(this);

//# sourceMappingURL=context-menu.js.map
