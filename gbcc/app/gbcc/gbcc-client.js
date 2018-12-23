var socket;
var universe;
var commandQueue = [];
var userData = {};
var myData = {};
var userStreamData = {};
var myWorld;
var myStreamData = {};
var foreverButtonCode = new Object();
var myUserType;
var activityType = undefined;
var drawPatches = true;
var drawDrawing = true;
var mirroringEnabled;
var myCanvas;
var myUserId;
var netlogoGlobals = {};
  
jQuery(document).ready(function() {

  var userId;
  var turtleDict = {};
  var allowMultipleButtonsSelected = true;
  var allowGalleryForeverButton = true;
  var teacherId;
  var viewOverride = {};
  viewOverride.turtles = {};
  viewOverride.patches = {};
  viewOverride.links = {};
  viewOverride.observer = {};
  viewOverride.drawingEvents = {};
  var viewState = undefined;
  socket = io();
  var myForeverButtonVar = "";
  var myMirrorVar = "";

  // save student settings
  socket.on("save settings", function(data) {
    userId = data.userId;
    myUserType = data.userType;
    teacherId = data.teacherId;
    $(".netlogo-canvas").attr("id","netlogoCanvas"); 
    Gallery.setupGallery({settings: data.gallerySettings, userId: userId});
    Physics.setupInterface();
    Maps.setupInterface();
    Graph.setupInterface();
    //Images.setupInterface();
    allowMultipleButtonsSelected = data.gallerySettings.allowMultipleSelections; 
    allowGalleryForeverButton = data.gallerySettings.allowGalleryControls;
    $(".roomNameInput").val(data.myRoom);
    $(".schoolNameInput").val(data.school);
    var secondView = data.gallerySettings.secondView;
    if (myUserType === "student" && typeof secondView === "object" && secondView.length > 3) {
      $(".netlogo-view-container").css("left", secondView[0]);
      $(".netlogo-view-container").css("top", secondView[1]);
      $(".netlogo-canvas").css("left", secondView[0]);
      $(".netlogo-canvas").css("top", secondView[1]);
    }
  });

  // display teacher or student interface
  socket.on("display interface", function(data) {
    if (activityType === undefined) { 
      activityType = data.activityType; 
      mirroringEnabled = (activityType === "gbcc") ? false : true;
    }
    switch (data.userType) {
      case "teacher": //as teacher, show teacher interface
        Interface.showTeacher(data.room, data.components);
        break;
      case "hierarchy hubnet student": //as hierarchy student, show hubnet student interface
        Interface.showStudent(data.room, data.components, "hubnet");
        $(".teacher-controls").css("display","none");
        break;
      case "hierarchy gbcc student": //as hierarchy student, show hubnet student interface
        Interface.showStudent(data.room, data.components, "gbcc");
        $(".teacher-controls").css("display","none");
        break;
      case "flat student": //as flat student, show teacher interface, but hide teacher controls
        Interface.showTeacher(data.room, data.components);
        $(".teacher-controls").css("display","none");
        break;
      case "login":
        activityType = data.activityType;
        Interface.showLogin(data.rooms, data.components);
        break;
      case "remove login":
        Interface.removeLogin(data.room);
        break;
      case "disconnected":
        Interface.showDisconnected();
        break;
    }
  });

  socket.on("gbcc user enters", function(data) {
    var uId = data.userId;
    var uType = data.userType;
    if (data.userData) {
      userData[uId] = data.userData;
    }
    if (userData[uId] === undefined) {
      userData[uId] = {};
    }    
    userData[uId]["gbcc-user-type"] = uType;
    var compileString = 'try { var reporterContext = false; var letVars = { }; procedures["GBCC-ON"]("'+uId+'","'+uType+'"); } catch (e) { if (e instanceof Exception.StopInterrupt) { return e; } else { throw e; } }'
    if (procedures.gbccOnEnter) { 
      userData[uId]["gbcc-enter-button-code-"+uId] = compileString.replace("GBCC-ON","GBCC-ON-ENTER"); 
      session.runCode(userData[data.userId]["gbcc-enter-button-code-"+data.userId]); 
    }
    if (procedures.gbccOnExit) { userData[uId]["gbcc-exit-button-code-"+uId] = compileString.replace("GBCC-ON","GBCC-ON-EXIT"); }
    if (procedures.gbccOnSelect) { userData[uId]["gbcc-select-button-code-"+uId] = compileString.replace("GBCC-ON","GBCC-ON-SELECT"); }
    if (procedures.gbccOnDeselect) { userData[uId]["gbcc-deselect-button-code-"+uId] = compileString.replace("GBCC-ON","GBCC-ON-DESELECT"); }
    if (procedures.gbccOnGo) { userData[uId]["gbcc-forever-button-code-"+uId] = compileString.replace("GBCC-ON","GBCC-ON-GO"); }
  });
  
  socket.on("gbcc user exits", function(data) {
    if (userData[data.userId] && userData[data.userId].reserved) { 
      userData[data.userId].reserved = data.userData.reserved;
    }
    if (procedures.gbccOnExit) {
      session.runCode(userData[data.userId]["gbcc-exit-button-code-"+data.userId]); 
    }
  });
  
  socket.on("gbcc user message", function(data) {
    //console.log("gbcc user message",data);
    if (procedures.gbccOnMessage) {
      var tag = data.hubnetMessageTag;
      var message = data.hubnetMessage;
      var uId = data.hubnetMessageSource;
      var uType = data.userType;
      var compileString;
      if (typeof message === "string") {
        compileString = 'try { var reporterContext = false; var letVars = { }; procedures["GBCC-ON-MESSAGE"]("'+uId+'","'+uType+'","'+tag+'",'+JSON.stringify(message)+'); } catch (e) { if (e instanceof Exception.StopInterrupt) { return e; } else { throw e; } }'
      } else {
        if ((typeof message === "boolean") || (typeof message === "number")) { 
          compileString = 'try { var reporterContext = false; var letVars = { }; procedures["GBCC-ON-MESSAGE"]("'+uId+'","'+uType+'","'+tag+'", '+message+' ); } catch (e) { if (e instanceof Exception.StopInterrupt) { return e; } else { throw e; } }'        
        } else {
          compileString = 'try { var reporterContext = false; var letVars = { }; procedures["GBCC-ON-MESSAGE"]("'+uId+'","'+uType+'","'+tag+'", '+JSON.stringify(message)+' ); } catch (e) { if (e instanceof Exception.StopInterrupt) { return e; } else { throw e; } }'                  
        }
      }
      session.runCode(compileString); 
    }
  });

  // display admin interface
  socket.on("display admin", function(data) {
    Interface.showAdmin(data.roomData);
  });

  // show or hide student view or gallery
  socket.on("student accepts UI change", function(data) {
    //console.log("STUDENT accepts UI change "+data.type);
    if (data.type === "view") {
      (data.display) ? $(".netlogo-view-container").css("display","block") : $(".netlogo-view-container").css("display","none");
    } else if (data.type === "tabs") {
      (data.display) ? $(".netlogo-tab-area").css("display","block") : $(".netlogo-tab-area").css("display","none");
    } else if (data.type === "gallery") {
      if (data.display) {
        $(".netlogo-gallery-tab").css("display","block");
        $(".netlogo-gallery-tab-content").css("display","block"); 
        for (userId in foreverButtonCode) {
          delete foreverButtonCode[userId];
        }
        if ($.isEmptyObject(foreverButtonCode)) { clearInterval(myForeverButtonVar); }
      } else {
        $(".netlogo-gallery-tab").css("display","none"); 
        $(".netlogo-gallery-tab-content").css("display","none");  
        for (userId in foreverButtonCode) {
          delete foreverButtonCode[userId];
        }
        if ($.isEmptyObject(foreverButtonCode)) { clearInterval(myForeverButtonVar); }
        userStreamData[data.teacherId] = {};
        if ($.isEmptyObject(foreverButtonCode)) { myForeverButtonVar = setInterval(runForeverButtonCode, 200); }
        foreverButtonCode[teacherId] = "gbcc-forever-button-code-"+teacherId;
      }
    }
    if (data.type === "mirror") {
      mirroringEnabled = data.display;
      if (activityType === "hubnet") {
        mirroringEnabled ? $(".netlogo-view-container").css("display","block") : $(".netlogo-view-container").css("display","none");
      }
      if (data.image && mirroringEnabled) {
        universe.model.drawingEvents.push({type: "import-drawing", sourcePath: data.image});
      }
      if (mirroringEnabled) {
        myWorld = world.exportState();
        if (data.state) {
          ImportExportPrims.importWorldRaw(data.state);
        }
        // teacher turns mirroing on
        // restore globals
        for (var g in netlogoGlobals) {
          world.observer.setGlobal(g, netlogoGlobals[g]);
        }
      } else {
        // teacher turns mirroring off 
        // store globals 
        var globalVars = world.observer.varNames();
        for (var g in globalVars) {
          netlogoGlobals[globalVars[g]] =  world.observer.getGlobal(globalVars[g]);
        }
        if (myWorld) {
          world.clearAll(); 
          world.importState(myWorld);
        }
      }
      //} 
    }
  });
  
  //"teacher accepts new entry request"
  socket.on("teacher accepts new entry request", function(data) {
    var state = world.exportCSV();
    var blob = myCanvas.toDataURL("image/png", 0.5);
    socket.emit('teacher requests UI change new entry', {'userId':  data.userId, 'state': state, 'image': blob});
  });
  
  //"student accepts request to share state"
  socket.on("student accepts state request", function(data) {
    var state = {};
    state.myUserData = userData[myUserId];
    state.myWorld = world.exportCSV();
    state.blob = myCanvas.toDataURL("image/png", 0.5);
    state.graph = Graph.getAll();
    state.maps = Maps.getAll();
    socket.emit('student replies state request', {userId:  data.userId, state: state});
  });
  
  //"students accepts and loads new state"
  socket.on("student accepts state change", function(data) {
    Gallery.storeState();
    var state = data.state;
    if (userData[myUserId] && userData[myUserId].reserved && userData[myUserId].reserved.state) {
      Gallery.restoreStateData(state);
    }
  });

  // students display reporters
  socket.on("display reporter", function(data) {
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab").hasClass("selected"))) {
      var matchingMonitors = session.widgetController.widgets().filter(function(x) { 
        return x.type === "monitor" && x.display === data.hubnetMessageTag; 
      });
      if (matchingMonitors.length > 0) {
        for (var i=0; i<matchingMonitors.length; i++) {
          matchingMonitors[i].compiledSource = data.hubnetMessage;
          matchingMonitors[i].reporter       = function() { return data.hubnetMessage; };
        }        }
      else if (activityType === "hubnet") {
        world.observer.setGlobal(data.hubnetMessageTag.toLowerCase(),data.hubnetMessage);
      } else {
        // WARNING: gbcc:restore-globals overwrites globals, may not want this feature
        if ((world.observer.getGlobal(data.hubnetMessageTag) != undefined) &&
          (data.hubnetMessage != undefined)) {
          world.observer.setGlobal(data.hubnetMessageTag, data.hubnetMessage);
        }
      }
    }
  });
  
  socket.on("display canvas reporter", function(data) {
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab").hasClass("selected"))) {
      Gallery.displayCanvas({
        message:data.hubnetMessage,
        source:data.hubnetMessageSource,
        tag:data.hubnetMessageTag,
        userType:data.userType,
        claimed:data.claimed});
    }
  });  
  
  socket.on("accept user data", function(data) {
    //console.log("accept user data", data);
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      if (userData[data.userId] === undefined) {
        userData[data.userId] = {};
      }
      userData[data.userId][data.tag] = data.value;
    }
  });
  
  socket.on("accept user stream data", function(data) {
  //  console.log("accept user stream data");
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      if (userStreamData[data.userId] === undefined) {
        userStreamData[data.userId] = {};
      }
      if (!userStreamData[data.userId][data.tag]) {
        userStreamData[data.userId][data.tag] = [];
      }
      userStreamData[data.userId][data.tag].push(data.value);
      userData[data.userId][data.tag] = data.value;
    }
  });
  
  function saveUpdate(updates, agentType) {
    var agents = updates[agentType];
    for (var agent in agents) {
      if (!viewState[agentType][agent]) { viewState[agentType][agent] = {}; }
      for (var tag in agents[agent]) { 
        viewState[agentType][agent][tag] = agents[agent][tag]; 
      }
    }
  }
  
  function overrideUpdate(updates, agentType) {
    var agents = updates[agentType];
    var agent;
    var tag;
    if (viewOverride[agentType] && agents) {
      for (var agent in viewOverride[agentType]) {
        for (var tag in viewOverride[agentType][agent]) {
          if (updates[agentType][agent] && updates[agentType][agent][tag] != undefined) {
            delete updates[agentType][agent][tag];
          }
        }
      }
    }
    updates[agentType] = agents;
    return updates;
  }
  
  function applyOverride(agentIds, agentType, tag, message) {
    var updates = {};
    updates[agentType] = {};
    var agent;
    for (var a in agentIds) {
      agent = agentIds[a];
      if (!updates[agentType][agent]) { updates[agentType][agent] = {}; }
      updates[agentType][agent][tag] = message; 
      if (!viewOverride[agentType][agent]) { viewOverride[agentType][agent] = {}; }
      viewOverride[agentType][agent][tag] = message;
    }
    return updates;
  }
  
  function removeOverride(agents, tag) {
    var agentIds = agents.ids;
    var agentType = agents.agentType;
    var updates = {};
    var agent;
    updates[agentType] = {};
    for (a in agentIds) {
      agent = agentIds[a];
      updates[agentType][agent] = {};
      if ((viewState[agentType][agent][tag.toLowerCase()] != undefined) || (viewState[agentType][agent][tag.toUpperCase()] != undefined)) {
        updates[agentType][agent][tag] =  (viewState[agentType][agent][tag.toUpperCase()] != undefined) ? viewState[agentType][agent][tag.toUpperCase()] : viewState[agentType][agent][tag.toLowerCase()];        
      }
      if (viewOverride[agentType][agent] && ((viewOverride[agentType][agent][tag.toLowerCase()] != undefined) || viewOverride[agentType][agent][tag.toUpperCase()] != undefined)) {
        if (viewOverride[agentType][agent][tag.toUpperCase()] != undefined) {
          delete viewOverride[agentType][agent][tag.toUpperCase()];
        } else {
          delete viewOverride[agentType][agent][tag.toLowerCase()];        
        }
      }
    } 
    return updates;
  }
  
  function removeOverrides() {
    var updates = {};
    var agentTypes = ["turtles", "patches", "links"];
    var agentType;
    for (var a in agentTypes) {
      agentType = agentTypes[a];
      updates[agentType] = {};
      for (var agent in viewOverride[agentType]) { 
        for (var tag in viewOverride[agentType][agent]) { 
          updates[agentType][agent] = {};
          if ((viewState[agentType][agent][tag.toLowerCase()] != undefined) || (viewState[agentType][agent][tag.toUpperCase()] != undefined)) {
            if (viewState[agentType][agent][tag.toUpperCase()] != undefined) {
              updates[agentType][agent][tag] = viewState[agentType][agent][tag.toUpperCase()];
            } else {
              updates[agentType][agent][tag] = viewState[agentType][agent][tag.toLowerCase()];        
            }
          }
          if (viewOverride[agentType][agent] && ((viewOverride[agentType][agent][tag.toLowerCase()] != undefined) || viewOverride[agentType][agent][tag.toUpperCase()] != undefined)) {
            if (viewOverride[agentType][agent][tag.toUpperCase()] != undefined) {
              delete viewOverride[agentType][agent][tag.toUpperCase()];
            } else {
              delete viewOverride[agentType][agent][tag.toLowerCase()];        
            }
          }
        }
      }
      if (Object.keys(updates[agentType]).length === 0) {delete updates[agentType]; };
    }
    return updates;
  }
  
  socket.on("accept user mirror data", function(data) {
    if (!viewState) {
      viewState = {};
      viewState.turtles = JSON.parse(JSON.stringify(universe.model.turtles));
      viewState.patches = JSON.parse(JSON.stringify(universe.model.patches));
      viewState.links = JSON.parse(JSON.stringify(universe.model.links));
      viewState.drawingEvents = {};
      viewState.observer = {};
    }
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      var updates = data.value;
      saveUpdate(updates, "turtles");
      saveUpdate(updates, "patches");
      saveUpdate(updates, "links");
      saveUpdate(updates, "observer");
      updates = overrideUpdate(updates, "turtles");
      updates = overrideUpdate(updates, "patches");
      updates = overrideUpdate(updates, "links");
      updates = overrideUpdate(updates, "observer");
      universe.applyUpdate( updates );
      world.triggerUpdate();
    }
  });
  
  function combineUpdates(updates) {
    var update = {};
    for (var u in updates) {
      for (var agentType in updates[u]) {
        if (!update[agentType]) { update[agentType] = {}; }
        for (var agent in updates[u][agentType]) {
          if (!update[agentType][agent]) { update[agentType][agent] = {};}
          for (var tag in updates[u][agentType][agent]) {
            update[agentType][agent][tag] = updates[u][agentType][agent][tag];
          }
        }
      }
    }
    if (update["drawingEvents"]) {
      var drawingEventObj = update["drawingEvents"][0];
      update["drawingEvents"] = [];
      update["drawingEvents"].push(drawingEventObj); 
    }
    return update;
  }
  
  socket.on("accept user override", function(data) {
    var updates = [];
    if (!viewState) {
      viewState = {};
      viewState.turtles = JSON.parse(JSON.stringify(universe.model.turtles));
      viewState.patches = JSON.parse(JSON.stringify(universe.model.patches));
      viewState.links = JSON.parse(JSON.stringify(universe.model.links));
      viewState.drawingEvents = {};
      viewState.observer = {};
    }
    if (myUserType === "student") {
      var messageType = data.messageType;
      var agents = data.agents;
      var source = data.source;
      var tag = data.tag;
      var message = data.message;
      var updates = [];
      switch (messageType) {
        case "send-override": // hubnet-send-override string agent string reporter
          updates.push(applyOverride(agents.ids, agents.agentType, tag.toUpperCase(), message));
          break;           
        case "send-follow": // hubnet-send-follow client-name agent radius 
          updates.push(applyOverride([0], "observer", "perspective", 2));
          updates.push(applyOverride([0], "observer", "targetAgent", [1, agents.ids[0]]));
          updates.push(applyOverride([0], "drawingEvents", "type", "zoom"));
          updates.push(applyOverride([0], "drawingEvents", "scale", message));
          break;
        case "send-watch": // hubnet-send-watch client-name agent
          updates.push(applyOverride([0], "observer", "perspective", 3));
          updates.push(applyOverride([0], "observer", "targetAgent", [1, agents.ids[0]]));
          break;
        case "clear-override": // hubnet-clear-override client agent-or-set variable-name
          updates.push(removeOverride(agents, tag.toUpperCase()));          
          break;
        case "clear-overrides": // hubnet-clear-overrides client
          updates.push(removeOverrides());
        case "reset-perspective": // hubnet-reset-perspective client-name
          updates.push(applyOverride([0], "observer", "perspective", 0));
          updates.push(applyOverride([0], "observer", "targetAgent", undefined));
          updates.push(applyOverride([0], "drawingEvents", "type", "reset-zoom"));
          break;
      }
      var update = combineUpdates(updates);
      universe.applyUpdate(update);
      world.triggerUpdate();
    }
  });
  
  socket.on("accept canvas override", function(data) {
    Gallery.acceptCanvasOverride(data);
  });
  
  socket.on("accept all user data", function(data) {
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      userData = data.userData;
    }
  });

  socket.on("accept user action", function(data) {
    switch (data.status) {
      case "select":
        if (procedures.gbccOnSelect) {
          session.runCode(userData[data.userId]["gbcc-select-button-code-"+data.userId]); 
        }
        break;
      case "deselect":
        if (procedures.gbccOnDeselect) {
          session.runCode(userData[data.userId]["gbcc-deselect-button-code-"+data.userId]); 
        }
        break;
      case "forever-deselect":
        delete foreverButtonCode[data.userId];
        if ($.isEmptyObject(foreverButtonCode)) { clearInterval(myForeverButtonVar); }
        break;
      case "forever-select":
        userStreamData[data.userId] = {};
        if ($.isEmptyObject(foreverButtonCode)) { myForeverButtonVar = setInterval(runForeverButtonCode, 200); }
        foreverButtonCode[data.userId] = "gbcc-forever-button-code-"+data.userId;
        break;
      case "mousedown":
        if (procedures.gbccOnMousedown) {
          session.runCode('try { var reporterContext = false; var letVars = { }; procedures["GBCC-ON-MOUSEDOWN"]("'+data.mouse.pxcor+'","'+data.mouse.pycor+'"); } catch (e) { if (e instanceof Exception.StopInterrupt) { return e; } else { throw e; } }');
        }
        break;
      case "mouseup":
        if (procedures.gbccOnMouseup) {
          session.runCode('try { var reporterContext = false; var letVars = { }; procedures["GBCC-ON-MOUSEUP"]("'+data.mouse.pxcor+'","'+data.mouse.pycor+'"); } catch (e) { if (e instanceof Exception.StopInterrupt) { return e; } else { throw e; } }');
        }
        break;
    }
  });
  
  function runForeverButtonCode() {
    for (userId in foreverButtonCode) { 
      if (procedures.gbccOnGo != undefined) {
        session.runCode(userData[userId]["gbcc-forever-button-code-"+userId]); 
      }
    }
  }
  
  socket.on("trigger file import", function(data) {
    if (data.filetype === "ggb") {
      Graph.importGgbDeleteFile(data.xml);
    } 
  });
    
  socket.on("execute command", function(data) {
    var commandObject = {};
    commandObject.messageSource = data.hubnetMessageSource;
    commandObject.messageTag = data.hubnetMessageTag;
    commandObject.message = data.hubnetMessage;
    commandQueue.push(commandObject);
    world.hubnetManager.hubnetMessageWaiting = true;
  });

  // student leaves activity and sees login page
  socket.on("teacher disconnect", function(data) {
    Interface.showDisconnected();
  });

});
