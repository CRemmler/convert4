
Graph = (function() {
  var applet1;
  var viewWidth;
  var viewHeight;
  var viewOffsetWidth;
  var viewOffsetHeight;
  var graphWidth;
  var graphHeight;
  var boundaries;
  var points = {};
  //var currentApplet = "";
  //var evalCmdToggle = 0;
  //var canvasWidth = 200;

  
  ////// SETUP MAP //////

  function setupInterface() {
    console.log("graph setup interface");
    if ($("#appletContainer").length === 0) {
      viewWidth = parseFloat($(".netlogo-canvas").css("width"));
      viewHeight = parseFloat($(".netlogo-canvas").css("height"));
      var spanText = "<div class='graph-controls'>";
      spanText +=       "<i id='graphOn' class='fa fa-toggle-on' aria-hidden='true'></i>";
      spanText +=       "<i id='graphOff' class='fa fa-toggle-off' aria-hidden='true'></i>";
      spanText +=    "</div>";
      $(".netlogo-widget-container").append(spanText);
      spanText =    "<div id='appletContainer'></div>";
      $(".netlogo-widget-container").append(spanText);
      $(".graph-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) + 8 + "px");
      $(".graph-controls").css("top", $(".netlogo-view-container").css("top"));
      $("#appletContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
      $("#appletContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
      $("#appletContainer").css("left", $(".netlogo-view-container").css("left"));
      $("#appletContainer").css("top", $(".netlogo-view-container").css("top"));
      applet1 = new GGBApplet({filename: "geogebra-default.ggb","showToolbar":true}, true);
      applet1.inject('appletContainer');
      $("#appletContainer").css("display", "none");
      setupEventListeners();
    }
  }
  
  function setupEventListeners() {
    $(".graph-controls").on("click", "#graphOn", function() {
      updateGraph("graphOn");
      triggerGraphUpdate();
    });
    $(".graph-controls").on("click", "#graphOff", function() {
      updateGraph("graphOff");
    });
    $(".netlogo-view-container").css("background-color","transparent");    
  }
  
  ////// DISPLAY GRAPH //////
  
  function updateGraph(state) {
    console.log(viewWidth);
    console.log(graphWidth);
    
    if (!viewOffsetWidth) {
      findGraphBoundaries(); 
    }
    
    if (state === "graphOff") {
      $("#graphOff").removeClass("selected");
      $("#graphOn").addClass("selected");
      $("#appletContainer").addClass("selected");
      $(".netlogo-view-container").css("z-index","0");
      drawPatches = true;
    } else {
      $("#graphOn").removeClass("selected");
      $("#graphOff").addClass("selected");
      $("#appletContainer").removeClass("selected");
      $(".netlogo-view-container").css("z-index","1");
      drawPatches = false;
    }
    world.triggerUpdate();
  }

  
  function triggerGraphUpdate() {
    if (procedures.gbccOnGraphUpdate != undefined) { session.run('gbcc-on-graph-update'); }
  }
  
  ////// COORDINATE CONVERSION //////
  
  function findGraphBoundaries() {
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
      
      boundaries = {xmin: xMin, xmax: xMax , ymin: yMin, ymax: yMax};
    }
  }
  /*
  function getBounds() {
    if (ggbApplet) {
      var properties = JSON.parse(ggbApplet.getViewProperties());
      var xMin = properties.xMin;
      var yMin = properties.yMin;;    
      var xScale = properties.invXscale;
      var yScale = properties.invYscale;
      width = viewWidth;
      height = viewHeight;
      var xMax = width * xScale + xMin; // how many sections there are  
      var yMax = height * yScale + yMin;
      boundaries = {xmin: xMin, xmax: xMax , ymin: yMin, ymax: yMax};
    } else {
      boundaries = {xmin: 0, xmax: 0, ymin: 0, ymax: 0};
    }
  }
  */
  function patchToGraph(coords) {
    //console.log(coords);
    applet1.getAppletObject().setSize(viewWidth + Math.random()*2, viewHeight + Math.random()*2);
    if (!viewOffsetWidth) {
      findGraphBoundaries(); 
    }
    var xcor = coords[0];
    var ycor = coords[1];
    var pixelX = universe.view.xPcorToPix(xcor);
    var pixelY = universe.view.yPcorToPix(ycor);
    pixelX -= (viewOffsetWidth );
    pixelY -= (viewOffsetHeight );
    var pixelPercentX = (pixelX / (graphWidth));
    var pixelPercentY = 1 - (pixelY / (graphHeight));
    //var boundaries = getBounds();
    var boundaryMinX = boundaries.xmin;
    var boundaryMinY = boundaries.ymin;
    var boundaryMaxX = boundaries.xmax;
    var boundaryMaxY = boundaries.ymax;
    var pointX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
    var pointY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
    return [pointX, pointY];
  }
  
  function graphToPatch(coords) {
    //console.log(coords);
    applet1.getAppletObject().setSize(viewWidth + Math.random()*2, viewHeight + Math.random()*2);
    if (!viewOffsetWidth) {
      findGraphBoundaries(); 
    }
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
    pixelX += (viewOffsetWidth / 2);    
    pixelY += (viewOffsetHeight / 2);
    var patchXcor = universe.view.xPixToPcor(pixelX);
    var patchYcor = universe.view.yPixToPcor(pixelY);
    return ([patchXcor, patchYcor]);
  }
  
  ////// SHOW AND HIDE GRAPH //////
  
  function showGraph() {
    $("#graphContainer").css("display","inline-block");
    $(".graph-controls").css("display","inline-block");
    updateGraph("graphOn");
    $("#appletContainer").css("display","inline-block");

    //map.setView(center, zoom);

    // left, top, width, height
    // if (settings.length == 4) {
      //$("#mapContainer").css("left", settings[0] + "px");
      //$("#mapContainer").css("top", settings[1] + "px");
      //$("#mapContainer").css("width", settings[2] + "px");
      //$("#mapContainer").css("height", settings[3] + "px");
    //}
  }
  
  function hideGraph() {
    updateGraph("graphOff");
    $(".graph-controls").css("display","none");
    $("#graphContainer").css("display","none");
  }

  ///////// GRAPH SETTINGS  ///////
  
  ///////// IMPORT GGB ///////
  
  function importFile(filename) { 
    applet1 = new GGBApplet({filename: filename,"showToolbar":true}, true);
    applet1.inject('appletContainer');
  }
  
  //////// POINTS /////////
  
  function createPoint(name, coords) {
    //console.log("create point");
    evalCommand(name+" = Point({"+coords[0]+", "+coords[1]+"})");
    var commands = $($($.parseXML(ggbApplet.getXML())).find("command"))
    var maxCommands = commands.length - 1;
    var root = $.parseXML(ggbApplet.getXML());
    $(root).find("command")[maxCommands].remove();
    var elements = $(root).find("element");
    
    var maxElements = elements.length - 1;
    console.log("number of elements",maxElements);
    var $point = $($(root).find("element")[maxElements]).find("pointSize")[maxElements];
    
    $($point).attr("val", "5");
    $objColor =  $($(root).find("element")[maxElements]).find("objColor")[maxElements];
    $($point).attr("r", "77");
    $($point).attr("g", "77");
    $($point).attr("b", "255");
    $($point).attr("alpha", "0");
    console.log($point);
    rootString = (new XMLSerializer()).serializeToString(root);
    ggbApplet.setXML(rootString);
  }
  
  function createPoints(points) {
    //console.log("create points",points);
    var point;
    for (var i=0; i<points.length; i++) {
      point = points[i];
      //console.log(point);
      createPoint(point[0], point[1]);
    }
  }
  
  function getPoint(name) {
    return [name, getXy(name) ];
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
    createPoint(name, [x, y]);
  }
  
  function setY(name, y) {
    var x = ggbApplet.getXcoord(name);
    createPoint(name, [x, y]);
  }
  
  function setXy(name, coords) {
    createPoint(name, coords);
  }
  
  function getX(name) {
    return ggbApplet.getXcoord(name);
  }
  
  function getY(name) {
    return ggbApplet.getYcoord(name);
  }
  
  function getXy(name) {
    return [ggbApplet.getXcoord(name), ggbApplet.getYcoord(name)];
  }
  
  /////// OBJECTS ////////
  
  function getObjects() {
    var objectList = [];
    var objectNames = ggbApplet.getAllObjectNames();
    var name;
    var value;
    for (var i=0; i<objectNames.length; i++) {
      name = objectNames[i];
      if (getObjectType(name) === "point") {
        value = name +" = Point({" + getX(name) + "," + getY(name) + "})";
      } else {
        value = ggbApplet.getCommandString(name);
      }
      objectList.push(value);
    }
    return objectList;
  }
  
  function createObjects(objects) {
    for (var i=0; i<objects.length; i++) {
      evalCommand(objects[i]);
    }
  }
  
  function renameObject(name1, name2) {
    ggbApplet.renameObject(name1, name2);
  }
  
  function deleteObject(name) {
    ggbApplet.deleteObject(name);
  }
  
  //////// SHOW AND HIDE ///////
  
  function hideObject(name) {
    ggbApplet.setVisible(name, false)
  }

  function showObject(name) {
    ggbApplet.setVisible(name, true)
  }
  
  /////// OBJECT ATTRIBUTES ///////
  
  function getValue(name) {
    return ggbApplet.getValue(name);
  }
  
  function getObjectType(name) {
    return ggbApplet.getObjectType(name);
  }
  
  function exists(name) {
    return ggbApplet.exists(name);
  }
  
  /////// GEOGEBRA EVAL ///////
  
  function evalCommand(cmdString) {
    try {
      console.log(cmdString);
      ggbApplet.evalCommand(cmdString);
    } catch (ex) {
      console.log("cannot evalCommand")
    }
  }
  
  function evalReporter(string) {
    return "0";
  }
  
  /*
  function resetInterface() {
    //console.log("reset interface");
    $("#appletContainer").css("display","inline-block");
    $(".graph-controls").css("display","inline-block");
    updateGraph("graphOff");
  }
  */

  /*
  function scaleCanvas(sourceWidth, sourceHeight) {
    var dataObj = {};
    var ratio = sourceWidth / sourceHeight;
    var width = canvasWidth;
    var height = canvasWidth;
    (sourceWidth > sourceHeight) ? height = width / ratio : width = height * ratio;
    dataObj.width = width;
    dataObj.height = height;
    return dataObj;
  }*/
    


/*
  
  function importGraph(data) {
    //Images.clearImage();
    var settings = data[0];
    var elements = data[1];
    Physics.removePhysics();
    Maps.removeMap();
    Graph.removeGraph();
    world.triggerUpdate();
    if (elements != "" && ggbApplet) { 
      ggbApplet.setXML(elements); 
    }
    resetInterface();
  }
  
  function createPoint(name, settings) {
    assignPointSettings(name, settings);
  }
  
  function updatePoint(name, settings) {
    assignPointSettings(name, settings);
  }
  
  
  function setX(name, xcor) { 
  
  }
  function setY(name, xcor) { 
  
  }
  function setXy(name, center) { 
    //console.log("set xy");
    createPoint(name, center);
  }
  
  
  function assignPointSettings(name, settings) {
    console.log("assign point settings",name,settings);
    if (!points[name]) { points[name] = {}; }
    if (!points[name].settings) { points[name].settings = {}; }
    points[name].settings["patch-coords"] = [ 0, 0 ];
    points[name].settings["graph-coords"] = undefined;
    for (var i=0; i<settings.length; i++) {
      key = settings[i][0];
      value = settings[i][1];
      points[name].settings[key] = value;
    }
    var graphCoords = points[name].settings["graph-coords"];
    if (!graphCoords) {
      graphCoords = patchToGraph(points[name].settings["patch-coords"]);
      points[name].settings["graph-coords"] = graphCoords;
    } 
    try {
      ggbApplet.evalCommand(name+" = Point({"+graphCoords[0]+", "+graphCoords[1]+"})");
    } catch (ex) {
      console.log("cannot add point to applet")
    }
  }
  
  function deletePoint(name) {
    if (ggbApplet) {
      ggbApplet.evalCommand("Delete("+name+")");
    }
  } 
  
  function getPoint(name, key) {
    if (points[name] && points[name].settings) {
      if (points[name].settings[key]) {
        return points[name].settings[key];
      }
    }
    return [ "does not exist" ]
  }
  
  function getPoints() {
    var pointList = [];
    var mark;
    for (point in points) {
      pointSettings = [];
      for (setting in points[point].settings) {
        mark = [ setting, points[point].settings[setting]];
        pointSettings.push(mark);
      }
      pointList.push([point, pointSettings]);
      
    }
    return pointList;
    
    return [];
  }
  
  
  function getElements() {
    var results = [];
    var result;
    var body;
    var allBodies = Physicsb2.getAllBodies();
    for (obj in allBodies) {
      body = allBodies[obj];
      //result = body.GetAngle() / Math.PI * 180;
      //if (result < 0) { result+= 360;}
      //results.push(Math.round(result));
      result = body.GetPosition();
      results.push([ Math.round(result.x), Math.round(result.y) ]);
    }
    //console.log(results);
    return results;

    //return ggbApplet.getXML()
  }

  function removeGraph() {
    $(".graph-controls").css("display","none");
    $("#appletContainer").css("display","none");
    if (ggbApplet) {
      var xml = $.parseXML(ggbApplet.getXML());
      var $xml = $(xml);
      var $construction = $xml.find('construction');
      $construction.find('element').each(function(){
        Graph.getApplet().getAppletObject().evalCommand("Delete("+$(this).attr('label')+")");
      });
      updateGraph("graphOn");
    }
  }
  

  function getApplet() {
    return applet1;
  }
  
  function evalCommand(cmdString) {
    if (Graph.getApplet().getAppletObject())
    Graph.getApplet().getAppletObject().evalCommand(cmdString);
  }
  
  function evalCommandGetLabels(cmdString) {
    return Graph.getApplet().getAppletObject().evalCommandGetLabels(cmdString);
  }
  
  function evalCommandCAS(cmdString) {
    return ggbApplet.evalCommand(cmdString);
  }
  */
  

  /*
  function getXml() {
    return getConstructions()
  }
  function setXml(xmlString) {
    return setConstructions(xmlString);
  }
  function createGraph() { }
  function showGraph() { 
    drawPatches = false;
    universe.repaint();
  }
  function deleteGraph() { }
  function hideGraph() { 
    drawPatches = false;
    universe.repaint();
  }
  function importGraph(data) {
    //console.log("import graph");
    resetInterface();
  }
  
  function loadFile(filename) {
    //console.log("load file");
    applet1 = new GGBApplet({filename: "js/extensions/graph/"+filename,"showToolbar":true}, true);
    applet1.inject('appletContainer');
    resetInterface();
  }
  

  
  
  function exportGraph() { }
  function createPoint(name, center) { 
    evalCommand(name+" = Point({"+center[0]+", "+center[1]+"})");
  }
  function createPoints(data) { 
    //console.log("create points",data);
    var pointsList = data;
    for (var p=0; p<pointsList.length; p++) {
      createPoint(pointsList[p][0], pointsList[p][1]);
    }
  }
  function getPoints() {
    console.log("get points"); 
    var xml = ggbApplet.getXML();
    var $xml = $(xml);
    var $construction = $xml.find("construction");
    var $elements = $construction.find("element");
    var element, $element;
    var $points, point;
    var x, y;
    var pointsList = [];
    //console.log($($elements)[1])
    for (var e = 0; e<$elements.length; e++) {
      element = $elements[e];
      type = element.getAttribute("type");
      $element = $(element);
      if (type === "point") {
        $points = $(element).find("coords");
        x = parseFloat($($points)[0].getAttribute("x"));
        y = parseFloat($($points)[0].getAttribute("y"));
        label = element.getAttribute("label");
        if (x != "NaN" && y != "NaN") {
          pointsList.push([ label, [x, y]]);
        }
      }
    }
          console.log(pointsList);
    //console.log(pointsList);
    return pointsList;
  }
  function getPoint(name) {
    var pointsList = getPoints();
    for (var i=0; i<pointsList.length; i++) {
      if (name === pointsList[i][0]) {
        return pointsList[i];
      }
    }
    return ["null" [ 0, 0]];
  }
  function deletePoints() { }
  function getConstructions() { 
    return ggbApplet.getXML();
  }
  function setConstructions(data) { 
    ggbApplet.setXML(data);
  }
  function appendConstructions(data) { }
  /*function setX(name, xcor) { }
  function setY(name, xcor) { }
  function setXy(name, center) { }
  function setLabel(name, label) { }
  function setElements(xml) { }
  function getX(name) { return parseFloat(getPoint(name)[1][0]); }
  function getY(name) { return parseFloat(getPoint(name)[1][1]); }
  function getXy(name) { 
    var point = getPoint(name);
    return [parseFloat(point[1][0]), parseFloat(point[1][1]) ]
  }
  function getLabel(name) { }
  function deletePoint(name) { 
    evalCommand("Delete("+name+")");
    //ggbApplet.evalCommand("Delete("+name+")");
  }*/
  //function graphToPatch(coords) { }
  //function patchToGraph(coords) { }
  //function evalCommand(command) { }
  /*
  function evalCommand(cmdString) {
    try {
      console.log(cmdString);
      //ggbApplet.evalCommand(cmdString);
      ggbApplet.evalCommand(cmdString);
    } catch (ex) {
      console.log("cannot evalCommand")
    }
  }
  */
  /*
  function adjustSize() {
    if (viewWidth && viewHeight) {
      //console.log("set it at ",viewWidth,viewHeight)
      ggbApplet.setWidth(viewWidth + random(1)*10);
      ggbApplet.setHeight(viewHeight + random(1)*10); 
    }
  }

  function evalCommandCas(command) { 
    console.log(command);
    return 0
  }
  
  function evalCommandGetLabels(command) {
      return ggbApplet.getValue(command);
   }*/

  return {
    /*
    importGraph: importGraph,
    createPoint: createPoint,
    updatePoint: updatePoint,
    deletePoint: deletePoint,
    getPoint: getPoint,
    getPoints: getPoints,
    getElements: getElements,
    setupInterface: setupInterface,
    getApplet: getApplet,
    evalCommand: evalCommand,
    evalCommandGetLabels: evalCommandGetLabels,
    evalCommandCAS: evalCommandCAS,
    patchToGraph: patchToGraph,
    graphToPatch: graphToPatch,
    removeGraph: removeGraph
    */
    /*
    createGraph: createGraph,
    deleteGraph: deleteGraph,
    hideGraph: hideGraph,
    importGraph: importGraph,
    importFile: importFile,
    exportGraph: exportGraph,
    createPoint: createPoint,
    createPoints: createPoints,
    getPoints: getPoints,
    deletePoints: deletePoints,
    getConstructions: getConstructions,
    setConstructions: setConstructions,
    appendConstructions: appendConstructions,
    setX: setX,
    setY: setY,
    setXy: setXy,
    setLabel: setLabel,
    setElements: setElements,
    getX: getX,
    getY: getY,
    getXy: getXy,
    getLabel: getLabel,
    deletePoint: deletePoint,
    graphToPatch: graphToPatch,
    patchToGraph: patchToGraph,
    evalCommand: evalCommand,
    evalCommandCas: evalCommandCas,
    evalCommandGetLabels: evalCommandGetLabels,
    showGraph: showGraph,
    getApplet: getApplet,
    setupInterface: setupInterface,
    getXml: getXml,
    setXml: setXml
    */
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
    exists: exists,
    renameObject: renameObject,
    deleteObject: deleteObject,
    hideObject: hideObject,
    showObject: showObject, 
    graphToPatch: graphToPatch,
    patchToGraph: patchToGraph,
    evalCommand: evalCommand,
    evalReporter: evalReporter,
    importFile: importFile
  };
 
})();

