(function() {
  var buttonProps, chooserProps, defaultWidgetMixinFor, inputBoxProps, monitorProps, outputProps, plotProps, sliderProps, switchProps, textBoxProps, updateWidget, viewProps, widgetEqualsBy;

  window.WidgetController = (function() {
    function WidgetController(ractive, viewController, configs) {
      var chartOps, component, display, ref;
      this.ractive = ractive;
      this.viewController = viewController;
      this.configs = configs;
      ref = this.configs.plotOps;
      for (display in ref) {
        chartOps = ref[display];
        component = this.ractive.findAllComponents("plotWidget").find(function(plot) {
          return plot.get("widget").display === display;
        });
        component.set('resizeCallback', chartOps.resizeElem.bind(chartOps));
      }
    }

    WidgetController.prototype.createWidget = function(widgetType, x, y) {
      var adjustedX, adjustedY, base, id, mixin, rect, widget;
      rect = document.querySelector('.netlogo-widget-container').getBoundingClientRect();
      adjustedX = Math.round(x - rect.x);
      adjustedY = Math.round(y - rect.y);
      base = {
        left: adjustedX,
        top: adjustedY,
        type: widgetType
      };
      mixin = defaultWidgetMixinFor(widgetType, adjustedX, adjustedY);
      widget = Object.assign(base, mixin);
      id = Math.max.apply(Math, Object.keys(this.ractive.get('widgetObj')).map(parseFloat)) + 1;
      window.setUpWidget(widget, id, ((function(_this) {
        return function() {
          _this.redraw();
          return _this.updateWidgets();
        };
      })(this)));
      if (widget.currentValue != null) {
        world.observer.setGlobal(widget.variable, widget.currentValue);
      }
      this.ractive.get('widgetObj')[id] = widget;
      this.ractive.update('widgetObj');
      this.ractive.findAllComponents("").find(function(c) {
        return c.get('widget') === widget;
      }).fire('initialize-widget');
    };

    WidgetController.prototype.runForevers = function() {
      var i, len, ref, widget;
      ref = this.widgets();
      for (i = 0, len = ref.length; i < len; i++) {
        widget = ref[i];
        if (widget.type === 'button' && widget.forever && widget.running) {
          widget.run();
        }
      }
    };

    WidgetController.prototype.updateWidgets = function() {
      var _, chartOps, i, len, ref, ref1, widget;
      ref = this.configs.plotOps;
      for (_ in ref) {
        chartOps = ref[_];
        chartOps.redraw();
      }
      ref1 = this.widgets();
      for (i = 0, len = ref1.length; i < len; i++) {
        widget = ref1[i];
        updateWidget(widget);
      }
      if (world.ticker.ticksAreStarted()) {
        this.ractive.set('ticks', Math.floor(world.ticker.tickCount()));
        this.ractive.set('ticksStarted', true);
      } else {
        this.ractive.set('ticks', '');
        this.ractive.set('ticksStarted', false);
      }
      this.ractive.update();
    };

    WidgetController.prototype.removeWidgetById = function(id, widgetWasNew) {
      var widgetType;
      if (widgetWasNew == null) {
        widgetWasNew = false;
      }
      widgetType = this.ractive.get('widgetObj')[id].type;
      delete this.ractive.get('widgetObj')[id];
      this.ractive.update('widgetObj');
      this.ractive.fire('deselect-widgets');
      if (!widgetWasNew) {
        switch (widgetType) {
          case "chooser":
          case "inputBox":
          case "plot":
          case "slider":
          case "switch":
            this.ractive.fire('controller.recompile');
        }
      }
    };

    WidgetController.prototype.widgets = function() {
      var _, ref, results, v;
      ref = this.ractive.get('widgetObj');
      results = [];
      for (_ in ref) {
        v = ref[_];
        results.push(v);
      }
      return results;
    };

    WidgetController.prototype.freshenUpWidgets = function(realWidgets, newWidgets) {
      var i, index, len, newWidget, props, realWidget, ref, ref1, setterUpper;
      for (index = i = 0, len = newWidgets.length; i < len; index = ++i) {
        newWidget = newWidgets[index];
        ref = (function() {
          switch (newWidget.type) {
            case "button":
              return [
                buttonProps, window.setUpButton((function(_this) {
                  return function() {
                    _this.redraw();
                    return _this.updateWidgets();
                  };
                })(this))
              ];
            case "chooser":
              return [chooserProps, window.setUpChooser];
            case "inputBox":
              return [inputBoxProps, window.setUpInputBox];
            case "monitor":
              return [monitorProps, window.setUpMonitor];
            case "output":
              return [outputProps, (function() {})];
            case "plot":
              return [plotProps, (function() {})];
            case "slider":
              return [sliderProps, window.setUpSlider];
            case "switch":
              return [switchProps, window.setUpSwitch];
            case "textBox":
              return [textBoxProps, (function() {})];
            case "view":
              return [viewProps, (function() {})];
            default:
              throw new Error("Unknown widget type: " + newWidget.type);
          }
        }).call(this), props = ref[0], setterUpper = ref[1];
        realWidget = realWidgets.find(widgetEqualsBy(props)(newWidget));
        if (realWidget != null) {
          realWidget.compilation = newWidget.compilation;
          setterUpper(newWidget, realWidget);
          if (newWidget.variable != null) {
            realWidget.variable = newWidget.variable.toLowerCase();
          }
          if ((ref1 = newWidget.type) === "chooser" || ref1 === "inputBox" || ref1 === "slider" || ref1 === "switch") {
            world.observer.setGlobal(newWidget.variable, realWidget.currentValue);
          }
        }
      }
      this.updateWidgets();
    };

    WidgetController.prototype.speed = function() {
      return this.ractive.get('speed');
    };

    WidgetController.prototype.setCode = function(code) {
      this.ractive.set('code', code);
      this.ractive.findComponent('codePane').setCode(code);
      this.ractive.fire('controller.recompile');
    };

    WidgetController.prototype.redraw = function() {
      if (Updater.hasUpdates()) {
        this.viewController.update(Updater.collectUpdates());
      }
    };

    WidgetController.prototype.teardown = function() {
      this.ractive.teardown();
    };

    WidgetController.prototype.code = function() {
      return this.ractive.get('code');
    };

    return WidgetController;

  })();

  updateWidget = function(widget) {
    var desiredHeight, desiredWidth, err, isNum, isntValidValue, maxPxcor, maxPycor, maxValue, minPxcor, minPycor, minValue, patchSize, ref, stepValue, value;
    if (widget.currentValue != null) {
      widget.currentValue = (function() {
        var error;
        if (widget.variable != null) {
          return world.observer.getGlobal(widget.variable);
        } else if (widget.reporter != null) {
          try {
            value = widget.reporter();
            isNum = typeof value === "number";
            isntValidValue = !((value != null) && (!isNum || isFinite(value)));
            if (isntValidValue) {
              return 'N/A';
            } else {
              if ((widget.precision != null) && isNum) {
                return NLMath.precision(value, widget.precision);
              } else {
                return value;
              }
            }
          } catch (error) {
            err = error;
            return 'N/A';
          }
        } else {
          return widget.currentValue;
        }
      })();
    }
    switch (widget.type) {
      case 'inputBox':
        widget.boxedValue.value = widget.currentValue;
        break;
      case 'slider':
        maxValue = widget.getMax();
        stepValue = widget.getStep();
        minValue = widget.getMin();
        if (widget.maxValue !== maxValue || widget.stepValue !== stepValue || widget.minValue !== minValue) {
          widget.maxValue = maxValue;
          widget.stepValue = stepValue;
          widget.minValue = minValue - 0.000001;
          widget.minValue = minValue;
        }
        break;
      case 'view':
        ref = widget.dimensions, maxPxcor = ref.maxPxcor, maxPycor = ref.maxPycor, minPxcor = ref.minPxcor, minPycor = ref.minPycor, patchSize = ref.patchSize;
        desiredWidth = Math.round(patchSize * (maxPxcor - minPxcor + 1));
        desiredHeight = Math.round(patchSize * (maxPycor - minPycor + 1));
        widget.right = widget.left + desiredWidth;
        widget.bottom = widget.top + desiredHeight;
    }
  };

  defaultWidgetMixinFor = function(widgetType, x, y) {
    switch (widgetType) {
      case "output":
        return {
          bottom: y + 60,
          right: x + 180,
          fontSize: 12
        };
      case "switch":
        return {
          bottom: y + 33,
          right: x + 100,
          on: false,
          variable: ""
        };
      case "slider":
        return {
          bottom: y + 33,
          right: x + 170,
          "default": 50,
          direction: "horizontal",
          max: "100",
          min: "0",
          step: "1"
        };
      case "inputBox":
        return {
          bottom: y + 60,
          right: x + 180,
          boxedValue: {
            multiline: false,
            type: "String",
            value: ""
          },
          variable: ""
        };
      case "button":
        return {
          bottom: y + 60,
          right: x + 180,
          buttonKind: "Observer",
          disableUntilTicksStart: false,
          forever: false,
          running: false
        };
      case "chooser":
        return {
          bottom: y + 45,
          right: x + 140,
          choices: [],
          currentChoice: -1,
          variable: ""
        };
      case "monitor":
        return {
          bottom: y + 45,
          right: x + 70,
          fontSize: 11,
          precision: 17
        };
      case "plot":
        return {
          bottom: y + 60,
          right: x + 180
        };
      case "textBox":
        return {
          bottom: y + 60,
          right: x + 180,
          color: 0,
          display: "",
          fontSize: 12,
          transparent: true
        };
      default:
        throw new Error("Huh?  What kind of widget is a " + widgetType + "?");
    }
  };

  widgetEqualsBy = function(props) {
    return function(w1) {
      return function(w2) {
        var eq, locationProps;
        eq = tortoise_require('brazier/equals').eq;
        locationProps = ['bottom', 'left', 'right', 'top'];
        return w1.type === w2.type && locationProps.concat(props).every(function(prop) {
          return eq(w1[prop])(w2[prop]);
        });
      };
    };
  };

  buttonProps = ['buttonKind', 'disableUntilTicksStart', 'forever', 'source'];

  chooserProps = ['choices', 'display', 'variable'];

  inputBoxProps = ['boxedValue', 'variable'];

  monitorProps = ['display', 'fontSize', 'precision', 'source'];

  outputProps = ['fontSize'];

  plotProps = ['autoPlotOn', 'display', 'legendOn', 'pens', 'setupCode', 'updateCode', 'xAxis', 'xmax', 'xmin', 'yAxis', 'ymax', 'ymin'];

  sliderProps = ['default', 'direction', 'display', 'max', 'min', 'step', 'units', 'variable'];

  switchProps = ['display', 'on', 'variable'];

  textBoxProps = ['color', 'display', 'fontSize', 'transparent'];

  viewProps = ['dimensions', 'fontSize', 'frameRate', 'showTickCounter', 'tickCounterLabel', 'updateMode'];

}).call(this);

//# sourceMappingURL=widget-controller.js.map
