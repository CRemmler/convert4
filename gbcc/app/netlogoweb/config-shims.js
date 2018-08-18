(function() {
  var genDialogConfig, genImportExportConfig, genInspectionConfig, genMouseConfig, genOutputConfig, genPlotOps, genWorldConfig;

  genDialogConfig = function(viewController) {
    var clearMouse;
    clearMouse = function() {
      viewController.mouseDown = false;
    };
    return {
      confirm: function(str) {
        clearMouse();
        return window.confirm(str);
      },
      input: function(str) {
        clearMouse();
        return window.prompt(str, "");
      },
      notify: function(str) {
        clearMouse();
        return window.nlwAlerter.display("NetLogo Notification", true, str);
      },
      yesOrNo: function(str) {
        clearMouse();
        return window.confirm(str);
      }
    };
  };

  genImportExportConfig = function(ractive, viewController) {
    return {
      exportFile: function(contents) {
        return function(filename) {
          window.saveAs(new Blob([contents], {
            type: "text/plain:charset=utf-8"
          }), filename);
        };
      },
      exportOutput: function(filename) {
        var exportBlob, exportText, ref, ref1;
        exportText = (ref = (ref1 = ractive.findComponent('outputWidget')) != null ? ref1.get('text') : void 0) != null ? ref : ractive.findComponent('console').get('output');
        exportBlob = new Blob([exportText], {
          type: "text/plain:charset=utf-8"
        });
        window.saveAs(exportBlob, filename);
      },
      exportView: function(filename) {
        var anchor;
        anchor = document.createElement("a");
        anchor.setAttribute("href", viewController.view.visibleCanvas.toDataURL("img/png"));
        anchor.setAttribute("download", filename);
        anchor.click();
      },
      importDrawing: function(trueImport) {
        return function(path) {
          var elem, listener;
          listener = function(event) {
            var reader;
            reader = new FileReader;
            reader.onload = function(e) {
              return trueImport(e.target.result);
            };
            if (event.target.files.length > 0) {
              reader.readAsDataURL(event.target.files[0]);
            }
            return elem.removeEventListener('change', listener);
          };
          elem = ractive.find('#import-drawing-input');
          elem.addEventListener('change', listener);
          elem.click();
          elem.value = "";
        };
      },
      importWorld: function(trueImport) {
        return function() {
          var elem, listener;
          listener = function(event) {
            var reader;
            reader = new FileReader;
            reader.onload = function(e) {
              return trueImport(e.target.result);
            };
            if (event.target.files.length > 0) {
              reader.readAsText(event.target.files[0]);
            }
            return elem.removeEventListener('change', listener);
          };
          elem = ractive.find('#import-world-input');
          elem.addEventListener('change', listener);
          elem.click();
          elem.value = "";
        };
      }
    };
  };

  genInspectionConfig = function() {
    var clearDead, inspect, stopInspecting;
    inspect = (function(agent) {
      return window.alert("Agent inspection is not yet implemented");
    });
    stopInspecting = (function(agent) {});
    clearDead = (function() {});
    return {
      inspect: inspect,
      stopInspecting: stopInspecting,
      clearDead: clearDead
    };
  };

  genMouseConfig = function(viewController) {
    return {
      peekIsDown: function() {
        return viewController.mouseDown;
      },
      peekIsInside: function() {
        return viewController.mouseInside;
      },
      peekX: viewController.mouseXcor,
      peekY: viewController.mouseYcor
    };
  };

  genPlotOps = function(container, ractive) {
    var display, i, id, len, plotOps, ref, type, widgets;
    widgets = Object.values(ractive.get('widgetObj'));
    plotOps = {};
    for (i = 0, len = widgets.length; i < len; i++) {
      ref = widgets[i], display = ref.display, id = ref.id, type = ref.type;
      if (type === "plot") {
        plotOps[display] = new HighchartsOps(container.querySelector("#netlogo-plot-" + id));
      }
    }
    return plotOps;
  };

  genOutputConfig = function(ractive, appendToConsole) {
    return {
      clear: function() {
        var output;
        output = ractive.findComponent('outputWidget');
        if ((output != null)) {
          return output.setText('');
        }
      },
      write: function(str) {
        var output;
        output = ractive.findComponent('outputWidget');
        if ((output != null)) {
          return output.appendText(str);
        } else {
          return appendToConsole(str);
        }
      }
    };
  };

  genWorldConfig = function(ractive) {
    return {
      resizeWorld: function() {
        var runningForeverButtons, widgets;
        widgets = Object.values(ractive.get('widgetObj'));
        runningForeverButtons = widgets.filter(function(arg) {
          var forever, running, type;
          type = arg.type, forever = arg.forever, running = arg.running;
          return type === "button" && forever && running;
        });
        runningForeverButtons.forEach(function(button) {
          return button.running = false;
        });
      }
    };
  };

  window.genConfigs = function(ractive, viewController, container) {
    var appendToConsole;
    appendToConsole = function(str) {
      return ractive.set('consoleOutput', ractive.get('consoleOutput') + str);
    };
    return {
      dialog: genDialogConfig(viewController),
      importExport: genImportExportConfig(ractive, viewController),
      inspection: genInspectionConfig(),
      mouse: genMouseConfig(viewController),
      output: genOutputConfig(ractive, appendToConsole),
      print: {
        write: appendToConsole
      },
      plotOps: genPlotOps(container, ractive),
      world: genWorldConfig(ractive)
    };
  };

}).call(this);

//# sourceMappingURL=config-shims.js.map
