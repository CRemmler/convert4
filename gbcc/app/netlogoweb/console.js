(function() {
  window.RactiveConsoleWidget = Ractive.extend({
    data: function() {
      return {
        input: '',
        isEditing: void 0,
        agentTypes: ['observer', 'turtles', 'patches', 'links'],
        agentTypeIndex: 0,
        checkIsReporter: void 0,
        history: [],
        historyIndex: 0,
        workingEntry: {},
        output: ''
      };
    },
    computed: {
      agentType: {
        get: function() {
          return this.get('agentTypes')[this.get('agentTypeIndex')];
        },
        set: function(val) {
          var index;
          index = this.get('agentTypes').indexOf(val);
          if (index >= 0) {
            this.set('agentTypeIndex', index);
            return this.focusCommandCenterEditor();
          }
        }
      }
    },
    components: {
      printArea: RactivePrintArea
    },
    onrender: function() {
      var changeAgentType, commandCenterEditor, consoleErrorLog, moveInHistory, run;
      changeAgentType = (function(_this) {
        return function() {
          return _this.set('agentTypeIndex', (_this.get('agentTypeIndex') + 1) % _this.get('agentTypes').length);
        };
      })(this);
      moveInHistory = (function(_this) {
        return function(index) {
          var entry, newIndex;
          newIndex = _this.get('historyIndex') + index;
          if (newIndex < 0) {
            newIndex = 0;
          } else if (newIndex > _this.get('history').length) {
            newIndex = _this.get('history').length;
          }
          if (_this.get('historyIndex') === _this.get('history').length) {
            _this.set('workingEntry', {
              agentType: _this.get('agentType'),
              input: _this.get('input')
            });
          }
          if (newIndex === _this.get('history').length) {
            _this.set(_this.get('workingEntry'));
          } else {
            entry = _this.get('history')[newIndex];
            _this.set(entry);
          }
          return _this.set('historyIndex', newIndex);
        };
      })(this);
      consoleErrorLog = (function(_this) {
        return function(messages) {
          return _this.set('output', (_this.get('output')) + "ERROR: " + (messages.join('\n')) + "\n");
        };
      })(this);
      run = (function(_this) {
        return function() {
          var agentType, history, input, lastEntry;
          input = _this.get('input');
          if (input.trim().length > 0) {
            agentType = _this.get('agentType');
            if (_this.get('checkIsReporter')(input)) {
              input = "show " + input;
            }
            _this.set('output', "" + (_this.get('output')) + agentType + "> " + input + "\n");
            history = _this.get('history');
            lastEntry = history.length > 0 ? history[history.length - 1] : {
              agentType: '',
              input: ''
            };
            if (lastEntry.input !== input || lastEntry.agentType !== agentType) {
              history.push({
                agentType: agentType,
                input: input
              });
            }
            _this.set('historyIndex', history.length);
            if (agentType !== 'observer') {
              input = "ask " + agentType + " [ " + input + " ]";
            }
            _this.fire('run', {}, input, consoleErrorLog);
            _this.set('input', '');
            return _this.set('workingEntry', {});
          }
        };
      })(this);
      this.on('clear-history', function() {
        return this.set('output', '');
      });
      commandCenterEditor = CodeMirror(this.find('.netlogo-command-center-editor'), {
        value: this.get('input'),
        mode: 'netlogo',
        theme: 'netlogo-default',
        scrollbarStyle: 'null',
        extraKeys: {
          Enter: run,
          Up: (function(_this) {
            return function() {
              return moveInHistory(-1);
            };
          })(this),
          Down: (function(_this) {
            return function() {
              return moveInHistory(1);
            };
          })(this),
          Tab: (function(_this) {
            return function() {
              return changeAgentType();
            };
          })(this)
        }
      });
      this.focusCommandCenterEditor = function() {
        return commandCenterEditor.focus();
      };
      commandCenterEditor.on('beforeChange', function(_, change) {
        var oneLineText;
        oneLineText = change.text.join('').replace(/\n/g, '');
        change.update(change.from, change.to, [oneLineText]);
        return true;
      });
      commandCenterEditor.on('change', (function(_this) {
        return function() {
          return _this.set('input', commandCenterEditor.getValue());
        };
      })(this));
      this.observe('input', function(newValue) {
        if (newValue !== commandCenterEditor.getValue()) {
          commandCenterEditor.setValue(newValue);
          return commandCenterEditor.execCommand('goLineEnd');
        }
      });
      return this.observe('isEditing', function(isEditing) {
        var classes;
        commandCenterEditor.setOption('readOnly', isEditing ? 'nocursor' : false);
        classes = this.find('.netlogo-command-center-editor').querySelector('.CodeMirror-scroll').classList;
        if (isEditing) {
          classes.add('cm-disabled');
        } else {
          classes.remove('cm-disabled');
        }
      });
    },
    appendText: function(str) {
      this.set('output', this.get('output') + str);
    },
    template: "<div class='netlogo-tab-content netlogo-command-center'\n     grow-in='{disable:\"console-toggle\"}' shrink-out='{disable:\"console-toggle\"}'>\n  <printArea id='command-center-print-area' output='{{output}}'/>\n\n  <div class='netlogo-command-center-input'>\n    <label>\n      <select value=\"{{agentType}}\">\n      {{#agentTypes}}\n        <option value=\"{{.}}\">{{.}}</option>\n      {{/}}\n      </select>\n    </label>\n    <div class=\"netlogo-command-center-editor\"></div>\n    <button on-click='clear-history'>Clear</button>\n  </div>\n</div>"
  });

}).call(this);

//# sourceMappingURL=console.js.map
