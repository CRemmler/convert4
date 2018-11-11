
var applet1;
Graph = (function() {
  var viewWidth;
  var viewHeight;
  var viewOffsetWidth;
  var viewOffsetHeight;
  var graphWidth;
  var graphHeight;
  var boundaries;
  var points = {};
  var graphLoaded = false;
  
  ////// SETUP MAP //////

  function setupInterface() {
    if ($("#graphContainer").length === 0) {
      viewWidth = parseFloat($(".netlogo-canvas").css("width"));
      viewHeight = parseFloat($(".netlogo-canvas").css("height"));
      Interface.setupEnvironment("graph");
      applet1 = new GGBApplet({filename: "geogebra-default.ggb","showToolbar":true, "appletOnLoad": appletOnLoadHidden}, true);
      applet1.inject('graphContainer');
    }
  }
  
  function appletOnLoadHidden(){
    console.log("APPLET ONLOAD HIDDEN");
    showGraph();
    updateGraph();
    hideGraph();
    ggbApplet.setErrorDialogsActive(false);  
  }
  
  function appletOnLoadVisible() {
    console.log("APPLET ONLOAD VISIBLE");
    showGraph();
    updateGraph(); 
    ggbApplet.setErrorDialogsActive(false);  
  }
  
  function appletOnLoadDeleteFile(filename) {
    console.log("applet onload delete file");
    showGraph();
    updateGraph(); 
    ggbApplet.setErrorDialogsActive(false);   
    console.log(filename);
    console.log("APPLET ONLOAD VISIBLE DELETE FILE");
    socket.emit('delete file', {'filename': filename});
  }
  
  ////// DISPLAY GRAPH //////
  
  function updateGraph() {
    if (ggbApplet) {
      ggbApplet.setWidth(parseInt($("#graphContainer").css("width")) - 2);
      ggbApplet.setHeight(parseInt($("#graphContainer").css("height")) - 2);//+ viewHeight + Math.random(1)); 
      
      $("#opacityWrapper").css("top",parseInt($("#graphContainer").css("top")) - 18 + "px");
      $("#opacityWrapper").css("left",$("#graphContainer").css("left"));
      var properties = JSON.parse(ggbApplet.getViewProperties());
      graphWidth = properties.width;
      graphHeight = properties.height;
      viewOffsetWidth = viewWidth - graphWidth;
      viewOffsetHeight = viewHeight - graphHeight;
      var xMin = properties.xMin;
      var yMin = properties.yMin;;    
      var xScale = properties.invXscale;
      var yScale = properties.invYscale;
      var xMax = graphWidth * xScale + xMin; // how many sections there are  
      var yMax = graphHeight * yScale + yMin;
      boundaries = {xmin: xMin, xmax: xMax, ymin: yMin, ymax: yMax};
      graphLoaded = true;
    }
  }
  
  ////// COORDINATE CONVERSION //////

  function patchToGraph(coords) {
    if (graphLoaded) {
      var xcor = coords[0];
      var ycor = coords[1];
      var pixelX = universe.view.xPcorToPix(xcor);
      var pixelY = universe.view.yPcorToPix(ycor);
      pixelX -= (viewOffsetWidth );
      pixelY -= (viewOffsetHeight );
      var pixelPercentX = (pixelX / (graphWidth));
      var pixelPercentY = 1 - (pixelY / (graphHeight));
      var boundaryMinX = boundaries.xmin;
      var boundaryMinY = boundaries.ymin;
      var boundaryMaxX = boundaries.xmax;
      var boundaryMaxY = boundaries.ymax;
      var pointX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
      var pointY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
      return [pointX, pointY];
    } else { return [ 0, 0 ]}
  }
  
  function graphToPatch(coords) {
    if (graphLoaded) {
      var pointPositionX = coords[0];
      var pointPositionY = coords[1];
      var boundaryMinX = boundaries.xmin;
      var boundaryMinY = boundaries.ymin;
      var boundaryMaxX = boundaries.xmax;
      var boundaryMaxY = boundaries.ymax;
      if ( pointPositionX < boundaryMinX 
        || pointPositionX > boundaryMaxX
        || pointPositionY < boundaryMinY
        || pointPositionY > boundaryMaxY) {
        return (["out of bounds", "out of bounds"]);
      }
      var pointPercentX = 1 - ((boundaryMaxX - pointPositionX) / (boundaryMaxX - boundaryMinX));
      var pointPercentY = (boundaryMaxY - pointPositionY) / (boundaryMaxY - boundaryMinY);
      var pixelX = pointPercentX * graphWidth;
      var pixelY = pointPercentY * graphHeight;
      pixelX += viewOffsetWidth;//(viewOffsetWidth / 2);    
      pixelY += viewOffsetHeight;//(viewOffsetHeight / 2);
      var patchXcor = universe.view.xPixToPcor(pixelX);
      var patchYcor = universe.view.yPixToPcor(pixelY);
      return ([patchXcor, patchYcor]);
    } else { return [ 0, 0 ]}
  }
  
  
  ////// SHOW AND HIDE GRAPH //////
  
  function showGraph() {
    Interface.showEnvironment("graph");
    updateGraph();
    world.triggerUpdate();
  }
  
  function hideGraph() {
    Interface.hideEnvironment("graph");
  }  


  ///////// IMPORT GGB ///////
  
  function uploadGgb() { 
    $("#ggbzip").one("change", function() {
      $("#ggbzip").off();
      var files = $(this).get(0).files;
      if (files.length > 0){
        var formData = new FormData();
        var file = files[0];
        formData.append('uploads[]', file, file.name);
        $.ajax({
           url: '/uploadggb',
           type: 'POST',
           data: formData,
           processData: false,
           contentType: false,
           success: function(data){
               console.log('upload successful!\n' + data);
           }
         });
       }
    });
    $("#ggbzip").click();
    $("#ggbzip").value = "";
  }

  function importGgbFile(filename) {
    console.log("import ggb filename "+filename);
    applet1 = new GGBApplet({filename: filename,"showToolbar":true, "appletOnLoad": appletOnLoadVisible}, true);
    applet1.inject('graphContainer');
  }
  
  function importGgbDeleteFile(data) {
    //console.log("import ggb delete file "+filename);
    //applet1 = new GGBApplet({filename: filename,"showToolbar":true, "appletOnLoad": appletOnLoadDeleteFile(filename)}, true);
    //applet1.inject('graphContainer');
    setAll(data);
  }
  
  function importGgb() {
    $("#importgbccfile").one("change", function() {
      $("#importgbccfile").off();
      //$("#importgbcctype").val("ggb");
      var files = $(this).get(0).files;
      if (files.length > 0){
        var formData = new FormData();
        var file = files[0];
        formData.append(socket.id, file);
        $.ajax({
           url: '/importgbccform?filetype=ggb',
           type: 'POST',
           data: formData,
           processData: false,
           contentType: false,
           success: function(data){
               console.log('upload successful!\n' + data);
              $("#importgbccfile").val("");
           }
         });
       }
    });
    $("#importgbccfile").click();
    $("#importgbccfile").value = "";
  }
 
  function exportGgb(filename) {
    $("#exportgbccfilename").val(filename);
    $("#ggbxml").val(ggbApplet.getXML());
    $("#exportgbcctype").val("ggb");
    $("#exportgbccform").submit();
  }
  
  function getGgbList() {
    return ["some file names"];
  }
  
  //////// POINTS /////////

  function createPoint(name, coords) {
    //console.log("create point",name,coords);
    var x = coords[0];
    var y = coords[1];
    ggbApplet.evalCommand(name + " = ("+x+", "+y+")");
  }
  
  function createPoints(points) {
    var point;
    for (var i=0; i<points.length; i++) {
      point = points[i];
      createPoint(point[0], point[1]);
    }
  }
  
  function getPoint(name) {
    return exists(name) ? [name, getXy(name)] : [ "undefined", [ 0,0] ];
  }
  
  function getPoints() {
    var pointList = [];
    var objectNames = ggbApplet.getAllObjectNames();
    var name;
    var x, y;
    for (var i=0; i<objectNames.length; i++) {
      name = objectNames[i];
      if (getObjectType(name) === "point") {
        pointList.push(getPoint(name));
      }
    }
    return pointList;
  }
  
  function deletePoint(name) {
    if (exists(name)) { ggbApplet.deleteObject(name); }
  }

  function deletePoints() {
    var points = getPoints();
    for (var i=0; i<points.length; i++) {
      deletePoint(points[i][0]);
    }
  }

  /////// POINT ATTRIBUTES ////////
  
  function setX(name, x) {
    var y = ggbApplet.getYcoord(name);
    if (exists(name)) {
      ggbApplet.setCoords(name, x, y);
    } else {
      ggbApplet.evalCommand(name + " = ("+x+", "+y+")");
    }
  }
  
  function setY(name, y) {
    var x = ggbApplet.getXcoord(name);
    if (exists(name)) {
      ggbApplet.setCoords(name, x, y);
    } else {
      ggbApplet.evalCommand(name + " = ("+x+", "+y+")");
    }
  }
  
  function setXy(name, coords) {
    var x = coords[0];
    var y = coords[1];
    if (exists(name)) {
      ggbApplet.setCoords(name, x, y);
    } else {
      ggbApplet.evalCommand(name + " = ("+x+", "+y+")");
    }
  }
  
  function getX(name) {
    return exists(name) ? ggbApplet.getXcoord(name) : 0;
  }
  
  function getY(name) {
    return exists(name) ? ggbApplet.getYcoord(name) : 0;
  }
  
  function getXy(name) {
    return exists(name) ? [ggbApplet.getXcoord(name), ggbApplet.getYcoord(name)] : [ 0, 0];
  }
  
  /////// OBJECTS ////////
  
  function getObjects() {
    var objectList = [];
    var objectNames = ggbApplet.getAllObjectNames();
    var name;
    var value;
    for (var i=0; i<objectNames.length; i++) {
      name = objectNames[i];
      
      value = getObject(objectNames[i]);
      objectList.push(value)
    }
    return objectList;
  }
  
  function getObject(name) {
    var result = {};
    var objectType = ggbApplet.getObjectType(name);    
    var valueTypes = [ "numeric", "text", "boolean" ];
    var commandTypes = [  ];
    var valueString = ggbApplet.getValueString(name);
    result.valueString = valueString;
    var commandString = ggbApplet.getCommandString(name);
    result.command = commandString ? commandString : valueString; 
    result.commandString = commandString;
    if (result.command.indexOf("=") < 0) {
      result.command = name + " = " + result.command;
    } 
    //console.log(name+" '"+ result.command + "'");
    result.color = ggbApplet.getColor(name); 
    result.lineStyle = ggbApplet.getLineStyle(name); 
    result.lineThickness = ggbApplet.getLineThickness(name);
    result.pointSize = ggbApplet.getPointSize(name);
    result.pointStyle = ggbApplet.getPointStyle(name); 
    result.visible = ggbApplet.getVisible(name);
    result.filling = ggbApplet.getFilling(name);
    result.labelVisible = ggbApplet.getLabelVisible(name);
    result.draggable = ggbApplet.isMoveable(name);
    if (objectType === "numeric" || objectType === "boolean" || objectType === "text") { result.visible = false; }
    var resultString = JSON.stringify(result);
    return [ name, resultString ];  
  }
  
  function createObjects(objects) {
    for (var i=0; i<objects.length; i++) {
      createObject(objects[i]);
    }
  }
  
  function hexToRgb(hex) {
    hex = hex.replace("#","");
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}
  
  function createObject(objectList) {
    var name = objectList[0];
    var result = JSON.parse(objectList[1]);
    //deleteObject(name);
    evalCommand(result.command);
    var color = hexToRgb(result.color);
    ggbApplet.setColor(name, color[0], color[1], color[2]);  
    ggbApplet.setLineStyle(name, result.lineStyle);  
    ggbApplet.setLineThickness(name, result.lineThickness);  
    ggbApplet.setPointSize(name, result.pointSize);  
    ggbApplet.setPointStyle(name, result.pointStyle);  
    ggbApplet.setVisible(name, result.visible);
    ggbApplet.setFilling(name, result.filling);
    ggbApplet.setLabelVisible(name, result.labelVisible);
    setDraggable(name, result.draggable);
    //if (result.xcoord && result.ycoord) { 
    //  ggbApplet.setCoords(name, result.xcoord, result.ycoord, 0); 
    //}
  }
  
  function renameObject(name1, name2) {
    if (exists(name1)) { ggbApplet.renameObject(name1, name2); }
  }
  
  function deleteObject(name) {
    if (exists(name)) { ggbApplet.deleteObject(name); }
  }
  
  function deleteObjects() {
    var objects = ggbApplet.getAllObjectNames();
    for (var i=0; i<objects.length; i++) {
      ggbApplet.deleteObject(objects[i]);
    }
  }
  
  //////// SHOW AND HIDE ///////
  
  function hideObject(name) {
    if (exists(name)) { ggbApplet.setVisible(name, false); }
  }

  function showObject(name) {
    if (exists(name)) { ggbApplet.setVisible(name, true); }
  }
  
  /////// OBJECT ATTRIBUTES ///////
  
  function getValue(arg) {
    var value = ggbApplet.getValue(arg);
    return (value || value === 0) ? value : "undefined";
  }
  
  function getObjectType(name) {
    return (exists(name)) ? ggbApplet.getObjectType(name) : "undefined";
  }
  
  function exists(name) {
    return (ggbApplet) ? ggbApplet.exists(name) : false;
  }
  
  function getCommandString(name) {
    return (exists(name)) ? ggbApplet.getCommandString(name) : "undefined";
  }
  
  function getValueString(name) {
    return (exists(name)) ? ggbApplet.getValueString(name) : "undefined";
  }
  
  function setDraggable(name, draggable) {
    if (exists(name)) {
      if (draggable) {
        ggbApplet.setFixed(name, false, true);
      } else {
        ggbApplet.setFixed(name, true, false);      
      }
    }
  }
  
  function getDraggable(name) {
    return exists(name) ? ggbApplet.isMoveable(name) : false;
  }
  
  function showObjectLabel(name) {
    ggbApplet.setLabelVisible(name, true);
  }
  
  function hideObjectLabel(name) {
    ggbApplet.setLabelVisible(name, false);
  }
  
  /////// GEOGEBRA EVAL ///////
  
  function evalCommand(cmdString) {
    try {
        if (graphLoaded) { 
          ggbApplet.evalCommand(cmdString); 
        } else {
          console.log("cannot evalCommand");
        };
      //}
    } catch (ex) {
      console.log("cannot evalCommand");
    }
  }
  
  function evalReporter(string) {
    return "0";
  }
  
  function getAll() {
    return ggbApplet.getXML();
  }
  
  function setAll(xmlString) {
    ggbApplet.setXML(xmlString);
  }
  
  /////// GRAPH APPEARANCE ///////
  
  function showToolbar() {
    ggbApplet.showToolBar(true);
  }
  
  function hideToolbar() {
    ggbApplet.showToolBar(false);
    updateGraph();
  }
  
  function bringToFront() {
    Interface.bringToFront("graph"); 
  }
  
  function sendToBack() {
    Interface.sendToBack("graph");
  }
  
  function setOpacity(value) {
    Interface.setOpacity("graph", value);
  }
  
  function getOpacity() {
    return Interface.getOpacity("graph");
  }
  
  function setGraphOffset(offset) {
    Interface.setGraphOffset("graph", offset);
    if (offset.length === 4) {
      ggbApplet.setWidth(width - 2);
      ggbApplet.setHeight(height - 2);
    }
    updateGraph();
  }
  function getGraphOffset() {
    return Interface.getGraphOffset();
  }
  
  function centerView(center) {
    var x = center[0];
    var y = center[1];
    ggbApplet.evalCommand("CenterView(( " + x + ", " + y + " ))");
  }
  
  function mouseOn() {
    Interface.mouseOn("graph");
  }
  
  function mouseOff() {   
    Interface.mouseOff("graph");   
  }
  
  
  
  return {
    setupInterface: setupInterface,
    hideGraph: hideGraph,
    showGraph: showGraph,
    createPoint: createPoint,
    createPoints: createPoints,
    getPoints: getPoints,
    setX: setX,
    setY: setY,
    setXy: setXy,
    getX: getX,
    getY: getY,
    getXy: getXy,    
    getObjects: getObjects,
    createObjects: createObjects,
    getValue: getValue,
    getObjectType: getObjectType,
    renameObject: renameObject,
    deleteObject: deleteObject,
    hideObject: hideObject,
    showObject: showObject, 
    graphToPatch: graphToPatch,
    patchToGraph: patchToGraph,
    evalCommand: evalCommand,
    evalReporter: evalReporter,
    importGgb: importGgb,
    objectExists: exists,
    getObject: getObject,
    updateGraph: updateGraph,
    deleteObjects: deleteObjects,
    getAll: getAll,
    setAll: setAll,
    showToolbar: showToolbar,
    hideToolbar: hideToolbar,
    showObjectLabel: showObjectLabel,
    hideObjectLabel: hideObjectLabel,
    
    bringToFront: bringToFront,
    sendToBack: sendToBack,
    setOpacity: setOpacity,
    getOpacity: getOpacity,
    showObjectLabel: showObjectLabel,
    hideObjectLabel: hideObjectLabel,
    setGraphOffset: setGraphOffset,
    getGraphOffset: getGraphOffset,
    mouseOff: mouseOff,
    mouseOn: mouseOn,
    uploadGgb: uploadGgb,
    importGgbFile: importGgbFile,
    getGgbList: getGgbList,
    importGgbDeleteFile: importGgbDeleteFile,
    
    deletePoints: deletePoints,
    deletePoint: deletePoint,
    getPoint: getPoint,
    centerView: centerView,
    exportGgb: exportGgb,
    createObject: createObject,
    setDraggable: setDraggable,
    getDraggable: getDraggable,
    getCommandString: getCommandString,
    getValueString: getValueString
  };
 
})();

