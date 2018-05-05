var socket;
var universe;
var commandQueue = [];
var userData = {};
var myData = {};
//var repaintPatches = true;
var foreverButtonCode = new Object();
var myUserType;
var activityType = undefined;
var drawPatches = true;

  
jQuery(document).ready(function() {
  
  $("body").append("<img id='imageLayer' style='display:none'>")

  var userId;
  var userType;
  var turtleDict = {};
  var allowMultipleButtonsSelected = true;
  var allowGalleryForeverButton = true;

  socket = io();

  // save student settings
  socket.on("save settings", function(data) {
    userId = data.userId;
    userType = data.userType;
    Gallery.setupGallery({settings: data.gallerySettings, userId: userId});
    Physics.setupInterface();
    Maps.setupInterface();
    Graph.setupInterface();
    $(".netlogo-canvas").attr("id","netlogoCanvas"); 
    allowMultipleButtonsSelected = data.gallerySettings.allowMultipleSelections; 
    allowGalleryForeverButton = data.gallerySettings.allowGalleryControls;
    $(".roomNameInput").val(data.myRoom);
    $(".schoolNameInput").val(data.school);
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
    //console.log("enters "+data.userType);
    if (data.userType === "teacher" && procedures.gbccOnTeacherEnter != undefined) 
    {
      session.run('gbcc-on-teacher-enter "'+data.userId+'"');
    } else {
      if (procedures.gbccOnEnter != undefined) { session.run('gbcc-on-enter "'+data.userId+'"'); }
    }
    if (data.userData) {
      userData[data.userId] = data.userData;
    }
  });
  
  socket.on("gbcc user exits", function(data) {
    if (data.userType === "teacher" && procedures.gbccOnTeacherExit != undefined) {
        session.run('gbcc-on-teacher-exit ["'+data.userId+'"]');
    } else {
      if (procedures.gbccOnExit != undefined) {
        session.run('gbcc-on-exit ["'+data.userId+'"]');
      }
    }
  });

  // display admin interface
  socket.on("display admin", function(data) {
    Interface.showAdmin(data.roomData);
  });

  // student repaints most recent changes to world (hubnet, not gbcc)
  socket.on("send update", function(data) {
    if (mirroringEnabled) {
      universe.applyUpdate({turtles: data.turtles, patches: data.patches});
      universe.repaint();
    }
  });

  // show or hide student view or gallery
  socket.on("student accepts UI change", function(data) {
    if (data.type === "view") {
      (data.display) ? $(".netlogo-view-container").css("display","block") : $(".netlogo-view-container").css("display","none");
    } else if (data.type === "tabs") {
      (data.display) ? $(".netlogo-tab-area").css("display","block") : $(".netlogo-tab-area").css("display","none");
    } else if (data.type === "widgets") {
      (data.display) ? $(".netlogo-widget-container .netlogo-button:not(.login)").css("display","block") : 
        $(".netlogo-widget-container .netlogo-button").css("display","none");  
    }
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
          matchingMonitors[0].compiledSource = data.hubnetMessage;
          matchingMonitors[0].reporter       = function() { return data.hubnetMessage; };
        }
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
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab").hasClass("selected"))) {
      if (userData[data.userId] === undefined) {
        userData[data.userId] = {};
      }
      userData[data.userId][data.tag] = data.value;
    }
  });
  
  socket.on("accept user action", function(data) {
    var userType = data.userType;
    switch (data.status) {
      case "select":
        if (userType === "teacher" && procedures.gbccOnTeacherSelect != undefined) {
          session.run('gbcc-on-teacher-select "'+data.userId+'"');    
        } else {
          if (procedures.gbccOnSelect != undefined) { session.run('gbcc-on-select "'+data.userId+'"');}
        }
        break;
      case "deselect":
        if (userType === "teacher" && procedures.gbccOnTeacherDeselect != undefined) {
          session.run('gbcc-on-teacher-deselect "'+data.userId+'"');    
        } else {
          if (procedures.gbccOnDeselect != undefined) { session.run('gbcc-on-deselect "'+data.userId+'"');}
        }
        break;
      case "forever-deselect":
        delete foreverButtonCode[data.userId];
        if ($.isEmptyObject(foreverButtonCode)) { clearInterval(myVar); }
        break;
      case "forever-select":
        if ($.isEmptyObject(foreverButtonCode)) { myVar = setInterval(runForeverButtonCode, 1000); }
        foreverButtonCode[data.userId] = data.key;
        break;
    }
  });

  var myVar = "";
  function runForeverButtonCode() {
    //console.log("run forever button code");
    for (userId in foreverButtonCode) { 
      if (procedures.gbccOnGo != undefined) {
        session.runObserverCode(foreverButtonCode[userId]); 
      }
    }
  }

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