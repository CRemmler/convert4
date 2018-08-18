(function() {
  window.NLWAlerter = (function() {
    function NLWAlerter(_alertWindow, _isStandalone) {
      this._alertWindow = _alertWindow;
      this._isStandalone = _isStandalone;
      this.alertContainer = this._alertWindow.querySelector("#alert-dialog");
    }

    NLWAlerter.prototype.display = function(title, dismissable, content) {
      this._alertWindow.querySelector("#alert-title").innerHTML = title;
      this._alertWindow.querySelector("#alert-message").innerHTML = content;
      if (this._isStandalone) {
        this._alertWindow.querySelector(".standalone-text").style.display = '';
      }
      if (!dismissable) {
        this._alertWindow.querySelector("#alert-dismiss-container").style.display = 'none';
      } else {
        this._alertWindow.querySelector("#alert-dismiss-container").style.display = '';
      }
      this._alertWindow.style.display = '';
    };

    NLWAlerter.prototype.displayError = function(content, dismissable, title) {
      if (dismissable == null) {
        dismissable = true;
      }
      if (title == null) {
        title = "Error";
      }
      this.display(title, dismissable, content);
    };

    NLWAlerter.prototype.hide = function() {
      this._alertWindow.style.display = 'none';
    };

    return NLWAlerter;

  })();

  window.showErrors = function(errors) {
    if (errors.length > 0) {
      if (window.nlwAlerter != null) {
        window.nlwAlerter.displayError(errors.join('<br/>'));
      } else {
        alert(errors.join('\n'));
      }
    }
  };

  window.handlingErrors = function(f) {
    return function() {
      var error, ex, message;
      try {
        return f();
      } catch (error) {
        ex = error;
        if (!(ex instanceof Exception.HaltInterrupt)) {
          message = !(ex instanceof TypeError) ? ex.message : "A type error has occurred in the simulation engine.\nMore information about these sorts of errors can be found\n<a href=\"https://netlogoweb.org/docs/faq#type-errors\">here</a>.<br><br>\nAdvanced users might find the generated error helpful, which is as follows:<br><br>\n<b>" + ex.message + "</b><br><br>";
          window.showErrors([message]);
          throw new Exception.HaltInterrupt;
        } else {
          throw ex;
        }
      }
    };
  };

}).call(this);

//# sourceMappingURL=global-noisy-things.js.map
