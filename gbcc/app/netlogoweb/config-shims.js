(function() {
  // (String, Ractive) => ((String) => Unit) => Unit
  var genAsyncDialogConfig, genDialogConfig, genIOConfig, genImportExportConfig, genInspectionConfig, genMouseConfig, genOutputConfig, genPlotOps, genWorldConfig, importFile;

  importFile = function(type, ractive) {
    return function(callback) {
      var elem, listener;
      listener = function(event) {
        var file, reader;
        reader = new FileReader;
        reader.onload = function(e) {
          return callback(e.target.result);
        };
        if (event.target.files.length > 0) {
          file = event.target.files[0];
          if (type === "image" || (type === "any" && file.type.startsWith("image/"))) {
            reader.readAsDataURL(file);
          } else {
            reader.readAsText(file);
          }
        }
        return elem.removeEventListener('change', listener);
      };
      elem = ractive.find('#general-file-input');
      elem.addEventListener('change', listener);
      elem.click();
      elem.value = "";
    };
  };

  // (Ractive, ViewController) => AsyncDialogConfig
  genAsyncDialogConfig = function(ractive, viewController) {
    var clearMouse, tellDialog;
    clearMouse = function() {
      viewController.mouseDown = false;
    };
    tellDialog = function(eventName, ...args) {
      return ractive.findComponent('asyncDialog').fire(eventName, ...args);
    };
    return {
      getChoice: function(message, choices) {
        return function(callback) {
          clearMouse();
          tellDialog('show-chooser', message, choices, callback);
        };
      },
      getText: function(message) {
        return function(callback) {
          clearMouse();
          tellDialog('show-text-input', message, callback);
        };
      },
      getYesOrNo: function(message) {
        return function(callback) {
          clearMouse();
          tellDialog('show-yes-or-no', message, callback);
        };
      },
      showMessage: function(message) {
        return function(callback) {
          clearMouse();
          tellDialog('show-message', message, callback);
        };
      }
    };
  };

  // (ViewController) => DialogConfig
  genDialogConfig = function(viewController) {
    var clearMouse;
    clearMouse = function() {
      viewController.mouseDown = false;
    };
    return {
      // `yesOrNo` should eventually be changed to use a proper synchronous, three-button,
      // customizable dialog... when HTML and JS start to support that. --JAB (6/1/16)

      // Uhh, they probably never will.  Instead, we should favor the `dialog` extension,
      // for which we provide "asyncDialog" shims above. --JAB (4/5/19)
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

  // (Ractive, ViewController) => ImportExportConfig
  genImportExportConfig = function(ractive, viewController) {
    return {
      exportFile: function(contents) {
        return function(filename) {
          window.saveAs(new Blob([contents], {
            type: "text/plain:charset=utf-8"
          }), filename);
        };
      },
      exportBlob: function(blob) {
        return function(filename) {
          return window.saveAs(blob, filename);
        };
      },
      getNlogo: function() {
        var _, result, success, v;
        ({result, success} = (new BrowserCompiler()).exportNlogo({
          info: Tortoise.toNetLogoMarkdown(ractive.get('info')),
          code: ractive.get('code'),
          widgets: (function() {
            var ref, results;
            ref = ractive.get('widgetObj');
            results = [];
            for (_ in ref) {
              v = ref[_];
              results.push(v);
            }
            return results;
          })(),
          turtleShapes: turtleShapes,
          linkShapes: linkShapes
        }));
        if (success) {
          return result;
        } else {
          throw new Error("The current model could not be converted to 'nlogo' format");
        }
      },
      getOutput: function() {
        var ref, ref1;
        return (ref = (ref1 = ractive.findComponent('outputWidget')) != null ? ref1.get('text') : void 0) != null ? ref : ractive.findComponent('console').get('output');
      },
      getViewBase64: function() {
        return viewController.view.visibleCanvas.toDataURL("image/png");
      },
      getViewBlob: function(callback) {
        return viewController.view.visibleCanvas.toBlob(callback, "image/png");
      },
      importFile: function(path) {
        return function(callback) {
          importFile("any", ractive)(callback);
        };
      },
      importModel: function(nlogoContents, modelName) {
        window.postMessage({
          nlogo: nlogoContents,
          path: modelName,
          type: "nlw-load-model"
        }, "*");
      }
    };
  };

  // () => InspectionConfig
  genInspectionConfig = function() {
    var clearDead, inspect, stopInspecting;
    inspect = (function(agent) {
      return window.alert("Agent inspection is not yet implemented");
    });
    stopInspecting = (function(agent) {});
    clearDead = (function() {});
    return {inspect, stopInspecting, clearDead};
  };

  // (Ractive) => IOConfig
  genIOConfig = function(ractive) {
    return {
      importFile: function(filepath) {
        return function(callback) {
          console.warn("Unsupported operation: `importFile`");
        };
      },
      slurpFileDialogAsync: function(callback) {
        importFile("any", ractive)(callback);
      },
      slurpURL: function(url) {
        var combine, contentType, ref, req, response, uint8Str;
        req = new XMLHttpRequest();
        // Setting the async option to `false` is deprecated and "bad" as far as HTML/JS is
        // concerned.  But this is NetLogo and NetLogo model code doesn't have a concept of
        // async execution, so this is the best we can do.  As long as it isn't used on a
        // per-tick basis or in a loop, it should be okay.  -JMB August 2017, JAB (10/25/18)
        req.open("GET", url, false);
        req.overrideMimeType('text\/plain; charset=x-user-defined'); // Get as binary string -- JAB (10/27/18)
        req.send();
        response = req.response;
        contentType = req.getResponseHeader("content-type");
        if (contentType.startsWith("image/")) {
          combine = function(acc, i) {
            return acc + String.fromCharCode(response.charCodeAt(i) & 0xff);
          };
          uint8Str = (function() {
            var results = [];
            for (var j = 0, ref = response.length; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this).reduce(combine, "");
          return `data:${contentType};base64,${btoa(uint8Str)}`;
        } else {
          return response;
        }
      },
      slurpURLAsync: function(url) {
        return function(callback) {
          fetch(url).then(function(response) {
            if (response.headers.get("content-type").startsWith("image/")) {
              return response.blob().then(function(blob) {
                var reader;
                reader = new FileReader;
                reader.onload = function(e) {
                  return callback(e.target.result);
                };
                return reader.readAsDataURL(blob);
              });
            } else {
              return response.text().then(callback);
            }
          });
        };
      }
    };
  };

  // (ViewController) => MouseConfig
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

  // (Element, Ractive) => [HighchartsOps]
  genPlotOps = function(container, ractive) {
    var display, id, j, len, plotOps, type, widgets;
    widgets = Object.values(ractive.get('widgetObj'));
    plotOps = {};
    for (j = 0, len = widgets.length; j < len; j++) {
      ({display, id, type} = widgets[j]);
      if (type === "plot") {
        plotOps[display] = new HighchartsOps(container.querySelector(`#netlogo-plot-${id}`));
      }
    }
    return plotOps;
  };

  // (Ractive, (String) => Unit) => OutputConfig
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

  // (Ractive) => WorldConfig
  genWorldConfig = function(ractive) {
    return {
      resizeWorld: function() {
        var runningForeverButtons, widgets;
        widgets = Object.values(ractive.get('widgetObj'));
        runningForeverButtons = widgets.filter(function({type, forever, running}) {
          return type === "button" && forever && running;
        });
        runningForeverButtons.forEach(function(button) {
          return button.running = false;
        });
      }
    };
  };

  // (Ractive, ViewController, Element) => Configs
  window.genConfigs = function(ractive, viewController, container) {
    var appendToConsole;
    appendToConsole = function(str) {
      return ractive.set('consoleOutput', ractive.get('consoleOutput') + str);
    };
    return {
      asyncDialog: genAsyncDialogConfig(ractive, viewController),
      base64ToImageData: window.synchroDecoder,
      dialog: genDialogConfig(viewController),
      importExport: genImportExportConfig(ractive, viewController),
      inspection: genInspectionConfig(),
      io: genIOConfig(ractive),
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
