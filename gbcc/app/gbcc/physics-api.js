var socket;
var universe;

Physicsb2 = (function() {
  var world;
  var physicsWorld;
  var running = false;
  var elementsBound = false;
  
  var SCALE = 30;
  var BOX2D_WIDTH = 0; 
  var BOX2D_HEIGHT = 0; 
  var NLOGO_WIDTH = 0; 
  var NLOGO_HEIGHT = 0;
  
  var bodyObj = {};
  var turtleObj = {};
  var fixtureObj = {};
  var fixDefObj = {};
  var bodyDefObj = {};
  var targetObj = {}; //object, key is bodyId, value is list of targets
  var worldObj = {};
  
  var helperPoints = [];
  var helperArc = {};
  
  var isMouseDown = false;
  var mouseX = undefined;
  var mouseY = undefined;
  var p = undefined;
  var canvasPosition;
  
  var selectedBody = null;
  var selectedFixture = null;
  var selectedTarget = null;
  
  var mouseJoint = null;
  var mousePVec;
  
  var pointDragged = null;
  var bodyDragged = null;
  var targetDragged = null;
  var fixtureDragged = null;
  
  var canvas = null;
  var ctx = null;
  var totalObjectsCreated;
  var fixtureClick = null;
  
  var wrap = [false, false];
  
  var prevSelectedBody;
  var prevSelectedFixture;
  
  var showAABB = false;
  var showCenter = false;

  var   b2Vec2 = Box2D.Common.Math.b2Vec2
     ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
     ,	b2Body = Box2D.Dynamics.b2Body
     ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
     ,	b2Fixture = Box2D.Dynamics.b2Fixture
     ,	b2World = Box2D.Dynamics.b2World
     ,	b2MassData = Box2D.Collision.Shapes.b2MassData
     ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
     ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
     ,	b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
     ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
     ,  b2AABB = Box2D.Collision.b2AABB
     ,  b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
     ,  b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
     ,  b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
     ,  b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
     ,  b2MassData = Box2D.Collision.Shapes.b2MassData

     ;
  

  // assume NetLogo world is centered at 0
  
  ///////// INITIALIZE
  
  
  $( window ).resize(function() {
    p = $( "#netlogoCanvas").parent();//$( "#netlogoCanvas";
    canvasPosition = p.offset();
    //console.log("reset canvas position " + canvasPosition);
  });

  ///////// CONVERSIONS
  
  function nlogotobox2d(coords) {
    // console.log("nlogotobox2d", coords);
    BOX2D_WIDTH = parseFloat($("#netlogoCanvas").css("width").replace("px",""));
    BOX2D_HEIGHT = parseFloat($("#netlogoCanvas").css("height").replace("px",""));
    var nlogoLeftAbsolute = coords[0] + NLOGO_WIDTH / 2;
    var nlogoLeftPercent = nlogoLeftAbsolute / NLOGO_WIDTH;
    var box2dLeftAbsolute = BOX2D_WIDTH * nlogoLeftPercent / SCALE * 2;
    var nlogoTopAbsolute = NLOGO_HEIGHT / 2 - coords[1];
    var nlogoTopPercent = nlogoTopAbsolute / NLOGO_HEIGHT;
    var box2dTopAbsolute = BOX2D_HEIGHT * nlogoTopPercent / SCALE * 2;
    //console.log([ box2dLeftAbsolute, box2dTopAbsolute]);
    return ([ box2dLeftAbsolute, box2dTopAbsolute]);
  };
  
  function box2dtonlogo(coords) {
    // console.log("box2dtonlogo",coords);
    BOX2D_WIDTH = parseFloat($("#netlogoCanvas").css("width").replace("px",""))
    BOX2D_HEIGHT = parseFloat($("#netlogoCanvas").css("height").replace("px",""))
    var xcoord = coords.x * SCALE / 2;
    var ycoord = coords.y * SCALE / 2;
    var box2dLeftAbsolute = xcoord;
    var box2dLeftPercent = xcoord / BOX2D_WIDTH;
    var nlogoLeftAbsolute = NLOGO_WIDTH * box2dLeftPercent - (NLOGO_WIDTH / 2);
    var box2dTopAbsolute = ycoord;
    var box2dTopPercent = ycoord / BOX2D_HEIGHT;
    var nlogoTopAbsolute = (NLOGO_HEIGHT / 2) - NLOGO_HEIGHT * box2dTopPercent;
    return ({x: nlogoLeftAbsolute, y: nlogoTopAbsolute});
  };
  
  function radiansToDegrees(angle) {
    return angle / 2 / Math.PI * 360;
  }
  
  function degreesToRadians(angle) {
    return angle * 2 * Math.PI / 360;
  }
  
  function roundToTenths(x) {
    return Math.round(x * 100) / 100;
  }

  
  function distanceBetweenCoords(coord1, coord2) {
    var changeInX = coord2[0] - coord1[0];
    var changeInY = coord2[1] - coord1[1];
    return Math.sqrt(Math.pow(changeInX,2) + Math.pow(changeInY,2));
  }
  
  
  function distanceBetweenCoordsAndMouse(helperCoords) {
    var x1 = helperCoords.x;
    var y1 = helperCoords.y;
    var x2 = (event.clientX - canvasPosition.left) / SCALE * 2;
    var y2 = (event.clientY - canvasPosition.top) / SCALE * 2;
    var d = Math.sqrt(Math.pow((x2 - x1),2)+Math.pow((y2 - y1),2));
    return d;
  }

  ////////// RUN WORLD

  function createWorld(m) {
    bodyObj = {};
    turtleObj = {};
    bindElements();
    var gravity = m[0]
    var range = m[1];
    wrap = m[2];
    totalObjectsCreated = 0;  
    NLOGO_WIDTH = range[0];
    NLOGO_HEIGHT = range[1];
    if (canvas === null) {
      canvas = document.getElementsByClassName('netlogo-canvas')[0];
      ctx = canvas.getContext('2d');
    }
    p = $( "#netlogoCanvas").parent();//$( "#netlogoCanvas";
    canvasPosition = p.offset();
    world = new b2World(
          new b2Vec2(gravity[0], gravity[1])    //gravity
       ,  true                 //allow sleep
    );
    if (universe.model) {
      for (var turtleId in universe.model.turtles) {
        turtleObj[turtleId] = universe.model.turtles[turtleId].who;
      }
    }
    setupDebugDraw();
  }
  
  function updateWorld() {
    //save objects 
    // create world 
    // populate objects 
  }

  var lastUpdate = 0;
  
  function runWorld() {
    var currentTime = new Date().getTime();
    if (currentTime - lastUpdate > 300) {
      // run world was called for the first time, after a break
      startWorld();
    }
    lastUpdate = currentTime;
  }

  function startWorld() {
    //console.log("start world");
    if (world) {
        for (id in bodyObj)
        {          
          b = bodyObj[id];
          if (b.GetType() == b2Body.b2_dynamicBody || b.GetType() === b2Body.b2_kinematicBody) {
            if (universe.model.turtles[id] != undefined
               && universe.model.turtles[id].xcor != undefined
               && universe.model.turtles[id].ycor != undefined 
               && universe.model.turtles[id].heading != undefined) 
            {
              if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
                var pos = nlogotobox2d([universe.model.turtles[id].xcor, universe.model.turtles[id].ycor]);
                var posVector = new b2Vec2();
                posVector.x = pos[0];
                posVector.y = pos[1];
                b.SetPosition(posVector);
                var heading = degreesToRadians(universe.model.turtles[id].heading);
                //b.SetTransform(b.GetPosition(), heading);
                b.SetAngle(heading);
              }
            }
          }
      }
      window.clearInterval(physicsWorld);      
      physicsWorld = window.setInterval(update, 1000 / 60);
      running = true;
    }
  }
        
  function stopWorld() {
    window.clearInterval(physicsWorld);
    running = false;
  }
  
  function updateBodies() {
    var b;
    universe.repaint();
    //default 1/60, 10, 10
    world.Step(
           1 / 30   //frame-rate
        ,  10       //velocity iterations
        ,  10       //position iterations
    );
    world.DrawDebugData();
    redrawWorld();
    world.ClearForces();
    var target, targetList;
    for (id in bodyObj)
    {
      b = bodyObj[id];
      if (b.GetType() == b2Body.b2_dynamicBody || b.GetType() === b2Body.b2_kinematicBody) {
        if (wrap[0]) {
          if (b.GetPosition().x * SCALE / 2 > BOX2D_WIDTH) {
            b.SetPosition(new b2Vec2(0,b.GetPosition().y));				
          } 
          if (b.GetPosition().x * SCALE / 2 < 0) {
             b.SetPosition(new b2Vec2(BOX2D_WIDTH / SCALE * 2 , b.GetPosition().y));
          }
        }
        if (wrap[1]) {
          if (b.GetPosition().y * SCALE / 2 > BOX2D_HEIGHT) {
            b.SetPosition(new b2Vec2(b.GetPosition().x, 0));    
          }
          if (b.GetPosition().y * SCALE / 2 < 0) {
            b.SetPosition(new b2Vec2(b.GetPosition().x, BOX2D_HEIGHT / SCALE));
          }
        }
        
        var pos = box2dtonlogo(b.GetPosition());
        //console.log(pos);
        var heading = radiansToDegrees(b.GetAngle());
        //if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
        //  universe.model.turtles[id].xcor = pos.x;
        //  universe.model.turtles[id].ycor = pos.y;
        //  universe.model.turtles[id].heading = heading;
        //}
        
        // move associated targets
        targetList = b.GetUserData().targetList;
        
        for (var t=0; t<targetList.length; t++) {
          targetId = targetList[t];
          //console.log(targetObj[targetId].relativeCoords);
          targetObj[targetId].coords = b.GetWorldPoint(targetObj[targetId].relativeCoords);
        }
        
      } else if (b.GetType() == b2Body.b2_staticBody) {
        //var pos = box2dtonlogo(b.GetPosition());
        //if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
        //  universe.model.turtles[id].xcor = pos.x;
        //  universe.model.turtles[id].ycor = pos.y;
        //}
      }
    }
  }

  function updateOnce() {
    if (world) {
      updateBodies();
    }
  }
     
  function drawCircle(data) {
    console.log("draw circle",data);
    var pointCoords, pixelCoords;
    ctx.beginPath();
    ctx.strokeStyle = data.strokeStyle;
    ctx.lineWidth = data.lineWidth;
    ctx.fillStyle = data.fillStyle;
    pointCoords = data.pointCoords;
    pixelCoords = data.pixelCoords ? data.pixelCoords : {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };      
    ctx.arc(pixelCoords.x, pixelCoords.y, data.radius, 0, Math.PI * 2, true); // Outer circl
    if (data.fill) { ctx.fill(); }
    if (data.stroke && data.strokeStyle != "(none)") { ctx.stroke(); }
  }
  
  function drawPolygon(data) {
    var fixture = data.fixture;
    var offset = data.offset;
    ctx.beginPath();
    ctx.strokeStyle = data.strokeStyle;
    ctx.lineWidth = data.lineWidth;
    ctx.fillStyle = data.fillStyle;
    var body = fixture.GetBody();
    var fixturePoints = fixture.GetShape().GetVertices();
    for (var i=0; i < fixturePoints.length; i++) {
      pointCoords = body.GetWorldPoint(fixturePoints[i]);
      pointCoords = { x: pointCoords.x + offset.x, y: pointCoords.y + offset.y };
      pixelCoords = { x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
      if (i === 0) {
        ctx.moveTo(pixelCoords.x, pixelCoords.y);
      } else {
        ctx.lineTo(pixelCoords.x, pixelCoords.y);
      }
    }
    ctx.closePath();
    if (data.fill) { ctx.fill(); }
    if (data.stroke && data.strokeStyle != "(none)") { ctx.stroke(); }
  }
  
  function update() {
    if (running) {//}&& (currentTime - lastUpdate > 5)) {
      updateBodies();
      if(isMouseDown && (!mouseJoint)) {
        var body = getBodyAtMouse();
        if(body) {
          if (!body.m_userData.selected) {
            for (b = world.GetBodyList() ; b; b = b.GetNext())
            {
              if (b.GetType() == b2Body.b2_dynamicBody)
              {
                if (b.m_userData.selected) {
                  b.m_userData.selected = false;
                }
              }
            }
            body.m_userData.selected = true;
          }
          var md = new b2MouseJointDef();
          md.bodyA = world.GetGroundBody();
          md.bodyB = body;
          md.target.Set(mouseX, mouseY);
          md.collideConnected = true;
          md.maxForce = 300.0 * body.GetMass();
          //mouseJoint = world.CreateJoint(md);
          body.SetAwake(true);
        }
      }
    }
  };
  
  function redrawWorld() {
    if (world) {
      var mode = Physics.getDrawButtonMode();
      if (fixtureClick && showAABB) {
        drawCircle({
          "strokeStyle": "white",
          "lineWidth": 2,
          "pointCoords": fixtureClick,
          "radius": 0.25 * SCALE,
          "fill": false,
          "stroke": true
        });
      }
      var body, bodyCenter, bodyId, bodyCenter, shape, color;
      var fixture;
      if (showCenter) {
        if (selectedBody) {
          body = selectedBody;
          drawCircle({
            "strokeStyle": "white",
            "fillStyle": "red",
            "lineWidth": 2,
            "pointCoords": body.GetPosition(),
            "radius": 8,
            "fill": true,
            "stroke": true
          });
          drawCircle({
            "strokeStyle": "white",
            "fillStyle": "blue",
            "lineWidth": 2,
            "pointCoords": body.GetWorldCenter(),
            "radius": 8,
            "fill": true,
            "stroke": true
          });
        }
      }
      var selectedFixtureId = selectedFixture ? selectedFixture.GetUserData().id : -1;
      var selectedBodyId = selectedBody ? selectedBody.GetUserData().id : -1;
      var fixtureId;
      for (var f in fixtureObj) {
        fixture = fixtureObj[f];
        body = fixture.GetBody();
        bodyId = body.GetUserData().id;
        shape = fixture.GetUserData().shape;
        fillStyle = fixture.GetUserData().fillStyle;
        strokeStyle = fixture.GetUserData().strokeStyle;
        console.log(f,fillStyle);
        if (showAABB) {
          ctx.beginPath();
          ctx.strokeStyle="white";
          ctx.lineWidth=1;
          var aabb = fixture.GetAABB();
          pixelCoords = {x: aabb.lowerBound.x * SCALE, y: aabb.lowerBound.y * SCALE };
          ctx.moveTo(pixelCoords.x, pixelCoords.y);
          pixelCoords = {x: aabb.lowerBound.x * SCALE, y: aabb.upperBound.y * SCALE };
          ctx.lineTo(pixelCoords.x, pixelCoords.y);
          pixelCoords = {x: aabb.upperBound.x * SCALE, y: aabb.upperBound.y * SCALE };
          ctx.lineTo(pixelCoords.x, pixelCoords.y);
          pixelCoords = {x: aabb.upperBound.x * SCALE, y: aabb.lowerBound.y * SCALE };
          ctx.lineTo(pixelCoords.x, pixelCoords.y);
          ctx.closePath();
          ctx.stroke();
        }
        if (showCenter && (selectedBodyId === bodyId)) {
          drawCircle({
            "strokeStyle": "white",
            "fillStyle": "yellow",
            "lineWidth": 2,
            "pointCoords": body.GetWorldPoint(fixture.GetMassData().center),
            "radius": 8,
            "fill": true,
            "stroke": true
          });
        }
        if (shape === "circle") {
          drawCircle({
            "strokeStyle": strokeStyle,
            "fillStyle": fillStyle,
            "lineWidth": 5,
            "pointCoords": body.GetWorldPoint(fixture.GetShape().GetLocalPosition()),
            "radius": fixture.GetShape().GetRadius() * SCALE,
            "fill": false,
            "stroke": true
          });
        } else if (shape === "polygon" || shape === "line") {
          drawPolygon({
            "strokeStyle": strokeStyle,
            "fillStyle": fillStyle,
            "lineWidth": 5,
            "fixture": fixture,
            "offset": {x: 0, y:0 },
            "fill": false,
            "stroke": true
          });
        }
      }
      if (selectedFixture && mode === "drag") {
        createHelperPoints(selectedFixture);
      }
      if (selectedBody && mode === "group") {
        createHelperArc();
      }
      if (mode === "force" || mode === "target") {
        drawAllTargets();
        //drawFreeTargets();
        //if (targetDragged) {
        //  drawTarget(targetDragged);
        //}
        //if (bodyDragged && mode==="force") {
        //  drawTargetsForBody();
        //}
      }
    }
    console.log("redrew world");
  }
        
  //////// OBJECTS IN WORLD 
        
  function copyBody(bodyId) {
    var newBodyId = bodyId+"-"+totalObjectsCreated;
    var body = bodyObj[bodyId];
    var bodyType = body.GetType();
    var behavior = (bodyType === 0) ? "static" : (bodyType === 1) ? "ghost" : "dynamic";
    createBody({
      "parentId": newBodyId, 
      "behavior": behavior,
      "box2dCoords": body.GetPosition(),
      "heading": body.GetAngle() 
    });
    return newBodyId;
  }
        
  function createBody(m) {
    //console.log("CREATE BODY", m);
    var bodyId = m.bodyId;
    var behavior = m.behavior;
    var nlogoCoords = m.coords;
    var angle = m.angle;
    
    var box2dCoords = m.box2dCoords ? [m.box2dCoords.x, m.box2dCoords.y] : nlogotobox2d(nlogoCoords);
    var bodyDef = new b2BodyDef;
    bodyDef.userData = {
      id: bodyId,
      selected: false,
      ghost: false,
      targetList: []
    }
    switch (behavior) {
      case "static":
        bodyDef.type = b2Body.b2_staticBody;          
        break;
      case "dynamic":
        bodyDef.type = b2Body.b2_dynamicBody;            
        break;
      case "ghost":
        bodyDef.type = b2Body.b2_kinematicBody;
        bodyDef.userData.ghost = true;
        break;
    }
    bodyDef.angle = degreesToRadians(angle);
    bodyDef.position.x = roundToTenths(box2dCoords[0]);
    bodyDef.position.y = roundToTenths(box2dCoords[1]);
    bodyDefObj[bodyId] = bodyDef;
  }
  
  function addBodyToWorld(bodyId) {
    //console.log("ADD BODY TO WORLD "+bodyId);
    bodyObj[bodyId] = world.CreateBody(bodyDefObj[bodyId]);
    totalObjectsCreated++;
    createTarget( {
      "targetId": "target-"+totalObjectsCreated,
      "bodyId": bodyId,
      "box2dCoords": "",
      "snap": true
    });  
    addTargetToBody({
      "targetId": "target-"+(totalObjectsCreated - 1),
      "bodyId": bodyId
    });
  }
  
  function deleteBody(bodyId) {
    //console.log("DELETE BODY "+bodyId);
    var body = bodyObj[bodyId];
    var f = bodyObj[bodyId].GetFixtureList();
    if (f != null) {
      var fixtureList = [];
      while (f) {
        fixtureList.push(f.GetUserData().id);
        f = f.GetNext();
      }
      for (var g=0; g<fixtureList.length; g++) {
        deleteFixture(fixtureList[g]);
      }
    }
    bodyObj[bodyId].GetWorld().DestroyBody(bodyObj[bodyId]);
    delete bodyObj[bodyId];
    universe.repaint();
    world.DrawDebugData();
    redrawWorld();
  }
  
  function deleteFixture(fixtureId) {
    //console.log("DELETE FIXTURE "+fixtureId);
    var body = fixtureObj[fixtureId].GetBody();
    var f = body.GetFixtureList();
    while (f) {
      if (f.GetUserData().id === fixtureId) { 
        body.DestroyFixture(f); 
        break;
      }
      f = f.GetNext();
    }
    delete fixDefObj[fixtureId];
    delete fixtureObj[fixtureId];
    universe.repaint();
    world.DrawDebugData();
    redrawWorld();
  }
  
  function deleteTarget(targetId) {
    //console.log("DELETE TARGET "+targetId);
    var bodyId = targetObj[targetId].bodyId;
    if (bodyId) {
      var targetList = bodyObj[bodyId].GetUserData().targetList;
      targetList.splice(targetList.indexOf(targetId), 1);
      bodyObj[bodyId].GetUserData().targetList = targetList;
      //drawTargetsForBody(bodyId);
      //drawFreeTargets();
    }
    delete targetObj[targetId];
    universe.repaint();
    world.DrawDebugData();
    redrawWorld();
  }
  
  
  /*function updateBodyPosition(bodyId) {
    var position = bodyObj[bodyId].GetPosition();
    var center = bodyObj[bodyId].GetWorldCenter();
    var offset = {};
    offset.x = position.x - center.x;
    offset.y = position.y - center.y;
    universe.repaint();
    world.DrawDebugData();
    console.log('1');
    bodyObj[bodyId].SetPosition(center);
    var f = bodyObj[bodyId].GetFixtureList();
    var fixtureList = [];
    while (f) {
      fixtureList.push(f);
      f = f.GetNext();
    }
    var fixture;
    var shape;
    var vertices;
    var point;
    var newVertices;
    
    for (var g=0; g<fixtureList.length; g++) {
      fixture = fixtureList[g];
      shape = fixture.GetUserData().shape;
      if (shape === "circle") {
        point = fixture.GetShape().GetLocalPosition();
        point.x = point.x + offset.x;
        point.y = point.y + offset.y;
        fixture.GetShape().SetLocalPosition(point);
      } else if (shape === "line" || shape === "polygon") {
        vertices = fixture.GetShape().GetVertices();
        newVertices = [];
        for (var h=0; h<vertices.length; h++) {
          point = vertices[h];
          point.x = point.x + offset.x;
          point.y = point.y + offset.y;
          newVertices.push(point);
        }
        fixture.GetShape().SetAsArray(newVertices, newVertices.length);
      }
    }
    recenter(bodyObj[bodyId]);
  }*/
  
  function removeFixtureFromBody(fixtureId) {
    if (fixtureObj[fixtureId]) {
      var body = fixtureObj[fixtureId].GetBody();
      var bodyId = body.GetUserData().id;
      bodyObj[bodyId].DestroyFixture(fixtureObj[fixtureId]);
      if (!bodyObj[bodyId].GetFixtureList()) {
        deleteBody(bodyId);
      } else {
        var newBodyId = copyBody(bodyId);
        addBodyToWorld(newBodyId, newBodyId);
        addFixtureToBody({fixtureId: fixtureId,bodyId:newBodyId});
        //updateBodyPosition(bodyId);
      
      }
    }
      
  }
  
  function addFixtureToBody(m) {
    //console.log("ADD FIXTURE TO BODY");
    var fixtureId = m.shapeId;
    var bodyId = m.bodyId;
    var fixDef = fixDefObj[fixtureId];
    if (bodyObj[bodyId].GetUserData().ghost) {
      fixDef.filter.groupIndex = -1;
    }
    var shape = fixDef.userData.shape;
    var coords = fixDef.userData.coords;
    var offsetX = bodyObj[bodyId].GetPosition().x;
    var offsetY = bodyObj[bodyId].GetPosition().y;
    if (shape === "circle") {
      fixDef.shape.SetLocalPosition(
        new b2Vec2(roundToTenths(coords[0][0] - offsetX), roundToTenths(coords[0][1] - offsetY)),
        new b2Vec2(roundToTenths(coords[1][0] - offsetX), roundToTenths(coords[1][1] - offsetY)));
    } else if (shape === "line") {
        var v1 = new b2Vec2(roundToTenths(coords[0][0] - offsetX), roundToTenths(coords[0][1] - offsetY));
        var v2 = new b2Vec2(roundToTenths(coords[1][0] - offsetX), roundToTenths(coords[1][1] - offsetY));
        var vertices = [v1, v2];
        fixDef.shape.SetAsArray(vertices, vertices.length);
    } else if (shape === "polygon") {
      var vertices = [];
      for (var i=coords.length-1;i>=0;i--){
        vertices.push(new b2Vec2(roundToTenths(coords[i][0] - offsetX), roundToTenths(coords[i][1] - offsetY)))
      }
      fixDef.shape.SetAsArray(vertices,vertices.length);
    }
    var firstObj = (bodyObj[bodyId].GetFixtureList() === null) ? true : false;
    bodyObj[bodyId].CreateFixture(fixDef);
    var f = bodyObj[bodyId].GetFixtureList();
    var fixture;
    while (f) {
        if (f.GetUserData().id === fixtureId) { fixture = f; }
        f = f.GetNext();
    }
    fixtureObj[fixtureId] = fixture;
    redrawWorld();
    drawHelperPoints();
    recenter(bodyObj[bodyId]);
  }
  
  function updateFixture(fixtureId, key, value) {
    if (fixtureId === null) {
      fixtureId = selectedFixture.GetUserData().id;
    } 
    var fixture = fixtureObj[fixtureId];
    switch (key) {
      case "color":
        var userData = fixture.GetUserData();
        userData.fillStyle = value;
        userData.defaultFillColor = value;
        fixtureObj[fixtureId].SetUserData(userData);
        break;
      case "density":
        fixture.SetDensity(value);
        fixture.GetBody().ResetMassData();
        break;
      case "friction":
        fixture.SetFriction(value);
        break;
      case "density":
        fixture.SetRestitution(value);
        break;
      case "shapeId":
        fixture.GetUserData().id = value;
        fixDefObj[value] = fixDefObj[fixtureId];
        delete fixDefObj[fixtureId];
        fixtureObj[value] = fixtureObj[fixtureId];
        delete fixtureObj[fixtureId];
        break;
      case "bodyIdShapeMode": 
        var body;
        var newBodyId = value;
        if (!bodyObj[value]) {
          newBodyId = "body-"+totalObjectsCreated;
          var bodyId = fixture.GetBody().GetUserData().id;
          body = bodyObj[bodyId];
          var coords = [body.GetPosition().x, body.GetPosition().y ];
          var bodyType = body.GetType();
          var behavior = (bodyType === 0) ? "static" : (bodyType === 1) ? "ghost" : "dynamic";
          createBody({
            "bodyId": newBodyId, 
            "behavior": behavior, 
            "box2dCoords": coords,
            "angle": body.GetAngle()
          });
          addBodyToWorld(newBodyId);
        } 
        body = fixtureObj[fixtureId].GetBody();
        var shape = fixture.GetUserData().shape;
        if (shape === "circle") {
          var center = fixture.GetShape().GetLocalPosition();
          var absCenter = body.GetWorldPoint(center);
        } else if (shape === "line" || shape === "polygon") {
          var vertices = fixture.GetShape().GetVertices();
          var absVertices = [];
          for (var i=0; i<vertices.length; i++) {
            absVertices.push(body.GetWorldPoint(vertices[i]));
          }
        }
        var f = body.GetFixtureList();
        while (f) {
          if (f.GetUserData().id === fixtureId) { 
            body.DestroyFixture(f); 
            break;
          }
          f = f.GetNext();
        } 
        bodyObj[newBodyId].CreateFixture(fixDefObj[fixtureId]);
        var f = bodyObj[newBodyId].GetFixtureList();
        while (f) {
            if (f.GetUserData().id === fixtureId) { fixture = f; }
            f = f.GetNext();
        }
        fixtureObj[fixtureId] = fixture;
        selectedFixture = fixture;
        selectedBody = bodyObj[newBodyId];
        var newBody = bodyObj[newBodyId];
        if (shape === "circle") {
          fixture.GetShape().SetLocalPosition(newBody.GetLocalPoint(absCenter));
        } else if (shape === "line" || shape === "polygon") {
          var localVertices = [];
          for (var i=0; i<absVertices.length; i++) {
            localVertices.push(newBody.GetLocalPoint(absVertices[i]));
          }
          fixture.GetShape().SetAsArray(localVertices);
        }
        createHelperLines({"color": "limegreen"});
        break;
    }
    universe.repaint();
    world.DrawDebugData(); 
    redrawWorld();
  }
  
  function updateBody(bodyId, key, value) {
    //console.log(key+","+value);
    var body;
    if (bodyId === null) {
      bodyId = selectedFixture.GetBody().GetUserData().id;
    } 
    body = bodyObj[bodyId];
    switch (key) {
      case "angle":
        var angle = parseFloat($("#physicsSettings #angle").val()) || 0;
        body.SetAngle(angle);
        break;
      case "objectType":
        if (value.indexOf[0,1,2] > -1) {
          value = 0;
        }
        body.SetType(value);
        break;
      case "bodyIdBodyMode": 
        var newBodyId = value;
        var bodyId = body.GetUserData().id;
        body.GetUserData().id = newBodyId;
        bodyObj[newBodyId] = bodyObj[bodyId];
        delete bodyObj[bodyId];
        break;
    }
    universe.repaint();
    world.DrawDebugData(); 
    createHelperLines({"color":"limegreen"}); 
  }
  
  function createFixture(m) {
    //console.log("CREATE FIXTURE",m);
    var shapeId = m.shapeId;
    var box2dCoords = m.box2dCoords ? [m.box2dCoords.x, m.box2dCoords.y] : nlogotobox2d(m.coords);
    var shape = m.typeOfShape;
    var density = m.density;
    var friction = m.friction;
    var restitution = m.restitution;
    var color = m.color;
    var box2dFixtureCoords = [];
    var radius = m.radius;
    if (m.vertices) {
      var nlogoFixtureCoords = m.vertices;
      for (let coord of nlogoFixtureCoords) {
        box2dFixtureCoords.push(nlogotobox2d(coord));  
      }
    } else if (m.box2dVertices) {
      
      for (let coord of m.box2dVertices) {
        box2dFixtureCoords.push([coord.x, coord.y]);  
      }
    }
    var fixDef = new b2FixtureDef;
    var fixture;
    fixDef.density = density;
    fixDef.friction = friction;
    fixDef.restitution = restitution;
    fixDef.userData = {
      id: shapeId,
      shape: shape,
      coords: box2dFixtureCoords,
      fillStyle: color,
      strokeStyle: "(none)",
      defaultFillColor: color
    }
    console.log("none");
    if (shape === "circle") {
      var distance = (distanceBetweenCoords(box2dFixtureCoords[0], box2dFixtureCoords[1]));
      fixDef.shape = new b2CircleShape();
      fixDef.shape.SetRadius(distance);
    } else if (shape === "line") {
      fixDef.shape = new b2PolygonShape();
    } else if (shape === "polygon") {
      fixDef.shape = new b2PolygonShape(); 
    }
    fixDefObj[shapeId] = fixDef;
  }
  
  function createTarget(m) {
    console.log("create target",m);
    var targetId = m.targetId;
    var bodyId = m.bodyId;
    var coords;
    var snap = m.snap || false;
    var fillStyle = bodyId ? "limegreen" : "gray";
    if (bodyId) {
      recenter(bodyObj[bodyId]);
    }
    if (snap) {
      coords = bodyObj[bodyId].GetWorldCenter();
    } else {
      var box2dCoords = m.box2dCoords ? [m.box2dCoords.x, m.box2dCoords.y] : nlogotobox2d(m.coords);
      coords = {x: box2dCoords[0], y: box2dCoords[1]};
    }
    var target = {
      strokeStyle: "white",
      coords: coords,
      bodyId: bodyId,
      fillStyle: fillStyle,
      targetId: targetId,
      snap: snap
    }
    targetObj[targetId] = target;
    totalObjectsCreated++;
  }

  
  function addTargetToBody(m) {
    console.log("add target to body",m);
    var targetId = m.targetId;
    var target = targetObj[targetId];
    var bodyId = m.bodyId;
    if (bodyId) {
      targetObj[targetId].relativeCoords = bodyObj[bodyId].GetLocalPoint(target.coords);
      console.log("rel coords" + targetObj[targetId].relativeCoords);
      bodyObj[bodyId].GetUserData().targetList.push(targetId);
    }
  }
  
  
  function updateTarget(targetId, key, value) {
    console.log(key+","+value);
    var target;
    if (targetId === null) {
      targetId = targetDragged.targetId;
    } 
    bodyId = targetObj[targetId].bodyId;
    target = targetObj[targetId];
    var body = target.bodyId;
    switch (key) {
      case "snap":
        targetObj[targetId].snap = value;
        if (value) {
          targetObj[targetId].coords = bodyObj[bodyId].GetWorldCenter();
          targetObj[targetId].relativeCoords = bodyObj[bodyId].GetLocalPoint(targetObj[targetId].coords);
        }
        break;
      case "targetId":
        targetObj[targetId].targetId = value;
        targetObj[value] = targetObj[targetId];
        delete targetObj[targetId];
        var targetList = bodyObj[bodyId].GetUserData().targetList;
        targetList[targetList.indexOf(targetId)] = value;
        bodyObj[bodyId].GetUserData().targetList = targetList;
        break;
      case "bodyIdTargetMode":
        targetObj[targetId].bodyId = value;
        
        if (bodyId) {
          var targetList = bodyObj[bodyId].GetUserData().targetList;
          targetList.splice(targetList.indexOf(targetId), 1);
          bodyObj[bodyId].GetUserData().targetList = targetList;
        }
        bodyObj[value].GetUserData().targetList.push(targetId);
        targetObj[targetId].relativeCoords = bodyObj[value].GetLocalPoint(targetObj[targetId].coords);
        break;
    }
    universe.repaint();
    world.DrawDebugData(); 
    redrawWorld();
  }
  
  function addDistanceJointToBody(m) {
    var id = m[0];
    var bodyA = m[1];
    var bodyB = m[2];
    var coords = m[3];
    var collideConnected = m[4];
    var coordsA = nlogotobox2d(coords[0]);
    var coordsB = nlogotobox2d(coords[1]);
    var bodyAOffsetX = bodyObj[bodyA].GetPosition().x;
    var bodyAOffsetY = bodyObj[bodyA].GetPosition().y;
    var bodyBOffsetX = bodyObj[bodyB].GetPosition().x;
    var bodyBOffsetY = bodyObj[bodyB].GetPosition().y;
    //console.log("addDistanceJointToBody "+id+" "+bodyA+" "+bodyB+" "+coords+" "+collideConnected);
    var joint = new b2DistanceJointDef();
    joint.Initialize(bodyObj[bodyA], bodyObj[bodyB], 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1])), 
      new b2Vec2(roundToTenths(coordsB[0]), roundToTenths(coordsB[1])));  
    joint.collideConnected = (collideConnected === true) ? true : false;
    world.CreateJoint(joint);
  }
  
  function addRevoluteJointToBody(m) {
    var id = m[0];
    var bodyA = m[1];
    var bodyB = m[2];
    var coords = m[3];
    var collideConnected = m[4];
    var coordsA = nlogotobox2d(coords[0]);
    var bodyAOffsetX = bodyObj[bodyA].GetPosition().x;
    var bodyAOffsetY = bodyObj[bodyA].GetPosition().y; 
    var joint = new b2RevoluteJointDef();
    joint.Initialize(bodyObj[bodyA], bodyObj[bodyB], 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1]))); 
    joint.collideConnected = (collideConnected === true) ? true : false;
    world.CreateJoint(joint);
  }
  
  function addPrismaticJointToBody(m) {
    var id = m[0];
    var bodyA = m[1];
    var bodyB = m[2];
    var coords = m[3];
    var collideConnected = m[4];
    var coordsA = nlogotobox2d(coords[0]);
    var coordsB = nlogotobox2d(coords[1]);
    var bodyAOffsetX = bodyObj[bodyA].GetPosition().x;
    var bodyAOffsetY = bodyObj[bodyA].GetPosition().y;
    var bodyBOffsetX = bodyObj[bodyB].GetPosition().x;
    var bodyBOffsetY = bodyObj[bodyB].GetPosition().y;
    var joint = new b2PrismaticJointDef();
    joint.Initialize(bodyObj[bodyA], bodyObj[bodyB], 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1])), 
      new b2Vec2(roundToTenths(coordsB[0]), roundToTenths(coordsB[1])));   
    joint.collideConnected = (collideConnected === true) ? true : false;
    world.CreateJoint(joint);
  }

  ///////// FORCES IN WORLD
  
  function applyForce(m) {
    //console.log("apply force");
    var id, bodyA, coords, amount, radians;
    var amount = m.force;
    radians = degreesToRadians(m.angle);
    var position = m.position;
    var targetId = m.targetId;
    
    //console.log(position + " "+m.angle);
    var direction;
    /*
    for (body in bodyObj) {
      b = bodyObj[body];
      coords = b.GetWorldCenter();
      direction = new b2Vec2(Math.cos(radians)*amount, Math.sin(radians)*amount);
      if (position === "relative") { 
        direction = b.GetWorldVector(direction); 
      }
      b.ApplyForce(
        direction, 
        new b2Vec2(coords.x, coords.y) );
    }*/
    
    
    var target = targetObj[targetId];
    if (target) {
      
      var bodyId = target.bodyId;
      if (bodyId) {
        var body = bodyObj[bodyId];
        var coords = target.coords;
        console.log("apply force to ",coords);
        console.log("which is ",target.relativeCoords);
        //var coords = target.relativeCoords;
        direction = new b2Vec2(Math.cos(radians)*amount, Math.sin(radians)*amount);
        if (position === "relative") { 
          direction = b.GetWorldVector(direction); 
        }
        body.ApplyForce(
          direction, 
          new b2Vec2(coords.x, coords.y) );
      }
    }
  }
  
  function applyLinearImpulse(m) {
    var id = m[0];
    var bodyA = m[1];
    var coords = m[2];
    var heading = m[3];
    var amount = m[4] * 50;
    var coordsA = nlogotobox2d(coords);
    var radians = degreesToRadians(heading);
    bodyObj[bodyA].ApplyImpulse(
      {x:Math.cos(radians)*amount, y:Math.sin(radians)*amount}, 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1])) );
  }
  
  function applyTorque(m) {
    var bodyA = m[0];
    var amount = m[1] * 40;
    bodyObj[bodyA].ApplyTorque(amount); 
  }
  
  function applyAngularImpulse(m) {
    var bodyA = m[0];
    var amount = m[1] * 5;
    bodyObj[bodyA].ApplyAngularImpulse(amount);      
  }

  function setupDebugDraw() {
    if (world) {
      //console.log("setup debug draw");
      var debugDraw = new b2DebugDraw();
       debugDraw.SetSprite(document.getElementById("netlogoCanvas").getContext("2d"));
       debugDraw.SetDrawScale(30.0);
       debugDraw.SetFillAlpha(0.3);
       debugDraw.SetLineThickness(1.0);
       debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
       world.SetDebugDraw(debugDraw);
     }
  }

   function getBodyAtMouse() {
     //console.log("get body at mouse");
     mousePVec = new b2Vec2(mouseX, mouseY);
     var aabb = new b2AABB();
     aabb.lowerBound.Set(mouseX - 0.25, mouseY - 0.25);
     aabb.upperBound.Set(mouseX + 0.25, mouseY + 0.25);
     selectedBody = null;
     world.QueryAABB(getBodyCB, aabb);
     return selectedBody;
   }
   
   function getFixtureAtMouse() {
     //console.log("get fixture at mouse");// line, circle, polygon
     mousePVec = new b2Vec2(mouseX, mouseY);
     var aabb = new b2AABB();
     aabb.lowerBound.Set(mouseX - 0.25, mouseY - 0.25);
     aabb.upperBound.Set(mouseX + 0.25, mouseY + 0.25);
     selectedFixture = null;
     fixtureClick = {x: mouseX, y: mouseY}; 
     world.QueryAABB(getFixtureCB, aabb);
     if (!selectedFixture) {
       clearAllHelperPoints();
     }
     return selectedFixture;
   }
  
   function getPointAtMouse() {
     var result = getClosestObject(helperPoints);
     if (result === null) {
       return null;
     } else {
       helperPointDragged = helperPoints[result];
       drawHelperPoints();
       return helperPoints[result];
     }
   }
   
   function getClosestObject(objectList) {
     var smallestDistance = undefined;
     var d;
     var closestPoint = undefined;
     for (var j=0; j<objectList.length; j++) {
       d = distanceBetweenCoordsAndMouse(objectList[j].coords);
       if (smallestDistance === undefined) {
         smallestDistance = d; 
         closestPoint = j;
       } else if ( smallestDistance > d) {
         smallestDistance = d;
         closestPoint = j;
       }
     }
     if (smallestDistance < 1) {
       return closestPoint;
     } else {
       return null;
     }
   }
   
   function getTargetAtMouse() {
     //console.log("get target at mouse");
     var targetList = [];
     for (var t in targetObj) {
       targetList.push(targetObj[t]);
     }
     var result = getClosestObject(targetList);
     if (result === null) {
       selectedTarget = null;
       return null;
     } else {
       resetTargetColors();
       targetList[result].fillStyle = "orange";

       targetDragged = targetList[result];
       //drawTarget(targetDragged);
       return targetList[result];
     }
   }
   
   function getArcAtMouse() {
     //console.log("get arc at mouse");
     d = distanceBetweenCoordsAndMouse(helperArc);
     if (d < 0.5) {
       return true;
     } else { 
       return false;
     }
   }
     
   function getBodyCB(fixture) {
     if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
         selectedBody = fixture.GetBody();
         return false;
     }
     return true;
   }
   
   function getFixtureCB(fixture) {
     selectedFixture = fixture;
     if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
         selectedFixture = fixture;
         return false;
     }
     return true;
   }
   
   /////////// EVENTS
   
    function handleMove() {   
      var vertices;
      var tempHelperPoint, newVertices;
      var center;
      var mode = Physics.getDrawButtonMode();
      fixtureClick = null;
      switch (mode) {
        case "group": {
          if (arcDragged) {
            drawHelperArc();
            $("#physicsSettings #angle").val(parseInt(radiansToDegrees(selectedBody.GetAngle()) ));
          } else {
            if (bodyDragged != null) {
              var center = {x: bodyDragged.offset.x + mouseX, y: bodyDragged.offset.y + mouseY };
              bodyDragged.body.SetPosition(center);
            }
          }
          break;
        }
        case "drag": {
          if (selectedFixture) {
            var center = selectedFixture.GetBody().GetPosition();
            selectedFixture.GetBody().SetPosition(center);
          }
          if (pointDragged != null) {
            dragFixtureByPoint();
          } else if (bodyDragged != null) {
            if (selectedFixture) {
              dragFixture();
            }
          }
          if (selectedFixture) {
            selectedFixture.GetBody().ResetMassData(); 
          }
          break;
        }
        case "force": {
          if (targetDragged) {
            targetDragged.coords.x = mouseX;
            targetDragged.coords.y = mouseY;
            targetDragged.snap = false;
          } else {
            if (bodyDragged != null) {
              var center = {x: bodyDragged.offset.x + mouseX, y: bodyDragged.offset.y + mouseY };
              bodyDragged.body.SetPosition(center);
              dragTargets();
              //drawTargetsForBody();
            }
          }
          break;
        }
      }
      universe.repaint();
      world.DrawDebugData();
      redrawWorld();
    }
    
    function dragFixtureByPoint() {
      helperPoints[pointDragged.fixtureIndex].coords.x = mouseX;
      helperPoints[pointDragged.fixtureIndex].coords.y = mouseY;
      helperPoints[pointDragged.fixtureIndex].pixelCoords.x = mouseX * SCALE;
      helperPoints[pointDragged.fixtureIndex].pixelCoords.y = mouseY * SCALE;
      if (pointDragged.shape === "circle") {
        var localCenter = selectedFixture.GetShape().GetLocalPosition();
        var absoluteCenter = bodyObj[pointDragged.bodyId].GetWorldPoint(localCenter);
        var radius = distanceBetweenCoordsAndMouse(absoluteCenter);
        selectedFixture.GetShape().SetRadius(radius);
      } else if (pointDragged.shape === "polygon" || pointDragged.shape === "line") {
        var vertices = selectedFixture.GetShape().GetVertices();
        var absolutePoint = new b2Vec2();
        absolutePoint.x = helperPoints[pointDragged.fixtureIndex].coords.x;
        absolutePoint.y = helperPoints[pointDragged.fixtureIndex].coords.y;
        var newVertex = bodyObj[pointDragged.bodyId].GetLocalPoint(absolutePoint);
        vertices[pointDragged.fixtureIndex] = newVertex;
        selectedFixture.GetShape().SetAsArray(vertices, vertices.length);
      }
    }
    
    function dragFixture() {
      var shape = selectedFixture.GetUserData().shape;
      var body = selectedFixture.GetBody();
      var absCoords, localCoords;
      var vertices;
      if (shape === "circle") {
        absCoords = {x: fixtureDragged.offset.x + mouseX, y: fixtureDragged.offset.y + mouseY };
        localCoords = body.GetLocalPoint(absCoords);
        selectedFixture.GetShape().SetLocalPosition(localCoords);
        helperPoints[0].coords.x = absCoords.x;
        helperPoints[0].coords.y = absCoords.y;
        helperPoints[0].pixelCoords.x = absCoords.x * SCALE;
        helperPoints[0].pixelCoords.y = absCoords.y * SCALE;
      } else if (shape === "line" || shape === "polygon") {
        vertices = fixtureDragged.offsetList;
        newVertices = [];
        for (var v=0; v<vertices.length; v++) {
           absCoords = {x: vertices[v].x + mouseX, y: vertices[v].y + mouseY};
           localCoords = body.GetLocalPoint(absCoords);
           newVertices.push(localCoords);
           helperPoints[v].coords.x = absCoords.x;
           helperPoints[v].coords.y = absCoords.y;
           helperPoints[v].pixelCoords.x = absCoords.x * SCALE;
           helperPoints[v].pixelCoords.y = absCoords.y * SCALE;
        }
        selectedFixture.GetShape().SetAsArray(newVertices);              
      } 
    }

    function dragTargets() {
      var shape = selectedFixture.GetUserData().shape;
      var body = selectedBody;
      var targets = selectedBody.GetUserData().targetList;
      var target;
      for (var t=0; t<targets.length; t++) {
        target = targetObj[targets[t]];
        target.coords = {x: target.offset.x + mouseX, y: target.offset.y + mouseY };
      }
    }
   
    function handleMouseClick() {
      //console.log("handle mouse click");
      universe.repaint();
      world.DrawDebugData();
      var mode = Physics.getDrawButtonMode();
      mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
      mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
      switch (mode) {
       case "drag": 
         if (!selectedFixture) {
           clearAllHelperPoints();
           $("#physicsSettings").addClass("hidden");
           clearAllHelperLines();
           selectedBody = null; 
         }
        var fixture = getFixtureAtMouse();
        if (fixture) {
          selectedBody = fixture.GetBody();
          createHelperLines({"color": "white"}); 
          console.log("set lines white");
          updateDragSettings(fixture);
        } 
        drawHelperPoints();
        break;
      case "group": 
        var body = getBodyAtMouse();
        if (!selectedFixture) {
          $("#physicsSettings").addClass("hidden");
          clearAllHelperLines();
          selectedBody = null; 
        }
        var fixture = getFixtureAtMouse();
        if (fixture) {
          var body = fixture.GetBody();
          selectedBody = body;
          updateBodySettings(body);
          createHelperLines({"color": "limegreen"}); 
          console.log("set lines green");
          
          body.SetLinearVelocity({x: 0, y: 0});
          console.log("set linear velocity to 0");
          
        }
        break;
      case "force": 
        //drawAllTargets();
        if (targetDragged) {
          targetObj[targetDragged.targetId].coords.x = mouseX;
          targetObj[targetDragged.targetId].coords.y = mouseY;
          
          if (targetDragged.bodyId) {

            targetObj[targetDragged.targetId].relativeCoords = bodyObj[targetDragged.bodyId].GetLocalPoint(targetObj[targetDragged.targetId].coords);
          }
        }
        var target = getTargetAtMouse(); 
        
        if (target) {
          updateTargetSettings(target);
          if (selectedBody) {
            var bodyId = selectedBody.GetUserData().id;
            selectedBody = bodyObj[target.bodyId];
            createHelperLines({"color": "limegreen"}); 
          }
        } else {
          if (!selectedBody) {
            resetTargetColors();
            $("#physicsSettings").addClass("hidden");
          } else {
            $("#physicsSettings").addClass("hidden");
            var body = getBodyAtMouse();
            if (selectedBody) {
              createHelperLines({"color": "limegreen"}); 
            } else {
              clearAllHelperLines();
              resetTargetColors();
            }
          }
        }
        break;
      case "target": 
      console.log("target click");
        var targetId = "target-"+totalObjectsCreated;
        createTarget( {
          "targetId": targetId,
          "bodyId": undefined,
          "box2dCoords": {x: mouseX, y: mouseY},
          "snap": false
        });  
        addTargetToBody({
          "targetId": targetId,
          "bodyId": undefined
        });
        //drawAllTargets();
        break;
      default: //mode === "line" || mode === "circle" || mode === "triangle")
       var bodyId = "body-"+totalObjectsCreated;
       var shapeId = mode+"-"+totalObjectsCreated;
       createBody({
         "bodyId": bodyId, 
         "behavior": "dynamic", 
         "box2dCoords": {x: mouseX, y: mouseY}, 
         "angle": 0
       });
       addBodyToWorld(bodyId);
       if (mode === "line") {
         createFixture({
           "shapeId": shapeId, 
           "box2dCoords": {x: mouseX, y: mouseY}, 
           "box2dVertices": [{x: mouseX - 2, y: mouseY},{x: mouseX + 2, y: mouseY}], 
           "typeOfShape": "line", 
           "density": 0.5,
           "friction": 0.5,
           "restitution": 0.5,
           "color": "(none)",
         });  
       } else if (mode === "circle") {
         createFixture({
           "shapeId": shapeId, 
           "box2dCoords": {x: mouseX, y: mouseY}, 
           "box2dVertices": [{x: mouseX - 0.5, y: mouseY},{x: mouseX + 0.5, y: mouseY}], 
           "typeOfShape": "circle", 
           "density": 0.5,
           "friction": 0.5,
           "restitution": 0.5,
           "color": "(none)",
           "radius": 1
         });  
       } else if (mode === "triangle") {
         createFixture({
           "shapeId": shapeId, 
           "box2dCoords": {x: mouseX, y: mouseY}, 
           "box2dVertices": [{x: mouseX, y: mouseY + 2},{x: mouseX, y: mouseY - 2}, {x: mouseX - 2, y: mouseY}], 
           "typeOfShape": "polygon", 
           "density": 0.5,
           "friction": 0.5,
           "restitution": 0.5,
           "color": "(none)",
         });  
       }
       addFixtureToBody({
         "shapeId": shapeId, 
         "bodyId": bodyId, 
       });  
       universe.repaint();
       world.DrawDebugData();
       break;
     }
     if (!selectedBody && !selectedFixture && !selectedTarget) {
        showSettings("worldModeSettings");
        updateWorldSettings();
     }
     redrawWorld();
   }
   
   function showSettings(id) {
     $("#physicsSettings").removeClass("hidden");//.css("display","inline-block");
     $("#groupModeSettings").addClass("hidden");
     $("#dragModeSettings").addClass("hidden");//.css("display","inline-block");
     $("#targetModeSettings").addClass("hidden");
     $("#worldModeSettings").addClass("hidden");
     $("#"+id).removeClass("hidden");
   }
   
   function updateDragSettings(fixture) {
     showSettings("dragModeSettings");
     $("#physicsSettings #shapeId").val(fixture.GetUserData().id);
     $("#physicsSettings #density").val(fixture.GetDensity());
     $("#physicsSettings #restitution").val(fixture.GetRestitution());
     $("#physicsSettings #friction").val(fixture.GetFriction());
     var bodyId = fixture.GetBody().GetUserData().id;
     var b;
     $("#bodyIdShapeMode").html("");
     for (var b in bodyObj) {
       if (bodyId === b) {
           $('#bodyIdShapeMode').append("<option value="+b+" selected='selected'>"+b+"</option>");
       } else {
         $('#bodyIdShapeMode').append("<option value="+b+">"+b+"</option>");
       }
     }
     $('#bodyIdShapeMode').append("<option value='new'>new</option>");
     var color = fixture.GetUserData().fillStyle;
     console.log(color);
     if (["(none)","#ff000032","#ffa50032","#ffff0032","#00ff0032","#0000ff32","#80008032"].indexOf(color) < 0) {
       $("#physicsSettings #color").val("(other)");
     } else {
       $("#physicsSettings #color").val(color);
     }
     $("#shapeId").val(fixture.GetUserData().id);
   }
   
   function updateBodySettings(body) {
     showSettings("groupModeSettings");
     $("#physicsSettings #bodyIdBodyMode").val(body.GetUserData().id);
     $("#physicsSettings #angle").val(parseInt(radiansToDegrees(body.GetAngle())));
     $("#physicsSettings .objectType").val(body.GetType());
   }
   
   function updateWorldSettings() {
     console.log("update world settings");
   }
   
   function updateWorld(key, value) {
     console.log("update world");
     switch (key) {
        case "gravityX":
          worldObj["gravityX"] = value;
          break;
        case "gravityX":
           worldObj["gravityX"] = value;
           break;
        case "gravityX":
          worldObj["gravityX"] = value;
          break;
        case "gravityX":
           worldObj["gravityX"] = value;
           break;
      }  
   }
   
   function updateTargetSettings(target) {
     showSettings("targetModeSettings");
     var b;
     $("#bodyIdTargetMode").html("");
     var bodyId = target.bodyId;
     $("#physicsSettings #targetId").val(target.targetId);
     for (var b in bodyObj) {
       if (bodyId === b) {
           $('#bodyIdTargetMode').append("<option value="+b+" selected='selected'>"+b+"</option>");
       } else {
         $('#bodyIdTargetMode').append("<option value="+b+">"+b+"</option>");
       }
     }
     $("#bodyIdTargetMode").append("<option value='undefined'>undefined</option>");
     if (!bodyId) {
       $("#bodyIdTargetMode").val("undefined");
     }
     if (target.snap != $("#snap").is(":checked")) {
       $("#snap").trigger("click");
     } 
   }
   
   function handleMouseDown() {
     //console.log("handle mouse down");
     var coords;
     var body;
     var fixture;
     var mode = Physics.getDrawButtonMode();
     var coordsList;
     var vertices;
     mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
     mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
     if (mode === "drag") {
       pointDragged = getPointAtMouse();
       if (pointDragged === null) {
         fixture = getFixtureAtMouse();
         if (fixture!= null) {
           setupDragFixture({
             "fixture": fixture,
             "mouseOffset": { x: mouseX, y: mouseY }
           });
           setupDragBody({
             "fixture": fixture,
             "mouseOffset": { x: mouseX, y: mouseY }
           });
         } 
       }
     } 
     if (mode === "group") {
       prevSelectedBody = selectedBody;
       prevSelectedFixture = selectedFixture;
       arcDragged = getArcAtMouse();
       if (!arcDragged) {
         fixture = getFixtureAtMouse();
         if (fixture!= null) {
           setupDragBody({
             "fixture": fixture,
             "mouseOffset": { x: mouseX, y: mouseY }
           });
         }
       }
     } 
     if (mode === "joint") {}
     if (mode === "force") {
       targetDragged = getTargetAtMouse();
       clearAllHelperLines();
       if (targetDragged === null) {
         fixture = getFixtureAtMouse();
         if (fixture!= null) {
           setupDragFixture({
             "fixture": fixture,
             "mouseOffset": { x: mouseX, y: mouseY }
           });
           setupDragBody({
             "fixture": fixture,
             "mouseOffset": { x: mouseX, y: mouseY }
           });
           setupDragTargets({
             "fixture": fixture,
             "mouseOffset": { x: mouseX, y: mouseY }
           });
         } 
       } 
       //drawTargets();
     }
     universe.repaint();
     world.DrawDebugData(); 
     redrawWorld();
   }
   
   function setupDragBody(data) {
     var fixture = data.fixture;
     var mouseOffset = data.mouseOffset;
     bodyDragged = {};
     var body = fixture.GetBody();
     bodyDragged.body = body;
     var center = bodyDragged.body.GetPosition();
     bodyDragged.offset = {x: center.x - mouseOffset.x, y:center.y - mouseOffset.y};
     
     bodyObj[body.GetUserData().id].SetAngularVelocity(0);
     bodyObj[body.GetUserData().id].SetLinearVelocity(new b2Vec2());
     //clearAllHelperLines(); 
     selectedBody = bodyDragged.body;
     var mode = Physics.getDrawButtonMode();
     if (mode === "drag") {
       createHelperLines({"color": "white"}); 
     } else if (mode === "group") {
       createHelperLines({"color": "limegreen"}); 
     }
     console.log("set lines either"+mode);
   }
   
   function setupDragTargets(data) {
     var fixture = data.fixture;
     var mouseOffset = data.mouseOffset;
     var body = fixture.GetBody();
     var targets = body.GetUserData().targetList;
     var location;
     for (var t=0; t<targets.length; t++) {
       location = targetObj[targets[t]].coords;
       targetObj[targets[t]].offset = {x: location.x - mouseOffset.x, y:location.y - mouseOffset.y};
     }
   }
   
   function setupDragFixture(data) {
     var fixture = data.fixture;
     var mouseOffset = data.mouseOffset;
     var body = fixture.GetBody();
     fixtureDragged = {};
     fixtureDragged.fixture = fixture;
     var shape = fixture.GetUserData().shape;
     fixtureDragged.shape = shape;
     if (shape === "circle") {
       coords = fixture.GetShape().GetLocalPosition();
       absCoords = body.GetWorldPoint(coords);
       fixtureDragged.offset = {x: absCoords.x - mouseOffset.x, y:absCoords.y - mouseOffset.y};
     } else if (shape === "line" || shape === "polygon") {
       fixtureDragged.offsetList = [];
       vertices = fixture.GetShape().GetVertices();
       for (var v=0; v<vertices.length; v++) {
         coords = vertices[v];
         absCoords = body.GetWorldPoint(coords);
         absCoords = {x: absCoords.x - mouseOffset.x, y:absCoords.y - mouseOffset.y};
         fixtureDragged.offsetList.push(absCoords);
       }
     }
   }
   
   function handleMouseUp() {
     //console.log("handle mouse up");
    // universe.repaint();
    // world.DrawDebugData();
     for (var i=0; i<helperPoints.length; i++) {
       if (helperPoints[i].color != "white") {
          helperPoints[i].color = "white";
       }
     }
     if (selectedBody && mode === "group") { createHelperArc(); }
     var mode = Physics.getDrawButtonMode();
     if (!selectedBody && selectedFixture) {
       selectedBody = selectedFixture.GetBody();
     }
     switch (mode) {
       case "group": 
         if (selectedBody) {
           createHelperLines({"color":"limegreen"}); 
         }
         break;
       case "target": 
         //if (selectedBody) {
        //   createHelperLines({"color": "limegreen"}); 
         //} 
         break;
       case "force":
         //if (selectedBody) {
          // createHelperLines({"color": "limegreen"}); 
         //} 
         //break;
         //if (targetDragged) {
        //   resetTargetColors();
         //}
       case "drag": 
         if (selectedFixture) {
           selectedBody = selectedFixture.GetBody();
           if (selectedBody) { recenter(selectedBody); console.log("MOUSE UP RECENTER"); }
         }
         drawHelperPoints();
         break;
     } 
     pointDragged = null;
     bodyDragged = null;
     
     universe.repaint();
     world.DrawDebugData();
     redrawWorld();
     
     //redrawWorld();
   }
   
   function recenter(body) {
     console.log(body);
     body.ResetMassData();
     var oldCenter = body.GetPosition();
     oldCenter = body.GetLocalPoint(oldCenter);
     var newCenter = body.GetWorldCenter();
     var newCenterAdjusted = body.GetLocalPoint(newCenter);
     var localChange = {x: newCenterAdjusted.x - oldCenter.x, y: newCenterAdjusted.y - oldCenter.y};
     var shape, absCoords, localCoords, vertices, newLocalCoords, newAbsCoords;
     f = body.GetFixtureList();
     while (f) {
       shape = f.GetUserData().shape;
       if (shape === "circle") {
         localCoords = f.GetShape().GetLocalPosition();
         localCoords = {x: localCoords.x - localChange.x, y:localCoords.y - localChange.y};
         f.GetShape().SetLocalPosition(localCoords);
       } else if (shape === "line" || shape === "polygon") {
         vertices = f.GetShape().GetVertices();
         newVertices = [];
         for (var v=0; v<vertices.length; v++) {
            localCoords = vertices[v];
            localCoords = {x: localCoords.x - localChange.x, y:localCoords.y - localChange.y};
            newVertices.push(localCoords);
         }
         f.GetShape().SetAsArray(newVertices);              
       } 
       f = f.GetNext();
     }
     body.SetPosition(newCenter);
     body.ResetMassData();
   }
   
   var handleMouseMove = function(e) {
     mouseX = (e.clientX - canvasPosition.left) / SCALE * 2;
     mouseY = (e.clientY - canvasPosition.top) / SCALE * 2;
     handleMove();
   }
   
   var handleTouchMove = function(e) {
     e.preventDefault();
     var orig = e.originalEvent;
     mouseX = (orig.touches[0].pageX - canvasPosition.left) / SCALE * 2;
     mouseY = (orig.touches[0].pageY - canvasPosition.left) / SCALE * 2;
     handleMove();
   };
   
   function bindElements() {
     if (elementsBound) { return } else { elementsBound = true; }
     //console.log("bind elements")
     $('#netlogoCanvas').on('mousedown', function(event) {
       isMouseDown = true;   
       mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
       mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
       handleMouseDown();
      $('#netlogoCanvas').on('mousemove', handleMouseMove);
     });
     $('#netlogoCanvas').on('mouseup', function(event) {
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
       $('#netlogoCanvas').off('mousemove');
       handleMouseUp();
     });
     $('#netlogoCanvas').on('mouseout', function(event) {
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
       $('#netlogoCanvas').off('mousemove', handleMouseMove);
     });
     $('#netlogoCanvas').on('click', function(event) {
       mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
       mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
       handleMouseClick();
     });
     $('#netlogoCanvas').on('touchstart', function(event) {
       isMouseDown = true;
       event.preventDefault();
       var orig = event.originalEvent;
       mouseX = (orig.touches[0].pageX - canvasPosition.left) / SCALE * 2;
       mouseY = (orig.touches[0].pageY - canvasPosition.left) / SCALE * 2;
       handleMouseDown();
       $('#netlogoCanvas').on('touchmove', handleTouchMove);
     });
    $('#netlogoCanvas').on('touchend', function(event) {
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
       $('#netlogoCanvas').off('touchmove');
       handleMouseUp();
    }); 
  }
  
  function createHelperPoints(fixture) {
    //console.log(fixture);
    var body = fixture.GetBody();
    var bodyCenter = body.GetPosition();
    var bodyId = body.GetUserData().id;
    var bodyCenter = body.GetPosition();
    var pointCoords;
    var pixelCoords;
    var localPosition;
    var radius;
    helperPoints = [];
    //universe.repaint();
    //world.DrawDebugData();
    var x, y;
    shape = fixture.GetUserData().shape;
    if (shape === "circle") {
      radius = fixture.GetShape().GetRadius();
      localCoords = fixture.GetShape().GetLocalPosition();
      var absoluteCoords = body.GetWorldPoint(localCoords);
      pointCoords = {x:(absoluteCoords.x - -radius), y:absoluteCoords.y};
      pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
      helperPoints.push({bodyId:bodyId, shape:"circle", fixtureIndex:0, coords:pointCoords, pixelCoords: pixelCoords });
    } else if (shape === "polygon" || shape === "line") {
      fixturePoints = fixture.GetShape().GetVertices();
      for (var i=0; i < fixturePoints.length; i++) {
        pointCoords = body.GetWorldPoint(fixturePoints[i]);
        pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
        helperPoints.push({bodyId:bodyId, shape:"polygon", fixtureIndex: i, coords:pointCoords, pixelCoords: pixelCoords });  
      }
    }
    drawHelperPoints();
  }
  
  function drawHelperPoints() {
    var coords;
    for (var i=0; i<helperPoints.length; i++) {
      ctx = canvas.getContext('2d');
      drawCircle({
        "strokeStyle": "limegreen",
        "fillStyle": "black",
        "lineWidth": 5,
        "pointCoords": helperPoints[i].coords,
        "radius": 12,
        "fill": true,
        "stroke": true
      });
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      coords = helperPoints[i].pixelCoords;
      ctx.fillText(i,coords.x - 6,coords.y + 8);
    }
  }
  
  function clearAllHelperLines() {
    var fixture;
    for (var fixture in fixtureObj) {
      f = fixtureObj[fixture];
      userData = f.GetUserData();
      userData.strokeStyle = "(none)";
      //userData.fillStyle = "(none)";
      f.SetUserData(userData);
    }
  }
  
  function clearAllHelperPoints() {
    helperPoints = [];
  }

  function resetAllFillColors() {
    var f;
    for (var fixture in fixtureObj) {
      f = fixtureObj[fixture];
      userData = f.GetUserData();
      userData.fillStyle = userData.defaultFillColor;
      console.log(userData.fillStyle);
      f.SetUserData(userData);
    }
  }
  
  function resetTargetColors() {
    for (var target in targetObj) {
      if (targetObj[target].fillStyle === "orange") {
        if (targetObj[target].bodyId) {
          targetObj[target].fillStyle = "limegreen";
        } else {
          targetObj[target].fillStyle = "gray";
        }
      }
    }
  }

  function createHelperLines(data) {
    console.log("create helper lines");
    clearAllHelperLines();
    if (selectedBody) {
      var f = selectedBody.GetFixtureList();
      while (f) {  
        var userData = f.GetUserData();
        userData.strokeStyle = data.color;
        //userData.fillStyle = "(none)";
        f.SetUserData(userData);
        f = f.GetNext();
      }
    }
  }
  
  function drawTarget(target) {
    //if (target.snap) {
    //  target.coords = bodyObj[target.bodyId].GetWorldCenter();
    //}
    var strokeStyle = target.strokeStyle;
    var fillStyle = target.fillStyle;
    var center = target.coords;
    var pixelCoords = {x: center.x * SCALE, y: center.y * SCALE};
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth=5;
    ctx.moveTo(pixelCoords.x - 20, pixelCoords.y);
    ctx.lineTo(pixelCoords.x + 20, pixelCoords.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pixelCoords.x - 0, pixelCoords.y - 20);
    ctx.lineTo(pixelCoords.x - 0, pixelCoords.y + 20);
    ctx.stroke();
    drawCircle({
      "strokeStyle": strokeStyle,
      "fillStyle": fillStyle,
      "lineWidth": 5,
      "pointCoords": center,
      "radius": 12,
      "fill": true,
      "stroke": true
    });
  }
  
  function drawAllTargets() {
    var target;
    for (var t in targetObj) {
      target = targetObj[t];
      drawTarget(target);
    }
  }
  
  function drawFreeTargets() {
    var target;
    for (var t in targetObj) {
      target = targetObj[t];
      if (target.bodyId === undefined) {
        drawTarget(target);
      }
    }
  }
    
  function drawTargetsForBody() {
    if (selectedBody) {
      var bodyId = selectedBody.GetUserData().id;
      var targetList = bodyObj[bodyId].GetUserData().targetList;
      var target;
      for (var i=0; i<targetList.length; i++) {
        target = targetObj[targetList[i]];
        drawTarget(target);
      }    
    }
  }
  
  function angleToOffset(angle, radius) {
    var oldPoint = {x: radius, y: 0};
    var newPoint = {};
    newPoint.x = oldPoint.x * Math.cos(angle) - oldPoint.y * Math.sin(angle);
    newPoint.y = oldPoint.y * Math.cos(angle) + oldPoint.x * Math.sin(angle);
    return newPoint;
  }
  
  function offsetToAngle(center, mouseCoords, radius) {
    radius = radius / SCALE;
    var position = {x: (mouseCoords.x - center.x), y: (mouseCoords.y - center.y)};
    var oldRadius = Math.sqrt(Math.pow((position.x), 2) + Math.pow((position.y), 2));
    var angle = Math.atan2(position.y, position.x);
    var newPoint = {x: radius * Math.cos(angle), y: radius * Math.sin(angle)};
    newPoint.x = newPoint.x + center.x;
    newPoint.y = newPoint.y + center.y;
    results = {};
    results.angle = angle;
    results.coords = newPoint;
    return results;
  }
  
  function createHelperArc() {  
    var center = selectedBody.GetPosition();
    pointCoords = center;
    pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
    //var angle = selectedBody.GetAngle();
    ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth=5;
    ctx.moveTo(pixelCoords.x, pixelCoords.y);
    var angle = selectedBody.GetAngle();
    var offset = angleToOffset(angle, 80);
    pixelCoords.x = pixelCoords.x + offset.x;
    pixelCoords.y = pixelCoords.y + offset.y;
    ctx.lineTo(pixelCoords.x, pixelCoords.y);
    ctx.stroke();
    
    /*
    drawCircle({
      "strokeStyle": "white",
      "fillStyle": "black",
      "lineWidth": 5,
      "pixelCoords": pixelCoords,
      "radius": 12,
      "fill": true,
      "stroke": true
    });*/
    
    ctx.beginPath();
    ctx.arc(pixelCoords.x, pixelCoords.y, 12, 0, Math.PI * 2, true); // Outer circle
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth=5;
    ctx.stroke();
    pointCoords = {x: pixelCoords.x / SCALE, y: pixelCoords.y / SCALE };
    helperArc = {x: pointCoords.x, y: pointCoords.y};
  }
  
  function drawHelperArc() {
    if (!selectedBody) {
      selectedBody = selectedFixture.GetBody();
    }
    if (selectedBody) {
      var center = selectedBody.GetPosition();
      pointCoords = center;
      pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE};
      var angle = selectedBody.GetAngle();
      
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth=5;
      ctx.moveTo(pixelCoords.x, pixelCoords.y);
      var mouseCoords = {x: mouseX, y: mouseY};
      var results = offsetToAngle(center, mouseCoords, 80);
      var newAngle = results.angle;
      var pointCoords = results.coords;
      var pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
      selectedBody.SetAngle(newAngle);
      ctx.lineTo(pixelCoords.x, pixelCoords.y);
      ctx.stroke();
      
      /*
      drawCircle({
        "strokeStyle": "white",
        "fillStyle": "black",
        "lineWidth": 5,
        "pointCoords": pointCoords,
        "radius": 12,
        "fill": true,
        "stroke": true
      });*/
      
      ctx.beginPath();
      ctx.arc(pixelCoords.x, pixelCoords.y, 12, 0, Math.PI * 2, true); // Outer circle
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth=5;
      ctx.stroke();
    }
  }
  
  function triggerModeChange(mode) {
    universe.repaint();
    world.DrawDebugData();
    clearAllHelperLines(); 
    resetAllFillColors();
    selectedFixture = null;
    selectedBody = null;
    arcDragged = false;
    $("#physicsSettings").addClass("hidden");
    //if (mode === "target" || mode === "force") {
    //  drawAllTargets();
    //} 
    ////drawFreeTargets();
    //}
    redrawWorld();
  }
  
  function triggerDisplayChange(display) {
    var mode = Physics.getDrawButtonMode();
    showAABB = display.showAABB;
    showCenter = display.showCenter;
    universe.repaint();
    world.DrawDebugData();
    redrawWorld();
    switch (mode) {
      case "group":
        createHelperLines({"color": "limegreen"}); 
        if (arcDragged ) { 
          drawHelperArc(); 
        }
        break;
      case "drag":
        drawHelperPoints();
        break;
      case "target":
        break;
    }
  }
  
  function deleteSelected() {
    var mode = Physics.getDrawButtonMode();
    switch (mode) {
      case "group":
        deleteBody(selectedBody.GetUserData().id);
        break;
      case "drag":
        deleteFixture(selectedFixture.GetUserData().id);
        break;
      case "force":
        deleteTarget(targetDragged.targetId);
    }
  }

  function getWorld() {
    return world;
  }
  
  function getBodyObj(id) {
    return bodyObj[id];
  }
  
  function getAllBodies() {
    return bodyObj;
  }
  
  function getAllFixtures() {
    return fixtureObj;
  }
  
  function getAllTargets() {
    return targetObj;
  }
  
  function drawDebugData() {
    world.DrawDebugData();
  }
  
  function getTotalObjectsCreated() {
    return totalObjectsCreated;
  }
  
  return {
    startWorld: startWorld,
    stopWorld: stopWorld,
    runWorld: runWorld,
    world: world,
    updateOnce: updateOnce,
    
    setupDebugDraw: setupDebugDraw,
    drawDebugData: drawDebugData,
    
    nlogotobox2d: nlogotobox2d,
    box2dtonlogo: box2dtonlogo,
    radiansToDegrees: radiansToDegrees,

    redrawWorld: redrawWorld,

    createBody: createBody,
    createFixture: createFixture,
    createWorld: createWorld,
    
    addBodyToWorld: addBodyToWorld,
    addFixtureToBody: addFixtureToBody,
    addTargetToBody: addTargetToBody,
    addDistanceJointToBody: addDistanceJointToBody,
    addRevoluteJointToBody: addRevoluteJointToBody,
    addPrismaticJointToBody: addPrismaticJointToBody,
    
    getWorld: getWorld,
    getBodyObj: getBodyObj,
    getAllBodies: getAllBodies,
    getAllFixtures: getAllFixtures,
    getAllTargets: getAllTargets,
    getTotalObjectsCreated: getTotalObjectsCreated,
        
    applyForce: applyForce,
    applyLinearImpulse: applyLinearImpulse,
    applyTorque: applyTorque,
    applyAngularImpulse: applyAngularImpulse,
    
    updateBody: updateBody,
    updateFixture: updateFixture,
    updateTarget: updateTarget,

    deleteFixture: deleteFixture,    
    deleteBody: deleteBody,
    deleteTarget: deleteTarget,
    deleteSelected: deleteSelected,
    
    triggerModeChange: triggerModeChange,
    triggerDisplayChange: triggerDisplayChange
  };

})();