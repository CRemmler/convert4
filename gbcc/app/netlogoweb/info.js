(function() {
  window.RactiveInfoTabEditor = Ractive.extend({
    data: function() {
      return {
        isEditing: false
      };
    },
    onrender: function() {
      var infoTabEditor;
      infoTabEditor = CodeMirror(this.find('.netlogo-info-editor'), {
        value: this.get('rawText'),
        tabsize: 2,
        mode: 'markdown',
        theme: 'netlogo-default',
        editing: this.get('isEditing'),
        lineWrapping: true
      });
      return infoTabEditor.on('change', (function(_this) {
        return function() {
          _this.set('rawText', infoTabEditor.getValue());
          return _this.set('info', infoTabEditor.getValue());
        };
      })(this));
    },
    template: "<div class='netlogo-info-editor'></div>"
  });

  window.RactiveInfoTabWidget = Ractive.extend({
    components: {
      infoeditor: RactiveInfoTabEditor
    },
    mdToHTML: function(md) {
      return window.html_sanitize(exports.toHTML(md), function(url) {
        if (/^https?:\/\//.test(url)) {
          return url;
        } else {
          return void 0;
        }
      }, function(id) {
        return id;
      });
    },
    template: "<div class='netlogo-tab-content netlogo-info'\n     grow-in='{disable:\"info-toggle\"}' shrink-out='{disable:\"info-toggle\"}'>\n  {{# !isEditing }}\n    <div class='netlogo-info-markdown'>{{{mdToHTML(rawText)}}}</div>\n  {{ else }}\n    <infoeditor rawText='{{rawText}}' />\n  {{ / }}\n</div>"
  });

}).call(this);

//# sourceMappingURL=info.js.map
