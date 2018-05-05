
Physics = (function() {
  
  var mode;
  
  function setupInterface() {
    viewWidth = parseFloat($(".netlogo-canvas").css("width"));
    viewHeight = parseFloat($(".netlogo-canvas").css("height"));
    var spanText = "<div class='physics-controls'>";
    spanText +=       "<i id='physicsOn' class='fa fa-toggle-on' aria-hidden='true'></i>";
    spanText +=       "<i id='physicsOff' class='fa fa-toggle-off' aria-hidden='true'></i>";
    spanText +=    "</div>";
    $(".netlogo-widget-container").append(spanText);
    spanText =    "<div id='physicsContainer'></div>";
    $(".netlogo-widget-container").append(spanText);
    $(".physics-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) + 8 + "px");
    $(".physics-controls").css("top", $(".netlogo-view-container").css("top"));
    $("#physicsContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
    $("#physicsContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
    $("#physicsContainer").css("left", $(".netlogo-view-container").css("left"));
    $("#physicsContainer").css("top", $(".netlogo-view-container").css("top"));
    $("#physicsContainer").css("display", "none");
    $("#physicsContainer").css("z-index","-1");
    $(".physics-controls").css("display","none");
    spanText = "<div id='physicsMenu'>";
    spanText +=       "<div class='leftControls'>"; //id='physicsDrawControls'>";
    spanText +=         "<div style='display:inline-block'><div><input type='checkbox' id='showAABB'></div><div><input type='checkbox' id='showCenter'></div></div>";
    
    
    spanText +=         " <img src='js/extensions/physics/images/a1.png' class='physics-drag purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a2.png' class='physics-drag white'>"
    spanText +=         " <img src='js/extensions/physics/images/a3.png' class='physics-line purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a4.png' class='physics-line white'>"
    spanText +=         " <img src='js/extensions/physics/images/a5.png' class='physics-circle purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a6.png' class='physics-circle white'>"
    spanText +=         " <img src='js/extensions/physics/images/a7.png' class='physics-triangle purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a8.png' class='physics-triangle white'>"
    
    
    spanText +=         " <img src='js/extensions/physics/images/a14.png' class='physics-target purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a13.png' class='physics-target white'>"
    spanText +=         " <img src='js/extensions/physics/images/a16.png' class='physics-group purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a15.png' class='physics-group white'>"
    spanText +=         " <img src='js/extensions/physics/images/a18.png' class='physics-force purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a17.png' class='physics-force white'>"
    
    /*
    spanText +=         " <img src='js/extensions/physics/images/a9.png' class='physics-group purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a10.png' class='physics-group white'>"
    spanText +=         " <img src='js/extensions/physics/images/a11.png' class='physics-target purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a12.png' class='physics-target white'>"
    */
    
    spanText +=       "</div>";
    spanText +=       "<div class='rightControls'>"; //"<div id='physicsStateControls'>";
    spanText +=         "<i class='fa fa-save' id='physicsSave' aria-hidden='true'></i>";
    spanText +=         " <i class='fa fa-refresh' id='physicsRefresh' aria-hidden='true'></i>";
    spanText +=         " <i class='fa fa-play' id='physicsPlay' aria-hidden='true'></i>";
    spanText +=         " <i class='fa fa-pause hidden' id='physicsPause' aria-hidden='true'></i>";
    spanText +=       "</div>";
    spanText += "</div>";
    $(".netlogo-view-container").append(spanText);  
    spanText =  "<div id='physicsSettings' class='hidden'>";
    spanText += "  <div class='leftControls'>";//"<span id='shapeSettings'>";
    spanText += "    <div id='dragModeSettings'>";
    spanText += "      ShapeId: <input id='shapeId' type='text'>";
    //spanText += "      Color: <select id='color'>";
    //spanText += "        <option value='(none)'>(none)</option>";
    //spanText += "        <option value='#ff000032'>red</option>";
    //spanText += "        <option value='#ffa50032'>orange</option>";
    //spanText += "        <option value='#ffff0032'>yellow</option>";
    //spanText += "        <option value='#00ff0032'>green</option>";
    //spanText += "        <option value='#0000ff32'>blue</option>";
    //spanText += "        <option value='#80008032'>purple</option>";
    //spanText += "        <option value='(other)'>(other)</option>";
    //spanText += "      </select>";
    spanText += "      BodyId: <select id='bodyIdShapeMode'>";
    spanText += "        <option></option>";
    spanText += "      </select>";
    spanText += "      D:<input type='number' id='density' title='density'>";
    spanText += "      R:<input type='number' id='restitution' title='restitution'>";
    spanText += "      F:<input type='number' id='friction' title='friction'>";
    spanText += "    </div>";
    spanText += "    <div id='groupModeSettings' class='in-line-block'>";
    spanText += "      BodyId: <input id='bodyIdBodyMode' type='text' value='123'>";
    spanText += "      Type:<select id='objectType' style='background-color:white'><option value='2'>Dynamic</option><option value='0'>Static</option><option value='1'>Ghost</option></select>";
    spanText += "      Angle:<input type='number' id='angle'>";
    spanText += "    </div>";
    spanText += "    <div id='targetModeSettings' class='in-line-block'>";
    spanText += "      TargetId: <input id='targetId' type='text' value='123'>";
    spanText += "      BodyId: <select id='bodyIdTargetMode'>";
    spanText += "        <option></option>";
    spanText += "      </select>";
    spanText += "      <input type='checkbox' id='snap'> Snap";
    spanText += "    </div>";
    
    spanText += "    <div id='worldModeSettings' class='in-line-block'>";
    spanText += "      Gravity:<input type='checkbox' id='gravityX'>x";
    spanText += "      <input type='checkbox' id='gravityY'>y Wrap:<input type='checkbox' id='wrapX'>x";
    spanText += "      <input type='checkbox' id='wrapY'>y";
    spanText += "    </div>";
    
    spanText += "  </div>"; 
    spanText += "  <div class='rightControls'>";//"<span id='physicsTrash'>";
    spanText += "    <i class='fa fa-trash-o' id='physicsDelete' aria-hidden='true'></i>";
    spanText += "  </div>";
    spanText += "</div>";
    
    $(".netlogo-view-container").append(spanText);  
    $("#physicsMenu").css("display", "none");
    $("#physicsSettings").css("top", parseFloat($(".netlogo-canvas").css("height")) - 34 + "px");
    
    
    //$("#physicsSettings").css("display", "none");
    //$("#physicsSettings").
    setupEventListeners();
  }
  
  function resetInterface() {
    $("#physicsContainer").css("display","inline-block");
    $(".physics-controls").css("display","inline-block");
    $("#physicsMenu").css("display","inline-block");
    $("#physicsMenu .purple").addClass("hidden");
    $("#physicsMenu .white").removeClass("hidden");
    
    updatePhysics("physicsOff");

  }
  
  function importPhysics(data) {
    var settings = data[0];
    var objects = data[1];
    //Images.clearImage();
    Physics.removePhysics();
    Maps.removeMap();
    Graph.removeGraph();
    world.triggerUpdate();
    Physicsb2.createWorld(settings);
    
    resetInterface();
  }
  
  //physics:create-object "body-0" [ [ "type-of-object" "body"] ]
  //physics:create-object "shape-0" [ ["type-of-object" "shape"] ["body-id" "body-0"] ]
  function createObject(name, settings) {
    var key, value;
    var parentId;
    
    var angle = 0; 
    var behavior = "dynamic";
    var color = "(none)";
    var coords = [0,0];
    var coords = [0,0];
    var force = 0;
    var density = 0.5;
    var friction = 0.5;
    var radius = 2;
    var restitution = 0.5;
    var typeOfObject = "body";
    var typeOfShape = "circle";
    var vertices = [[0,0], [2,2]];
    var bodyId;
    var shapeId;
    var bodyCoords, fixtureCoords;
    var position = "absolute";
    var targetId = undefined;
    for (var i=0; i<settings.length; i++) {
      key = settings[i][0];
      value = settings[i][1];
      switch ( key ) {
        case "heading": angle = value; break;
        case "behavior": behavior = value; break;
        case "body-id": bodyId = value; break;
        case "color": color = value; break;
        case "position": position = value; break;
        //case "coords": coords = value; break;
        case "coords": coords = value; break;
        case "density": density = value; break;
        case "force": force = value; break;
        case "friction": friction = value; break;
        case "radius": radius = value; break;
        case "restitution": restitution = value; break;
        case "type-of-object": typeOfObject = value; break;
        case "type-of-shape": typeOfShape = value; break;
        case "vertices": vertices = value; break;
        case "target-id": targetId = value; break;
      }
    }
    if (typeof color === "object") {
      color = rgbToHex(color);
    }
    
    if (typeOfObject === "body") {
      bodyId = name;
      Physicsb2.createBody({
        "bodyId": bodyId, 
        "behavior": behavior, 
        "coords": coords, 
        "angle": angle
      });
      Physicsb2.addBodyToWorld(bodyId);


    } else if (typeOfObject === "shape") {
      shapeId = name;
      Physicsb2.createFixture({
        "shapeId": shapeId, 
        "coords": coords, 
        "vertices": vertices, 
        "typeOfShape": typeOfShape, 
        "density": density,
        "friction": friction,
        "restitution": restitution,
        "color": color,
        "radius": radius
      });  
      Physicsb2.addFixtureToBody({
        "shapeId": shapeId, 
        "bodyId": bodyId, 
      });  
    } else if (typeOfObject === "target") {
      //console.log("index.html to physicsJs apply force");
      /*Physicsb2.addTargetToBody({
        "id": name+"-"+target,
        "bodyA": parentId,
        "coords": null
      });*/
      Physicsb2.applyForce({angle: angle, force: force, position: position, targetId: targetId});

    }
    Physicsb2.redrawWorld();
  }
  
  function rgbToHex(color) {
    var result;
    var r = color[0];
    var g = color[1];
    var b = color[2];
    if (color[3] != undefined) {
      var a = color[3];
      a = a.toString(16);
      if (a.length === 1) { a = "0" + a; }
    }
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    if (r.length === 1) { r = "0" + r; }
    if (g.length === 1) { g = "0" + g; }
    if (b.length === 1) { b = "0" + b; }
    result = r+g+b;
    if (color[3] != undefined) {
      var a = color[3];
      a = a.toString(16);
      if (a.length === 1) { a = "0" + a; }
      result = result + a;
    }
    return "#"+result;
  }
  
  /*
  function connectToObject(who, name) {
    var parentId = name+"body";
    //console.log("connect to turtle "+parentId+" to " + who);
    Physicsb2.updateBodyId(parentId, who);
  }
  
  function disconnectFromObject(who, name) {
    var parentId = name+"body";
    //console.log("connect to turtle "+parentId+" to " + who);
    Physicsb2.updateBodyId(who, parentId);
  }*/
  
  function removeObject(name) {
    return ([]);
  }
  
  function getObject(name) {
    var results = [];
    var body;
    var allBodies = Physicsb2.getAllBodies();
    for (obj in allBodies) {
      body = allBodies[obj];
      results.push(body.GetAngle());
    }
    return results;
  }
  
  function getObjects() {
    results = [];
    return results;
  }

  function setupEventListeners() {
    $(".physics-controls").on("click", "#physicsOn", function() {
      updatePhysics("physicsOff");
      triggerPhysicsUpdate();
      stopWorld();
      Physicsb2.updateOnce();
    });
    $(".physics-controls").on("click", "#physicsOff", function() {
      updatePhysics("physicsOn");
      //startWorld();
    });
    $("#physicsMenu").on("click", "#physicsReset", function() {
      
    });
    $("#physicsMenu").on("click", "#physicsPlay", function() {
      startWorld();
      $(this).addClass("hidden");
      $("#physicsPause").removeClass("hidden");
      $("#physicsMenu .leftControls").removeClass("selected");
    });
    $("#physicsMenu").on("click", "#physicsPause", function() {
      stopWorld();
      $(this).addClass("hidden");
      $("#physicsPlay").removeClass("hidden");
      
      $("#physicsMenu .leftControls").addClass("selected");
    });
    $("#physicsSettings").on("click", "#physicsDelete", function() {
      //console.log("delete it");
      Physicsb2.deleteSelected();
    });
    $(".netlogo-view-container").css("background-color","transparent"); 
    assignDrawButtonMode("drag"); 
    assignDrawButtonMode("line"); 
    assignDrawButtonMode("circle"); 
    assignDrawButtonMode("triangle"); 
    //assignDrawButtonMode("quad"); 
    assignDrawButtonMode("group"); 
    //assignDrawButtonMode("joint"); 
    assignDrawButtonMode("target");
    
    assignDrawButtonMode("force");
    assignSettings("color");
    assignSettings("density");
    assignSettings("restitution");
    assignSettings("friction");
    assignSettings("shapeId");
    assignSettings("bodyIdShapeMode");
    assignSettings("bodyIdBodyMode");
    assignSettings("angle");
    assignSettings("objectType");
    assignSettings("snap");
    assignSettings("targetId");
    assignSettings("bodyIdTargetMode");
    assignDisplay("showAABB");
    assignDisplay("showCenter");
    assignDisplay("gravityX");
    assignDisplay("gravityY");
    assignDisplay("wrapX");
    assignDisplay("wrapY");

  }
  
  function assignSettings(setting) {
    $("#physicsSettings .leftControls").on("change", "#"+setting, function () {
      console.log("setting " + setting + " changed");
      var value = $(this).val();
      var fixtureId = $("#shapeId").val();
      if (["color","density","restitution","friction","shapeId","bodyIdShapeMode"].indexOf(setting) > -1) {
        Physicsb2.updateFixture(null, setting, value);
      } else  if (["bodyIdBodyMode","angle", "objectType"].indexOf(setting) > -1) {
        Physicsb2.updateBody(null, setting, value);
      } else if (["targetId","bodyIdTargetMode","snap"].indexOf(setting) > -1) {
        Physicsb2.updateTarget(null, setting, value);
      } else if (["gravityX","gravityY","wrapX","wrapY"].indexOf(setting) > -1) {
        Physicsb2.updateWorld(setting, value);
      }
    });
  }
  
  function assignDrawButtonMode(buttonMode) {
    $("#physicsMenu .leftControls").on("click", ".physics-"+buttonMode, function() {
      if ($("#physicsMenu .leftControls").hasClass("selected")) {
        $("#physicsMenu .purple").addClass("hidden");
        $("#physicsMenu .white").removeClass("hidden");
        $(".physics-"+buttonMode+".purple").removeClass("hidden");
        $(".physics-"+buttonMode+".white").addClass("hidden");
        mode = buttonMode;
        Physicsb2.triggerModeChange(mode);
      }
    });
  }
  
  function assignDisplay(display) {
    $("#physicsMenu .leftControls").on("click", "#"+display, function() {
      if ($("#physicsMenu .leftControls").hasClass("selected")) {
        var showAABB = $("#showAABB:checked").length === 1 ? true : false;
        var showCenter = $("#showCenter:checked").length === 1 ? true : false;
        Physicsb2.triggerDisplayChange({"showAABB": showAABB, "showCenter": showCenter });
      }
    });
  }
  
  function getDrawButtonMode() {
    return mode;
  }
  
  function triggerPhysicsUpdate() {
    if (procedures.gbccOnPhysicsUpdate != undefined) { session.run('gbcc-on-physics-update'); }
  }

  function updatePhysics(state) {
    if (state === "physicsOn") {
      $("#physicsOff").removeClass("selected");
      $("#physicsOn").addClass("selected");
      $("#physicsContainer").addClass("selected");
      $("#physicsPlay").removeClass("hidden");
      $("#physicsMenu .rightControls i:not(#physicsPause)").removeClass("hidden");
      //$("#physicsMenu").addClass("selected");
      $("#physicsMenu div").addClass("selected");
      universe.repaint();
      Physicsb2.drawDebugData();
      $(".physics-drag").click()
    } else {
      $("#physicsOn").removeClass("selected");
      $("#physicsOff").addClass("selected");
      $("#physicsContainer").removeClass("selected");
      $("#physicsMenu").removeClass("selected");
      $("#physicsMenu .rightControls i").addClass("hidden");
      
      $("#physicsMenu div").removeClass("selected");
      
      $("#physicsMenu img.selected").removeClass("selected");
      $(".physics-drag").click()
    }
    $("#physicsSettings").addClass("hidden");
  }
  
  function startWorld() {
    $("#physicsPlay").addClass("inactive");
    $("#physicsPause").removeClass("inactive");
    Physicsb2.startWorld();
  }
  
  function stopWorld() {
    $("#physicsPause").addClass("inactive");
    $("#physicsPlay").removeClass("inactive");
    Physicsb2.stopWorld();
    if (universe.model) {
      for (var turtleId in universe.model.turtles) {
        world.turtleManager.getTurtle(turtleId).xcor = universe.model.turtles[turtleId].xcor;
        world.turtleManager.getTurtle(turtleId).ycor = universe.model.turtles[turtleId].ycor;
        world.turtleManager.getTurtle(turtleId)._heading = universe.model.turtles[turtleId].heading;
      }
    }
  }

  function removePhysics() {
    Physicsb2.stopWorld();
    $(".physics-controls").css("display","none");
    $("#physicsMenu").css("display","none");
    if ($("#physicsPlay").hasClass("inactive")) { 
      $("#physicsPlay").removeClass("inactive");  
      $("#physicsPause").addClass("inactive");  
    }
    $(".netlogo-canvas").off("keydown");
  }

  function patchToWorld(coords) {
    return coords;
  }
  
  function worldToPatch(coords) {
    return coords;
  }

  return {
    importPhysics: importPhysics,
    createObject: createObject,
    removeObject: removeObject,
    //connectToObject: connectToObject,
    //disconnectFromObject: disconnectFromObject,
    getObject: getObject,
    getObjects: getObjects,
    setupInterface: setupInterface,
    patchToWorld: patchToWorld,
    worldToPatch: worldToPatch,
    removePhysics: removePhysics,
    getDrawButtonMode: getDrawButtonMode
  };
 
})();

