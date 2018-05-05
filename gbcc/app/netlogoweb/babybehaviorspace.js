
/*

  type Metric = {
    interval: Number
  , reporter: () => Any
  }

  type VariableConfig = {
    name:           String
    parameterSpace: { type: "discreteValues", values: Array[Any] }
                  | { type: "range", min: Number, max: Number, interval: Number }
  }

  type BehaviorSpaceConfig =
    {
      parameterSet:        { type: "discreteCombos",   combos:    Array[Object[Any]]    }
                         | { type: "cartesianProduct", variables: Array[VariableConfig] }
      repetitionsPerCombo: Number
      metrics:             Object[Metric]
      setup:               () => Unit
      go:                  () => Unit
      stopCondition:       () => Boolean
      iterationLimit:      Number
    }

  type Results = Array[{ config: Object[Any], results: Object[Object[Any]] }]
 */

(function() {
  var cartesianProduct, executeRun, genCartesianSet;

  window.runBabyBehaviorSpace = function(config, setGlobal, dump) {
    var combination, finalParameterSet, flatten, go, iterationLimit, j, key, len, metrics, pSet, parameterSet, repetitionsPerCombo, results, results1, setup, stopCondition, value;
    parameterSet = config.parameterSet, repetitionsPerCombo = config.repetitionsPerCombo, metrics = config.metrics, setup = config.setup, go = config.go, stopCondition = config.stopCondition, iterationLimit = config.iterationLimit;
    parameterSet = (function() {
      switch (parameterSet.type) {
        case "discreteCombos":
          return parameterSet.combos;
        case "cartesianProduct":
          return genCartesianSet(parameterSet.variables);
        default:
          throw new Exception("Unknown parameter set type: " + type);
      }
    })();
    flatten = function(xs) {
      var ref;
      return (ref = []).concat.apply(ref, xs);
    };
    finalParameterSet = flatten((function() {
      var j, len, results1;
      results1 = [];
      for (j = 0, len = parameterSet.length; j < len; j++) {
        combination = parameterSet[j];
        results1.push((function() {
          var k, ref, results2;
          results2 = [];
          for (k = 1, ref = repetitionsPerCombo; 1 <= ref ? k <= ref : k >= ref; 1 <= ref ? k++ : k--) {
            results2.push(combination);
          }
          return results2;
        })());
      }
      return results1;
    })());
    results1 = [];
    for (j = 0, len = finalParameterSet.length; j < len; j++) {
      pSet = finalParameterSet[j];
      for (key in pSet) {
        value = pSet[key];
        setGlobal(key, value);
      }
      results = executeRun(setup, go, stopCondition, iterationLimit, metrics, dump);
      results1.push({
        config: pSet,
        results: results
      });
    }
    return results1;
  };

  cartesianProduct = function(xs) {
    return xs.reduce(function(acc, x) {
      var nested;
      nested = acc.map(function(a) {
        return x.map(function(b) {
          return a.concat(b);
        });
      });
      return nested.reduce((function(flattened, l) {
        return flattened.concat(l);
      }), []);
    }, [[]]);
  };

  genCartesianSet = function(variables) {
    var basicParameterSet, condense;
    basicParameterSet = variables.map(function(arg) {
      var interval, max, min, name, ref, type, values, x;
      name = arg.name, (ref = arg.parameterSpace, type = ref.type, values = ref.values, min = ref.min, max = ref.max, interval = ref.interval);
      values = (function() {
        var j, ref1, ref2, ref3, results1;
        switch (type) {
          case "discreteValues":
            return values;
          case "range":
            results1 = [];
            for (x = j = ref1 = min, ref2 = max, ref3 = interval; ref3 > 0 ? j <= ref2 : j >= ref2; x = j += ref3) {
              results1.push(x);
            }
            return results1;
            break;
          default:
            throw new Exception("Unknown parameter space type: " + type);
        }
      })();
      return values.map(function(value) {
        return {
          name: name,
          value: value
        };
      });
    });
    condense = (function(acc, arg) {
      var name, value;
      name = arg.name, value = arg.value;
      acc[name] = value;
      return acc;
    });
    return cartesianProduct(basicParameterSet).map(function(combo) {
      return combo.reduce(condense, {});
    });
  };

  executeRun = function(setup, go, stopCondition, iterationLimit, metrics, dump) {
    var iters, maxIters, measure, measurements;
    iters = 0;
    maxIters = iterationLimit < 1 ? -1 : iterationLimit;
    measurements = {};
    measure = function(i) {
      var interval, ms, name, ref, reporter;
      ms = {};
      for (name in metrics) {
        ref = metrics[name], reporter = ref.reporter, interval = ref.interval;
        if (interval === 0 || (i % interval) === 0) {
          ms[name] = dump(reporter());
        }
      }
      if (Object.keys(ms).length > 0) {
        measurements[i] = ms;
      }
    };
    setup();
    while (!stopCondition() && iters < maxIters) {
      measure(iters);
      go();
      iters++;
    }
    measure(iters);
    return measurements;
  };

}).call(this);

//# sourceMappingURL=babybehaviorspace.js.map
