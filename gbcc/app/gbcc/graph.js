
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
      spanText =    "<div id='graphContainer'></div>";
      $(".netlogo-widget-container").append(spanText);
      $("#graphContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
      $("#graphContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
      $("#graphContainer").css("left", $(".netlogo-view-container").css("left"));
      $("#graphContainer").css("top", $(".netlogo-view-container").css("top"));
      $("#graphContainer").css("display", "none");
      $(".netlogo-view-container").css("pointer-events","none");
      setupEventListeners();
    }
  }
  
  function appletOnLoadVisible() {
    setTimeout(function(){ 
      updateGraph(); 
      $("#graphContainer").css("display","inline-block");
      $(".netlogo-view-container").css("z-index","1");
      ggbApplet.setErrorDialogsActive(false);  
    }, 1000);
  }
  
  function setupEventListeners() {
    $(".netlogo-view-container").css("background-color","transparent");   
  }
  
  ////// DISPLAY GRAPH //////
  
  function updateGraph() {
    if (ggbApplet) {
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
      ggbApplet.setWidth(viewWidth + Math.random(1));
      ggbApplet.setHeight(viewHeight + Math.random(1)); 
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
  
  function showGraph(settings) {
    if (!applet1) 
    {
      $("#graphContainer").css("display","none");
      importGgb("geogebra-default.ggb");
    } else { 
      $("#graphContainer").css("display","inline-block");
      $(".netlogo-view-container").css("z-index","1");
      world.triggerUpdate();

    }
    $("#graphContainer").css("display","inline-block");
    $(".netlogo-view-container").css("pointer-events","none");
    // left, top, width, height
    /*if (settings.length == 4) {
      $("#mapContainer").css("left", settings[0] + "px");
      $("#mapContainer").css("top", settings[1] + "px");
      $("#mapContainer").css("width", settings[2] + "px");
      $("#mapContainer").css("height", settings[3] + "px");
    }*/
    drawPatches = false;
    world.triggerUpdate();
  }
  
  function hideGraph() {
    $("#graphContainer").css("display","none");
    $(".netlogo-view-container").css("z-index","0");
    $(".netlogo-view-container").css("pointer-events","auto");
    drawPatches = true;
    world.triggerUpdate();
  }

  ///////// GRAPH SETTINGS  ///////
  
  ///////// IMPORT GGB ///////
  
  function importGgb(filename) { 
    //drawPatches = true;
    //universe.repaint();
    $("#graphContainer").css("display","inline-block");
    applet1 = new GGBApplet({filename: filename,"showToolbar":true, "appletOnLoad": appletOnLoadVisible}, true);
    applet1.inject('graphContainer');
  }
  
  //////// POINTS /////////
  
  function createPoint(name, coords) {
    if (graphLoaded) { 
      deleteObject(name);
      ggbApplet.evalCommand(name+" = Point({"+coords[0]+", "+coords[1]+"})");
      var commands = $($($.parseXML(ggbApplet.getXML())).find("command"))
      var maxCommands = commands.length;
      //console.log("number of commands",maxCommands);
      var root = $.parseXML(ggbApplet.getXML());
      if (maxCommands > 0) {
        commandIndex = maxCommands - 1;
        //console.log($(commands[commandIndex]).attr("name"));
        if ($(commands[commandIndex]).attr("name") === "Point") {
          $(root).find("command")[commandIndex].remove();
          var elements = $(root).find("element");
          var maxElements = elements.length - 1;
          var $point = $($(root).find("element")[maxElements]).find("pointSize")[0];
          $($point).attr("val", "5");
          $objColor =  $($(root).find("element")[maxElements]).find("objColor")[0];
          $($objColor).attr("r", "77");
          $($objColor).attr("g", "77");
          $($objColor).attr("b", "255");
          $($objColor).attr("alpha", "0");
          rootString = (new XMLSerializer()).serializeToString(root);
          ggbApplet.setXML(rootString);
        }
      }
    }
  }
  
  function createPoints(points) {
    //console.log("create points",points);
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
  
  /////// POINT ATTRIBUTES ////////
  
  function setX(name, x) {
    var y = ggbApplet.getYcoord(name);
    if (ggbApplet.exists(name)) {
    //createPoint(name, [x, y]);
      ggbApplet.setCoords(name, x, y);
    } else {
      createPoint(name, [x, y]);
    }
  }
  
  function setY(name, y) {
    var x = ggbApplet.getXcoord(name);
    //createPoint(name, [x, y]);
    //ggbApplet.setCoords(name, x, y);
    if (ggbApplet.exists(name)) {
    //createPoint(name, [x, y]);
      ggbApplet.setCoords(name, x, y);
    } else {
      createPoint(name, [x, y]);
    }
  }
  
  function setXy(name, coords) {
    //createPoint(name, coords);
    var x = coords[0];
    var y = coords[1];
    //ggbApplet.setCoords(name, coords[0], coords[1]);
    if (ggbApplet.exists(name)) {
    //createPoint(name, [x, y]);
      ggbApplet.setCoords(name, x, y);
    } else {
      createPoint(name, [x, y]);
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
      //console.log(name, ggbApplet.getCommandString(name));
      if (getObjectType(name) === "point" && ggbApplet.getCommandString(name) === "") {
        //console.log("is just a point");
        value = name +" = Point({" + getX(name) + "," + getY(name) + "})";
      } else {
        value = name +" = " + ggbApplet.getCommandString(name);
      }
      //console.log(value);
      objectList.push(value);
    }
    return objectList;
  }
  
  function getObject(name) {
    if (getObjectType(name) === "point" && ggbApplet.getCommandString(name) === "") {
      //console.log("is just a point");
      value = name +" = Point({" + getX(name) + "," + getY(name) + "})";
    } else {
      value = name +" = " + ggbApplet.getCommandString(name);
    }
    return [ name, value ];
  }
  
  function createObjects(objects) {
    for (var i=0; i<objects.length; i++) {
      evalCommand(objects[i]);
    }
  }
  
  function renameObject(name1, name2) {
    if (exists(name1)) { ggbApplet.renameObject(name1, name2); }
  }
  
  function deleteObject(name) {
    if (exists(name)) { ggbApplet.deleteObject(name); }
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
  
  /////// GEOGEBRA EVAL ///////
  
  function evalCommand(cmdString) {
    console.log("evalCommand",cmdString);
    try {
      if (cmdString.includes("Point({")) {
        var equals = cmdString.indexOf("=");
        var firstParenthesis = cmdString.indexOf("{");
        var secondParenthesis = cmdString.indexOf("}");
        var comma = cmdString.indexOf(",");
        var name = cmdString.slice(0, equals).trim();
        var xcor = cmdString.slice(firstParenthesis + 1, comma).trim();
        var ycor = cmdString.slice(comma + 1, secondParenthesis).trim();
        xcor = parseFloat(xcor) || 0;
        ycor = parseFloat(ycor) || 0;
        createPoint(name, [xcor, ycor]);
      } else {
        if (graphLoaded) { ggbApplet.evalCommand(cmdString) };
      }
    } catch (ex) {
      console.log("cannot evalCommand")
    }
  }
  
  function evalReporter(string) {
    return "0";
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
    exists: exists,
    getObject: getObject,
    updateGraph: updateGraph
  };
 
})();

