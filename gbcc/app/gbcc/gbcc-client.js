var socket;
var universe;
var commandQueue = [];
var userData = {};
var myData = {};
var userStreamData = {};
var myStreamData = {};
//var repaintPatches = true;
var foreverButtonCode = new Object();
var myUserType;
var activityType = undefined;
var drawPatches = true;

  
jQuery(document).ready(function() {
  
  $("body").append("<img id='imageLayer' width='200px' height='200px' style='display:none'>")

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
    $(".netlogo-canvas").attr("id","netlogoCanvas"); 
    Gallery.setupGallery({settings: data.gallerySettings, userId: userId});
    Physics.setupInterface();
    Maps.setupInterface();
    Graph.setupInterface();
    //$(".netlogo-canvas").attr("id","netlogoCanvas"); 
    allowMultipleButtonsSelected = data.gallerySettings.allowMultipleSelections; 
    allowGalleryForeverButton = data.gallerySettings.allowGalleryControls;
    $(".roomNameInput").val(data.myRoom);
    $(".schoolNameInput").val(data.school);
    var secondView = data.gallerySettings.secondViewString;
    if (userType === "student" && typeof secondView === "object" && secondView.length === 4) {
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
    if (data.userData) {
      userData[data.userId] = data.userData;
    }
    if (procedures.gbccOnEnter) {
      session.run('gbcc-on-enter "'+data.userId+'" "'+data.userType+'"');
    }
  });
  
  socket.on("gbcc user exits", function(data) {
    if (procedures.gbccOnExit) {
      session.run('gbcc-on-exit "'+data.userId+'" "'+data.userType+'"');
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
    } else if (data.type === "gallery") {
      if (data.display) {
        $(".netlogo-gallery-tab").css("display","block");
        $(".netlogo-gallery-tab-content").css("display","block"); 
        for (userId in foreverButtonCode) {
          delete foreverButtonCode[userId];
        }
        if ($.isEmptyObject(foreverButtonCode)) { clearInterval(myVar); }
      } else {
        var teacherId = data.teacherId;
        $(".netlogo-gallery-tab").css("display","none"); 
        $(".netlogo-gallery-tab-content").css("display","none");  
        for (userId in foreverButtonCode) {
          delete foreverButtonCode[userId];
        }
        if ($.isEmptyObject(foreverButtonCode)) { clearInterval(myVar); }
        userStreamData[data.teacherId] = {};
        session.compileObserverCode("gbcc-forever-button-code-"+teacherId, "gbcc-on-go \""+teacherId+"\" \"teacher\"");
  
        if ($.isEmptyObject(foreverButtonCode)) { myVar = setInterval(runForeverButtonCode, 200); }
        foreverButtonCode[teacherId] = "gbcc-forever-button-code-"+teacherId;
        //console.log(foreverButtonCode);
      }
      $(".gbcc-gallery li.selected").length
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
    //console.log("accept user data", data);
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      if (userData[data.userId] === undefined) {
        userData[data.userId] = {};
      }
      userData[data.userId][data.tag] = data.value;
    }
  });
  
  socket.on("accept user stream data", function(data) {
    //console.log("accept user stream data", data);
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      if (userStreamData[data.userId] === undefined) {
        userStreamData[data.userId] = {};
      }
      if (userStreamData[data.userId][data.tag] === undefined) {
        userStreamData[data.userId][data.tag] = [];
      }
      userStreamData[data.userId][data.tag].push(data.value);
      //console.log(userStreamData[data.userId][data.tag]);
    }
  });

  
  socket.on("accept all user data", function(data) {
    //console.log("accept ALL user data");
    if (!allowGalleryForeverButton || (allowGalleryForeverButton && !$(".netlogo-gallery-tab-content").hasClass("selected"))) {
      userData = data.userData;
    }
  });

  socket.on("accept user action", function(data) {
    var userType = data.userType;
    //console.log(data.userId+" "+userId+" "+userType);
    switch (data.status) {
      case "select":
        if (procedures.gbccOnSelect) {
          session.run('gbcc-on-select "'+data.userId+'" "'+data.userType+'"');
        }
        break;
      case "deselect":
        if (procedures.gbccOnDeselect) {
          session.run('gbcc-on-deselect "'+data.userId+'" "'+data.userType+'"');
        }
        break;
      case "forever-deselect":
        delete foreverButtonCode[data.userId];
        if ($.isEmptyObject(foreverButtonCode)) { clearInterval(myVar); }
        break;
      case "forever-select":
        userStreamData[data.userId] = {};
        //myStreamData[data.userId] = {};
        //console.log("clear userStreamData");
        if ($.isEmptyObject(foreverButtonCode)) { myVar = setInterval(runForeverButtonCode, 200); }
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