(function() {
  var WidgetEventGenerators,
    slice = [].slice;

  WidgetEventGenerators = {
    recompile: function() {
      return {
        run: function(ractive, widget) {
          return ractive.fire('recompile');
        },
        type: "recompile"
      };
    },
    recompileLite: function() {
      return {
        run: function(ractive, widget) {
          return ractive.fire('recompile-lite');
        },
        type: "recompile-lite"
      };
    },
    redrawView: function() {
      return {
        run: function(ractive, widget) {
          return ractive.fire('redraw-view');
        },
        type: "redrawView"
      };
    },
    refreshChooser: function() {
      return {
        run: function(ractive, widget) {
          return ractive.fire('refresh-chooser', "ignore", widget);
        },
        type: "refreshChooser"
      };
    },
    rename: function(oldName, newName) {
      return {
        run: function(ractive, widget) {
          return ractive.fire('rename-interface-global', oldName, newName, widget.currentValue);
        },
        type: "rename:" + oldName + "," + newName
      };
    },
    resizePatches: function() {
      return {
        run: function(ractive, widget) {
          return ractive.fire('set-patch-size', widget.dimensions.patchSize);
        },
        type: "resizePatches"
      };
    },
    resizeView: function() {
      return {
        run: function(ractive, widget) {
          return ractive.fire('resize-view');
        },
        type: "resizeView"
      };
    },
    updateEngineValue: function() {
      return {
        run: function(ractive, widget) {
          return world.observer.setGlobal(widget.variable, widget.currentValue);
        },
        type: "updateCurrentValue"
      };
    },
    updateTopology: function() {
      return {
        run: function(ractive, widget) {
          return ractive.fire('update-topology');
        },
        type: "updateTopology"
      };
    }
  };

  window.RactiveWidget = RactiveDraggableAndContextable.extend({
    _weg: WidgetEventGenerators,
    data: function() {
      return {
        id: void 0,
        isEditing: void 0,
        isSelected: void 0,
        resizeDirs: ['left', 'right', 'top', 'bottom', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
        widget: void 0
      };
    },
    components: {
      editForm: void 0
    },
    computed: {
      classes: function() {
        return (this.get('isEditing') ? 'interface-unlocked' : '') + "\n" + (this.get('isSelected') ? 'selected' : '');
      },
      dims: function() {
        return "position: absolute;\nleft: " + (this.get('left')) + "px; top: " + (this.get('top')) + "px;\nwidth: " + (this.get('right') - this.get('left')) + "px; height: " + (this.get('bottom') - this.get('top')) + "px;";
      }
    },
    handleResize: function(arg) {
      var bottom, left, right, top;
      left = arg.left, right = arg.right, top = arg.top, bottom = arg.bottom;
      this.set('widget.left', left);
      this.set('widget.right', right);
      this.set('widget.top', top);
      this.set('widget.bottom', bottom);
    },
    handleResizeEnd: function() {},
    on: {
      'edit-widget': function() {
        if (this.get('isNotEditable') !== true) {
          this.fire('hide-context-menu');
          this.findComponent('editForm').fire("show-yourself");
          false;
        }
      },
      init: function() {
        var ref;
        if ((ref = this.findComponent('editForm')) != null) {
          ref.fire("activate-cloaking-device");
        }
      },
      'initialize-widget': function() {
        this.findComponent('editForm').fire("prove-your-worth");
        return false;
      },
      "*.has-been-proven-unworthy": function() {
        return this.fire('unregister-widget', this.get('widget').id, true);
      },
      "*.update-widget-value": function(_, values) {
        var error, event, eventArraysArray, events, ex, getByPath, i, isTroublesome, k, len, name, newies, oldies, ref, scrapeWidget, setByPath, triggerNames, triggers, uniqueEvents, v, widget, widgets;
        getByPath = function(obj) {
          return function(path) {
            return path.split('.').reduce((function(acc, x) {
              return acc[x];
            }), obj);
          };
        };
        setByPath = function(obj) {
          return function(path) {
            return function(value) {
              var i, key, lastParent, parents, ref;
              ref = path.split('.'), parents = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), key = ref[i++];
              lastParent = parents.reduce((function(acc, x) {
                return acc[x];
              }), obj);
              return lastParent[key] = value;
            };
          };
        };
        try {
          widget = this.get('widget');
          widgets = Object.values(this.parent.get('widgetObj'));
          isTroublesome = function(w) {
            return w.variable === values.variable && w.type !== widget.type;
          };
          if ((values.variable != null) && widgets.some(isTroublesome)) {
            return this.fire('reject-duplicate-var', values.variable);
          } else {
            scrapeWidget = function(widget, triggerNames) {
              return triggerNames.reduce((function(acc, x) {
                acc[x] = getByPath(widget)(x);
                return acc;
              }), {});
            };
            triggers = this.eventTriggers();
            triggerNames = Object.keys(triggers);
            oldies = scrapeWidget(widget, triggerNames);
            for (k in values) {
              v = values[k];
              setByPath(widget)(k)(v);
            }
            newies = scrapeWidget(widget, triggerNames);
            eventArraysArray = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = triggerNames.length; i < len; i++) {
                name = triggerNames[i];
                if (newies[name] !== oldies[name]) {
                  results.push(triggers[name].map(function(constructEvent) {
                    return constructEvent(oldies[name], newies[name]);
                  }));
                }
              }
              return results;
            })();
            events = (ref = []).concat.apply(ref, eventArraysArray);
            uniqueEvents = events.reduce((function(acc, x) {
              if (acc.find(function(y) {
                return y.type === x.type;
              }) == null) {
                return acc.concat([x]);
              } else {
                return acc;
              }
            }), []);
            for (i = 0, len = uniqueEvents.length; i < len; i++) {
              event = uniqueEvents[i];
              event.run(this, widget);
            }
            return this.fire('update-widgets');
          }
        } catch (error) {
          ex = error;
          return console.error(ex);
        } finally {
          return false;
        }
      }
    },
    partials: {
      editorOverlay: "{{ #isEditing }}\n  <div draggable=\"true\" style=\"{{dims}}\" class=\"editor-overlay{{#isSelected}} selected{{/}}\"\n       on-click=\"@this.fire('hide-context-menu') && @this.fire('select-widget', @event)\"\n       on-contextmenu=\"@this.fire('show-context-menu', @event)\"\n       on-dblclick=\"@this.fire('edit-widget')\"\n       on-dragstart=\"start-widget-drag\"\n       on-drag=\"drag-widget\"\n       on-dragend=\"stop-widget-drag\"></div>\n{{/}}"
    }
  });

}).call(this);

//# sourceMappingURL=widget.js.map
