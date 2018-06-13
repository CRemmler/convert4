(function() {
  var hasProp = {}.hasOwnProperty;

  window.controlEventTraffic = function(controller) {
    var checkActionKeys, createWidget, dropOverlay, hailSatan, mousetrap, onCloseDialog, onCloseEditForm, onOpenDialog, onOpenEditForm, onQMark, onWidgetBottomChange, onWidgetRightChange, onWidgetValueChange, openDialogs, ractive, redrawView, refreshChooser, refreshDims, rejectDupe, renameGlobal, resizeView, setPatchSize, toggleInterfaceLock, trackFocus, unregisterWidget, updateTopology, viewController;
    ractive = controller.ractive, viewController = controller.viewController;
    openDialogs = new Set([]);
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
    createWidget = function(widgetType, pageX, pageY) {
      controller.createWidget(widgetType, pageX, pageY);
    };
    dropOverlay = function() {
      ractive.set('isHelpVisible', false);
      ractive.set('isOverlayUp', false);
    };
    hailSatan = function(arg) {
      var clientX, clientY, ref;
      ref = arg.event, clientX = ref.clientX, clientY = ref.clientY;
      ractive.set("lastDragX", clientX);
      ractive.set("lastDragY", clientY);
    };
    onCloseDialog = function(dialog) {
      openDialogs["delete"](dialog);
      ractive.set('someDialogIsOpen', openDialogs.size > 0);
      document.querySelector('.netlogo-model').focus();
    };
    onCloseEditForm = function(editForm) {
      ractive.set('someEditFormIsOpen', false);
      onCloseDialog(editForm);
    };
    onQMark = (function() {
      var focusedElement;
      focusedElement = void 0;
      return function(arg) {
        var elem, helpIsNowVisible, isProbablyEditingText, ref, target;
        target = arg.target;
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
    refreshDims = function() {
      onWidgetRightChange();
      onWidgetBottomChange();
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
      refreshDims();
    };
    setPatchSize = function(patchSize) {
      world.setPatchSize(patchSize);
      refreshDims();
    };
    toggleInterfaceLock = function() {
      var isEditing;
      if (!this.get('someDialogIsOpen')) {
        isEditing = !ractive.get('isEditing');
        ractive.set('isEditing', isEditing);
      }
    };
    trackFocus = function(node) {
      ractive.set('hasFocus', document.activeElement === node);
    };
    unregisterWidget = function(_, id, wasNew) {
      controller.removeWidgetById(id, wasNew);
      refreshDims();
    };
    updateTopology = function() {
      var ref, wrapX, wrapY;
      ref = viewController.model.world, wrapX = ref.wrappingallowedinx, wrapY = ref.wrappingallowediny;
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
