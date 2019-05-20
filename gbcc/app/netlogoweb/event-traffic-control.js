(function() {
  // (WidgetController) => Unit
  var hasProp = {}.hasOwnProperty;

  window.controlEventTraffic = function(controller) {
    var checkActionKeys, createWidget, dropOverlay, hailSatan, mousetrap, onCloseDialog, onCloseEditForm, onOpenDialog, onOpenEditForm, onQMark, onWidgetBottomChange, onWidgetRightChange, onWidgetValueChange, openDialogs, ractive, redrawView, refreshChooser, refreshDims, rejectDupe, renameGlobal, resizeView, setPatchSize, toggleBooleanData, trackFocus, unregisterWidget, updateTopology, viewController;
    ({ractive, viewController} = controller);
    openDialogs = new Set([]);
    // (Event) => Unit
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
            if (w.forever) {
              w.running = !w.running;
            } else {
              w.run();
            }
          }
        }
      }
    };
    // (String, Number, Number) => Unit
    createWidget = function(widgetType, pageX, pageY) {
      controller.createWidget(widgetType, pageX, pageY);
    };
    dropOverlay = function() {
      ractive.set('isHelpVisible', false);
      ractive.set('isOverlayUp', false);
    };
    // Thanks, Firefox.  Maybe just put the proper values in the `drag` event, in the
    // future, instead of sending us `0` for them every time? --JAB (11/23/17)

    // (RactiveEvent) => Unit
    hailSatan = function({
        event: {clientX, clientY}
      }) {
      ractive.set("lastDragX", clientX);
      ractive.set("lastDragY", clientY);
    };
    onCloseDialog = function(dialog) {
      var temp;
      openDialogs.delete(dialog);
      ractive.set('someDialogIsOpen', openDialogs.size > 0);
      temp = document.scrollTop;
      document.querySelector('.netlogo-model').focus();
      document.scrollTop = temp;
    };
    onCloseEditForm = function(editForm) {
      ractive.set('someEditFormIsOpen', false);
      onCloseDialog(editForm);
    };
    onQMark = (function() {
      var focusedElement;
      focusedElement = void 0;
      return function({target}) {
        var elem, helpIsNowVisible, isProbablyEditingText, ref;
        isProbablyEditingText = (((ref = target.tagName.toLowerCase()) === "input" || ref === "textarea") && !target.readOnly) || target.contentEditable === "true";
        if (!isProbablyEditingText) {
          helpIsNowVisible = !ractive.get('isHelpVisible');
          ractive.set('isHelpVisible', helpIsNowVisible);
          elem = helpIsNowVisible ? (focusedElement = document.activeElement, ractive.find('#help-dialog')) : focusedElement;
          elem.focus();
        }
      };
    })();
    onOpenDialog = function(dialog) {
      openDialogs.add(dialog);
      ractive.set('someDialogIsOpen', true);
    };
    onOpenEditForm = function(editForm) {
      ractive.set('someEditFormIsOpen', true);
      onOpenDialog(editForm);
    };
    // () => Unit
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
    // () => Unit
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
    // (Any, Any, String, Number) => Unit
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
    // () => Unit
    redrawView = function() {
      controller.redraw();
      viewController.repaint();
    };
    // (Widget.Chooser) => Boolean
    refreshChooser = function(chooser) {
      var eq;
      ({eq} = tortoise_require('brazier/equals'));
      chooser.currentChoice = Math.max(0, chooser.choices.findIndex(eq(chooser.currentValue)));
      chooser.currentValue = chooser.choices[chooser.currentChoice];
      world.observer.setGlobal(chooser.variable, chooser.currentValue);
      return false;
    };
    // () => Unit
    refreshDims = function() {
      onWidgetRightChange();
      onWidgetBottomChange();
    };
    // (String) => Unit
    rejectDupe = function(varName) {
      showErrors([`There is already a widget of a different type with a variable named '${varName}'`]);
    };
    // (String, String, Any) => Boolean
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
      if (!existsInObj(function({variable}) {
        return variable === oldName;
      })(ractive.get('widgetObj'))) {
        world.observer.setGlobal(oldName, void 0);
      }
      world.observer.setGlobal(newName, value);
      return false;
    };
    // () => Unit
    resizeView = function() {
      var maxpxcor, maxpycor, minpxcor, minpycor, patchsize;
      ({minpxcor, maxpxcor, minpycor, maxpycor, patchsize} = viewController.model.world);
      setPatchSize(patchsize);
      world.resize(minpxcor, maxpxcor, minpycor, maxpycor);
      refreshDims();
    };
    // (Number) => Unit
    setPatchSize = function(patchSize) {
      world.setPatchSize(patchSize);
      refreshDims();
    };
    // (String) => Unit
    toggleBooleanData = function(dataName) {
      var newData;
      if (!ractive.get('someDialogIsOpen')) {
        newData = !ractive.get(dataName);
        ractive.set(dataName, newData);
      }
    };
    // (Node) => Unit
    trackFocus = function(node) {
      ractive.set('hasFocus', document.activeElement === node);
    };
    // (_, Number, Boolean) => Unit
    unregisterWidget = function(_, id, wasNew) {
      controller.removeWidgetById(id, wasNew);
      refreshDims();
    };
    // () => Unit
    updateTopology = function() {
      var wrapX, wrapY;
      ({
        wrappingallowedinx: wrapX,
        wrappingallowediny: wrapY
      } = viewController.model.world);
      world.changeTopology(wrapX, wrapY);
    };
    mousetrap = Mousetrap(ractive.find('.netlogo-model'));
    mousetrap.bind(['up', 'down', 'left', 'right'], function(_, name) {
      return ractive.fire('nudge-widget', name);
    });
    mousetrap.bind(['ctrl+shift+l', 'command+shift+l'], function() {
      return ractive.fire('toggle-interface-lock');
    });
    mousetrap.bind(['ctrl+shift+h', 'command+shift+h'], function() {
      return ractive.fire('hide-resizer');
    });
    mousetrap.bind('del', function() {
      return ractive.fire('delete-selected');
    });
    mousetrap.bind('escape', function() {
      return ractive.fire('deselect-widgets');
    });
    mousetrap.bind('?', onQMark);
    ractive.observe('widgetObj.*.currentValue', onWidgetValueChange);
    ractive.observe('widgetObj.*.right', onWidgetRightChange);
    ractive.observe('widgetObj.*.bottom', onWidgetBottomChange);
    ractive.on('hail-satan', hailSatan);
    ractive.on('toggle-interface-lock', function() {
      return toggleBooleanData('isEditing');
    });
    ractive.on('toggle-orientation', function() {
      return toggleBooleanData('isVertical');
    });
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
    ractive.on('drop-overlay', function(_, event) {
      return dropOverlay();
    });
    ractive.on('show-errors', function(_, event) {
      return window.showErrors(event.context.compilation.messages);
    });
    ractive.on('track-focus', function(_, node) {
      return trackFocus(node);
    });
    ractive.on('*.refresh-chooser', function(_, nada, chooser) {
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
    ractive.on('*.dialog-closed', function(_, dialog) {
      return onCloseDialog(dialog);
    });
    ractive.on('*.dialog-opened', function(_, dialog) {
      return onOpenDialog(dialog);
    });
    ractive.on('*.edit-form-closed', function(_, editForm) {
      return onCloseEditForm(editForm);
    });
    ractive.on('*.edit-form-opened', function(_, editForm) {
      return onOpenEditForm(editForm);
    });
  };

}).call(this);

//# sourceMappingURL=event-traffic-control.js.map
