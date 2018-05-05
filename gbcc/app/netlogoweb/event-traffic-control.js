(function() {
  var hasProp = {}.hasOwnProperty;

  window.controlEventTraffic = function(controller) {
    var checkActionKeys, createWidget, hailSatan, mousetrap, onWidgetBottomChange, onWidgetRightChange, onWidgetValueChange, ractive, redrawView, refreshChooser, rejectDupe, renameGlobal, resizeView, setPatchSize, toggleInterfaceLock, trackFocus, unregisterWidget, updateTopology, viewController;
    ractive = controller.ractive, viewController = controller.viewController;
    checkActionKeys = function(e) {
      var _, char, ref, w;
      if (ractive.get('hasFocus')) {
        char = String.fromCharCode(e.which != null ? e.which : e.keyCode);
        ref = ractive.get('widgetObj');
        for (_ in ref) {
          w = ref[_];
          if (w.type === 'button' && w.actionKey === char && ractive.findAllComponents('buttonWidget').find(function(b) {
            return b.get('widget') === w;
          }).get('isEnabled')) {
            w.run();
          }
        }
      }
    };
    createWidget = function(widgetType, pageX, pageY) {
      controller.createWidget(widgetType, pageX, pageY);
    };
    hailSatan = function(arg) {
      var clientX, clientY, ref;
      ref = arg.event, clientX = ref.clientX, clientY = ref.clientY;
      ractive.set("lastDragX", clientX);
      ractive.set("lastDragY", clientY);
    };
    onWidgetBottomChange = function() {
      var i, w;
      ractive.set('height', Math.max.apply(Math, (function() {
        var ref, results;
        ref = ractive.get('widgetObj');
        results = [];
        for (i in ref) {
          if (!hasProp.call(ref, i)) continue;
          w = ref[i];
          if (w.bottom != null) {
            results.push(w.bottom);
          }
        }
        return results;
      })()));
    };
    onWidgetRightChange = function() {
      var i, w;
      ractive.set('width', Math.max.apply(Math, (function() {
        var ref, results;
        ref = ractive.get('widgetObj');
        results = [];
        for (i in ref) {
          if (!hasProp.call(ref, i)) continue;
          w = ref[i];
          if (w.right != null) {
            results.push(w.right);
          }
        }
        return results;
      })()));
    };
    onWidgetValueChange = function(newVal, oldVal, keyPath, widgetNum) {
      var widget, widgetHasValidValue;
      widgetHasValidValue = function(widget, value) {
        return (value != null) && (function() {
          switch (widget.type) {
            case 'slider':
              return !isNaN(value);
            case 'inputBox':
              return !(widget.boxedValue.type === 'Number' && isNaN(value));
            default:
              return true;
          }
        })();
      };
      widget = ractive.get('widgetObj')[widgetNum];
      if ((widget.variable != null) && (typeof world !== "undefined" && world !== null) && newVal !== oldVal && widgetHasValidValue(widget, newVal)) {
        world.observer.setGlobal(widget.variable, newVal);
      }
    };
    redrawView = function() {
      controller.redraw();
      viewController.repaint();
    };
    refreshChooser = function(chooser) {
      var eq;
      eq = tortoise_require('brazier/equals').eq;
      chooser.currentChoice = Math.max(0, chooser.choices.findIndex(eq(chooser.currentValue)));
      chooser.currentValue = chooser.choices[chooser.currentChoice];
      world.observer.setGlobal(chooser.variable, chooser.currentValue);
      return false;
    };
    rejectDupe = function(varName) {
      showErrors(["There is already a widget of a different type with a variable named '" + varName + "'"]);
    };
    renameGlobal = function(oldName, newName, value) {
      var existsInObj;
      existsInObj = function(f) {
        return function(obj) {
          var _, v;
          for (_ in obj) {
            v = obj[_];
            if (f(v)) {
              return true;
            }
          }
          return false;
        };
      };
      if (!existsInObj(function(arg) {
        var variable;
        variable = arg.variable;
        return variable === oldName;
      })(ractive.get('widgetObj'))) {
        world.observer.setGlobal(oldName, void 0);
      }
      world.observer.setGlobal(newName, value);
      return false;
    };
    resizeView = function() {
      var maxpxcor, maxpycor, minpxcor, minpycor, patchsize, ref;
      ref = viewController.model.world, minpxcor = ref.minpxcor, maxpxcor = ref.maxpxcor, minpycor = ref.minpycor, maxpycor = ref.maxpycor, patchsize = ref.patchsize;
      setPatchSize(patchsize);
      world.resize(minpxcor, maxpxcor, minpycor, maxpycor);
    };
    setPatchSize = function(patchSize) {
      viewModel.dimensions.patchSize = patchSize;
      world.setPatchSize(patchSize);
    };
    toggleInterfaceLock = function() {
      var isEditing;
      isEditing = !ractive.get('isEditing');
      ractive.set('isEditing', isEditing);
      ractive.fire('editing-mode-changed-to', isEditing);
    };
    trackFocus = function(node) {
      ractive.set('hasFocus', document.activeElement === node);
    };
    unregisterWidget = function(_, id, wasNew) {
      controller.removeWidgetById(id, wasNew);
      onWidgetRightChange();
      onWidgetBottomChange();
    };
    updateTopology = function() {
      var ref, wrapX, wrapY;
      ref = viewController.model.world, wrapX = ref.wrappingallowedinx, wrapY = ref.wrappingallowediny;
      world.changeTopology(wrapX, wrapY);
    };
    mousetrap = Mousetrap(ractive.find('.netlogo-model'));
    mousetrap.bind(['ctrl+shift+alt+i', 'command+shift+alt+i'], function() {
      return ractive.fire('toggle-interface-lock');
    });
    mousetrap.bind('del', function() {
      return ractive.fire('delete-selected');
    });
    mousetrap.bind('escape', function() {
      return ractive.fire('deselect-widgets');
    });
    ractive.observe('widgetObj.*.currentValue', onWidgetValueChange);
    ractive.observe('widgetObj.*.right', onWidgetRightChange);
    ractive.observe('widgetObj.*.bottom', onWidgetBottomChange);
    ractive.on('hail-satan', hailSatan);
    ractive.on('toggle-interface-lock', toggleInterfaceLock);
    ractive.on('*.redraw-view', redrawView);
    ractive.on('*.resize-view', resizeView);
    ractive.on('*.unregister-widget', unregisterWidget);
    ractive.on('*.update-topology', updateTopology);
    ractive.on('check-action-keys', function(_, event) {
      return checkActionKeys(event);
    });
    ractive.on('create-widget', function(_, type, x, y) {
      return createWidget(type, x, y);
    });
    ractive.on('show-errors', function(_, event) {
      return window.showErrors(event.context.compilation.messages);
    });
    ractive.on('track-focus', function(_, node) {
      return trackFocus(node);
    });
    ractive.on('*.refresh-chooser', function(_, chooser) {
      return refreshChooser(chooser);
    });
    ractive.on('*.reject-duplicate-var', function(_, varName) {
      return rejectDupe(varName);
    });
    ractive.on('*.rename-interface-global', function(_, oldN, newN, x) {
      return renameGlobal(oldN, newN, x);
    });
    ractive.on('*.set-patch-size', function(_, patchSize) {
      return setPatchSize(patchSize);
    });
    ractive.on('*.update-widgets', function() {
      return controller.updateWidgets();
    });
  };

}).call(this);

//# sourceMappingURL=event-traffic-control.js.map
