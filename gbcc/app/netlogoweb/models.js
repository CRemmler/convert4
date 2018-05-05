(function() {
  exports.bindModelChooser = function(container, onComplete, selectionChanged, currentMode) {
    var PUBLIC_PATH_SEGMENT_LENGTH, adjustModelPath, createModelSelection, modelDisplayName, populateModelChoices, setModelCompilationStatus;
    PUBLIC_PATH_SEGMENT_LENGTH = "public/".length;
    adjustModelPath = function(modelName) {
      return modelName.substring(PUBLIC_PATH_SEGMENT_LENGTH, modelName.length);
    };
    modelDisplayName = function(modelName) {
      var stripPrefix;
      stripPrefix = function(prefix, str) {
        var startsWith;
        startsWith = function(p, s) {
          return s.substring(0, p.length) === p;
        };
        if (startsWith(prefix, str)) {
          return str.substring(prefix.length);
        } else {
          return str;
        }
      };
      return stripPrefix("modelslib/", adjustModelPath(modelName));
    };
    setModelCompilationStatus = function(modelName, status) {
      if (status === "not_compiling" && currentMode !== "dev") {
        return $("option[value=\"" + (adjustModelPath(modelName)) + "\"]").attr("disabled", true);
      } else {
        return $("option[value=\"" + (adjustModelPath(modelName)) + "\"]").addClass(currentMode).addClass(status);
      }
    };
    populateModelChoices = function(select, modelNames) {
      var i, len, modelName, option, results;
      select.append($('<option>').text('Select a model'));
      results = [];
      for (i = 0, len = modelNames.length; i < len; i++) {
        modelName = modelNames[i];
        option = $('<option>').attr('value', adjustModelPath(modelName)).text(modelDisplayName(modelName));
        results.push(select.append(option));
      }
      return results;
    };
    createModelSelection = function(container, modelNames) {
      var select;
      select = $('<select>').attr('name', 'models').css('width', '100%').addClass('chzn-select');
      select.on('change', function(e) {
        var modelURL;
        if (modelSelect.get(0).selectedIndex > 0) {
          modelURL = (modelSelect.get(0).value) + ".nlogo";
          return selectionChanged(modelURL);
        }
      });
      populateModelChoices(select, modelNames);
      select.appendTo(container);
      select.chosen({
        search_contains: true
      });
      return select;
    };
    return $.ajax('/model/list.json', {
      complete: function(req, status) {
        var allModelNames;
        allModelNames = JSON.parse(req.responseText);
        window.modelSelect = createModelSelection(container, allModelNames);
        if (container.classList.contains('tortoise-model-list')) {
          $.ajax('/model/statuses.json', {
            complete: function(req, status) {
              var allModelStatuses, i, len, modelName, modelStatus, ref, ref1;
              allModelStatuses = JSON.parse(req.responseText);
              for (i = 0, len = allModelNames.length; i < len; i++) {
                modelName = allModelNames[i];
                modelStatus = (ref = (ref1 = allModelStatuses[modelName]) != null ? ref1.status : void 0) != null ? ref : 'unknown';
                setModelCompilationStatus(modelName, modelStatus);
              }
              return window.modelSelect.trigger('chosen:updated');
            }
          });
        }
        return onComplete();
      }
    });
  };

  exports.selectModel = function(model) {
    modelSelect.val(model);
    return modelSelect.trigger("chosen:updated");
  };

  exports.selectModelByURL = function(modelURL) {
    var choiceElem, choiceElems, choicesArray, extractNMatches, modelName, modelPath, prefix, ref, regexStr, truePath, truePrefix, urlIsInternal;
    extractNMatches = function(regex) {
      return function(n) {
        return function(str) {
          var i, result, results;
          result = (new RegExp(regex)).exec(str);
          return (function() {
            results = [];
            for (var i = 1; 1 <= n ? i <= n : i >= n; 1 <= n ? i++ : i--){ results.push(i); }
            return results;
          }).apply(this).map(function(matchNumber) {
            return result[matchNumber];
          });
        };
      };
    };
    urlIsInternal = function(url) {
      var extractDomain;
      extractDomain = function(str) {
        return extractNMatches(".*?//?([^/]+)|()")(1)(str)[0];
      };
      return extractDomain(window.location.href) === extractDomain(url);
    };
    if (urlIsInternal(modelURL)) {
      regexStr = ".*/(modelslib/|test/|demomodels/)(.+).nlogo";
      ref = extractNMatches(regexStr)(2)(modelURL), prefix = ref[0], modelName = ref[1];
      truePrefix = prefix === "modelslib/" ? "" : prefix;
      modelPath = ("" + prefix + modelName).replace(/%20/g, " ");
      truePath = ("" + truePrefix + modelName).replace(/%20/g, " ");
      choiceElems = document.getElementsByName('models')[0].children;
      choicesArray = [].slice.call(choiceElems);
      choiceElem = choicesArray.reduce((function(acc, x) {
        if (x.innerHTML === truePath) {
          return x;
        } else {
          return acc;
        }
      }), null);
      if (choiceElem != null) {
        exports.selectModel(modelPath);
      }
    }
  };

  exports.handPickedModels = ["Curricular Models/BEAGLE Evolution/DNA Replication Fork", "Curricular Models/Connected Chemistry/Connected Chemistry Gas Combustion", "IABM Textbook/chapter 2/Simple Economy", "IABM Textbook/chapter 8/Sandpile Simple", "Sample Models/Art/Fireworks", "Sample Models/Art/Follower", "Sample Models/Biology/Ants", "Sample Models/Biology/BeeSmart Hive Finding", "Sample Models/Biology/Daisyworld", "Sample Models/Biology/Evolution/Cooperation", "Sample Models/Biology/Flocking", "Sample Models/Biology/Slime", "Sample Models/Biology/Virus", "Sample Models/Biology/Wolf Sheep Predation", "Sample Models/Chemistry & Physics/Diffusion Limited Aggregation/DLA", "Sample Models/Chemistry & Physics/GasLab/GasLab Gas in a Box", "Sample Models/Chemistry & Physics/Heat/Boiling", "Sample Models/Chemistry & Physics/Ising", "Sample Models/Chemistry & Physics/Waves/Wave Machine", "Sample Models/Computer Science/Cellular Automata/CA 1D Elementary", "Sample Models/Earth Science/Climate Change", "Sample Models/Earth Science/Erosion", "Sample Models/Earth Science/Fire", "Sample Models/Mathematics/3D Solids", "Sample Models/Mathematics/Mousetraps", "Sample Models/Networks/Preferential Attachment", "Sample Models/Networks/Team Assembly", "Sample Models/Networks/Virus on a Network", "Sample Models/Social Science/Segregation", "Sample Models/Social Science/Traffic Basic", "Sample Models/Social Science/Voting"].map(function(p) {
    return "modelslib/" + p;
  });

}).call(this);

//# sourceMappingURL=models.js.map
