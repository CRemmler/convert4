
Interface = (function() {

  var items = {};
  var passCodes = {};
  var roomNames = {};

  function displayLoginInterface(rooms, components) {
    if ($(".login-room-button-container").length > 0) {
      var widgetIndex = $(".netlogo-widget").length - 1;
      var roomName = rooms[rooms.length - 1];
      createButton(roomName, widgetIndex);
      return;
    } 
    var roomButtonHtml, roomButtonId;
    setupItems();
    addTeacherControls();
    highlightOutputAreasOnClick();
    $(".netlogo-tab-area").addClass("hidden");
    $(".netlogo-export-wrapper").css("display","none");
    $(".netlogo-speed-slider").css("display","none");
    $("body").append("<div class='admin-body'></div>");
    $(".admin-body").css("display","inline");
    // hide all widgets
    $(".netlogo-widget").addClass("hidden");
    $(".gbcc-widget").addClass("hidden");    
    $(".netlogo-model-title").removeClass("hidden");
    $("#netlogo-title").html("");
    // show Welcome Students reporter
    var index = components.componentRange[0];
    var widget = "<div id='netlogo-monitor-"+index+"' class='netlogo-widget netlogo-monitor netlogo-output login login-welcome-student'>"+
    "<label class='netlogo-label'>Welcome Student</label> "+
    "<output class='netlogo-value'>Please choose a room.</output></div>";
    $("body").append(widget);
    // show Welcome teacher reporter
    index++;
    widget = "<div id='netlogo-monitor-"+index+"' class='netlogo-widget netlogo-monitor netlogo-output login login-welcome-teacher'>"+
    "<label class='netlogo-label ''>Welcome Teacher</label> <output class='netlogo-value'>"+
    "Please create a room.    <span id='tipHeading'><u>(tips) </u></span></output></div>";
    $("body").append(widget);
    // show room name input box
    index++;
    widget = "<label id='netlogo-inputBox-"+index+"' class='netlogo-widget netlogo-input-box netlogo-input login login-room-name'>"+
    "<div class='netlogo-label'>room-name</div>  <textarea class='netlogo-multiline-input create-room-input'></textarea></label>";
    $("body").append(widget);
    // show Create Room button
    index++;
    widget = "<button id='netlogo-button-"+index+"'class='netlogo-widget netlogo-button netlogo-command login login-create-room' type='button' >"+
    "<div class='netlogo-button-agent-context'></div> <span class='netlogo-label'>Create</span> </button>";
    $("body").append(widget);
    $("#netlogo-button-"+index).on("click", function() {
      var myRoom = $(".create-room-input").val();
      socket.emit("enter room", {room: myRoom});
    });
    // container for room Buttons
    widget = "<div class='netlogo-widget login login-room-button-container'></div>"
    $("body").append(widget);
    var roomName;
    var passCode;
    for (var i=0; i<rooms.length; i++) {
      // a room button
      index++;
      createButton(rooms[i], index);
    }
    widget  = "<div class='netlogo-widget login login-tips'>";
    widget += "  <span id='tips' style='display:none'>";
    widget += "    <p><span>- Getting crowded? Start your own group of rooms. Add something like \"/octopus\" to the end of this url.</span>";
    widget += "    <p><span>- Want to require an entry code? Call your room something like \"123:starfish\".";
    widget += "    Your room will be called \"123\". The entry code will be \"starfish\".</span>";
    widget += "  </span>";
    widget += "</div>";
    $("body").append(widget);
    $("#tipHeading").on("click", function() {
      ($("#tips").css("display") === "none") ? $("#tips").css("display","inline-block") : $("#tips").css("display","none"); 
    });
    $("#exportHtmlButton").css("display","none");
    $(".netlogo-toggle-container").css("display","none");
  }
  
  function createButton(roomName, index) {
    passCode = "";
    if (roomName.indexOf(":") > 0) { 
      passCode = roomName.substr(roomName.indexOf(":")+1, roomName.length).toUpperCase().trim();
      roomName = roomName.substr(0,roomName.indexOf(":")); 
    }
    roomNames["netlogo-button-"+index] = roomName;
    passCodes["netlogo-button-"+index] = passCode;
    widget = "<button id='netlogo-button-"+index+"'class='netlogo-widget netlogo-command login login-room-button' type='button'>";
    widget += "<div class='netlogo-button-agent-context'></div> <span class='netlogo-label'>"+roomName+"</span> </button>";
    $(".login-room-button-container").append(widget);
    $(".login-room-button-container").on("click", "#netlogo-button-"+index, function() {
      var myRoom = roomNames[$(this).attr("id")];
      if (passCodes[$(this).attr("id")] === "") {
        socket.emit("enter room", {room: myRoom});  
      } else {
        var response = window.prompt("What is the Entry Code?","").toUpperCase().trim();
        if (response === passCodes[$(this).attr("id")]) {
          socket.emit("enter room", {room: myRoom});
        } else {
          alert("Incorrect Password");
        }
      }
    });
  }
  
  function removeLoginButton(roomName) {
    $(".login-room-button-container button .netlogo-label").each(function() { 
      if ($(this).html() === roomName) {
        $(this).parent().remove();
      }
    });
  }

  function displayTeacherInterface(room, components) {
    showItems(components.componentRange[0], components.componentRange[1]);
    $(".netlogo-export-wrapper").css("display","block");
    $(".netlogo-ugly-button").each(function() { if ($(this).html() === "HTML") { $(this).css("display","none"); } }) // hide it?
    var sanitizedRoom = exports.toHTML(room);
    $("#netlogo-title").html(sanitizedRoom.substring(3, sanitizedRoom.length));
    $(".netlogo-view-container").removeClass("hidden");
    $(".netlogo-tab-area").removeClass("hidden");
    $(".admin-body").css("display","none");
    $($(".netlogo-toggle-container")[0]).css("display","flex");
    if (activityType === "gbcc") { setupGbccMouseEvents(); }
  }

  function displayStudentInterface(room, components, activityType) {
    showItems(components.componentRange[0], components.componentRange[1]);
    $(".netlogo-export-wrapper").css("display","block");
    $(".netlogo-ugly-button").each(function() { if ($(this).html() === "HTML") { $(this).css("display","none"); } })  // hide it?
    var sanitizedRoom = exports.toHTML(room);
    $("#netlogo-title").html(sanitizedRoom.substring(3, sanitizedRoom.length));
    $(".netlogo-view-container").removeClass("hidden");
    $(".admin-body").css("display","none");
    $(".teacher-controls").css("display","none");
    if (activityType === "hubnet") {
      $(".netlogo-view-container").css("pointer-events","auto");
      $(".netlogo-button:not(.hidden)").click(function(e){clickHandlerButton(this, e, "button");});
      $(".netlogo-button:not(.hidden) input").change(function(e){clickHandlerWidget(this, e, "button");});
      $(".netlogo-slider:not(.hidden) input").change(function(e){clickHandlerWidget(this, e, "slider");});
      $(".netlogo-switcher:not(.hidden) input").change(function(e){clickHandlerWidget(this, e, "switcher");});
      $(".netlogo-chooser:not(.hidden) select").change(function(e){clickHandlerWidget(this, e, "chooser");});
      $(".netlogo-input-box:not(.hidden) textarea").change(function(e){clickHandlerWidget(this, e, "inputBox");});
      $(".netlogo-view-container").click(function(e){clickHandlerButton(this, e, "view");});
    } else {
      $(".netlogo-view-container").css("pointer-events","auto");
      $(".netlogo-tab-area").removeClass("hidden");
    }
    $($(".netlogo-toggle-container")[0]).css("display","flex");
    if (activityType === "gbcc") { setupGbccMouseEvents(); }
  }
  
  function setupGbccMouseEvents() {
    $(".netlogo-view-container").on("mousedown", function(e){
      if (procedures.gbccOnMousedown) {
        offset = $(this).offset();
        pxcor = universe.view.xPixToPcor(e.clientX - offset.left + window.pageXOffset);
        pycor = universe.view.yPixToPcor(e.clientY - offset.top + window.pageYOffset);
        session.runCode('try { var reporterContext = false; var letVars = { }; procedures["GBCC-ON-MOUSEDOWN"]("'+pxcor+'","'+pycor+'"); } catch (e) { if (e instanceof Exception.StopInterrupt) { return e; } else { throw e; } }');
      }
    });
    $(".netlogo-view-container").on("mouseup", function(e){
      if (procedures.gbccOnMouseup) {
        offset = $(this).offset();
        pxcor = universe.view.xPixToPcor(e.clientX - offset.left + window.pageXOffset);
        pycor = universe.view.yPixToPcor(e.clientY - offset.top + window.pageYOffset);
        session.runCode('try { var reporterContext = false; var letVars = { }; procedures["GBCC-ON-MOUSEUP"]("'+pxcor+'","'+pycor+'"); } catch (e) { if (e instanceof Exception.StopInterrupt) { return e; } else { throw e; } }');
      }
    });
  }

  function displayDisconnectedInterface() {
    $(".admin-body").css("display","inline");
    $(".admin-body").html("You have been disconnected. Please refresh the page to continue.");
    $(".netlogo-widget").addClass("hidden");
    $(".gbcc-widget").addClass("hidden");
    $("#netlogo-model-container").css("display","none");
  }

  function displayAdminInterface(rooms) {
    $(".netlogo-widget").addClass("hidden");
    $(".gbcc-widget").addClass("hidden");
    $("#netlogo-model-container").css("display","none");
    $(".admin-body").html(rooms);
  }

  function clearRoom(roomName, school) {
    socket.emit("admin clear room", {roomName: roomName, school: school});
  }

  function clickHandlerButton(thisElement, e, widget) {
    var value;
    var id = $(thisElement).attr("id");
    var label = $("#"+id+" .netlogo-label").text();
    if (widget === "view") {
      label = "View";
      offset = $(thisElement).offset();
      value = [ universe.view.xPixToPcor(e.clientX - offset.left + window.pageXOffset), universe.view.yPixToPcor(e.clientY - offset.top + window.pageYOffset) ];
    } else if (widget === "button" ) {
      value = "";
    } else {
      value = world.observer.getGlobal(label.toLowerCase());
      socket.emit("send reporter", {hubnetMessageSource: "server", hubnetMessageTag: label, hubnetMessage:value});
    }
    socket.emit("send command", {hubnetMessageTag: label, hubnetMessage:value});
  }
  
  function clickHandlerWidget(thisElement, e, widget) {
    var value;
    var id = $(thisElement).parent().attr("id");
    var label = $("#"+id+" .netlogo-label").text();
    value = world.observer.getGlobal(label.toLowerCase());
    if (value == undefined) {
      var id = $(thisElement).parent().parent().parent().attr("id");
      var label = $("#"+id+" .netlogo-label").text();
      value = world.observer.getGlobal(label.toLowerCase());
      if (value == undefined) { return; }
    }
    socket.emit("send reporter", {hubnetMessageSource: "server", hubnetMessageTag: label, hubnetMessage:value});
    socket.emit("send command", {hubnetMessageTag: label, hubnetMessage:value});
  }

  function setupItems() {
    var key, value, id;
    $(".netlogo-widget").each(function() {
      id = $(this).attr("id");
      if (id) {
        key = parseInt(id.replace(/\D/g,''));
        if (key) {
          value = id;
          items[key] = value;
        }
      }
    });
  }
  
  function highlightOutputAreasOnClick() {
    // highlight all output areas on click
    $(".netlogo-output").click(function() { 
      var sel, range;
      var el = $(this)[0];
      if (window.getSelection && document.createRange) { //Browser compatibility
        sel = window.getSelection();
        if(sel.toString() == ''){ //no text selection
           window.setTimeout(function(){
              range = document.createRange(); //range object
              range.selectNodeContents(el); //sets Range
              sel.removeAllRanges(); //remove all ranges from selection
              sel.addRange(range);//add Range to a Selection.
          },1);
        }
      }else if (document.selection) { //older ie
          sel = document.selection.createRange();
          if(sel.text == ''){ //no text selection
              range = document.body.createTextRange();//Creates TextRange object
              range.moveToElementText(el);//sets Range
              range.select(); //make selection.
          }
      }
    });
  }
  
  function addTeacherControls() {
    // add show/hide client view or tabs
    var viewWidth = parseFloat($(".netlogo-canvas").css("width"));
    var viewHeight = parseFloat($(".netlogo-canvas").css("height"));
    var spanText;
    if (activityType === "hubnet") {
      $(".netlogo-widget-container").append("<span class='gbcc-widget teacher-controls hidden' style='float:right'><input id='enableMirroring' checked type='checkbox'>Enable: Mirroring</span>");
      $(".teacher-controls").css("top", parseFloat($(".netlogo-view-container").css("top")) + parseFloat($(".netlogo-view-container").css("height")) - 0 + "px");
      $(".teacher-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-view-container").css("width")) - 128 + "px");
    } else {
      spanText = "<span class='gbcc-widget teacher-controls mirror-controls hidden' style='float:right'>";
      spanText += "<input id='enableMirroring' type='checkbox'>Mirror";
      spanText += "<span>";
      $(".netlogo-widget-container").append(spanText);
      spanText = "<span class='gbcc-widget teacher-controls hidden' style='float:right'>";    
      spanText += "<input id='enableView' checked type='checkbox'>View";
      spanText += "<input id='enableTabs' checked type='checkbox'>Tabs";
      spanText += "<input id='enableGallery' checked type='checkbox'>Gallery</span>";
      $(".netlogo-widget-container").append(spanText);
      $(".teacher-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) - 160 + "px");
      $(".mirror-controls").css("left",parseFloat($(".netlogo-view-container").css("left")));
    }
    $(".teacher-controls").css("position","absolute");
    $(".teacher-controls").css("top", parseFloat($(".netlogo-view-container").css("top")) + parseFloat($(".netlogo-canvas").css("height")) + "px");
    $(".netlogo-view-container").css("width", $(".netlogo-view-container canvas").css("width"));
    $("#enableView").click(function() {
      socket.emit('teacher requests UI change', {'display': $(this).prop("checked"), 'type': 'view'});
    });
    $("#enableTabs").click(function() {
      socket.emit('teacher requests UI change', {'display': $(this).prop("checked"), 'type': 'tabs'});
    });
    $("#enableGallery").click(function() {
      socket.emit('teacher requests UI change', {'display': $(this).prop("checked"), 'type': 'gallery'});
    });
    $("#enableMirroring").click(function() {
      mirroringEnabled = $(this).prop("checked") ? true : false;
      if (mirroringEnabled) {
        var state = world.exportCSV();
        var blob = myCanvas.toDataURL("image/png", 0.5); 
        socket.emit('teacher requests UI change', {'display': mirroringEnabled, 'state': state, 'type': 'mirror', 'image': blob});
      } else {
        socket.emit('teacher requests UI change', {'display': mirroringEnabled, 'state': "", 'type': 'mirror' });        
      }
      if (activityType === "hubnet") {
        socket.emit('teacher requests UI change', {'display': mirroringEnabled, 'type': 'view'});
      }
    });
  }

  function showItems(min, max) {
    $(".netlogo-widget").addClass("hidden");
    $(".netlogo-model-title").removeClass("hidden");
    $(".teacher-controls").removeClass("hidden");
    for (var i=min; i<=max; i++) {
      $("#"+items[i]).removeClass("hidden");
    }
  }

  function setupEnvironment(name) {
    var container = name + "Container";
    var spanText =  "<div class='gbcc-widget' id='"+container+"'></div>";
    $(".netlogo-widget-container").append(spanText);
    $("#"+container).css("width", parseFloat($(".netlogo-canvas").css("width")) - 1 + "px");
    $("#"+container).css("height", parseFloat($(".netlogo-canvas").css("height")) - 1 + "px");
    $("#"+container).css("left", $(".netlogo-view-container").css("left"));
    $("#"+container).css("top", $(".netlogo-view-container").css("top"));
    $("#"+container).css("display", "none");
    $("body").append(spanText);
    $(".netlogo-view-container").css("background-color","transparent"); 
  }

  function showEnvironment(name) {    
    var container = name + "Container"; 
    drawPatches = false;
    $("#graphContainer").css("display","none");
    $("#mapContainer").css("display","none");
    $("#"+container).css("left", $(".netlogo-view-container").css("left"));
    $("#"+container).css("top", $(".netlogo-view-container").css("top"));
    $("#"+container).css("display","inline-block");
    $(".netlogo-view-container").css("z-index","0");
    $("#opacityWrapper").css("top",parseInt($("#"+container).css("top") - 15) + "px");
    $("#opacityWrapper").css("left",$("#"+container).css("left"));
    $("#opacityWrapper").css("display", "inline-block");
    mouseOn("graph");
    mouseOn("map");
  }
  
  function hideEnvironment(name) {
    var container = name + "Container";
    drawPatches = true;
    world.triggerUpdate();
    $("#"+container).css("display","none");
    $(".netlogo-view-container").css("z-index","0");
    $(".netlogo-view-container").css("pointer-events","auto");
    //$("#"+container).css("display", "none");
    $("#opacityWrapper").css("display", "none");
    mouseOff("graph");
    mouseOff("map");
  }

  function bringToFront(name) {
    var container = name + "Container";
    $("#"+container).css("z-index","3");
    $(".netlogo-view-container").css("z-index","0");
  } 
  
  function sendToBack(name) {
    var container = name + "Container";
    $("#"+container).css("z-index","0");
    $(".netlogo-view-container").css("z-index","1"); 
  }
  
  function mouseOn(name) {
    var container = name + "Container";
    $(".netlogo-view-container").css("pointer-events","none");
    $("#"+container).css("pointer-events","auto");
  }
  
  function mouseOff(name) {
    var container = name + "Container";
    $(".netlogo-view-container").css("pointer-events","auto");
    $("#"+container).css("pointer-events","none");
  }

  function setOpacity(name, value) {
    var container = name + "Container";
    $("#"+container).css("opacity", value);
    $("#opacity").val(value * 100);
  }
  
  function getOpacity(name) {
    var container = name + "Container";
    return parseFloat($("#"+container).css("opacity"));
  }
  
  function setGraphOffset(name, offset)  {
    var container = name + "Container";
    var top = offset[1] + "px";
    var left = offset[0] + "px";
    $("#"+container).css("top", top);
    $("#"+container).css("left", left);   
    if (offset.length === 4) {
      var height = offset[3] + "px";
      var width = offset[2] + "px";
      $("#"+container).css("height", height);
      $("#"+container).css("width", width);   
    }
  }
  
  function getGraphOffset() {
    var container = name + "Container";
    var top = parseInt($("#"+container).css("top"));
    var left = parseInt($("#"+container).css("left"));
    var height = parseInt($("#"+container).css("height"));
    var width = parseInt($("#"+container).css("width"));   
    return [ left, top, width, height ]
  };
  
  return {
    showLogin: displayLoginInterface,
    removeLogin: removeLoginButton,
    showTeacher: displayTeacherInterface,
    showStudent: displayStudentInterface,
    showDisconnected: displayDisconnectedInterface,
    showAdmin: displayAdminInterface,
    clearRoom: clearRoom,
    bringToFront: bringToFront,
    sendToBack: sendToBack,
    setOpacity: setOpacity,
    getOpacity: getOpacity,
    setGraphOffset: setGraphOffset,
    getGraphOffset: getGraphOffset,
    mouseOn: mouseOn,
    mouseOff: mouseOff,
    setupEnvironment: setupEnvironment,
    showEnvironment: showEnvironment,
    hideEnvironment: hideEnvironment
  };
 
})();
