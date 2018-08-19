
Physics = (function() {
  
  var mode;
  
  ////// SETUP PHYSICS //////
  
  function setupInterface() {
    viewWidth = parseFloat($(".netlogo-canvas").css("width"));
    viewHeight = parseFloat($(".netlogo-canvas").css("height"));
    //var spanText = "<div class='physics-controls'>";
    //spanText +=       "<i id='physicsOn' class='fa fa-toggle-on' aria-hidden='true'></i>";
    //spanText +=       "<i id='physicsOff' class='fa fa-toggle-off' aria-hidden='true'></i>";
    //spanText +=    "</div>";
    //$(".netlogo-widget-container").append(spanText);
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
    //spanText +=         " <img src='./app/gbcc/physics-ui/a14.png' class='physics-target purple hidden'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a13.png' class='physics-target white'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a16.png' class='physics-group purple hidden'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a15.png' class='physics-group white'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a20.png' class='physics-force purple hidden'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a19.png' class='physics-force white'>"

    spanText +=         "<select id='selectionMode'>"
    spanText +=           "<option selected >Shape</option>";
    spanText +=           "<option>Body</option>";
    spanText +=           "<option>Target</option>";
    spanText +=         "</select>"
    
    //spanText +=         " <img src='./app/gbcc/physics-ui/a18.png' class='physics-force purple hidden'>"
    //spanText +=         " <img src='./app/gbcc/physics-ui/a17.png' class='physics-force white'>"
    /*
    spanText +=         " <img src='./app/gbcc/physics-ui/a9.png' class='physics-group purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a10.png' class='physics-group white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a11.png' class='physics-target purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a12.png' class='physics-target white'>"
    */
    spanText +=       "</div>";
    spanText +=       "<div class='centerControls'>";
    spanText +=         "<span></span>"
    spanText +=       "</div>"
    spanText +=       "<div class='rightControls'>"; //"<div id='physicsStateControls'>";
    
    spanText +=         " <img src='./app/gbcc/physics-ui/a3.png' class='physics-line purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a4.png' class='physics-line white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a5.png' class='physics-circle purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a6.png' class='physics-circle white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a7.png' class='physics-triangle purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a8.png' class='physics-triangle white'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a23.png' class='physics-rect purple hidden'>"
    spanText +=         " <img src='./app/gbcc/physics-ui/a22.png' class='physics-rect white'>"
    
    //spanText +=         "<i class='fa fa-save' id='physicsSave' aria-hidden='true'></i>";
    //spanText +=         " <i class='fa fa-refresh' id='physicsRefresh' aria-hidden='true'></i>";
    //spanText +=         " <i class='fa fa-play' id='physicsPlay' aria-hidden='true'></i>";
    //spanText +=         " <i class='fa fa-pause hidden' id='physicsPause' aria-hidden='true'></i>";
    spanText +=       "</div>";
    spanText += "</div>";
    $(".netlogo-view-container").append(spanText);  
    
    //spanText =  "<div id='physicsSettings' class='hidden'>";
    /*
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
    */
    //spanText += "</div>";
    //$(".netlogo-view-container").append(spanText);  
    $("#physicsMenu").css("display", "none");
    $("#physicsSettings").css("top", parseFloat($(".netlogo-canvas").css("height")) - 34 + "px");
    //$("#physicsContainer").css("display","inline-block");
    //$(".physics-controls").css("display","inline-block");
    //$("#physicsMenu").css("display","inline-block");
    //$("#physicsMenu .purple").addClass("hidden");
    //$("#physicsMenu .white").removeClass("hidden");
    updatePhysics("physicsOff");
    Physicsb2.createWorld({width: universe.model.world.worldwidth, height: universe.model.world.worldheight});//[[false, true], [viewWidth, viewHeight], [true, true]]);
  //  Physicsb2.createWorld({width: viewWidth, height: viewHeight});//[[false, true], [viewWidth, viewHeight], [true, true]]);
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
    assignDrawButtonMode("rect");
    
    //assignDrawButtonMode("quad"); 
    //assignDrawButtonMode("group"); 
    //assignDrawButtonMode("joint"); 
    //assignDrawButtonMode("target");
    //assignDrawButtonMode("force");
    assignSelectionMode();
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
    showObjects();
  }
  
  function assignSettings(setting) {
    $("#physicsSettings .leftControls").on("change", "#"+setting, function () {
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
    $("#physicsMenu").on("click", ".physics-"+buttonMode, function() {
      if ($("#physicsMenu .leftControls").hasClass("selected")) {
        $("#physicsMenu .purple").addClass("hidden");
        $("#physicsMenu .white").removeClass("hidden");
        $(".physics-"+buttonMode+".purple").removeClass("hidden");
        $(".physics-"+buttonMode+".white").addClass("hidden");
        mode = (buttonMode === "drag") ? $("#selectionMode").val().toLowerCase() : buttonMode;
        Physicsb2.triggerModeChange(mode);
      }
    });
  }
  
  function assignSelectionMode() {
    $("#selectionMode").on("change", function() {
      mode = $(this).val().toLowerCase();
      Physicsb2.triggerModeChange(mode);
    });
    mode = "shape";
    Physicsb2.triggerModeChange(mode);
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
      //universe.repaint();
      //Physicsb2.drawDebugData();
      Physicsb2.refresh();
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
    //$("#physicsSettings").addClass("hidden");
  }
    
/*  
  function getDrawButtonMode() {
    console.log("asked for mode ",mode);
    return mode;
  }
  */
  
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
    $(".netlogo-view-container").css("pointer-events","auto");
    $(".netlogo-view-container").css("cursor","pointer");
    Physicsb2.bindElements();
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
    if (!mirroringEnabled) {
      $(".netlogo-view-container").css("pointer-events","none");
    }
    $(".netlogo-view-container").css("cursor","auto");
    Physicsb2.unBindElements();
    universe.repaint();
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
    // get-ObjectSettingsc
    var objects = getObjects();
    var connectedTurtles = getConnected();
    deleteObjects();
    var gravity =  {x: data[0], y:data[1]};
    Physicsb2.updateWorld("gravityXY", gravity);;
    Physicsb2.createWorld({width: universe.model.world.worldwidth, height: universe.model.world.worldheight, gravity:gravity});//[[false, true], [viewWidth, viewHeight], [true, true]]);
    createObjects(objects);
    for (var i=0; i<connectedTurtles.length; i++) {
      connectWhoToObject(connectedTurtles[i][0], connectedTurtles[i][1]);
    }
    // create-objects
  }
  function getGravityXy() {
    var data = Physicsb2.getWorld().GetGravity();
    return [ data.x, data.y ];
  }
  function setWrapXy(data) {
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
    Physicsb2.updateWorld("velocityIterations", velocityIterations);
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
    Physicsb2.refresh();
  }
  function setBehavior(name, behavior) {
    if (Physicsb2.getBodyObj(name) != undefined) {
      var bodyType = (behavior === "static") ? 0 : (behavior === "ghost") ? 1 : 2;
      Physicsb2.getBodyObj(name).SetType(bodyType);
      Physicsb2.recenter(Physicsb2.getBodyObj(name));
    }
    //Physicsb2.getBodyObj(name).ResetMassData();

  }
  function setBodyXy(name, patchCoords) {
    if (Physicsb2.getBodyObj(name) && patchCoords && typeof patchCoords[0] === "number" && typeof patchCoords[1] === "number") {
      Physicsb2.getBodyObj(name).SetPosition(Physicsb2.patchToBox2d(patchCoords));
    }
    Physicsb2.refresh();
  }
  function setAngle(name, angle) {
    if (Physicsb2.getBodyObj(name)) {
      Physicsb2.getBodyObj(name).SetAngle(Physicsb2.degreesToRadians(angle));
    }
    Physicsb2.refresh();
  }
  function setLinearVelocity(name, data) {
    if (Physicsb2.getBodyObj(name) && data && typeof data[0] === "number" && typeof data[1] === "number") {
      Physicsb2.getBodyObj(name).SetLinearVelocity({x: data[0], y: data[1]});
    }
  }
  function setAngularVelocity(name, angularVelocity) {
    if (Physicsb2.getBodyObj(name)) {
      Physicsb2.getBodyObj(name).SetAngularVelocity(angularVelocity);
    }
  }
  function getBehavior(name) {
    if (Physicsb2.getBodyObj(name)) {
      var bodyType = Physicsb2.getBodyObj(name).GetType();
      return (bodyType === 0) ? "static" : (bodyType === 1) ? "ghost" : "dynamic";
    } else {
      return name + " does not exist";
    }
  }
  function getBodyXy(name) {
    if (Physicsb2.getBodyObj(name)) {
      return Physicsb2.box2dToPatch(Physicsb2.getBodyObj(name).GetPosition());
    } else {
      return [ 0, 0];
    }
  }
  function getAngle(name) {
    return Physicsb2.getBodyObj(name) ? Physicsb2.radiansToDegrees(Physicsb2.getBodyObj(name).GetAngle()) : 0;
  }
  function getLinearVelocity(name) {
    if (Physicsb2.getBodyObj(name)) {
      var linearVelocity = Physicsb2.getBodyObj(name).GetLinearVelocity();
      return [ linearVelocity.x, linearVelocity.y ];
    } else {
      return [ 0, 0];
    }
  }
  function getAngularVelocity(name) {
    return Physicsb2.getBodyObj(name) ? Physicsb2.getBodyObj(name).GetAngularVelocity() : 0;
  }
  
  ///////// SHAPE ////////
  function setFriction(name, value) {
    if (Physicsb2.getFixtureObj(name)) {
      Physicsb2.getFixtureObj(name).SetFriction(value);
    }
  }
  function setDensity(name, value) {
    if (Physicsb2.getFixtureObj(name)) {
      Physicsb2.getFixtureObj(name).SetDensity(value);
    }
  }
  function setRestitution(name, value) {
    if (Physicsb2.getFixtureObj(name)) {
      Physicsb2.getFixtureObj(name).SetRestitution(value);
    }
  }
  function getFriction(name) {
    return (Physicsb2.getFixtureObj(name)) ? Physicsb2.getFixtureObj(name).GetFriction() : 0;
  }
  function getDensity(name) {
    return (Physicsb2.getFixtureObj(name)) ? Physicsb2.getFixtureObj(name).GetDensity() : 0;
  }
  function getRestitution(name) {
    return (Physicsb2.getFixtureObj(name)) ? Physicsb2.getFixtureObj(name).GetRestitution() : 0;
  }
  
  ///////// LINE ////////
  function createLine(name, bodyId) {
    var patchCoords = [ 0, 0];
    if (Physicsb2.getBodyObj(bodyId)) {
      patchCoords = Physicsb2.box2dToPatch(Physicsb2.getBodyObj(bodyId).GetPosition());
    } else {
      createBody(bodyId, patchCoords);
      //setBehavior(bodyId, "static");
    }
    Physicsb2.createFixture({
      "shapeId": name, 
      //"coords": patchCoords, // center of body {x: mouseX, y: mouseY}, 
      "vertices": [ [ patchCoords[0] - 2, patchCoords[1]], [ patchCoords[0] + 2, patchCoords[1]]],
      "typeOfShape": "line"
    });  
    Physicsb2.addFixtureToBody({ "shapeId": name, "bodyId": bodyId }); 
    setBehavior(bodyId,"static");
    Physicsb2.refresh();
  }
  function setLineRelativeEndpoints(name, patchEndpoints) {
    setPolygonRelativeVertices(name, patchEndpoints);
    Physicsb2.refresh();
  }
  function setLineEndpoints(name, patchEndpoints) {
    setPolygonVertices(name, patchEndpoints);
    Physicsb2.refresh();
  }
  function getLineRelativeEndpoints(name) {
    return getPolygonRelativeVertices(name);
    Physicsb2.refresh();
  }
  function getLineEndpoints(name) {
    return getPolygonVertices(name);
    Physicsb2.refresh();
  }   
  
  ///////// CIRCLE ////////
  function createCircle(name, bodyId) {
    var patchCoords = [ 0, 0];
    if (Physicsb2.getBodyObj(bodyId)) {
      patchCoords = Physicsb2.box2dToPatch(Physicsb2.getBodyObj(bodyId).GetPosition());
    } else {
      createBody(bodyId, patchCoords);
    }
    Physicsb2.createFixture({
      "shapeId": name, 
      "coords": patchCoords,
      "vertices": [ [ patchCoords[0] - 2, patchCoords[1]], [ patchCoords[0] + 2, patchCoords[1]]],
      "radius": 1, 
      "typeOfShape": "circle"
    });  
    Physicsb2.addFixtureToBody({ "shapeId": name, "bodyId": bodyId }); 
    Physicsb2.refresh();
  }
  function setCircleRadius(name, radius) {
    if (Physicsb2.getFixtureObj(name) && typeof radius === "number") {
      Physicsb2.getFixtureObj(name).GetShape().SetRadius(radius);
    }
    Physicsb2.refresh();
  }
  function setCircleRelativeCenter(name, relativePatchCoords) {
    if (Physicsb2.getFixtureObj(name) && relativePatchCoords.length > 0) {
      var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;     
      var offset = Physicsb2.getBodyObj(bodyId).GetPosition(); 
      var absolutePatchOffset = Physicsb2.box2dToPatch(offset); 
      var absoluteBox2dCoords = Physicsb2.patchToBox2d([ absolutePatchOffset[0] + relativePatchCoords[0], absolutePatchOffset[1] + relativePatchCoords[1]]);
      var relativeCenter = {x: offset.x - absoluteBox2dCoords.x, y:offset.y - absoluteBox2dCoords.y};
      Physicsb2.getFixtureObj(name).GetShape().SetLocalPosition(relativeCenter);
    }
    Physicsb2.refresh();
  }
  function setCircleCenter(name, patchCoords) {
    if (Physicsb2.getFixtureObj(name) && patchCoords.length > 0) {
      var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
      var offset = Physicsb2.getBodyObj(bodyId).GetPosition();  
      var box2dCoords = Physicsb2.patchToBox2d(patchCoords);
      var relativeBox2dCoords = {x: box2dCoords.x - offset.x, y: box2dCoords.y - offset.y };
      Physicsb2.getFixtureObj(name).GetShape().SetLocalPosition(relativeBox2dCoords);
    }
    Physicsb2.refresh();
  }
  function getCircleRadius(name) {
    return Physicsb2.getFixtureObj(name) ? Physicsb2.getFixtureObj(name).GetShape().GetRadius() : 0;
  }
  function getCircleRelativeCenter(name) {
    var center = [ 0, 0];
    if (Physicsb2.getFixtureObj(name)) {
      var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
      var offset = Physicsb2.getBodyObj(bodyId).GetPosition(); 
      var box2dCoords = Physicsb2.getFixtureObj(name).GetShape().GetLocalPosition();
      var absoluteBox2dCoords = { x: offset.x - box2dCoords.x, y: offset.y - box2dCoords.y};
      var absoluteNlogoCoords = Physicsb2.box2dToPatch(absoluteBox2dCoords);
      var absoluteOffset = Physicsb2.box2dToPatch(offset);
      center = [absoluteNlogoCoords[0] - absoluteOffset[0],absoluteNlogoCoords[1] - absoluteOffset[1] ];
    }
    return center;
  }
  function getCircleCenter(name) {
    var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
    var offset = Physicsb2.getBodyObj(bodyId).GetPosition(); 
    var relativeCenter = Physicsb2.getFixtureObj(name).GetShape().GetLocalPosition();
    var absoluteCenter = { x: relativeCenter.x + offset.x, y: relativeCenter.y + offset.y};
    return Physicsb2.box2dToPatch(absoluteCenter);
  }
  
  ///////// POLYGON ////////
  function createPolygon(name, bodyId) {
    var patchCoords = [ 0, 0];
    if (Physicsb2.getBodyObj(bodyId)) {
      patchCoords = Physicsb2.box2dToPatch(Physicsb2.getBodyObj(bodyId).GetPosition());
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
    Physicsb2.refresh();
  }
  function setPolygonRelativeVertices(name, patchVertices) {
    if (Physicsb2.getFixtureObj(name) && patchVertices.length > 0) {
      var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;    
      var offset = Physicsb2.getBodyObj(bodyId).GetPosition(); 
      var absolutePatchOffset = Physicsb2.box2dToPatch(offset); 
      var vertices = [];
      for (var i=0; i<patchVertices.length; i++) {
        var absoluteBox2dCoords = Physicsb2.patchToBox2d([ absolutePatchOffset[0] + patchVertices[i][0], absolutePatchOffset[1] + patchVertices[i][1]]);
        var relativeCenter = {x: offset.x - absoluteBox2dCoords.x, y:offset.y - absoluteBox2dCoords.y};
        vertices.push(relativeCenter);
      }
      Physicsb2.getFixtureObj(name).GetShape().SetAsArray(vertices, vertices.length);
    }
  Physicsb2.refresh();
  }
  function setPolygonVertices(name, patchVertices) {
    if (Physicsb2.getFixtureObj(name) && patchVertices.length > 0) {
      var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
      var offset = Physicsb2.getBodyObj(bodyId).GetPosition();  
      var vertices = [];
      var box2dVertex;
      for (var i=0; i<patchVertices.length; i++) {
        box2dVertex = Physicsb2.patchToBox2d(patchVertices[i]);
        vertices.push({ x: box2dVertex.x - offset.x, y: box2dVertex.y - offset.y});
      }
      Physicsb2.getFixtureObj(name).GetShape().SetAsArray(vertices, vertices.length);
    }
    Physicsb2.refresh(); 
  }
  function getPolygonRelativeVertices(name) {
    var vertices = [];
    var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
    var offset = Physicsb2.getBodyObj(bodyId).GetPosition(); 
    if (Physicsb2.getFixtureObj(name)) {
      var box2dCoords, absoluteBox2dCoords, absoluteNlogoCoords, absoluteOffset, relativeCenter;
      box2dVertices = Physicsb2.getFixtureObj(name).GetShape().GetVertices();
      for (var i=0; i<box2dVertices.length; i++) {
        box2dCoords = box2dVertices[i];
        absoluteBox2dCoords = { x: offset.x - box2dCoords.x, y: offset.y - box2dCoords.y};
        absoluteNlogoCoords = Physicsb2.box2dToPatch(absoluteBox2dCoords);
        absoluteOffset = Physicsb2.box2dToPatch(offset);
        relativeCenter = [absoluteNlogoCoords[0] - absoluteOffset[0],absoluteNlogoCoords[1] - absoluteOffset[1] ];
        vertices.push(relativeCenter);
      }
    }
    return vertices;
  }
  function getPolygonVertices(name) {
    var vertices = [ ];
    if (Physicsb2.getFixtureObj(name)) {
      var bodyId = Physicsb2.getFixtureObj(name).GetBody().GetUserData().id;
      var offset = Physicsb2.getBodyObj(bodyId).GetPosition();
      var relativeVertices = Physicsb2.getFixtureObj(name).GetShape().GetVertices();
      var vertex;
      for (var i=0; i<relativeVertices.length; i++) {
        vertex = { x: relativeVertices[i].x + offset.x, y: relativeVertices[i].y + offset.y};
        vertices.push(Physicsb2.box2dToPatch(vertex));
      }
    }
    return vertices;
  }
  
  ///////// TARGET ////////
  function createTarget(name, bodyId) {
    Physicsb2.createTarget( { "targetId": name, "bodyId": bodyId, "snap": true, "box2dCoords": Physicsb2.getBodyObj(bodyId).GetPosition() });  
    Physicsb2.addTargetToBody({"targetId": name, "bodyId": bodyId });
    Physicsb2.refresh();
  }
  function setTargetRelativeXy(name, relativePatchCoords) {
    //console.log(relativePatchCoords);
    relativePatchCoords = [-relativePatchCoords[0], -relativePatchCoords[1]];
    if (Physicsb2.getTargetObj(name)) {
      var bodyId = Physicsb2.getTargetObj(name).bodyId;
      var offset = Physicsb2.getBodyObj(bodyId).GetPosition(); 
      var absolutePatchOffset = Physicsb2.box2dToPatch(offset); 
      var absoluteBox2dCoords = Physicsb2.patchToBox2d([ absolutePatchOffset[0] + relativePatchCoords[0], absolutePatchOffset[1] + relativePatchCoords[1]]);
      var relativeCenter = {x: offset.x - absoluteBox2dCoords.x, y:offset.y - absoluteBox2dCoords.y};
      Physicsb2.getTargetObj(name).relativeCoords = relativeCenter;
      Physicsb2.getTargetObj(name).coords = Physicsb2.getBodyObj(bodyId).GetWorldPoint(relativeCenter);  
    }
    Physicsb2.refresh();
  }
  function setTargetXy(name, coords) {
    if (Physicsb2.getTargetObj(name)) {
      var bodyId = Physicsb2.getTargetObj(name).bodyId; 
      var coords = patchToBox2d([ coords[0], coords[1] ]);
      Physicsb2.getTargetObj(name).coords = coords;
      Physicsb2.getTargetObj(name).relativeCoords = Physicsb2.getBodyObj(bodyId).GetLocalPoint(coords);
    }
  }
  function getTargetRelativeXy(name) {
    var center = [ 0, 0];
    if (Physicsb2.getTargetObj(name)) {
      var bodyId = Physicsb2.getTargetObj(name).bodyId;
      var offset = Physicsb2.getBodyObj(bodyId).GetPosition(); 
      var box2dCoords = Physicsb2.getTargetObj(name).relativeCoords;
      var absoluteBox2dCoords = { x: offset.x - box2dCoords.x, y: offset.y - box2dCoords.y};
      var absoluteNlogoCoords = Physicsb2.box2dToPatch(absoluteBox2dCoords);
      var absoluteOffset = Physicsb2.box2dToPatch(offset);
      center = [absoluteNlogoCoords[0] - absoluteOffset[0],absoluteNlogoCoords[1] - absoluteOffset[1] ];
      center = [ -center[0], -center[1] ]
    }
    return center;
  }
  function getTargetXy(name) {
    var center = [ 0, 0];
    if (Physicsb2.getTargetObj(name)) {
      var box2dCoords = Physicsb2.getTargetObj(name).coords;    
      center = Physicsb2.box2dToPatch(box2dCoords);
    }
    return center;
  }
  
  ///////// OBJECT ////////
  function setBodyId(oldBodyId, newBodyId) {
    //console.log("move "+oldBodyId+" to " +newBodyId);
    Physicsb2.updateBody(oldBodyId, "bodyIdBodyMode", newBodyId);

  }
  function getBodyId(name) {
    if (Physicsb2.getBodyObj(name)) {
      return name;
    } else if (Physicsb2.getTargetObj(name)) {
      return Physicsb2.getTargetObj(name).bodyId;
    } else if (Physicsb2.getFixtureObj(name)) {
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
        createBody(name, result.xy);
        setBehavior(name, result.behavior);
        setBodyXy(name, result.xy);
        setAngle(name, result.angle);
        break;
      case "target":
        createTarget(name, result.bodyId);
        setTargetXy(name, result.coords);
        break;
      case "circle":
        createCircle(name, result.bodyId);
        setCircleRadius(name, result.radius);
        setCircleCenter(name, result.center);
        break;
      case "line":
        createLine(name, result.bodyId);
        setLineEndpoints(name, result.endpoints[0], result.endpoints[1]);
        break;
      case "polygon":
        createPolygon(name, result.bodyId);
        setPolygonVertices(name, result.vertices);
        //console.log(result.vertices);
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
        result.endpoints = getLineEndpoints(name);
        break;
      case "polygon":
        result.vertices = getPolygonVertices(name);
        break;
      case "circle":
        result.radius = getCircleRadius(name);
        result.center = getCircleCenter(name);
    }
    return JSON.stringify(result);
  }
  function getTarget(name) {
    var result = {
      "name": name,
      "objectType": "target",
      "bodyId": getBodyId(name),
      "coords": getTargetXy(name)
      //"Xy": getTargetXy(name)
    };
    return JSON.stringify(result);
  }
  function getObjects() {
    var objectList = [];
    
    var bList = Physicsb2.getAllBodies();
    var bodyList = [];
    for (b in bList) { bodyList.push(b); }
    for (var i=0; i<bodyList.length; i++) {
      objectList.push([bodyList[i], getBody(bodyList[i])]);
    }
    
    var fList = Physicsb2.getAllFixtures();
    var fixtureList = [];
    for (f in fList) { fixtureList.push(f); }
    for (var i=0; i<fixtureList.length; i++) {
      objectList.push([fixtureList[i], getFixture(fixtureList[i])]);
    }
    
    var tList = Physicsb2.getAllTargets();
    var targetList = [];
    for (t in tList) { targetList.push(t); }
    for (var i=0; i<targetList.length; i++) {
      objectList.push([targetList[i], getTarget(targetList[i])]);
    }
  
    return objectList;
  }
  
  function getSettings() {
    var settings = {};
    settings.gravityXy = getGravityXy();
    settings.wrapXy = getWrapXy();
    settings.timeStep = getTimeStep();
    settings.velocityIterations = getVelocityIterations();
    settings.getPositionIterations = getPositionIterations();
    return settings;
  }
  
  function setSettings(data) {
    //var data = JSON.parse(results);
    if (data.gravityXy) { setGravityXy(data.gravityXy); }
    if (data.wrapXy) { setWrapXy(data.wrapXy); }
    if (data.timeStep) { setTimeStep(data.timeStep); }
    if (data.velocityIterations) { setVelocityIterations(data.velocityIterations); }
    if (data.getPositionIterations) { setPositionIterations(data.getPositionIterations); }
  }
  
  function getObject(name) {
    if (Physicsb2.getBodyObj(name)) {
      return getBody(name);
    } else if (Physicsb2.getTargetObj(name)) {
      return getTarget(name);
    } else if (Physicsb2.getFixtureObj(name)) {
      return getFixture(name);
    } else {
      return "none";
    }
  }
  function getObjectType(name) {
    if (Physicsb2.getBodyObj(name)) {
      return "body";
    } else if (Physicsb2.getTargetObj(name)) {
      return "target";
    } else if (Physicsb2.getFixtureObj(name)) {
      return Physicsb2.getFixtureObj(name).GetUserData().shape;
    } else {
      return "none";
    }
  }
  function deleteObject(name) {
    if (Physicsb2.getBodyObj(name)) {
      Physicsb2.deleteBody(name);
    } else if (Physicsb2.getFixtureObj(name)) {
      Physicsb2.deleteFixture(name);
    } else if (Physicsb2.getTargetObj(name)) {
      Physicsb2.deleteTarget(name);
    }
  }
  
  function deleteTargets() {
    var tList = Physicsb2.getAllTargets();
    var targetList = [];
    for (t in tList) { targetList.push(t); }
    for (var i=0; i<targetList.length; i++) {
      Physicsb2.deleteTarget(targetList[i]);
    }
  }
  function deleteObjects() {
    
    var targetList = Physicsb2.getAllTargets();
    var targetsToRemove = [];
    for (b in targetList) {
      targetsToRemove.push(b);
    }
    for (var i=0; i<targetsToRemove.length; i++) {
      Physicsb2.deleteTarget(targetsToRemove[i]);
    }
    
    var fixtureList = Physicsb2.getAllFixtures();
    var fixturesToRemove = [];
    for (f in fixtureList) {
      fixturesToRemove.push(f);
    }
    for (var i=0; i<fixturesToRemove.length; i++) {
      Physicsb2.deleteFixture(fixturesToRemove[i]);
    }
    
    var bodyList = Physicsb2.getAllBodies();
    var bodiesToRemove = [];
    for (b in bodyList) {
      bodiesToRemove.push(b);
    }
    for (var i=0; i<bodiesToRemove.length; i++) {
      Physicsb2.deleteBody(bodiesToRemove[i]);
    }
    

  }
  
  ////////// FORCES /////////
  function applyForce(name, force, angle) {
    if (Physicsb2.getTargetObj(name)) {
      Physicsb2.applyForce({ targetId: name, force: force, position: "absolute", angle: angle});
    } else {
      if (Physicsb2.getBodyObj(name)) {
        var targetList = Physicsb2.getBodyObj("line-body-0").GetUserData().targetList;
        if (targetList.length > 0) {
          Physicsb2.applyForce({ targetId: targetList[0], force: force, position: "absolute", angle: angle});
        }
      }
    }
  }
  function applyForceRelativeAngle(name, force, angle) {
    if (Physicsb2.getTargetObj(name)) {
      Physicsb2.applyForce({ targetId: name, force: force, position: "relative", angle: angle});
    } else {
      if (Physicsb2.getBodyObj(name)) {
        var targetList = Physicsb2.getBodyObj(name).GetUserData().targetList;
        if (targetList.length > 0) {
          Physicsb2.applyForce({ targetId: targetList[0], force: force, position: "relative", angle: angle});
        }
      }
    }
    //Physicsb2.applyForce({ targetId: name, force: force, position: "relative", angle: angle});
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
  function connectWhoToObject(who, name) {
    if (Physicsb2.getBodyObj(name) != undefined) {
      Physicsb2.connectWho(who, name);
      Physicsb2.refresh();
    }
  }
  function disconnectWho(who) {
    Physicsb2.disconnectWho(who);
  }

  function getConnected() {
    var connectedList = [];
    var bodies = Physicsb2.getAllBodies(); 
    for (var b in bodies) {
      var userdata = bodies[b].GetUserData();
      if (userdata.turtleId != -1) {
        connectedList.push([userdata.turtleId, userdata.id]);
      }
    }
    return connectedList;
  }

  function resetTicks() {
    
  }
  function tick() {
    var list = 0;
    Physicsb2.updateOnce();
    list = Physicsb2.getCollisions();
    //Physicsb2.redrawWorld();
  }
  function getTick() {
    var list = 0;
    Physicsb2.updateOnce();
    list = Physicsb2.getCollisions();
    return list;
  }
  function repaint() {
    Physicsb2.refresh();
    //Physicsb2.redrawWorld();
    //Physicsb2.updateOnce();
  }
  function createRectangle(name, body) {
    createPolygon(name, body);
  }
  function setRectangleRelativeCorners(name, corners) {
    var vertices = cornersToVertices(corners);
    setPolygonRelativeVertices(name, vertices);
  }
  function setRectangleCorners(name, corners) {
    var vertices = cornersToVertices(corners);
    setPolygonVertices(name, vertices);
  }
  function setRectanglePatch(name, coords) {
    var x = coords[0];
    var y = coords[1];
    setRectangleCorners(name, [ [ x - 0.45, y + 0.45 ], [ x + 0.45, y - 0.45]]);
    setBehavior(getBodyId(name), "static");
  }
  function cornersToVertices(corners) {
    var xmin, xmax, ymin, ymax;
    var point0 = corners[0];
    var point1 = corners[1];
    var xmin = point0[0] < point1[0] ? point0[0] : point1[0];
    if (point0[0] < point1[0]) {
      xmin = point0[0];
      xmax = point1[0];
    } else {
      xmax = point0[0];
      xmin = point1[0];
    }
    if (point0[1] < point1[1]) {
      ymin = point0[1];
      ymax = point1[1];
    } else {
      ymax = point0[1];
      ymin = point1[1];
    }
    return [[xmin, ymax],[xmax, ymax],[xmax, ymin],[xmin, ymin]];
  }
  function getRectangleRelativeCorners(name) {
    var list = 0;
    return list;
  }
  function getRectangleCorners(name) {
    var list = 0;
    return list;
  }

  function getRectanglePatch(name) {
    var patch = 0;
    return patch;
  }
  function showObject(name) {
    
  }
  function hideObject(name) {
    
  }
  function showObjects() {
    Physicsb2.repaintPhysics(true);;
  }
  function hideObjects() {
    Physicsb2.repaintPhysics(false);
  }
  function importWorld(filename) {
    
  }
  function exportWorld() {
    
  }
  function showToolbar() {
    $("#physicsMenu").css("display","block");
  }
  function hideToolbar() {
    $("#physicsMenu").css("display","none");
  }
  function getAll() {
    var data = {};
    data.objects = getObjects();
    data.settings = getSettings();
    return JSON.stringify(data);
  }
  function setAll(dataString) {
    data = JSON.parse(dataString);
    if (data.objects) { createObjects(data.objects); }
    if (data.settings) { setSettings(data.settings); }
  }

  
  return {
    setupInterface: setupInterface,
    //getDrawButtonMode: getDrawButtonMode,
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
    getConnected: getConnected,
    tick: tick,
    getTick: getTick,
    resetTicks: resetTicks,
    showObject: showObject,
    hideObject: hideObject,
    repaint: repaint,
    createRectangle: createRectangle,
    setRectangleRelativeCorners: setRectangleRelativeCorners,
    setRectangleCorners: setRectangleCorners,
    getRectangleRelativeCorners: getRectangleRelativeCorners,
    getRectangleCorners: getRectangleCorners,
    setRectanglePatch: setRectanglePatch,
    getRectanglePatch: getRectanglePatch,
    showObjects: showObjects,
    hideObjects: hideObjects,
    showToolbar: showToolbar,
    hideToolbar: hideToolbar,
    getAll: getAll,
    setAll: setAll
  };
 
})();

