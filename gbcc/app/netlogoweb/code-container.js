(function() {
  var RactiveCodeContainerBase;

  RactiveCodeContainerBase = Ractive.extend({
    _editor: void 0,
    data: function() {
      return {
        code: void 0,
        extraClasses: void 0,
        extraConfig: void 0,
        id: void 0,
        initialCode: void 0,
        isDisabled: false,
        injectedConfig: void 0,
        style: void 0
      };
    },
    oncomplete: function() {
      var initialCode, ref;
      initialCode = this.get('initialCode');
      this.set('code', (ref = initialCode != null ? initialCode : this.get('code')) != null ? ref : "");
      return this._setupCodeMirror();
    },
    twoway: false,
    _setupCodeMirror: function() {
      var baseConfig, config, ref, ref1;
      baseConfig = {
        mode: 'netlogo',
        theme: 'netlogo-default',
        value: this.get('code'),
        viewportMargin: Infinity
      };
      config = Object.assign({}, baseConfig, (ref = this.get('extraConfig')) != null ? ref : {}, (ref1 = this.get('injectedConfig')) != null ? ref1 : {});
      this._editor = new CodeMirror(this.find("#" + (this.get('id'))), config);
      this._editor.on('change', (function(_this) {
        return function() {
          return _this.set('code', _this._editor.getValue());
        };
      })(this));
      this.observe('isDisabled', function(isDisabled) {
        var classes;
        this._editor.setOption('readOnly', isDisabled ? 'nocursor' : false);
        classes = this.find('.netlogo-code').querySelector('.CodeMirror-scroll').classList;
        if (isDisabled) {
          classes.add('cm-disabled');
        } else {
          classes.remove('cm-disabled');
        }
      });
    },
    setCode: function(code) {
      if ((this._editor != null) && this._editor.getValue() !== code) {
        this._editor.setValue(code);
      }
    },
    template: "<div id=\"{{id}}\" class=\"netlogo-code {{(extraClasses || []).join(' ')}}\" style=\"{{style}}\"></div>"
  });

  window.RactiveCodeContainerMultiline = RactiveCodeContainerBase.extend({
    data: function() {
      return {
        extraConfig: {
          tabSize: 2,
          extraKeys: {
            "Ctrl-F": "findPersistent",
            "Cmd-F": "findPersistent"
          }
        }
      };
    }
  });

  window.RactiveEditFormCodeContainer = Ractive.extend({
    data: function() {
      return {
        config: void 0,
        id: void 0,
        label: void 0,
        style: void 0,
        value: void 0
      };
    },
    twoway: false,
    components: {
      codeContainer: RactiveCodeContainerMultiline
    },
    template: "<label for=\"{{id}}\">{{label}}</label>\n<codeContainer id=\"{{id}}\" initialCode=\"{{value}}\" injectedConfig=\"{{config}}\" style=\"{{style}}\" />"
  });

}).call(this);

//# sourceMappingURL=code-container.js.map
