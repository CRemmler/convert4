(function() {
  var allReporters, closeBracket, commands, commentRule, constantRule, constants, directives, linkVars, memberRegEx, notWordCh, openBracket, patchVars, ref, reporters, turtleVars, variable, wordCh, wordEnd, wordRegEx;

  ref = window.keywords, commands = ref.commands, constants = ref.constants, directives = ref.directives, linkVars = ref.linkVars, patchVars = ref.patchVars, reporters = ref.reporters, turtleVars = ref.turtleVars;

  notWordCh = /[\s\[\(\]\)]/.source;

  wordCh = /[^\s\[\(\]\)]/.source;

  wordEnd = "(?=" + notWordCh + "|$)";

  wordRegEx = function(pattern) {
    return new RegExp("" + pattern + wordEnd, 'i');
  };

  memberRegEx = function(words) {
    return wordRegEx("(?:" + (words.join('|')) + ")");
  };

  commentRule = {
    token: 'comment',
    regex: /;.*/
  };

  constantRule = {
    token: 'constant',
    regex: memberRegEx(constants)
  };

  openBracket = {
    regex: /[\[\(]/,
    indent: true
  };

  closeBracket = {
    regex: /[\]\)]/,
    dedent: true
  };

  variable = {
    token: 'variable',
    regex: new RegExp(wordCh + "+")
  };

  allReporters = [].concat(reporters, turtleVars, patchVars, linkVars).reverse();

  CodeMirror.defineSimpleMode('netlogo', {
    start: [
      {
        token: 'keyword',
        regex: wordRegEx("to(?:-report)?"),
        indent: true
      }, {
        token: 'keyword',
        regex: wordRegEx("end"),
        dedent: true
      }, {
        token: 'keyword',
        regex: memberRegEx(directives)
      }, {
        token: 'keyword',
        regex: wordRegEx(wordCh + "*-own")
      }, {
        token: 'command',
        regex: memberRegEx(commands.reverse())
      }, {
        token: 'reporter',
        regex: memberRegEx(allReporters)
      }, {
        token: 'string',
        regex: /"(?:[^\\]|\\.)*?"/
      }, {
        token: 'number',
        regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i
      }, constantRule, commentRule, openBracket, closeBracket, variable
    ],
    meta: {
      electricChars: "dD])\n",
      lineComment: ";"
    }
  });

}).call(this);

//# sourceMappingURL=codemirror-mode.js.map
