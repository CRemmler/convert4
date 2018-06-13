(function() {
  window.RactiveModelTitle = RactiveContextable.extend({
    data: function() {
      return {
        contextMenuOptions: [
          {
            text: "Edit",
            isEnabled: true,
            action: (function(_this) {
              return function() {
                return _this.fire('edit-title');
              };
            })(this)
          }
        ],
        isEditing: void 0,
        title: void 0
      };
    },
    on: {
      'edit-title': function() {
        var defaultOnEmpty, newName, oldName, ref;
        defaultOnEmpty = function(s) {
          if (s === '') {
            return "Untitled";
          } else {
            return s;
          }
        };
        if (this.get('isEditing')) {
          oldName = this.get('title');
          newName = prompt("Enter a new name for your model", oldName);
          this.set('title', (ref = defaultOnEmpty(newName)) != null ? ref : oldName);
        }
      }
    },
    template: "<div class=\"netlogo-model-masthead\">\n  <div class=\"flex-row\" style=\"justify-content: center; height: 30px; line-height: 30px;\">\n    <h2 id=\"netlogo-title\"\n        on-contextmenu=\"@this.fire('show-context-menu', @event)\"\n        class=\"netlogo-widget netlogo-model-title {{classes}}{{# isEditing }} interface-unlocked initial-color{{/}}\"\n        on-dblclick=\"edit-title\">\n      {{ title }}\n    </h2>\n  </div>\n</div>"
  });

}).call(this);

//# sourceMappingURL=title.js.map
