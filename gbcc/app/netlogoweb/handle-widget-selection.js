(function() {
  window.handleWidgetSelection = function(ractive) {
    var deleteSelected, deselectThoseWidgets, hideResizer, justSelectIt, lockSelection, nudgeWidget, resizer, selectThatWidget, unlockSelection;
    resizer = function() {
      return ractive.findComponent('resizer');
    };
    lockSelection = function(_, component) {
      resizer().lockTarget(component);
    };
    unlockSelection = function() {
      resizer().unlockTarget();
    };
    deleteSelected = function() {
      var hasNoEditWindowUp, selected, widget;
      selected = resizer().get('target');
      widget = selected.get('widget');
      hasNoEditWindowUp = document.querySelector('.widget-edit-popup') == null;
      if (ractive.get('isEditing') && (selected != null) && (widget != null) && (widget.type !== "view") && hasNoEditWindowUp) {
        unlockSelection();
        deselectThoseWidgets();
        ractive.fire('unregister-widget', widget.id);
      }
    };
    justSelectIt = function(event) {
      resizer().setTarget(event.component);
    };
    selectThatWidget = function(event, trueEvent) {
      if (ractive.get("isEditing")) {
        trueEvent.preventDefault();
        trueEvent.stopPropagation();
        justSelectIt(event);
      }
    };
    deselectThoseWidgets = function() {
      resizer().clearTarget();
    };
    ractive.observe("isEditing", function(isEditing) {
      deselectThoseWidgets();
    });
    hideResizer = function() {
      if (ractive.get("isEditing")) {
        ractive.set('isResizerVisible', !ractive.get('isResizerVisible'));
        return false;
      } else {
        return true;
      }
    };
    nudgeWidget = function(event, direction) {
      var selected;
      selected = resizer().get('target');
      if ((selected != null) && (!ractive.get('someDialogIsOpen'))) {
        selected.nudge(direction);
        return false;
      } else {
        return true;
      }
    };
    ractive.on('*.select-component', justSelectIt);
    ractive.on('*.select-widget', selectThatWidget);
    ractive.on('deselect-widgets', deselectThoseWidgets);
    ractive.on('delete-selected', deleteSelected);
    ractive.on('hide-resizer', hideResizer);
    ractive.on('nudge-widget', nudgeWidget);
    ractive.on('*.lock-selection', lockSelection);
    return ractive.on('*.unlock-selection', unlockSelection);
  };

}).call(this);

//# sourceMappingURL=handle-widget-selection.js.map
