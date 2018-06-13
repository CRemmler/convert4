(function() {
  window.handleContextMenu = function(ractive) {
    var handleContextMenu, hideContextMenu;
    hideContextMenu = function(event) {
      var contextMenu;
      if ((event != null ? event.button : void 0) !== 2) {
        contextMenu = ractive.findComponent('contextMenu');
        if (contextMenu.get('visible')) {
          contextMenu.fire('cover-thineself');
        }
      }
    };
    window.addEventListener('keyup', function(e) {
      if (e.keyCode === 27) {
        return hideContextMenu(e);
      }
    });
    document.addEventListener("click", hideContextMenu);
    document.addEventListener("contextmenu", function(e) {
      var c, classes, elem, elems, hasClass, latestElem, listOfLists;
      latestElem = e.target;
      elems = [];
      while (latestElem != null) {
        elems.push(latestElem);
        latestElem = latestElem.parentElement;
      }
      listOfLists = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = elems.length; i < len; i++) {
          elem = elems[i];
          results.push((function() {
            var j, len1, ref, results1;
            ref = elem.classList;
            results1 = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              c = ref[j];
              results1.push(c);
            }
            return results1;
          })());
        }
        return results;
      })();
      classes = listOfLists.reduce(function(acc, x) {
        return acc.concat(x);
      });
      hasClass = function(x) {
        return classes.indexOf(x) !== -1;
      };
      if ((!hasClass("netlogo-widget")) && (!hasClass("netlogo-widget-container"))) {
        return hideContextMenu(e);
      }
    });
    handleContextMenu = function(a, b, c) {
      var component, pageX, pageY, ref, ref1, ref2, theEditFormIsntUp;
      theEditFormIsntUp = this.get("isEditing") && !this.findAllComponents('editForm').some(function(form) {
        return form.get('visible');
      });
      if (theEditFormIsntUp) {
        ref = c == null ? [a, b] : [b, c], (ref1 = ref[0], component = ref1.component), (ref2 = ref[1], pageX = ref2.pageX, pageY = ref2.pageY);
        ractive.fire('deselect-widgets');
        this.findComponent('contextMenu').fire('reveal-thineself', component, pageX, pageY);
        return false;
      } else {
        return true;
      }
    };
    ractive.on('show-context-menu', handleContextMenu);
    ractive.on('*.show-context-menu', handleContextMenu);
    ractive.on('*.hide-context-menu', hideContextMenu);
  };

}).call(this);

//# sourceMappingURL=handle-context-menu.js.map
