(function() {
  window.RactivePlot = RactiveWidget.extend({
    data: function() {
      return {
        contextMenuOptions: [this.standardOptions(this)["delete"]],
        isNotEditable: true,
        menuIsOpen: false,
        resizeCallback: (function(x, y) {})
      };
    },
    observe: {
      'left right top bottom': function() {
        this.get('resizeCallback')(this.get('right') - this.get('left'), this.get('bottom') - this.get('top'));
      }
    },
    on: {
      render: function() {
        var ractive, topLevel, topLevelObserver;
        ractive = this;
        topLevel = document.querySelector("#" + (this.get('id')));
        topLevelObserver = new MutationObserver(function(mutations) {
          return mutations.forEach(function(arg) {
            var addedNodes, container, containerObserver;
            addedNodes = arg.addedNodes;
            container = Array.from(addedNodes).find(function(elem) {
              return elem.classList.contains("highcharts-container");
            });
            if (container != null) {
              topLevelObserver.disconnect();
              containerObserver = new MutationObserver(function(mutties) {
                return mutties.forEach(function(arg1) {
                  var addedNodies, menu, menuObserver;
                  addedNodies = arg1.addedNodes;
                  menu = Array.from(addedNodies).find(function(elem) {
                    return elem.classList.contains("highcharts-contextmenu");
                  });
                  if (menu != null) {
                    ractive.set('menuIsOpen', true);
                    containerObserver.disconnect();
                    menuObserver = new MutationObserver(function() {
                      return ractive.set('menuIsOpen', menu.style.display !== "none");
                    });
                    return menuObserver.observe(menu, {
                      attributes: true
                    });
                  }
                });
              });
              return containerObserver.observe(container, {
                childList: true
              });
            }
          });
        });
        return topLevelObserver.observe(topLevel, {
          childList: true
        });
      }
    },
    minWidth: 100,
    minHeight: 85,
    template: "{{>editorOverlay}}\n<div id=\"{{id}}\" class=\"netlogo-widget netlogo-plot {{classes}}\"\n     style=\"{{dims}}{{#menuIsOpen}}z-index: 10;{{/}}\"></div>"
  });

}).call(this);

//# sourceMappingURL=plot.js.map
