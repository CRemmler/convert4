(function() {
  var dropNLogoExtension, partials, template;

  dropNLogoExtension = function(s) {
    if (s.match(/.*\.nlogo/) != null) {
      return s.slice(0, -6);
    } else {
      return s;
    }
  };

  window.generateRactiveSkeleton = function(container, widgets, code, info, isReadOnly, filename, checkIsReporter) {
    var animateWithClass, model;
    model = {
      checkIsReporter: checkIsReporter,
      code: code,
      consoleOutput: '',
      exportForm: false,
      hasFocus: false,
      height: 0,
      info: info,
      isEditing: false,
      isHelpVisible: false,
      isOverlayUp: false,
      isReadOnly: isReadOnly,
      isResizerVisible: true,
      isStale: false,
      lastCompiledCode: code,
      lastCompileFailed: false,
      lastDragX: void 0,
      lastDragY: void 0,
      modelTitle: dropNLogoExtension(filename),
      outputWidgetOutput: '',
      primaryView: void 0,
      someDialogIsOpen: false,
      someEditFormIsOpen: false,
      speed: 0.0,
      ticks: "",
      ticksStarted: false,
      widgetObj: widgets.reduce((function(acc, widget, index) {
        acc[index] = widget;
        return acc;
      }), {}),
      width: 0
    };
    animateWithClass = function(klass) {
      return function(t, params) {
        var event, eventNames, i, len, listener;
        params = t.processParams(params);
        eventNames = ['animationend', 'webkitAnimationEnd', 'oAnimationEnd', 'msAnimationEnd'];
        listener = function(l) {
          return function(e) {
            var event, i, len;
            e.target.classList.remove(klass);
            for (i = 0, len = eventNames.length; i < len; i++) {
              event = eventNames[i];
              e.target.removeEventListener(event, l);
            }
            return t.complete();
          };
        };
        for (i = 0, len = eventNames.length; i < len; i++) {
          event = eventNames[i];
          t.node.addEventListener(event, listener(listener));
        }
        return t.node.classList.add(klass);
      };
    };
    Ractive.transitions.grow = animateWithClass('growing');
    Ractive.transitions.shrink = animateWithClass('shrinking');
    return new Ractive({
      el: container,
      template: template,
      partials: partials,
      components: {
        console: RactiveConsoleWidget,
        contextMenu: RactiveContextMenu,
        editableTitle: RactiveModelTitle,
        codePane: RactiveModelCodeComponent,
        helpDialog: RactiveHelpDialog,
        infotab: RactiveInfoTabWidget,
        resizer: RactiveResizer,
        tickCounter: RactiveTickCounter,
        labelWidget: RactiveLabel,
        switchWidget: RactiveSwitch,
        buttonWidget: RactiveButton,
        sliderWidget: RactiveSlider,
        chooserWidget: RactiveChooser,
        monitorWidget: RactiveMonitor,
        inputWidget: RactiveInput,
        outputWidget: RactiveOutputArea,
        plotWidget: RactivePlot,
        viewWidget: RactiveView,
        spacer: RactiveEditFormSpacer
      },
      computed: {
        stateName: function() {
          if (this.get('isEditing')) {
            if (this.get('someEditFormIsOpen')) {
              return 'authoring - editing widget';
            } else {
              return 'authoring - plain';
            }
          } else {
            return 'interactive';
          }
        }
      },
      data: function() {
        return model;
      }
    });
  };

  template = "<div class=\"netlogo-model\" style=\"min-width: {{width}}px;\"\n     tabindex=\"1\" on-keydown=\"@this.fire('check-action-keys', @event)\"\n     on-focus=\"@this.fire('track-focus', @node)\"\n     on-blur=\"@this.fire('track-focus', @node)\">\n  <div id=\"modal-overlay\" class=\"modal-overlay\" style=\"{{# !isOverlayUp }}display: none;{{/}}\" on-click=\"drop-overlay\"></div>\n  <div class=\"netlogo-header\">\n    <div class=\"netlogo-subheader\">\n      <div class=\"netlogo-powered-by\">\n        <a href=\"http://ccl.northwestern.edu/netlogo/\">\n          <img style=\"vertical-align: middle;\" alt=\"NetLogo\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAANcSURBVHjarJRdaFxFFMd/M/dj7252uxubKms+bGprVyIVbNMWWqkQqtLUSpQWfSiV+oVFTcE3DeiDgvoiUSiCYLH2oVoLtQ+iaaIWWtE2FKGkkSrkq5svN+sm7ma/7p3x4W42lEbjQw8MM8yc87/nzPnNFVprbqWJXyMyXuMqx1Ni6N3ny3cX8tOHNLoBUMvESoFI2Xbs4zeO1lzREpSrMSNS1zkBDv6uo1/noz1H7mpvS4SjprAl2AZYEqzKbEowBAgBAkjPKX2599JjT7R0bj412D0JYNplPSBD1G2SmR/e6u1ikEHG2vYiGxoJmxAyIGSCI8GpCItKimtvl2JtfGujDNkX6epuAhCjNeAZxM1ocPy2Qh4toGQ5DLU+ysiuA2S3P0KgJkjAgEAlQylAA64CG/jlUk6//ng4cNWmLK0yOPNMnG99Rs9LQINVKrD+wmke7upg55PrWP3eYcwrlykpKCkoelDy/HVegQhoABNAepbACwjOt72gZkJhypX70YDWEEklue+rbnYc2MiGp1upPfYReiJJUUG58gFXu4udch1wHcjFIgy0HyIjb2yvBpT2F6t+6+f+D15lW8c9JDo7iPSdgVIRLUqL2AyHDQAOf9hfbqxvMF98eT3RuTS1avHyl+Stcphe2chP9+4k/t3RbXVl3W+Ws17FY56/w3VcbO/koS/eZLoAqrQMxADZMTYOfwpwoWjL4+bCYcgssMqGOzPD6CIkZ/3SxTJ0ayFIN6/BnBrZb2XdE1JUgkJWkfrUNRJnPyc16zsbgPyXIUJBpvc+y89nk/S8/4nek3NPGeBWMwzGvhUPnP6RubRLwfODlqqx3LSCyee2MnlwMwA2RwgO5qouVcHmksUdJweYyi8hZkrUjgT5t/ejNq0jBsSqNWsKyT9uFtxw7Bs585d3g46KOeT2bWHmtd14KyP+5mzqpsYU3OyioACMhGiqPTMocsrHId9cy9BLDzKxq8X3ctMwlV6yKSHL4fr4dd0DeQBTBUgUkvpE1kVPbqkX117ZzuSaFf4zyfz5n9A4lk0yNU7vyb7jTy1kmFGipejKvh6h9n0W995ZPTu227hqmCz33xXgFV1v9NzI96NfjndWt7XWCB/7BSICFWL+j3lAofpCtfYFb6X9MwCJZ07mUsXRGwAAAABJRU5ErkJggg==\"/>\n          <span style=\"font-size: 16px;\">powered by NetLogo</span>\n        </a>\n      </div>\n    </div>\n    <editableTitle title=\"{{modelTitle}}\" isEditing=\"{{isEditing}}\"/>\n    {{# !isReadOnly }}\n      <div class=\"flex-column\" style=\"align-items: flex-end; user-select: none;\">\n        <div class=\"netlogo-export-wrapper\">\n          <span style=\"margin-right: 4px;\">File:</span>\n          <button class=\"netlogo-ugly-button\" on-click=\"open-new-file\"{{#isEditing}} disabled{{/}}>New</button>\n        </div>\n        <div class=\"netlogo-export-wrapper\" style=\"display: block;\">\n          <span style=\"margin-right: 4px;\">Export:</span> \n          <button class=\"netlogo-ugly-button\" on-click=\"export-nlogo\"{{#isEditing}} disabled{{/}}>NetLogo</button>\n          <form action=\"exportGbccReport\" method=\"post\" enctype=\"multipart/form-data\" style=\"display: inline-block\">\n            <input type=\"text\" name=\"roomname\" class=\"roomNameInput\" style=\"display:none\" value=\"\"> \n            <input type=\"text\" name=\"schoolname\" class=\"schoolNameInput\" style=\"display:none\" value=\"\"> \n            <button class=\"netlogo-ugly-button\" type=\"submit\">Report</button>\n          </form>\n        </div>\n      </div>\n    {{/}}\n  </div>\n\n  <div class=\"netlogo-interface-unlocker-container{{#!someDialogIsOpen}} enabled{{/}}\" on-click=\"toggle-interface-lock\">\n    <div class=\"netlogo-interface-unlocker {{#isEditing}}interface-unlocked{{/}}\"></div>\n    <spacer width=\"5px\" />\n    <span class=\"netlogo-interface-mode-text\">Mode: {{#isEditing}}Authoring{{else}}Interactive{{/}}</span>\n  </div>\n\n  <helpDialog isOverlayUp=\"{{isOverlayUp}}\" isVisible=\"{{isHelpVisible}}\" stateName=\"{{stateName}}\" wareaHeight=\"{{height}}\" wareaWidth=\"{{width}}\"></helpDialog>\n  <contextMenu></contextMenu>\n\n  <label class=\"netlogo-speed-slider{{#isEditing}} interface-unlocked{{/}}\">\n    <span class=\"netlogo-label\">model speed</span>\n    <input type=\"range\" min=-1 max=1 step=0.01 value=\"{{speed}}\"{{#isEditing}} disabled{{/}} />\n    <tickCounter isVisible=\"{{primaryView.showTickCounter}}\"\n                 label=\"{{primaryView.tickCounterLabel}}\" value=\"{{ticks}}\" />\n  </label>\n\n  <div style=\"position: relative; width: {{width}}px; height: {{height}}px\"\n       class=\"netlogo-widget-container{{#isEditing}} interface-unlocked{{/}}\"\n       on-contextmenu=\"@this.fire('show-context-menu', { component: @this }, @event)\"\n       on-click=\"@this.fire('deselect-widgets', @event)\" on-dragover=\"hail-satan\">\n    <resizer isEnabled=\"{{isEditing}}\" isVisible=\"{{isResizerVisible}}\" />\n    {{#widgetObj:key}}\n      {{# type === 'view'     }} <viewWidget    id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} ticks=\"{{ticks}}\" /> {{/}}\n      {{# type === 'textBox'  }} <labelWidget   id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} /> {{/}}\n      {{# type === 'switch'   }} <switchWidget  id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} /> {{/}}\n      {{# type === 'button'   }} <buttonWidget  id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} errorClass=\"{{>errorClass}}\" ticksStarted=\"{{ticksStarted}}\"/> {{/}}\n      {{# type === 'slider'   }} <sliderWidget  id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} errorClass=\"{{>errorClass}}\" /> {{/}}\n      {{# type === 'chooser'  }} <chooserWidget id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} /> {{/}}\n      {{# type === 'monitor'  }} <monitorWidget id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} errorClass=\"{{>errorClass}}\" /> {{/}}\n      {{# type === 'inputBox' }} <inputWidget   id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} /> {{/}}\n      {{# type === 'plot'     }} <plotWidget    id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} /> {{/}}\n      {{# type === 'output'   }} <outputWidget  id=\"{{>widgetID}}\" isEditing=\"{{isEditing}}\" left=\"{{left}}\" right=\"{{right}}\" top=\"{{top}}\" bottom=\"{{bottom}}\" widget={{this}} text=\"{{outputWidgetOutput}}\" /> {{/}}\n    {{/}}\n  </div>\n\n  <div class=\"netlogo-tab-area\" style=\"max-width: {{Math.max(width, 500)}}px\">\n    {{# !isReadOnly }}\n    <label class=\"netlogo-tab{{#showConsole}} netlogo-active{{/}}\">\n      <input id=\"console-toggle\" type=\"checkbox\" checked=\"{{showConsole}}\" />\n      <span class=\"netlogo-tab-text\">Command Center</span>\n    </label>\n    {{#showConsole}}\n      <console output=\"{{consoleOutput}}\" isEditing=\"{{isEditing}}\" checkIsReporter=\"{{checkIsReporter}}\" />\n    {{/}}\n    {{/}}\n    <label class=\"netlogo-tab{{#showCode}} netlogo-active{{/}}\">\n      <input id=\"code-tab-toggle\" type=\"checkbox\" checked=\"{{ showCode }}\" />\n      <span class=\"netlogo-tab-text{{#lastCompileFailed}} netlogo-widget-error{{/}}\">NetLogo Code</span>\n    </label>\n    {{#showCode}}\n      <codePane code='{{code}}' lastCompiledCode='{{lastCompiledCode}}' lastCompileFailed='{{lastCompileFailed}}' isReadOnly='{{isReadOnly}}' />\n    {{/}}\n      <div class=\"netlogo-gallery-tab\">\n        <span class=\"netlogo-tab-text\">Gallery</span>\n      </div>\n      <div class='netlogo-gallery-tab-content'></div>      \n    <label class=\"netlogo-tab{{#showInfo}} netlogo-active{{/}}\">\n      <input id=\"info-toggle\" type=\"checkbox\" checked=\"{{ showInfo }}\" />\n      <span class=\"netlogo-tab-text\">Model Info</span>\n    </label>\n    {{#showInfo}}\n      <infotab rawText='{{info}}' isEditing='{{isEditing}}' />\n    {{/}}\n  </div>\n\n  <input id=\"import-drawing-input\" type=\"file\" name=\"import-drawing\" style=\"display: none;\" />\n  <input id=\"import-world-input\"   type=\"file\" name=\"import-world\"   style=\"display: none;\" />\n\n</div>";

  partials = {
    errorClass: "{{# !compilation.success}}netlogo-widget-error{{/}}",
    widgetID: "netlogo-{{type}}-{{id}}"
  };

}).call(this);

//# sourceMappingURL=skeleton.js.map
