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
var mirroringEnabled = true;
var myCanvas;
  
jQuery(document).ready(function() {

  var userId;
  var turtleDict = {};
  var allowMultipleButtonsSelected = true;
  var allowGalleryForeverButton = true;
  
  socket = io();
  
  var myForeverButtonVar = "";
  var myMirrorVar = "";

  // save student settings
  socket.on("save settings", function(data) {
    userId = data.userId;
    myUserType = data.userType;
    $(".netlogo-canvas").attr("id","netlogoCanvas"); 
    Gallery.setupGallery({settings: data.gallerySettings, userId: userId});
    Physics.setupInterface();
    Maps.setupInterface();
    Graph.setupInterface();
    allowMultipleButtonsSelected = data.gallerySettings.allowMultipleSelections; 
    allowGalleryForeverButton = data.gallerySettings.allowGalleryControls;
    $(".roomNameInput").val(data.myRoom);
    $(".schoolNameInput").val(data.school);
    var secondView = data.gallerySettings.secondViewString;
    if (myUserType === "student" && typeof secondView === "object" && secondView.length === 4) {
      $(".netlogo-view-container").css("left", secondView[0]);
      $(".netlogo-view-container").css("top", secondView[1]);
      $(".netlogo-view-container").css("width", secondView[2] - secondView[0]);
      $(".netlogo-view-container").css("height", secondView[3] - secondView[1]);    
    }
  });

  // display teacher or student interface
  socket.on("display interface", function(data) {
    if (activityType === undefined) { activityType = data.activityType; }
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
    if (procedures.gbccOnExit) {
      session.runCode(userData[data.userId]["gbcc-exit-button-code-"+data.userId]); 
    }
  });

  // display admin interface
  socket.on("display admin", function(data) {
    Interface.showAdmin(data.roomData);
  });

  // show or hide student view or gallery
  socket.on("student accepts UI change", function(data) {
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
        var teacherId = data.teacherId;
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
      if (data.state) {
        if (mirroringEnabled) {
          myWorld = data.state;
          world.miniWorkspace.importCSV(data.state);
        } else {
          if (myWorld) { 
            world.importState(myWorld);
          }
        }
      } 
      if (data.image && mirroringEnabled) {
        universe.applyUpdate({ drawingEvents: [{type: "import-drawing", sourcePath: data.image}] });
      }
    }
  });
  
  //"teacher accepts new entry request"
  socket.on("teacher accepts new entry request", function(data) {
    var state = world.exportCSV();
    blob = myCanvas.toDataURL("image/jpeg", 0.5); 
    socket.emit('teacher requests UI change new entry', {'userId':  data.userId, 'state': state, 'image': blob});
  });

  // students display reporters
  socket.on("display reporter", function(data) {
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab").hasClass("selected"))) {
      if (data.hubnetMessageTag.includes("canvas")) {
        Gallery.displayCanvas({message:data.hubnetMessage,source:data.hubnetMessageSource,tag:data.hubnetMessageTag,userType:data.userType});
      } else {
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
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      if (userStreamData[data.userId] === undefined) {
        userStreamData[data.userId] = {};
      }
      userStreamData[data.userId][data.tag].push(data.value);
      userData[data.userId][data.tag] = data.value;
    }
  });
  
  socket.on("accept user mirror data", function(data) {
    var turtles = data.value.turtles;
    var patches = data.value.patches;
    var links = data.value.links;
    var drawingEvents = data.value.drawingEvents;
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      if (turtles) { 
        universe.applyUpdate({ turtles: turtles }); 
      }
      if (patches) { 
        universe.applyUpdate({ patches: patches }); 
      }
      if (links) { 
        universe.applyUpdate({ links: links }); 
      }
      if (drawingEvents) { 
        universe.applyUpdate({ drawingEvents: drawingEvents }); 
      }
      world.triggerUpdate();
    }
  });
  
  socket.on("accept all user data", function(data) {
    //console.log("accept ALL user data");
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
    }
  });
  
  function runForeverButtonCode() {
    for (userId in foreverButtonCode) { 
      if (procedures.gbccOnGo != undefined) {
        session.runCode(userData[userId]["gbcc-forever-button-code-"+userId]); 
      }
    }
  }
  
  // show or hide student view or gallery
  socket.on("student accepts mirror change", function(data) {
    if (data.type === "mirror") {
      mirroringEnabled = data.display;
    }
    if (mirroringEnabled && data.type === "mirror") {
      myWorld = data.state;
      world.miniWorkspace.importCSV(data.state);
    } else {
      if (myWorld) { 
        world.importState(myWorld);
      }
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