(function() {
  window.RactiveModelCodeComponent = Ractive.extend({
    data: function() {
      return {
        code: void 0,
        isReadOnly: void 0,
        lastCompiledCode: void 0,
        lastCompileFailed: false,
        procedureNames: {},
        autoCompleteStatus: false,
        codeUsage: [],
        usageVisibility: false,
        selectedCode: void 0,
        usageLeft: void 0,
        usageTop: void 0
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
    setupProceduresDropdown: function() {
      $('#procedurenames-dropdown').chosen({
        search_contains: true
      });
      $('#procedurenames-dropdown').on('change', (function(_this) {
        return function() {
          var index, procedureNames, selectedProcedure;
          procedureNames = _this.get('procedureNames');
          selectedProcedure = $('#procedurenames-dropdown').val();
          index = procedureNames[selectedProcedure];
          return _this.findComponent('codeEditor').highlightProcedure(selectedProcedure, index);
        };
      })(this));
      $('#procedurenames-dropdown').on('chosen:showing_dropdown', (function(_this) {
        return function() {
          return _this.setProcedureNames();
        };
      })(this));
    },
    getProcedureNames: function() {
      var codeString, procedureCheck, procedureMatch, procedureNames;
      codeString = this.get('code');
      procedureNames = {};
      procedureCheck = /^\s*(?:to|to-report)\s(?:\s*;.*\n)*\s*(\w\S*)/gm;
      while ((procedureMatch = procedureCheck.exec(codeString))) {
        procedureNames[procedureMatch[1]] = procedureMatch.index + procedureMatch[0].length;
      }
      return procedureNames;
    },
    setProcedureNames: function() {
      var procedureNames;
      procedureNames = this.getProcedureNames();
      this.set('procedureNames', procedureNames);
      $('#procedurenames-dropdown').trigger('chosen:updated');
    },
    setupAutoComplete: function(hintList) {
      var editor;
      CodeMirror.registerHelper('hintWords', 'netlogo', hintList);
      editor = this.findComponent('codeEditor').getEditor();
      editor.on('keyup', (function(_this) {
        return function(cm, event) {
          if (!cm.state.completionActive && event.keyCode > 64 && event.keyCode < 91 && _this.get('autoCompleteStatus')) {
            return cm.showHint({
              completeSingle: false
            });
          }
        };
      })(this));
    },
    netLogoHintHelper: function(cm, options) {
      var cur, found, from, term, to, token;
      cur = cm.getCursor();
      token = cm.getTokenAt(cur);
      to = CodeMirror.Pos(cur.line, token.end);
      if (token.string && /\S/.test(token.string[token.string.length - 1])) {
        term = token.string;
        from = CodeMirror.Pos(cur.line, token.start);
      } else {
        term = '';
        from = to;
      }
      found = options.words.filter(function(word) {
        return word.slice(0, term.length) === term;
      });
      if (found.length > 0) {
        return {
          list: found,
          from: from,
          to: to
        };
      }
    },
    autoCompleteWords: function() {
      var allKeywords, supportedKeywords;
      allKeywords = new Set(window.keywords.all);
      supportedKeywords = Array.from(allKeywords).filter(function(kw) {
        return !window.keywords.unsupported.includes(kw);
      }).map(function(kw) {
        return kw.replace("\\", "");
      });
      return Object.keys(this.getProcedureNames()).concat(supportedKeywords);
    },
    setupCodeUsagePopup: function() {
      var codeUsageMap, editor;
      editor = this.findComponent('codeEditor').getEditor();
      codeUsageMap = {
        'Ctrl-U': (function(_this) {
          return function() {
            if (editor.somethingSelected()) {
              return _this.setCodeUsage();
            }
          };
        })(this),
        'Cmd-U': (function(_this) {
          return function() {
            if (editor.somethingSelected()) {
              return _this.setCodeUsage();
            }
          };
        })(this)
      };
      editor.addKeyMap(codeUsageMap);
      editor.on('cursorActivity', (function(_this) {
        return function(cm) {
          if (_this.get('usageVisibility')) {
            return _this.set('usageVisibility', false);
          }
        };
      })(this));
    },
    getCodeUsage: function() {
      var check, codeString, codeUsage, editor, line, lineNumber, match, pos, selectedCode;
      editor = this.findComponent('codeEditor').getEditor();
      selectedCode = editor.getSelection().trim();
      this.set('selectedCode', selectedCode);
      codeString = this.get('code');
      check = RegExp("\\b(" + selectedCode + ")\\b", "g");
      codeUsage = [];
      while ((match = check.exec(codeString))) {
        pos = editor.posFromIndex(match.index + match[1].length);
        lineNumber = pos.line + 1;
        line = editor.getLine(pos.line);
        codeUsage.push({
          pos: pos,
          lineNumber: lineNumber,
          line: line
        });
      }
      return codeUsage;
    },
    setCodeUsage: function() {
      var codeUsage, editor, pos;
      codeUsage = this.getCodeUsage();
      editor = this.findComponent('codeEditor').getEditor();
      this.set('codeUsage', codeUsage);
      pos = editor.cursorCoords(editor.getCursor());
      this.set('usageLeft', pos.left);
      this.set('usageTop', pos.top);
      this.set('usageVisibility', true);
    },
    on: {
      'complete': function(_) {
        this.setupProceduresDropdown();
        CodeMirror.registerHelper('hint', 'fromList', this.netLogoHintHelper);
        this.setupAutoComplete(this.autoCompleteWords());
        this.setupCodeUsagePopup();
      },
      'recompile': function(_) {
        this.setupAutoComplete(this.autoCompleteWords());
      },
      'jump-to-usage': function(context, usagePos) {
        var editor, end, selectedCode, start;
        editor = this.findComponent('codeEditor').getEditor();
        selectedCode = this.get('selectedCode');
        end = usagePos;
        start = CodeMirror.Pos(end.line, end.ch - selectedCode.length);
        editor.setSelection(start, end);
        this.set('usageVisibility', false);
      }
    },
    template: "<div class=\"netlogo-tab-content netlogo-code-container\"\n     grow-in='{disable:\"code-tab-toggle\"}' shrink-out='{disable:\"code-tab-toggle\"}'>\n  <ul class=\"netlogo-codetab-widget-list\">\n    <li class=\"netlogo-codetab-widget-listitem\">\n      <select class=\"netlogo-procedurenames-dropdown\" id=\"procedurenames-dropdown\" data-placeholder=\"Jump to Procedure\" tabindex=\"2\">\n        {{#each procedureNames:name}}\n          <option value=\"{{name}}\">{{name}}</option>\n        {{/each}}\n      </select>\n    </li>\n    <li class=\"netlogo-codetab-widget-listitem\">\n      {{# !isReadOnly }}\n        <button class=\"netlogo-widget netlogo-ugly-button netlogo-recompilation-button{{#isEditing}} interface-unlocked{{/}}\"\n            on-click=\"recompile\" {{# !isStale }}disabled{{/}} >Recompile Code</button>\n      {{/}}\n    </li>\n    <li class=\"netlogo-codetab-widget-listitem\">\n      <input type='checkbox' class=\"netlogo-autocomplete-checkbox\" checked='{{autoCompleteStatus}}'>\n      <label class=\"netlogo-autocomplete-label\">\n        Auto Complete {{# autoCompleteStatus}}Enabled{{else}}Disabled{{/}}\n      </label>\n    </li>\n  </ul>\n  <codeEditor id=\"netlogo-code-tab-editor\" code=\"{{code}}\"\n              injectedConfig=\"{ lineNumbers: true, readOnly: {{isReadOnly}} }\"\n              extraClasses=\"['netlogo-code-tab']\" />\n</div>\n<div class=\"netlogo-codeusage-popup\" style=\"left: {{usageLeft}}px; top: {{usageTop}}px;\">\n  {{# usageVisibility}}\n    <ul class=\"netlogo-codeusage-list\">\n      {{#each codeUsage}}\n        <li class=\"netlogo-codeusage-item\" on-click=\"[ 'jump-to-usage', this.pos ]\">{{this.lineNumber}}: {{this.line}}</li>\n      {{/each}}\n    </ul>\n  {{/}}\n</div>"
  });

}).call(this);

//# sourceMappingURL=code-editor.js.map
