(function() {
  var Tortoise, defaultDisplayError, finishLoading, fromNlogo, fromNlogoWithoutCode, fromURL, globalEval, handleAjaxLoad, handleCompilation, loadData, loadError, loading, newSession, normalizedFileName, openSession, reportAjaxError, reportCompilerError, startLoading, toNetLogoMarkdown, toNetLogoWebMarkdown;

  loadError = function(url) {
    return "Unable to load NetLogo model from " + url + ", please ensure:\n<ul>\n  <li>That you can download the resource <a target=\"_blank\" href=\"" + url + "\">at this link</a></li>\n  <li>That the server containing the resource has\n    <a target=\"_blank\" href=\"https://en.wikipedia.org/wiki/Cross-origin_resource_sharing\">\n      Cross-Origin Resource Sharing\n    </a>\n    configured appropriately</li>\n</ul>\nIf you have followed the above steps and are still seeing this error,\nplease send an email to our <a href=\"mailto:bugs@ccl.northwestern.edu\">\"bugs\" mailing list</a>\nwith the following information:\n<ul>\n  <li>The full URL of this page (copy and paste from address bar)</li>\n  <li>Your operating system and browser version</li>\n</ul>";
  };

  toNetLogoWebMarkdown = function(md) {
    return md.replace(new RegExp('<!---*\\s*((?:[^-]|-+[^->])*)\\s*-*-->', 'g'), function(match, commentText) {
      return "[nlw-comment]: <> (" + (commentText.trim()) + ")";
    });
  };

  toNetLogoMarkdown = function(md) {
    return md.replace(new RegExp('\\[nlw-comment\\]: <> \\(([^\\)]*)\\)', 'g'), function(match, commentText) {
      return "<!-- " + commentText + " -->";
    });
  };

  handleAjaxLoad = (function(_this) {
    return function(url, onSuccess, onFailure) {
      var req;
      req = new XMLHttpRequest();
      req.open('GET', url);
      req.onreadystatechange = function() {
        if (req.readyState === req.DONE) {
          if (req.status === 0 || req.status >= 400) {
            return onFailure(req);
          } else {
            return onSuccess(req.responseText);
          }
        }
      };
      return req.send("");
    };
  })(this);

  newSession = function(container, modelResult, readOnly, filename, lastCompileFailed, onError) {
    var code, info, ref, result, widgets, wiggies;
    if (readOnly == null) {
      readOnly = false;
    }
    if (filename == null) {
      filename = "export";
    }
    if (onError == null) {
      onError = void 0;
    }
    code = modelResult.code, info = modelResult.info, (ref = modelResult.model, result = ref.result), wiggies = modelResult.widgets;
    widgets = globalEval(wiggies);
    info = toNetLogoWebMarkdown(info);
    return new SessionLite(container, widgets, code, info, readOnly, filename, result, lastCompileFailed, onError);
  };

  normalizedFileName = function(path) {
    var pathComponents;
    pathComponents = path.split(/\/|\\/);
    return decodeURI(pathComponents[pathComponents.length - 1]);
  };

  loadData = function(container, pathOrURL, name, loader, onError) {
    return {
      container: container,
      loader: loader,
      onError: onError,
      modelPath: pathOrURL,
      name: name
    };
  };

  openSession = function(load) {
    return function(model, lastCompileFailed) {
      var name, ref, session;
      name = (ref = load.name) != null ? ref : normalizedFileName(load.modelPath);
      session = newSession(load.container, model, false, name, lastCompileFailed, load.onError);
      load.loader.finish();
      return session;
    };
  };

  loading = function(process) {
    var loader;
    document.querySelector("#loading-overlay").style.display = "";
    loader = {
      finish: function() {
        return document.querySelector("#loading-overlay").style.display = "none";
      }
    };
    return setTimeout(process(loader), 20);
  };

  defaultDisplayError = function(container) {
    return function(errors) {
      return container.innerHTML = "<div style='padding: 5px 10px;'>" + errors + "</div>";
    };
  };

  reportCompilerError = function(load) {
    return function(res) {
      var errors;
      errors = res.model.result.map(function(err) {
        var contains, message;
        contains = function(s, x) {
          return s.indexOf(x) > -1;
        };
        message = err.message;
        if (contains(message, "Couldn't find corresponding reader") || contains(message, "Models must have 12 sections")) {
          return message + " (see <a href='https://netlogoweb.org/info#model-format-error'>here</a> for more information)";
        } else {
          return message;
        }
      }).join('<br/>');
      load.onError(errors);
      return load.loader.finish();
    };
  };

  reportAjaxError = function(load) {
    return function(req) {
      load.onError(loadError(load.modelPath));
      return load.loader.finish();
    };
  };

  startLoading = function(process) {
    document.querySelector("#loading-overlay").style.display = "";
    if ((process != null)) {
      return setTimeout(process, 20);
    }
  };

  finishLoading = function() {
    return document.querySelector("#loading-overlay").style.display = "none";
  };

  fromNlogo = function(nlogo, container, path, callback, onError) {
    if (onError == null) {
      onError = defaultDisplayError(container);
    }
    return loading(function(loader) {
      var load, name, segments;
      segments = path.split(/\/|\\/);
      name = segments[segments.length - 1];
      load = loadData(container, path, name, loader, onError);
      return handleCompilation(nlogo, callback, load);
    });
  };

  fromURL = function(url, modelName, container, callback, onError) {
    if (onError == null) {
      onError = defaultDisplayError(container);
    }
    return loading(function(loader) {
      var compile, load;
      load = loadData(container, url, modelName, loader, onError);
      compile = function(nlogo) {
        return handleCompilation(nlogo, callback, load);
      };
      return handleAjaxLoad(url, compile, reportAjaxError(load));
    });
  };

  handleCompilation = function(nlogo, callback, load) {
    var compiler, onFailure, onSuccess, result, success;
    onSuccess = function(input, lastCompileFailed) {
      return callback(openSession(load)(input, lastCompileFailed));
    };
    onFailure = reportCompilerError(load);
    compiler = new BrowserCompiler();
    result = compiler.fromNlogo(nlogo, []);
    if (result.model.success) {
      return onSuccess(result, false);
    } else {
      success = fromNlogoWithoutCode(nlogo, compiler, onSuccess);
      onFailure(result, success);
    }
  };

  fromNlogoWithoutCode = function(nlogo, compiler, onSuccess) {
    var first, newNlogo, result;
    first = nlogo.indexOf("@#$#@#$#@");
    if (first < 0) {
      return false;
    } else {
      newNlogo = nlogo.substring(first);
      result = compiler.fromNlogo(newNlogo, []);
      if (!result.model.success) {
        return false;
      } else {
        result.code = nlogo.substring(0, first);
        onSuccess(result, true);
        return result.model.success;
      }
    }
  };

  Tortoise = {
    startLoading: startLoading,
    finishLoading: finishLoading,
    fromNlogo: fromNlogo,
    fromURL: fromURL,
    toNetLogoMarkdown: toNetLogoMarkdown,
    toNetLogoWebMarkdown: toNetLogoWebMarkdown
  };

  if (typeof window !== "undefined" && window !== null) {
    window.Tortoise = Tortoise;
  } else {
    exports.Tortoise = Tortoise;
  }

  globalEval = eval;

}).call(this);

//# sourceMappingURL=tortoise.js.map
