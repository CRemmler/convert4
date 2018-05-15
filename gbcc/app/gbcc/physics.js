
Physics = (function() {
  
  var mode;
  
  ////// SETUP PHYSICS //////
  
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
    spanText +=         " <img src='./app/gbcc/physics-ui/a1.png' class='physics-drag purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a2.png' class='physics-drag white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a3.png' class='physics-line purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a4.png' class='physics-line white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a5.png' class='physics-circle purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a6.png' class='physics-circle white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a7.png' class='physics-triangle purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a8.png' class='physics-triangle white'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a14.png' class='physics-target purple hidden'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a13.png' class='physics-target white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a16.png' class='physics-group purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a15.png' class='physics-group white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a20.png' class='physics-force purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a19.png' class='physics-force white'>"
    
    //spanText +=         " <img src='./app/gbcc/physics-ui/a18.png' class='physics-force purple hidden'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a17.png' class='physics-force white'>"
    /*
    spanText +=         " <img src='./app/gbcc/physics-ui/a9.png' class='physics-group purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a10.png' class='physics-group white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a11.png' class='physics-target purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a12.png' class='physics-target white'>"
    */
    spanText +=       "</div>";
    spanText +=       "<div class='rightControls'>"; //"<div id='physicsStateControls'>";
    //spanText +=         "<i class='fa fa-save' id='physicsSave' aria-hidden='true'></i>";
    //spanText +=         " <i class='fa fa-refresh' id='physicsRefresh' aria-hidden='true'></i>";
    spanText +=         " <i class='fa fa-play' id='physicsPlay' aria-hidden='true'></i>";
    spanText +=         " <i class='fa fa-pause hidden' id='physicsPause' aria-hidden='true'></i>";
    spanText +=       "</div>";
    spanText += "</div>";
    $(".netlogo-view-container").append(spanText);  
    spanText =  "<div id='physicsSettings' class='hidden'>";
    spanText += "  <div class='leftControls'>";//"<span id='shapeSettings'>";
    spanText += "    <div id='dragModeSettings'>";
    spanText += "      ShapeId: <input id='shapeId' type='text'>";
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



    //$("#physicsContainer").css("display","inline-block");
    //$(".physics-controls").css("display","inline-block");
    //$("#physicsMenu").css("display","inline-block");
    //$("#physicsMenu .purple").addClass("hidden");
    //$("#physicsMenu .white").removeClass("hidden");
    
    updatePhysics("physicsOff");
    //Physicsb2.initializeView();
    Physicsb2.createWorld({width: viewWidth, height: viewHeight});//[[false, true], [viewWidth, viewHeight], [true, true]]);
    $("#physicsContainer").css("display", "none");
    setupEventListeners();
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
    assignSettings("gravityX");
    assignSettings("gravityY");
    assignSettings("wrapX");
    assignSettings("wrapY");

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
        Physicsb2.updateWorld(setting, value === "on" ? true : false);
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
  
  ////// DISPLAY PHYSICS //////
  
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
    
  
  function getDrawButtonMode() {
    return mode;
  }
  
  function triggerPhysicsUpdate() {
    if (procedures.gbccOnPhysicsUpdate != undefined) { session.run('gbcc-on-physics-update'); }
  }
  
  ////// SHOW AND HIDE GRAPH //////
  
  function showWorld(boundaries) {
    
    Physicsb2.initializeView();
    $("#physicsMenu").css("display","inline-block");
    $("#physicsContainer").css("display","inline-block");
    $(".physics-controls").css("display","inline-block");
    updatePhysics("physicsOn");
    $("#physicsContainer").css("display","inline-block");
    // left, top, width, height
    // if (settings.length == 4) {
      //$("#mapContainer").css("left", settings[0] + "px");
      //$("#mapContainer").css("top", settings[1] + "px");
      //$("#mapContainer").css("width", settings[2] + "px");
      //$("#mapContainer").css("height", settings[3] + "px");
    //}
  }
  
  function hideWorld() {
    updatePhysics("physicsOff");
    $(".physics-controls").css("display","none");
    $("#physicsContainer").css("display","none");    
    Physicsb2.stopWorld();
    $("#physicsMenu").css("display","none");
    if ($("#physicsPlay").hasClass("inactive")) { 
      $("#physicsPlay").removeClass("inactive");  
      $("#physicsPause").addClass("inactive");  
    }
  }

  ///////// START AND STOP WORLD  ///////

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

  ///////// PHYSICS SETTINGS  ///////
  function setGravityXy(data) {
    Physicsb2.updateWorld("gravityXY", data);
  }
  function getGravityXy() {
    var data = Physicsb2.getWorld().GetGravity();
    return [ data.x, data.y ];
  }
  function setWrapXy(coords) {
    Physicsb2.updateWorld("wrapX", data[0]);
    Physicsb2.updateWorld("wrapY", data[1]);
  }
  function getWrapXy() {
    return Physicsb2.getWorldSettings("wrap");
  }
  function setTimeStep(timestep) {
    Physicsb2.updateWorld("timestep", timestep);
  }
  function getTimeStep() {
    return Physicsb2.getWorldSettings("timestep");
  }
  function setVelocityIterations(velocityIterations) {
    Physicsb2.updateWorld("velocityIterations", velocityiterations);
  }
  function getVelocityIterations() {
    return Physicsb2.getWorldSettings("velocityIterations");
  }
  function setPositionIterations(positionIterations) {
    Physicsb2.updateWorld("positionIterations", positionIterations);
  }
  function getPositionIterations() {
    return Physicsb2.getWorldSettings("positionInterations");
  }
  
  ///////// BODY ////////
  function createBody(name, patchCoords) {
    Physicsb2.createBody({ "bodyId": name, "behavior": "dynamic", "coords": patchCoords, "angle": 0 });
    Physicsb2.addBodyToWorld(name);
  }
  function setBehavior(name, behavior) {
    if (Physicsb2.getBodyObject(name)) {
      var bodyType = (behavior === 0) ? "static" : (behavior === 1) ? "ghost" : "dynamic";
      Physicsb2.getBodyObject(name).SetType(bodyType);
    }
  }
  function setBodyXy(name, patchCoords) {
    if (Physicsb2.getBodyObject(name) && patchCoords && typeof patchCoords.x === "number" && typeof patchCoords.y === "number") {
      Physicsb2.getBodyObject(name).SetPosition(Physicsb2.patchToBox2d(patchCoords));
    }
  }
  function setAngle(name, angle) {
    Physicsb2.getBodyObj(name).setAngle(angle);
  }
  function setLinearVelocity(name, data) {
    if (Physicsb2.getBodyObj(name) && data && typeof data[0] === "number" && typeof data[1] === "number") {
      Physicsb2.getBodyObj(name).setLinearVelocity({x: data[0], y: data[1]});
    }
  }
  function setAngularVelocity(name, angularVelocity) {
    if (Physicsb2.getBodyObj(name)) {
      Physicsb2.getBodyObj(name).setAngularVelocity(angle);
    }
  }
  function getBehavior(name) {
    if (Physicsb2.getBodyObject(name)) {
      var bodyType = Physicsb2.getBodyObject(name).GetType;
      return (bodyType === 0) ? "static" : (bodyType === 1) ? "ghost" : "dynamic";
    } else {
      return name + " does not exist";
    }
  }
  function getBodyXy(name) {
    if (Physicsb2.getBodyObject(name)) {
      return Physicsb2.box2dToPatch(Physicsb2.getBodyObject(name).GetPosition());
    } else {
      return [ 0, 0];
    }
  }
  function getAngle(name) {
    return Physicsb2.getBodyObj(name) ? rePhysicsb2.getBodyObj(name).GetAngle() : 0;
  }
  function getLinearVelocity() {
    if (Physicsb2.getBodyObj(name)) {
      var linearVelocity = Physicsb2.getBodyObj(name).GetLinearVelocity();
      return [ linearVelocity.x, linearVelocity.y ];
    } else {
      return [ 0, 0];
    }
  }
  function getAngularVelocity(name) {
    return Physicsb2.getBodyObj(name) ? rePhysicsb2.getBodyObj(name).GetAngularVelocity() : 0;
  }
  
  ///////// SHAPE ////////
  function setFriction(name, value) {
    if (Physicsb2.getFixtureObj(name)) {
      Physicsb2.getFixtureObj(name).SetFriction(value);
    }
  }
  function setDensity() {
    if (Physicsb2.getFixtureObj(name)) {
      Physicsb2.getFixtureObj(name).SetDensity(value);
    }
  }
  function setRestitution() {
    if (Physicsb2.getFixtureObj(name)) {
      Physicsb2.getFixtureObj(name).SetDensity(value);
    }
  }
  function getFriction(name) {
    return Physicsb2.getFixtureObj(name) ? Physicsb2.getFixtureObj(name).GetFriction() : 0;
  }
  function getDensity(name) {
    return Physicsb2.getFixtureObj(name) ? Physicsb2.getFixtureobj(name).GetDensity() : 0;
  }
  function getRestitution(name) {
    return Physicsb2.getFixtureObj(name) ? Physicsb2.getFixtureObj(name).GetRestitution() : 0;
  }
  
  ///////// LINE ////////
  function createLine(name, bodyId) {
    var patchCoords = [ 0, 0];
    if (Physicsb2.getBodyObj(name)) {
      patchCoords = Physicsb2.box2dToPatch(Physicsb2.getBodyObj(name).GetPosition());
    } else {
      createBody(bodyId, patchCoords);
    }
    Physicsb2.createFixture({
      "shapeId": name, 
      //"coords": patchCoords, // center of body {x: mouseX, y: mouseY}, 
      "vertices": [ [ patchCoords[0] - 2, patchCoords[1]], [ patchCoords[0] + 2, patchCoords[1]]],
      "typeOfShape": "line"
    });  
    Physicsb2.addFixtureToBody({ "shapeId": name, "bodyId": bodyId }); 
    Physicsb2.drawDebugData();

  }
  function setLineRelativeEndpoints(name, patchEndpoints) {
    setPolygonRelativeVertices(patchEndpoints);
  }
  function setLineEndpoints(name, patchEndpoints) {
    setPolygonVertices(patchEndpoints);
  }
  function getLineRelativeEndpoints(name) {
    return getPolygonRelativeVertices(name);
  }
  function getLineEndpoints(name) {
    return getPolygonVertices(name);
  }   
  
  ///////// CIRCLE ////////
  function createCircle(name, bodyId) {
    var patchCoords = [ 0, 0];
    if (Physicsb2.getBodyObj(name)) {
      patchCoords = Physicsb2.box2dToPatch(Physicsb2.getBodyObj(name).GetPosition());
    } else {
      createBody(bodyId, patchCoords);
    }
    Physicsb2.createFixture({
      "shapeId": name, 
      "coords": patchCoords,
      "vertices": [ [ patchCoords[0] - 2, patchCoords[1]], [ patchCoords[0] + 2, patchCoords[1]]],
      "radius": 10, 
      "typeOfShape": "circle"
    });  
    Physicsb2.addFixtureToBody({ "shapeId": name, "bodyId": bodyId }); 
    Physicsb2.drawDebugData();

  }
  function setCircleRadius(name, radius) {
    if (Physicsb2.getFixtureObj(name) && typeof radius === "number") {
      Physicsb2.getFixtureObj(name).GetShape().SetRadius(radius);
    }
  }
  function setCircleRelativeCenter(name, patchCoords) {
    if (Physicsb2.getFixtureObj(name) && patchCoords.length > 0) {
      Physicsb2.getFixtureObj(name).getShape().setLocalPosition(Physicsb2.patchToBox2d(patchCoords));
    }
  }
  function setCircleCenter(name, patchCoords) {
    if (Physicsb2.getFixtureObj(name) && patchCoords.length > 0) {
      var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
      var offset = bodyObj[bodyId].GetPosition();  
      var box2dCoords = Physicsb2.patchToBox2d(patchCoords);
      var relativeBox2dCoords = {x: box2dCoords.x + offset.x, y: box2dCoords.y + offset.y };
      Physicsb2.getFixtureObj(name).getShape().setLocalPosition(relativeBox2dCoords);
    }
  }
  function getCircleRadius(name) {
    return Physicsb2.getFixtureObj(name) ? Physicsb2.getFixtureObj(name).GetShape().GetRadius() : 0;
  }
  function getCircleRelativeCenter(name) {
    var center = [ 0, 0];
    if (Physicsb2.getFixtureObj(name)) {
      center = Physicsb2.getFixtureObj(name).GetShape().GetLocalPosition();
      center = box2dToPatch(center);
    }
    return center;
  }
  function getCircleCenter(name) {
    var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
    var offset = bodyObj[bodyId].GetPosition(); 
    var center = Physicsb2.getFixtureObj(name).GetShape().GetLocalPosition();
    var absoluteCenter = { x: relativeCenter[0] + offset.x, y: relativeCenter[1] + offset.y};
    return box2dToPatch(absoluteCenter);
  }
  
  ///////// POLYGON ////////
  function createPolygon(name, bodyId) {
    var patchCoords = [ 0, 0];
    if (Physicsb2.getBodyObj(name)) {
      patchCoords = Physicsb2.box2dToPatch(Physicsb2.getBodyObj(name).GetPosition());
    } else {
      createBody(bodyId, patchCoords);
    }
    Physicsb2.createFixture({
      "shapeId": name, 
      //"coords": patchCoords, // center of body {x: mouseX, y: mouseY}, 
      "vertices": [ [ patchCoords[0] - 10, patchCoords[1]], [ patchCoords[0] - 10, patchCoords[1] + 10], [ patchCoords[0], patchCoords[1]]],
      "typeOfShape": "polygon"
    });  
    Physicsb2.addFixtureToBody({ "shapeId": name, "bodyId": bodyId }); 
    Physicsb2.drawDebugData();

  }
  function setPolygonRelativeVertices(name, patchVertices) {
    if (Physicsb2.getFixtureObject(name) && patchVertices.length > 0) {
      var vertices = [];
      for (var i=0; i<patchVertices.length; i++) {
        vertices.push(Physicsb2.patchToBox2d(patchVertices[i]));
      }
      Physicsb2.getFixtureObject(name).GetShape().SetAsArray(vertices, vertices.length);
    }
  }
  function setPolygonVertices(name, patchVertices) {
    if (Physicsb2.getFixtureObj(name) && patchVertices.length > 0) {
      var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
      var offset = bodyObj[bodyId].GetPosition();  
      var vertices = [];
      var box2dVertex;
      for (var i=0; i<patchVertices.length; i++) {
        box2dVertex = Physicsb2.patchToBox2d(patchVertices[i]);
        vertices.push({ x: box2dVertex.x + offset.x, y: box2dVertex.y + offset.y});
      }
      Physicsb2.getFixtureObj(name).GetShape().SetAsArray(vertices, vertices.length);
    } 
  }
  function getPolygonRelativeVertices(name) {
    var vertices = [];
    if (Physicsb2.getFixtureObj(name)) {
        vertices = Physicsb2.getFixtureObj(name).GetShape().GetVertices();
        vertices = box2dToPatch(vertices);
    }
    return vertices;
  }
  function getPolygonVertices() {
    var vertices = [ ];
    if (Physicsb2.getFixtureObj(name)) {
      var bodyId = Physicsb2.getFixtureObj("triangle-0").GetBody().GetUserData().id;
      var offset = bodyObj[bodyId].GetPosition();
      var relativeVertices = Physicsb2.getFixtureObj(name).GetShape().GetVertices();
      var vertex;
      for (var i=0; i<relativeVertices.length; i++) {
        vertex = { x: relativeVertices[i].x + offset.x, y: relativeVertices[i].y + offset.y};
        vertices.push(box2dToPatch(vertex));
      }
    }
    return vertices;
  }
  
  ///////// TARGET ////////
  function createTarget(name, bodyId) {
    Physicsb2.createTarget( { "targetId": name, "bodyId": bodyId, "snap": true });  
    Physicsb2.addTargetToBody({"targetId": name, "bodyId": bodyId });
  }
  function setTargetRelativeXy() {

  }
  function setTargetXy() {

  }
  function getTargetRelativeXy() {
  }
  function getTargetXy() {

  }
  
  ///////// OBJECT ////////
  function setBodyId() {

  }
  function getBodyId(name) {
    if (Physicsb2.GetBodyObj(name)) {
      return name;
    } else if (Physicsb2.GetTargetObj(name)) {
      return Physicsb2.GetTargetObj(name).bodyId;
    } else if (Physicsb2.GetFixtureObj(name)) {
      return Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
    } else {
      return "none";
    }
  }
  function createObject(objectList) {
    var name = objectList[0];
    var result = JSON.parse(objectList[1]);
    var objectType = result.objectType;
    switch (objectType) {
      case "body":
        createBody(name, result.bodyId);
        setBehavior(name, result.behavior);
        setBodyXy(name, result.xy);
        setAngle(name, result.angle);
        break;
      case "target":
        createTarget(name, result.bodyId);
        setTargetRelativeXy(name, result.relativeXy);
        break;
      case "circle":
        createCircle(name, result.bodyId);
        setRadius(name, result.angle);
        setCircleCenter(name, result.center);
        break;
      case "line":
        createLine(name, result.bodyId);
        setRelativeEndpoints(name, result.relativeEndpoints);
        break;
      case "polygon":
        createPolygon(name, result.bodyId);
        setRelativeVertices(name, result.relativeVertices);
        break;
    }
    if (objectType === "circle" || objectType === "line" || objectType === "polygon") {
      setFriction(name, result.friction);
      setDensity(name, result.density);
      setRestitution(name, result.restitution);
    }
  }
  function createObjects(objectList) {
    for (var i=0; i<objectList.length; i++) {
      createObject(objectList[i]);
    }
  }
  function getBody(name) {
    var result = {
      "name": name,
      "objectType": "body",
      "behavior": getBehavior(name),
      "xy": getBodyXy(name),
      "angle": getAngle(name)
    };
    return JSON.stringify(result);
  } 
  function getFixture(name) {
    var objectType = getObjectType(name);
    var result = {
      "name": name,
      "objectType": objectType,
      "bodyId": getBodyId(name),
      "friction": getFriction(name),
      "density": getDensity(name),
      "restitution": getRestitution,
    };
    switch (objectType) {
      case "line": 
        result.relativeEndpoints = getLineRelativeEndpoints(name);
        break;
      case "polygon":
        result.relativeVertices = getPolygonRelativeVertices(name);
        break;
      case "circle":
        result.radius = getRadius(name);
        result.center = getCircleCenter(name);
    }
    return JSON.stringify(result);
  }
  function getTarget(name) {
    var result = {
      "name": name,
      "objectType": "target",
      "bodyId": getBodyId(name),
      "relativeXy": getTargetRelativeXy(name)
    };
    return JSON.stringify(result);
  }
  function getObjects() {
    var objectList = [];
    var bodyList = Physicsb2.getAllBodies();
    for (var i=0; i<bodyList.length; i++) {
      objectList.push([name, getBody(bodyList[i])]);
    }
    var fixtureList = Physicsb2.getAllFixtures();
    for (var i=0; i<fixtureList.length; i++) {
      objectList.push([name, getBody(fixtureList[i])]);
    }
    var targetList = Physicsb2.getAllTargets();
    for (var i=0; i<targetList.length; i++) {
      objectList.push([name, getBody(targetList[i])]);
    }
    return objectList;
  }
  function getObject(name) {
    if (Physicsb2.GetBodyObj(name)) {
      return getBody(name);
    } else if (Physicsb2.GetTargetObj(name)) {
      return getTarget(name);
    } else if (Physicsb2.GetFixtureObj(name)) {
      return getFixture(name);
    } else {
      return "none";
    }
  }
  function getObjectType(name) {
    if (Physicsb2.GetBodyObj(name)) {
      return "body";
    } else if (Physicsb2.GetTargetObj(name)) {
      return "target";
    } else if (Physicsb2.GetFixtureObj(name)) {
      return Physicsb2.GetFixtureObj(name).GetUserData().shape;
    } else {
      return "none";
    }
  }
  function deleteObject(name) {
    if (Physicsb2.GetBodyObj(name)) {
      Physicsb2.deleteBody(name);
    } else if (Physicsb2.GetFixtureObj(name)) {
      Physicsb2.deleteFixture(name);
    } else if (Physicsb2.GetTargetObj(name)) {
      Physicsb2.deleteTarget(name);
    }
  }
  function deleteTargets() {
    var targetList = Physicsb2.getAllTargets();
    for (var i=0; i<targetList.length; i++) {
      Physicsb2.deleteTarget(targetList[i]);
    }
  }
  function deleteObjects() {
    var bodyList = Physicsb2.getAllBodies();
    for (var i=0; i<bodyList.length; i++) {
      Physicsb2.deleteBody(bodyList[i]);
    }
    var fixtureList = Physicsb2.getAllFixtures();
    for (var i=0; i<fixtureList.length; i++) {
      Physicsb2.deleteFixture(fixtureList[i]);
    }
    var targetList = Physicsb2.getAllTargets();
    for (var i=0; i<targetList.length; i++) {
      Physicsb2.deleteTarget(targetList[i]);
    }
  }
  
  ////////// FORCES /////////
  function applyForce(name, force, angle) {
    Physicsb2.applyForce({ targetId: name, force: force, position: "absolute", angle: angle});
  }
  function applyForceRelativeAngle(name, force, angle) {
    Physicsb2.applyForce({ targetId: name, force: force, position: "relative", angle: angle});
  }
  function applyLinearImpulse() {
    Physicsb2.applyLinearImpulse({ targetId: name, force: force, position: "absolute", angle: angle});
  }
  function applyLinearImpulseRelativeAngle() {
    Physicsb2.applyLinearImpulse({ targetId: name, force: force, position: "relative", angle: angle});
  }
  function applyTorque(name, force) {
    Physicsb2.applyTorque({targetId: name, force: force}); 
  }
  function applyAngularImpulse() {
    Physicsb2.applyAngularImpulse({targetId: name, force: force}); 
  }
  
  //////// CONNECTION TO TURTLE /////////
  function connectWhoToObject() {

  }
  function disconnectWho() {

  }



  
  /*
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
      });
      Physicsb2.applyForce({angle: angle, force: force, position: position, targetId: targetId});

    }
    Physicsb2.redrawWorld();
  }

  function connectToObject(who, name) {
    var parentId = name+"body";
    //console.log("connect to turtle "+parentId+" to " + who);
    Physicsb2.updateBodyId(parentId, who);
  }
  
  function disconnectFromObject(who, name) {
    var parentId = name+"body";
    //console.log("connect to turtle "+parentId+" to " + who);
    Physicsb2.updateBodyId(who, parentId);
  }
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
    return [ coords.x, coords.y ];
  }
  
  function worldToPatch(coords) {
    return {x: coords[0], y:coords[1]};
  }
  
  
  //////// OTHER /////////
  
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
  */
  return {
    setupInterface: setupInterface,
    getDrawButtonMode: getDrawButtonMode,
    hideWorld: hideWorld,
    showWorld: showWorld,
    //setData: setData,
    //importFile: importFile,
    //getData: getData,
    //exportFile: exportFile,
    
    setGravityXy: setGravityXy,
    getGravityXy: getGravityXy,
    setWrapXy: setWrapXy,
    getWrapXy: getWrapXy,
    setTimeStep: setTimeStep,
    getTimeStep: getTimeStep,
    setVelocityIterations: setVelocityIterations,
    getVelocityIterations: getVelocityIterations,
    setPositionIterations: setPositionIterations,
    getPositionIterations: getPositionIterations,
    createBody: createBody,
    setBehavior: setBehavior,
    setBodyXy: setBodyXy,
    setAngle: setAngle,
    setLinearVelocity: setLinearVelocity,
    setAngularVelocity: setAngularVelocity,
    getBehavior: getBehavior,
    getBodyXy: getBodyXy,
    getAngle: getAngle,
    getLinearVelocity: getLinearVelocity,
    getAngularVelocity: getAngularVelocity,
    setFriction: setFriction,
    setDensity: setDensity,
    setRestitution: setRestitution,
    getFriction: getFriction,
    getDensity: getDensity,
    getRestitution: getRestitution,
    createLine: createLine,
    setLineRelativeEndpoints: setLineRelativeEndpoints,
    setLineEndpoints: setLineEndpoints,
    getLineRelativeEndpoints: getLineRelativeEndpoints,
    getLineEndpoints: getLineEndpoints,
    createCircle: createCircle,
    setCircleRadius: setCircleRadius,
    setCircleRelativeCenter: setCircleRelativeCenter,
    setCircleCenter: setCircleCenter,
    getCircleRadius: getCircleRadius,
    getCircleRelativeCenter: getCircleRelativeCenter,
    getCircleCenter: getCircleCenter,
    createPolygon: createPolygon,
    setPolygonRelativeVertices: setPolygonRelativeVertices,
    setPolygonVertices: setPolygonVertices,
    getPolygonRelativeVertices: getPolygonRelativeVertices,
    getPolygonVertices: getPolygonVertices,
    createTarget: createTarget,
    setTargetRelativeXy: setTargetRelativeXy,
    setTargetXy: setTargetXy,
    getTargetRelativeXy: getTargetRelativeXy,
    getTargetXy: getTargetXy,
    setBodyId: setBodyId,
    getBodyId: getBodyId,
    createObjects: createObjects,
    getObjects: getObjects,
    getObject: getObject,
    getObjectType: getObjectType,
    deleteObject: deleteObject,
    deleteTargets: deleteTargets,
    deleteObjects: deleteObjects,
    applyForce: applyForce,
    applyForceRelativeAngle: applyForceRelativeAngle,
    applyLinearImpulse: applyLinearImpulse,
    applyLinearImpulseRelativeAngle: applyLinearImpulseRelativeAngle,
    applyTorque: applyTorque,
    applyAngularImpulse: applyAngularImpulse,
    connectWhoToObject: connectWhoToObject,
    disconnectWho: disconnectWho,

  };
 
})();

