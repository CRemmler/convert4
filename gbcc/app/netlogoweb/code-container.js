(function() {
  var RactiveCodeContainerBase, editFormCodeContainerFactory;

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
        onchange: (function() {}),
        style: void 0
      };
    },
    oncomplete: function() {
      var initialCode, ref;
      initialCode = this.get('initialCode');
      this.set('code', (ref = initialCode != null ? initialCode : this.get('code')) != null ? ref : "");
      this._setupCodeMirror();
    },
    twoway: false,
    _setupCodeMirror: function() {
      var baseConfig, config, ref, ref1;
      baseConfig = {
        mode: 'netlogo',
        theme: 'netlogo-default',
        value: this.get('code').toString(),
        viewportMargin: Infinity
      };
      config = Object.assign({}, baseConfig, (ref = this.get('extraConfig')) != null ? ref : {}, (ref1 = this.get('injectedConfig')) != null ? ref1 : {});
      this._editor = new CodeMirror(this.find("#" + (this.get('id'))), config);
      this._editor.on('change', (function(_this) {
        return function() {
          var code;
          code = _this._editor.getValue();
          _this.set('code', code);
          _this.parent.fire('code-changed', code);
          return _this.get('onchange')(code);
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
      var str;
      str = code.toString();
      if ((this._editor != null) && this._editor.getValue() !== str) {
        this._editor.setValue(str);
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

  window.RactiveCodeContainerOneLine = RactiveCodeContainerBase.extend({
    oncomplete: function() {
      var forceOneLine;
      this._super();
      forceOneLine = function(_, change) {
        var oneLineText;
        oneLineText = change.text.join('').replace(/\n/g, '');
        change.update(change.from, change.to, [oneLineText]);
        return true;
      };
      this._editor.on('beforeChange', forceOneLine);
    }
  });

  editFormCodeContainerFactory = function(container) {
    return Ractive.extend({
      data: function() {
        return {
          config: void 0,
          id: void 0,
          label: void 0,
          onchange: (function() {}),
          style: void 0,
          value: void 0
        };
      },
      twoway: false,
      components: {
        codeContainer: container
      },
      template: "<label for=\"{{id}}\">{{label}}</label>\n<codeContainer id=\"{{id}}\" initialCode=\"{{value}}\" injectedConfig=\"{{config}}\"\n               onchange=\"{{onchange}}\" style=\"{{style}}\" />"
    });
  };

  window.RactiveEditFormOneLineCode = editFormCodeContainerFactory(RactiveCodeContainerOneLine);

  window.RactiveEditFormMultilineCode = editFormCodeContainerFactory(RactiveCodeContainerMultiline);

}).call(this);

//# sourceMappingURL=code-container.js.map
