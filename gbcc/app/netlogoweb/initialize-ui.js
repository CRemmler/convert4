(function() {
  var entwine, entwineDimensions;

  window.initializeUI = function(containerArg, widgets, code, info, isReadOnly, filename, checkIsReporter) {
    var configs, container, controller, ractive, updateUI, viewController, viewModel;
    container = typeof containerArg === 'string' ? document.querySelector(containerArg) : containerArg;
    controller = null;
    updateUI = function() {
      controller.redraw();
      return controller.updateWidgets();
    };
    window.setUpWidgets(widgets, updateUI);
    ractive = window.generateRactiveSkeleton(container, widgets, code, info, isReadOnly, filename, checkIsReporter);
    container.querySelector('.netlogo-model').focus();
    viewModel = widgets.find(function(arg) {
      var type;
      type = arg.type;
      return type === 'view';
    });
    ractive.set('primaryView', viewModel);
    viewController = new ViewController(container.querySelector('.netlogo-view-container'), viewModel.fontSize);
    entwineDimensions(viewModel, viewController.model.world);
    entwine([[viewModel, "fontSize"], [viewController.view, "fontSize"]], viewModel.fontSize);
    configs = window.genConfigs(ractive, viewController, container);
    controller = new WidgetController(ractive, viewController, configs);
    window.controlEventTraffic(controller);
    window.handleWidgetSelection(ractive);
    window.handleContextMenu(ractive);
    return controller;
  };

  entwine = function(objKeyPairs, value) {
    var backingValue, i, key, len, obj, ref;
    backingValue = value;
    for (i = 0, len = objKeyPairs.length; i < len; i++) {
      ref = objKeyPairs[i], obj = ref[0], key = ref[1];
      Object.defineProperty(obj, key, {
        get: function() {
          return backingValue;
        },
        set: function(newValue) {
          return backingValue = newValue;
        }
      });
    }
  };

  entwineDimensions = function(viewWidget, modelView) {
    var mName, translations, wName;
    translations = {
      maxPxcor: "maxpxcor",
      maxPycor: "maxpycor",
      minPxcor: "minpxcor",
      minPycor: "minpycor",
      patchSize: "patchsize",
      wrappingAllowedInX: "wrappingallowedinx",
      wrappingAllowedInY: "wrappingallowediny"
    };
    for (wName in translations) {
      mName = translations[wName];
      entwine([[viewWidget.dimensions, wName], [modelView, mName]], viewWidget.dimensions[wName]);
    }
  };

}).call(this);

//# sourceMappingURL=initialize-ui.js.map
