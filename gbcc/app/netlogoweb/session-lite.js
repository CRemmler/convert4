(function() {
  var DEFAULT_REDRAW_DELAY, FAST_UPDATE_EXP, MAX_REDRAW_DELAY, MAX_UPDATE_DELAY, MAX_UPDATE_TIME, NETLOGO_VERSION, REDRAW_EXP, SLOW_UPDATE_EXP, codeCompile, globalEval, now, ref, ref1,
    splice = [].splice;

  MAX_UPDATE_DELAY = 1000;

  FAST_UPDATE_EXP = 0.5;

  SLOW_UPDATE_EXP = 4;

  MAX_UPDATE_TIME = 100;

  DEFAULT_REDRAW_DELAY = 1000 / 30;

  MAX_REDRAW_DELAY = 1000;

  REDRAW_EXP = 2;

  NETLOGO_VERSION = '2.5.2';

  codeCompile = function(code, commands, reporters, widgets, onFulfilled, onErrors) {
    var compileParams, ex;
    compileParams = {
      code: code,
      widgets: widgets,
      commands: commands,
      reporters: reporters,
      turtleShapes: typeof turtleShapes !== "undefined" && turtleShapes !== null ? turtleShapes : [],
      linkShapes: typeof linkShapes !== "undefined" && linkShapes !== null ? linkShapes : []
    };
    try {
      return onFulfilled((new BrowserCompiler()).fromModel(compileParams));
    } catch (error) {
      ex = error;
      return onErrors([ex]);
    } finally {
      Tortoise.finishLoading();
    }
  };

  // performance.now gives submillisecond timing, which improves the event loop
  // for models with submillisecond go procedures. Unfortunately, iOS Safari
  // doesn't support it. BCH 10/3/2014
  now = (ref = typeof performance !== "undefined" && performance !== null ? performance.now.bind(performance) : void 0) != null ? ref : Date.now.bind(Date);

  // See http://perfectionkills.com/global-eval-what-are-the-options/ for what
  // this is doing. This is a holdover till we get the model attaching to an
  // object instead of global namespace. - BCH 11/3/2014
  globalEval = eval;

  window.AgentModel = tortoise_require('agentmodel');

  window.SessionLite = (function() {
    class SessionLite {
      
      // (Element|String, Array[Widget], String, String, Boolean, String, String, Boolean, (String) => Unit)
      constructor(container, widgets, code, info, readOnly, filename, modelJS, lastCompileFailed, displayError) {
        var checkIsReporter, ref1;
        this.eventLoop = this.eventLoop.bind(this);
        this.promptFilename = this.promptFilename.bind(this);
        this.displayError = displayError;
        checkIsReporter = (str) => {
          var compileRequest;
          compileRequest = {
            code: this.widgetController.code(),
            widgets: this.widgetController.widgets()
          };
          return (new BrowserCompiler()).isReporter(str, compileRequest);
        };
        this._eventLoopTimeout = -1;
        this._lastRedraw = 0;
        this._lastUpdate = 0;
        this.drawEveryFrame = false;
        this.widgetController = initializeUI(container, widgets, code, info, readOnly, filename, checkIsReporter);
        this.widgetController.ractive.on('*.recompile', (_, callback) => {
          return this.recompile(callback);
        });
        this.widgetController.ractive.on('*.recompile-lite', (_, callback) => {
          return this.recompileLite(callback);
        });
        this.widgetController.ractive.on('export-nlogo', (_, event) => {
          return this.exportNlogo(event);
        });
        this.widgetController.ractive.on('export-html', (_, event) => {
          return this.exportHtml(event);
        });
        this.widgetController.ractive.on('open-new-file', (_, event) => {
          return this.openNewFile();
        });
        this.widgetController.ractive.on('console.run', (_, code, errorLog) => {
          return this.run(code, errorLog);
        });
        this.widgetController.ractive.set('lastCompileFailed', lastCompileFailed);
        this.widgetController.ractive.on('console.compileObserverCode', (key, value) => {
          return this.run(key, value);
        });
        this.widgetController.ractive.on('console.compileTurtleCode', (who, key, value) => {
          return this.run(who, key, value);
        });
        this.widgetController.ractive.on('console.compilePatchCode', (pxcor, pycor, key, value) => {
          return this.run(pxcor, pycor, key, value);
        });
        this.widgetController.ractive.on('console.runObserverCode', (key) => {
          return this.run(key);
        });
        this.widgetController.ractive.on('console.runTurtleCode', (who, key) => {
          return this.run(who, key);
        });
        this.widgetController.ractive.on('console.runPatchCode', (pxcor, pycor, key) => {
          return this.run(pxcor, pycor, key);
        });
        this.drawEveryFrame = false;
        window.modelConfig = Object.assign((ref1 = window.modelConfig) != null ? ref1 : {}, this.widgetController.configs);
        window.modelConfig.version = NETLOGO_VERSION;
        globalEval(modelJS);
      }

      modelTitle() {
        return this.widgetController.ractive.get('modelTitle');
      }

      startLoop() {
        if (procedures.startup != null) {
          window.handlingErrors(procedures.startup)();
        }
        this.widgetController.redraw();
        this.widgetController.updateWidgets();
        return requestAnimationFrame(this.eventLoop);
      }

      updateDelay() {
        var delay, speed, speedFactor, viewWidget;
        viewWidget = this.widgetController.widgets().filter(function({type}) {
          return type === 'view';
        })[0];
        speed = this.widgetController.speed();
        delay = 1000 / viewWidget.frameRate;
        if (speed > 0) {
          speedFactor = Math.pow(Math.abs(speed), FAST_UPDATE_EXP);
          return delay * (1 - speedFactor);
        } else {
          speedFactor = Math.pow(Math.abs(speed), SLOW_UPDATE_EXP);
          return MAX_UPDATE_DELAY * speedFactor + delay * (1 - speedFactor);
        }
      }

      redrawDelay() {
        var speed, speedFactor;
        speed = this.widgetController.speed();
        if (speed > 0) {
          speedFactor = Math.pow(Math.abs(this.widgetController.speed()), REDRAW_EXP);
          return MAX_REDRAW_DELAY * speedFactor + DEFAULT_REDRAW_DELAY * (1 - speedFactor);
        } else {
          return DEFAULT_REDRAW_DELAY;
        }
      }

      eventLoop(timestamp) {
        var i, j, maxNumUpdates, ref1, updatesDeadline;
        this._eventLoopTimeout = requestAnimationFrame(this.eventLoop);
        updatesDeadline = Math.min(this._lastRedraw + this.redrawDelay(), now() + MAX_UPDATE_TIME);
        maxNumUpdates = this.drawEveryFrame ? 1 : (now() - this._lastUpdate) / this.updateDelay();
        if (!this.widgetController.ractive.get('isEditing')) {
// maxNumUpdates can be 0. Need to guarantee i is ascending.
          for (i = j = 1, ref1 = maxNumUpdates; j <= ref1; i = j += 1) {
            this._lastUpdate = now();
            this.widgetController.runForevers();
            if (now() >= updatesDeadline) {
              break;
            }
          }
        }
        if (Updater.hasUpdates()) {
          // First conditional checks if we're on time with updates. If so, we may as
          // well redraw. This keeps animations smooth for fast models. BCH 11/4/2014
          if (i > maxNumUpdates || now() - this._lastRedraw > this.redrawDelay() || this.drawEveryFrame) {
            this._lastRedraw = now();
            this.widgetController.redraw();
          }
        }
        // Widgets must always be updated, because global variables and plots can be
        // altered without triggering an "update".  That is to say that `Updater`
        // only concerns itself with View updates. --JAB (9/2/15)
        return this.widgetController.updateWidgets();
      }

      teardown() {
        this.widgetController.teardown();
        return cancelAnimationFrame(this._eventLoopTimeout);
      }

      // (() => Unit) => Unit
      recompileLite(successCallback = (function() {})) {
        var lastCompileFailed, someWidgetIsFailing;
        lastCompileFailed = this.widgetController.ractive.get('lastCompileFailed');
        someWidgetIsFailing = this.widgetController.widgets().some(function(w) {
          var ref1;
          return ((ref1 = w.compilation) != null ? ref1.success : void 0) === false;
        });
        if (lastCompileFailed || someWidgetIsFailing) {
          this.recompile(successCallback);
        }
      }

      // (() => Unit) => Unit
      recompile(successCallback = (function() {})) {
        var code, oldWidgets, onCompile;
        code = this.widgetController.code();
        oldWidgets = this.widgetController.widgets();
        onCompile = (res) => {
          var state;
          if (res.model.success) {
            state = world.exportState();
            world.clearAll();
            this.widgetController.redraw(); // Redraw right before `Updater` gets clobbered --JAB (2/27/18)
            globalEval(res.model.result);
            world.importState(state);
            this.widgetController.ractive.set('isStale', false);
            this.widgetController.ractive.set('lastCompiledCode', code);
            this.widgetController.ractive.set('lastCompileFailed', false);
            this.widgetController.redraw();
            this.widgetController.freshenUpWidgets(oldWidgets, globalEval(res.widgets));
            return successCallback();
          } else {
            this.widgetController.ractive.set('lastCompileFailed', true);
            res.model.result.forEach((r) => {
              return r.lineNumber = code.slice(0, r.start).split("\n").length;
            });
            return this.alertCompileError(res.model.result);
          }
        };
        return Tortoise.startLoading(() => {
          return codeCompile(code, [], [], oldWidgets, onCompile, this.alertCompileError);
        });
      }

      getNlogo() {
        return (new BrowserCompiler()).exportNlogo({
          info: Tortoise.toNetLogoMarkdown(this.widgetController.ractive.get('info')),
          code: this.widgetController.ractive.get('code'),
          widgets: this.widgetController.widgets(),
          turtleShapes: turtleShapes,
          linkShapes: linkShapes
        });
      }

      exportNlogo() {
        var exportBlob, exportName, exportedNLogo;
        exportName = this.promptFilename(".nlogo");
        if (exportName != null) {
          exportedNLogo = this.getNlogo();
          if (exportedNLogo.success) {
            exportBlob = new Blob([exportedNLogo.result], {
              type: "text/plain:charset=utf-8"
            });
            return saveAs(exportBlob, exportName);
          } else {
            return this.alertCompileError(exportedNLogo.result);
          }
        }
      }

      promptFilename(extension) {
        var suggestion;
        suggestion = this.modelTitle() + extension;
        return window.prompt('Filename:', suggestion);
      }

      exportHtml() {
        var exportName;
        exportName = this.promptFilename(".html");
        if (exportName != null) {
          window.req = new XMLHttpRequest();
          req.open('GET', standaloneURL);
          req.onreadystatechange = () => {
            var dom, exportBlob, nlogo, nlogoScript, parser, wrapper;
            if (req.readyState === req.DONE) {
              if (req.status === 200) {
                nlogo = this.getNlogo();
                if (nlogo.success) {
                  parser = new DOMParser();
                  dom = parser.parseFromString(req.responseText, "text/html");
                  nlogoScript = dom.querySelector("#nlogo-code");
                  nlogoScript.textContent = nlogo.result;
                  nlogoScript.dataset.filename = exportName.replace(/\.html$/, ".nlogo");
                  wrapper = document.createElement("div");
                  wrapper.appendChild(dom.documentElement);
                  exportBlob = new Blob([wrapper.innerHTML], {
                    type: "text/html:charset=utf-8"
                  });
                  return saveAs(exportBlob, exportName);
                } else {
                  return this.alertCompileError(nlogo.result);
                }
              } else {
                return alert("Couldn't get standalone page");
              }
            }
          };
          return req.send("");
        }
      }

      // () => Unit
      openNewFile() {
        if (confirm('Are you sure you want to open a new model?  You will lose any changes that you have not exported.')) {
          parent.postMessage({
            hash: "NewModel",
            type: "nlw-set-hash"
          }, "*");
          window.postMessage({
            type: "nlw-open-new"
          }, "*");
        }
      }

      // (Object[Any], ([{ config: Object[Any], results: Object[Array[Any]] }]) => Unit) => Unit
      asyncRunBabyBehaviorSpace(config, reaction) {
        return Tortoise.startLoading(() => {
          reaction(this.runBabyBehaviorSpace(config));
          return Tortoise.finishLoading();
        });
      }

      // (Object[Any]) => [{ config: Object[Any], results: Object[Array[Any]] }]
      runBabyBehaviorSpace({experimentName, parameterSet, repetitionsPerCombo, metrics, setupCode, goCode, stopConditionCode, iterationLimit}) {
        var _, compiledMetrics, convert, go, last, map, massagedConfig, metricFs, miniDump, pipeline, ref1, result, setGlobal, setup, stopCondition, toObject, unwrapCompilation, zip;
        ({last, map, toObject, zip} = tortoise_require('brazier/array'));
        ({pipeline} = tortoise_require('brazier/function'));
        result = (new BrowserCompiler()).fromModel({
          code: this.widgetController.code(),
          widgets: this.widgetController.widgets(),
          commands: [setupCode, goCode],
          reporters: metrics.map(function(m) {
            return m.reporter;
          }).concat([stopConditionCode]),
          turtleShapes: [],
          linkShapes: []
        });
        unwrapCompilation = function(prefix, defaultCode) {
          return function({
              result: compiledCode,
              success
            }) {
            return new Function(`${prefix}${(success ? compiledCode : defaultCode)}`);
          };
        };
        [setup, go] = result.commands.map(unwrapCompilation("", ""));
        ref1 = result.reporters.map(unwrapCompilation("return ", "-1")), [...metricFs] = ref1, [_] = splice.call(metricFs, -1);
        stopCondition = unwrapCompilation("return ", "false")(last(result.reporters));
        convert = function([{reporter, interval}, f]) {
          return [
            reporter,
            {
              reporter: f,
              interval
            }
          ];
        };
        compiledMetrics = pipeline(zip(metrics), map(convert), toObject)(metricFs);
        massagedConfig = {
          experimentName,
          parameterSet,
          repetitionsPerCombo,
          metrics: compiledMetrics,
          setup,
          go,
          stopCondition,
          iterationLimit
        };
        setGlobal = world.observer.setGlobal.bind(world.observer);
        miniDump = function(x) {
          var ref2;
          if (Array.isArray(x)) {
            return x.map(miniDump);
          } else if ((ref2 = typeof x) === "boolean" || ref2 === "number" || ref2 === "string") {
            return x;
          } else {
            return workspace.dump(x);
          }
        };
        return window.runBabyBehaviorSpace(massagedConfig, setGlobal, miniDump);
      }

      // (String, (Array[String]) => Unit) => Unit
      run(code, errorLog) {
        var compileErrorLog;
        compileErrorLog = (result) => {
          return this.alertCompileError(result, errorLog);
        };
        Tortoise.startLoading();
        return codeCompile(this.widgetController.code(), [code], [], this.widgetController.widgets(), ({
            commands,
            model: {
              result: modelResult,
              success: modelSuccess
            }
          }) => {
          var ex, result, success;
          if (modelSuccess) {
            [{result, success}] = commands;
            if (success) {
              try {
                return window.handlingErrors(new Function(result))(errorLog);
              } catch (error) {
                ex = error;
                if (!(ex instanceof Exception.HaltInterrupt)) {
                  throw ex;
                }
              }
            } else {
              return compileErrorLog(result);
            }
          } else {
            return compileErrorLog(modelResult);
          }
        }, compileErrorLog);
      }

      // (String, (String, Array[{ message: String}]) => String) =>
      //  { success: true, value: Any } | { success: false, error: String }
      runReporter(code, errorLog) {
        var compileParams, compileResult, ex, message, modelResult, modelSuccess, reporter, reporterValue, reporters, result, success;
        errorLog = errorLog != null ? errorLog : function(prefix, errs) {
          var message;
          message = `${prefix}: ${errs.map(function(err) {
            return err.message;
          })}`;
          console.error(message);
          return message;
        };
        compileParams = {
          code: this.widgetController.code(),
          widgets: this.widgetController.widgets(),
          commands: [],
          reporters: [code],
          turtleShapes: typeof turtleShapes !== "undefined" && turtleShapes !== null ? turtleShapes : [],
          linkShapes: typeof linkShapes !== "undefined" && linkShapes !== null ? linkShapes : []
        };
        compileResult = (new BrowserCompiler()).fromModel(compileParams);
        ({
          reporters,
          model: {
            result: modelResult,
            success: modelSuccess
          }
        } = compileResult);
        if (!modelSuccess) {
          message = errorLog("Compiler error", modelResult);
          return {
            success: false,
            error: message
          };
        }
        [{result, success}] = reporters;
        if (!success) {
          message = errorLog("Reporter error", result);
          return {
            success: false,
            error: message
          };
        }
        reporter = new Function(`return ( ${result} );`);
        try {
          reporterValue = reporter();
          return {
            success: true,
            value: reporterValue
          };
        } catch (error) {
          ex = error;
          message = errorLog("Runtime error", [ex]);
          return {
            success: false,
            error: message
          };
        }
      }

      alertCompileError(result, errorLog = this.alertErrors) {
        return errorLog(result.map(function(err) {
          if (err.lineNumber != null) {
            return `(Line ${err.lineNumber}) ${err.message}`;
          } else {
            return err.message;
          }
        }));
      }

      alertErrors(messages) {
        return this.displayError(messages.join('\n'));
      }

      compileObserverCode(key, value) {
        return this.compileCodeAndSet(key, value);
      }

      compileTurtleCode(who, key, value) {
        value = "ask turtle " + who + " [ " + value + " ]";
        key = who + ":" + key;
        return this.compileCodeAndSet(key, value);
      }

      compilePatchCode(pxcor, pycor, key, value) {
        value = "ask patch " + pxcor + " " + pycor + " [ " + value + " ]";
        key = pxcor + ":" + pycor + ":" + key;
        return this.compileCodeAndSet(key, value);
      }

      runObserverCode(key) {
        var messageTag;
        messageTag = key;
        return this.runCode(myData[messageTag]);
      }

      runTurtleCode(who, key) {
        var messageTag;
        messageTag = who + ":" + key;
        return this.runCode(myData[messageTag]);
      }

      runPatchCode(pxcor, pycor, key) {
        var messageTag;
        messageTag = pxcor + ":" + pycor + ":" + key;
        return this.runCode(myData[messageTag]);
      }

      compileCodeAndSet(messageTag, code) {
        return codeCompile(this.widgetController.code(), [code], [], this.widgetController.widgets(), ({
            commands,
            model: {
              result: modelResult,
              success: modelSuccess
            }
          }) => {
          var result, success;
          if (modelSuccess) {
            [{result, success}] = commands;
            if (success) {
              socket.emit('send reporter', {
                hubnetMessageSource: "server",
                hubnetMessageTag: messageTag,
                hubnetMessage: result
              });
              return myData[messageTag] = result;
            } else {
              return this.alertCompileError(result);
            }
          } else {
            return this.alertCompileError(modelResult);
          }
        }, this.alertCompileError);
      }

      runCode(code) {
        var ex;
        try {
          return window.handlingErrors(new Function(code))();
        } catch (error) {
          ex = error;
          if (!(ex instanceof Exception.HaltInterrupt)) {
            throw ex;
          }
        }
      }

    };

    SessionLite.prototype.widgetController = void 0; // WidgetController

    return SessionLite;

  }).call(this);

  // See http://perfectionkills.com/global-eval-what-are-the-options/ for what
  // this is doing. This is a holdover till we get the model attaching to an
  // object instead of global namespace. - BCH 11/3/2014
  globalEval = eval;

  window.AgentModel = tortoise_require('agentmodel');

  window.codeCompile = function(code, commands, reporters, widgets, onFulfilled, onErrors) {
    var compileParams, ex;
    compileParams = {
      code: code,
      widgets: widgets,
      commands: commands,
      reporters: reporters,
      turtleShapes: typeof turtleShapes !== "undefined" && turtleShapes !== null ? turtleShapes : [],
      linkShapes: typeof linkShapes !== "undefined" && linkShapes !== null ? linkShapes : []
    };
    try {
      return onFulfilled((new BrowserCompiler()).fromModel(compileParams));
    } catch (error) {
      ex = error;
      return onErrors([ex]);
    } finally {
      Tortoise.finishLoading();
    }
  };

  window.serverNlogoCompile = function(model, commands, reporters, widgets, onFulfilled) {
    var compileCallback, compileParams;
    compileParams = {
      model: model,
      commands: JSON.stringify(commands),
      reporters: JSON.stringify(reporters)
    };
    compileCallback = function(res) {
      return onFulfilled(JSON.parse(res));
    };
    return ajax('/compile-nlogo', compileParams, compileCallback);
  };

  window.serverCodeCompile = function(code, commands, reporters, widgets, onFulfilled) {
    var compileCallback, compileParams;
    compileParams = {
      code,
      widgets: JSON.stringify(widgets),
      commands: JSON.stringify(commands),
      reporters: JSON.stringify(reporters),
      turtleShapes: JSON.stringify(typeof turtleShapes !== "undefined" && turtleShapes !== null ? turtleShapes : []),
      linkShapes: JSON.stringify(typeof linkShapes !== "undefined" && linkShapes !== null ? linkShapes : [])
    };
    compileCallback = function(res) {
      return onFulfilled(JSON.parse(res));
    };
    return ajax('/compile-code', compileParams, compileCallback);
  };

  window.ajax = function(url, params, callback) {
    var key, paramPairs, req, value;
    paramPairs = (function() {
      var results;
      results = [];
      for (key in params) {
        value = params[key];
        results.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
      return results;
    })();
    req = new XMLHttpRequest();
    req.open('POST', url);
    req.onreadystatechange = function() {
      if (req.readyState === req.DONE) {
        return callback(req.responseText);
      }
    };
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    return req.send(paramPairs.join('&'));
  };

  // performance.now gives submillisecond timing, which improves the event loop
  // for models with submillisecond go procedures. Unfortunately, iOS Safari
  // doesn't support it. BCH 10/3/2014
  now = (ref1 = typeof performance !== "undefined" && performance !== null ? performance.now.bind(performance) : void 0) != null ? ref1 : Date.now.bind(Date);

}).call(this);

//# sourceMappingURL=session-lite.js.map
