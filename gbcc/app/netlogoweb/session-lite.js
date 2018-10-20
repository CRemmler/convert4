(function() {
  var DEFAULT_REDRAW_DELAY, FAST_UPDATE_EXP, MAX_REDRAW_DELAY, MAX_UPDATE_DELAY, MAX_UPDATE_TIME, NETLOGO_VERSION, REDRAW_EXP, SLOW_UPDATE_EXP, codeCompile, globalEval, now, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

  MAX_UPDATE_DELAY = 1000;

  FAST_UPDATE_EXP = 0.5;

  SLOW_UPDATE_EXP = 4;

  MAX_UPDATE_TIME = 100;

  DEFAULT_REDRAW_DELAY = 1000 / 30;

  MAX_REDRAW_DELAY = 1000;

  REDRAW_EXP = 2;

  NETLOGO_VERSION = '2.4.0';

  codeCompile = function(code, commands, reporters, widgets, onFulfilled, onErrors) {
    var compileParams, error, ex;
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

  now = (ref = typeof performance !== "undefined" && performance !== null ? performance.now.bind(performance) : void 0) != null ? ref : Date.now.bind(Date);

  globalEval = eval;

  window.AgentModel = tortoise_require('agentmodel');

  window.SessionLite = (function() {
    SessionLite.prototype.widgetController = void 0;

    function SessionLite(container, widgets, code, info, readOnly, filename, modelJS, lastCompileFailed, displayError) {
      var checkIsReporter, ref1;
      this.displayError = displayError;
      this.promptFilename = bind(this.promptFilename, this);
      this.eventLoop = bind(this.eventLoop, this);
      checkIsReporter = (function(_this) {
        return function(str) {
          var compileRequest;
          compileRequest = {
            code: _this.widgetController.code(),
            widgets: _this.widgetController.widgets()
          };
          return (new BrowserCompiler()).isReporter(str, compileRequest);
        };
      })(this);
      this._eventLoopTimeout = -1;
      this._lastRedraw = 0;
      this._lastUpdate = 0;
      this.drawEveryFrame = false;
      this.widgetController = initializeUI(container, widgets, code, info, readOnly, filename, checkIsReporter);
      this.widgetController.ractive.on('*.recompile', (function(_this) {
        return function(_, callback) {
          return _this.recompile(callback);
        };
      })(this));
      this.widgetController.ractive.on('*.recompile-lite', (function(_this) {
        return function(_, callback) {
          return _this.recompileLite(callback);
        };
      })(this));
      this.widgetController.ractive.on('export-nlogo', (function(_this) {
        return function(_, event) {
          return _this.exportNlogo(event);
        };
      })(this));
      this.widgetController.ractive.on('export-html', (function(_this) {
        return function(_, event) {
          return _this.exportHtml(event);
        };
      })(this));
      this.widgetController.ractive.on('open-new-file', (function(_this) {
        return function(_, event) {
          return _this.openNewFile();
        };
      })(this));
      this.widgetController.ractive.on('console.run', (function(_this) {
        return function(_, code, errorLog) {
          return _this.run(code, errorLog);
        };
      })(this));
      this.widgetController.ractive.set('lastCompileFailed', lastCompileFailed);
      this.widgetController.ractive.on('console.compileObserverCode', (function(_this) {
        return function(key, value) {
          return _this.run(key, value);
        };
      })(this));
      this.widgetController.ractive.on('console.compileTurtleCode', (function(_this) {
        return function(who, key, value) {
          return _this.run(who, key, value);
        };
      })(this));
      this.widgetController.ractive.on('console.compilePatchCode', (function(_this) {
        return function(pxcor, pycor, key, value) {
          return _this.run(pxcor, pycor, key, value);
        };
      })(this));
      this.widgetController.ractive.on('console.runObserverCode', (function(_this) {
        return function(key) {
          return _this.run(key);
        };
      })(this));
      this.widgetController.ractive.on('console.runTurtleCode', (function(_this) {
        return function(who, key) {
          return _this.run(who, key);
        };
      })(this));
      this.widgetController.ractive.on('console.runPatchCode', (function(_this) {
        return function(pxcor, pycor, key) {
          return _this.run(pxcor, pycor, key);
        };
      })(this));
      this.drawEveryFrame = false;
      window.modelConfig = Object.assign((ref1 = window.modelConfig) != null ? ref1 : {}, this.widgetController.configs);
      window.modelConfig.version = NETLOGO_VERSION;
      globalEval(modelJS);
    }

    SessionLite.prototype.modelTitle = function() {
      return this.widgetController.ractive.get('modelTitle');
    };

    SessionLite.prototype.startLoop = function() {
      if (procedures.startup != null) {
        window.handlingErrors(procedures.startup)();
      }
      this.widgetController.redraw();
      this.widgetController.updateWidgets();
      return requestAnimationFrame(this.eventLoop);
    };

    SessionLite.prototype.updateDelay = function() {
      var delay, speed, speedFactor, viewWidget;
      viewWidget = this.widgetController.widgets().filter(function(arg) {
        var type;
        type = arg.type;
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
    };

    SessionLite.prototype.redrawDelay = function() {
      var speed, speedFactor;
      speed = this.widgetController.speed();
      if (speed > 0) {
        speedFactor = Math.pow(Math.abs(this.widgetController.speed()), REDRAW_EXP);
        return MAX_REDRAW_DELAY * speedFactor + DEFAULT_REDRAW_DELAY * (1 - speedFactor);
      } else {
        return DEFAULT_REDRAW_DELAY;
      }
    };

    SessionLite.prototype.eventLoop = function(timestamp) {
      var i, j, maxNumUpdates, ref1, updatesDeadline;
      this._eventLoopTimeout = requestAnimationFrame(this.eventLoop);
      updatesDeadline = Math.min(this._lastRedraw + this.redrawDelay(), now() + MAX_UPDATE_TIME);
      maxNumUpdates = this.drawEveryFrame ? 1 : (now() - this._lastUpdate) / this.updateDelay();
      if (!this.widgetController.ractive.get('isEditing')) {
        for (i = j = 1, ref1 = maxNumUpdates; j <= ref1; i = j += 1) {
          this._lastUpdate = now();
          this.widgetController.runForevers();
          if (now() >= updatesDeadline) {
            break;
          }
        }
      }
      if (Updater.hasUpdates()) {
        if (i > maxNumUpdates || now() - this._lastRedraw > this.redrawDelay() || this.drawEveryFrame) {
          this._lastRedraw = now();
          this.widgetController.redraw();
        }
      }
      return this.widgetController.updateWidgets();
    };

    SessionLite.prototype.teardown = function() {
      this.widgetController.teardown();
      return cancelAnimationFrame(this._eventLoopTimeout);
    };

    SessionLite.prototype.recompileLite = function(successCallback) {
      var lastCompileFailed, someWidgetIsFailing;
      if (successCallback == null) {
        successCallback = (function() {});
      }
      lastCompileFailed = this.widgetController.ractive.get('lastCompileFailed');
      someWidgetIsFailing = this.widgetController.widgets().some(function(w) {
        var ref1;
        return ((ref1 = w.compilation) != null ? ref1.success : void 0) === false;
      });
      if (lastCompileFailed || someWidgetIsFailing) {
        this.recompile(successCallback);
      }
    };

    SessionLite.prototype.recompile = function(successCallback) {
      var code, oldWidgets, onCompile;
      if (successCallback == null) {
        successCallback = (function() {});
      }
      code = this.widgetController.code();
      oldWidgets = this.widgetController.widgets();
      onCompile = (function(_this) {
        return function(res) {
          var state;
          if (res.model.success) {
            state = world.exportState();
            world.clearAll();
            _this.widgetController.redraw();
            globalEval(res.model.result);
            world.importState(state);
            _this.widgetController.ractive.set('isStale', false);
            _this.widgetController.ractive.set('lastCompiledCode', code);
            _this.widgetController.ractive.set('lastCompileFailed', false);
            _this.widgetController.redraw();
            _this.widgetController.freshenUpWidgets(oldWidgets, globalEval(res.widgets));
            return successCallback();
          } else {
            _this.widgetController.ractive.set('lastCompileFailed', true);
            return _this.alertCompileError(res.model.result);
          }
        };
      })(this);
      return Tortoise.startLoading((function(_this) {
        return function() {
          return codeCompile(code, [], [], oldWidgets, onCompile, _this.alertCompileError);
        };
      })(this));
    };

    SessionLite.prototype.getNlogo = function() {
      return (new BrowserCompiler()).exportNlogo({
        info: Tortoise.toNetLogoMarkdown(this.widgetController.ractive.get('info')),
        code: this.widgetController.ractive.get('code'),
        widgets: this.widgetController.widgets(),
        turtleShapes: turtleShapes,
        linkShapes: linkShapes
      });
    };

    SessionLite.prototype.exportNlogo = function() {
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
    };

    SessionLite.prototype.promptFilename = function(extension) {
      var suggestion;
      suggestion = this.modelTitle() + extension;
      return window.prompt('Filename:', suggestion);
    };

    SessionLite.prototype.exportHtml = function() {
      var exportName;
      exportName = this.promptFilename(".html");
      if (exportName != null) {
        window.req = new XMLHttpRequest();
        req.open('GET', standaloneURL);
        req.onreadystatechange = (function(_this) {
          return function() {
            var dom, exportBlob, nlogo, nlogoScript, parser, wrapper;
            if (req.readyState === req.DONE) {
              if (req.status === 200) {
                nlogo = _this.getNlogo();
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
                  return _this.alertCompileError(nlogo.result);
                }
              } else {
                return alert("Couldn't get standalone page");
              }
            }
          };
        })(this);
        return req.send("");
      }
    };

    SessionLite.prototype.openNewFile = function() {
      if (confirm('Are you sure you want to open a new model?  You will lose any changes that you have not exported.')) {
        parent.postMessage({
          hash: "NewModel",
          type: "nlw-set-hash"
        }, "*");
        window.postMessage({
          type: "nlw-open-new"
        }, "*");
      }
    };

    SessionLite.prototype.asyncRunBabyBehaviorSpace = function(config, reaction) {
      return Tortoise.startLoading((function(_this) {
        return function() {
          reaction(_this.runBabyBehaviorSpace(config));
          return Tortoise.finishLoading();
        };
      })(this));
    };

    SessionLite.prototype.runBabyBehaviorSpace = function(arg) {
      var _, compiledMetrics, convert, experimentName, go, goCode, iterationLimit, j, last, map, massagedConfig, metricFs, metrics, miniDump, parameterSet, pipeline, ref1, ref2, ref3, repetitionsPerCombo, result, setGlobal, setup, setupCode, stopCondition, stopConditionCode, toObject, unwrapCompilation, zip;
      experimentName = arg.experimentName, parameterSet = arg.parameterSet, repetitionsPerCombo = arg.repetitionsPerCombo, metrics = arg.metrics, setupCode = arg.setupCode, goCode = arg.goCode, stopConditionCode = arg.stopConditionCode, iterationLimit = arg.iterationLimit;
      ref1 = tortoise_require('brazier/array'), last = ref1.last, map = ref1.map, toObject = ref1.toObject, zip = ref1.zip;
      pipeline = tortoise_require('brazier/function').pipeline;
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
        return function(arg1) {
          var compiledCode, success;
          compiledCode = arg1.result, success = arg1.success;
          return new Function("" + prefix + (success ? compiledCode : defaultCode));
        };
      };
      ref2 = result.commands.map(unwrapCompilation("", "")), setup = ref2[0], go = ref2[1];
      ref3 = result.reporters.map(unwrapCompilation("return ", "-1")), metricFs = 2 <= ref3.length ? slice.call(ref3, 0, j = ref3.length - 1) : (j = 0, []), _ = ref3[j++];
      stopCondition = unwrapCompilation("return ", "false")(last(result.reporters));
      convert = function(arg1) {
        var f, interval, ref4, reporter;
        (ref4 = arg1[0], reporter = ref4.reporter, interval = ref4.interval), f = arg1[1];
        return [
          reporter, {
            reporter: f,
            interval: interval
          }
        ];
      };
      compiledMetrics = pipeline(zip(metrics), map(convert), toObject)(metricFs);
      massagedConfig = {
        experimentName: experimentName,
        parameterSet: parameterSet,
        repetitionsPerCombo: repetitionsPerCombo,
        metrics: compiledMetrics,
        setup: setup,
        go: go,
        stopCondition: stopCondition,
        iterationLimit: iterationLimit
      };
      setGlobal = world.observer.setGlobal.bind(world.observer);
      miniDump = function(x) {
        var ref4;
        if (Array.isArray(x)) {
          return x.map(miniDump);
        } else if ((ref4 = typeof x) === "boolean" || ref4 === "number" || ref4 === "string") {
          return x;
        } else {
          return workspace.dump(x);
        }
      };
      return window.runBabyBehaviorSpace(massagedConfig, setGlobal, miniDump);
    };

    SessionLite.prototype.run = function(code, errorLog) {
      var compileErrorLog;
      compileErrorLog = (function(_this) {
        return function(result) {
          return _this.alertCompileError(result, errorLog);
        };
      })(this);
      Tortoise.startLoading();
      return codeCompile(this.widgetController.code(), [code], [], this.widgetController.widgets(), (function(_this) {
        return function(arg) {
          var commands, error, ex, modelResult, modelSuccess, ref1, ref2, result, success;
          commands = arg.commands, (ref1 = arg.model, modelResult = ref1.result, modelSuccess = ref1.success);
          if (modelSuccess) {
            ref2 = commands[0], result = ref2.result, success = ref2.success;
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
        };
      })(this), compileErrorLog);
    };

    SessionLite.prototype.alertCompileError = function(result, errorLog) {
      if (errorLog == null) {
        errorLog = this.alertErrors;
      }
      return errorLog(result.map(function(err) {
        return err.message;
      }));
    };

    SessionLite.prototype.alertErrors = function(messages) {
      return this.displayError(messages.join('\n'));
    };

    SessionLite.prototype.compileObserverCode = function(key, value) {
      return this.compileCodeAndSet(key, value);
    };

    SessionLite.prototype.compileTurtleCode = function(who, key, value) {
      value = "ask turtle " + who + " [ " + value + " ]";
      key = who + ":" + key;
      return this.compileCodeAndSet(key, value);
    };

    SessionLite.prototype.compilePatchCode = function(pxcor, pycor, key, value) {
      value = "ask patch " + pxcor + " " + pycor + " [ " + value + " ]";
      key = pxcor + ":" + pycor + ":" + key;
      return this.compileCodeAndSet(key, value);
    };

    SessionLite.prototype.runObserverCode = function(key) {
      var messageTag;
      messageTag = key;
      return this.runCode(myData[messageTag]);
    };

    SessionLite.prototype.runTurtleCode = function(who, key) {
      var messageTag;
      messageTag = who + ":" + key;
      return this.runCode(myData[messageTag]);
    };

    SessionLite.prototype.runPatchCode = function(pxcor, pycor, key) {
      var messageTag;
      messageTag = pxcor + ":" + pycor + ":" + key;
      return this.runCode(myData[messageTag]);
    };

    SessionLite.prototype.compileCodeAndSet = function(messageTag, code) {
      return codeCompile(this.widgetController.code(), [code], [], this.widgetController.widgets(), (function(_this) {
        return function(arg) {
          var commands, modelResult, modelSuccess, ref1, ref2, result, success;
          commands = arg.commands, (ref1 = arg.model, modelResult = ref1.result, modelSuccess = ref1.success);
          if (modelSuccess) {
            ref2 = commands[0], result = ref2.result, success = ref2.success;
            if (success) {
              socket.emit('send reporter', {
                hubnetMessageSource: "server",
                hubnetMessageTag: messageTag,
                hubnetMessage: result
              });
              return myData[messageTag] = result;
            } else {
              return _this.alertCompileError(result);
            }
          } else {
            return _this.alertCompileError(modelResult);
          }
        };
      })(this), this.alertCompileError);
    };

    SessionLite.prototype.runCode = function(code) {
      var error, ex;
      try {
        return window.handlingErrors(new Function(code))();
      } catch (error) {
        ex = error;
        if (!(ex instanceof Exception.HaltInterrupt)) {
          throw ex;
        }
      }
    };

    return SessionLite;

  })();

  globalEval = eval;

  window.AgentModel = tortoise_require('agentmodel');

  window.codeCompile = function(code, commands, reporters, widgets, onFulfilled, onErrors) {
    var compileParams, error, ex;
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
      code: code,
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

  now = (ref1 = typeof performance !== "undefined" && performance !== null ? performance.now.bind(performance) : void 0) != null ? ref1 : Date.now.bind(Date);

}).call(this);

//# sourceMappingURL=session-lite.js.map
