(function() {
  window.RactiveModelCodeComponent = Ractive.extend({
    data: function() {
      return {
        code: void 0,
        isReadOnly: void 0,
        lastCompiledCode: void 0,
        lastCompileFailed: false
      };
    },
    components: {
      codeEditor: RactiveCodeContainerMultiline
    },
    computed: {
      isStale: '(${code} !== ${lastCompiledCode}) || ${lastCompileFailed}'
    },
    setCode: function(code) {
      this.findComponent('codeEditor').setCode(code);
    },
    template: "<div class=\"netlogo-tab-content netlogo-code-container\"\n     grow-in='{disable:\"code-tab-toggle\"}' shrink-out='{disable:\"code-tab-toggle\"}'>\n  {{# !isReadOnly }}\n    <button class=\"netlogo-widget netlogo-ugly-button netlogo-recompilation-button{{#isEditing}} interface-unlocked{{/}}\"\n            on-click=\"recompile\" {{# !isStale }}disabled{{/}} >Recompile Code</button>\n  {{/}}\n  <codeEditor id=\"netlogo-code-tab-editor\" code=\"{{code}}\"\n              injectedConfig=\"{ lineNumbers: true, readOnly: {{isReadOnly}} }\"\n              extraClasses=\"['netlogo-code-tab']\" />\n</div>"
  });

}).call(this);

//# sourceMappingURL=code-editor.js.map
