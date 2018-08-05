
Interface = (function() {

  var items = {};
  var passCodes = {};
  var roomNames = {};

  function displayLoginInterface(rooms, components) {
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
    $(".netlogo-model-title").removeClass("hidden");
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
      roomName = rooms[i];
      passCode = "";
      
      if (roomName.indexOf(":") > 0) { 
        passCode = roomName.substr(roomName.indexOf(":")+1, roomName.length).toUpperCase().trim();
        roomName = roomName.substr(0,roomName.indexOf(":")); 
      }
      roomNames["netlogo-button-"+index] = rooms[i];
      passCodes["netlogo-button-"+index] = passCode;
      widget = "<button id='netlogo-button-"+index+"'class='netlogo-widget netlogo-command login login-room-button'"+
      " type='button'>"+
//      "<div class='netlogo-button-agent-context'></div> <span class='netlogo-label'>"+markdown.toHTML(roomName)+"</span> </button>";
    "<div class='netlogo-button-agent-context'></div> <span class='netlogo-label'>"+roomName+"</span> </button>";

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
    setupExtensions();
  }

  function displayTeacherInterface(room, components) {
    showItems(components.componentRange[0], components.componentRange[1]);
    $(".netlogo-export-wrapper").css("display","block");
    //var sanitizedRoom = markdown.toHTML(room);
    var sanitizedRoom = room;
    $("#netlogo-title").html("<p>"+$("#netlogo-title").html()+" "+sanitizedRoom.substr(3,sanitizedRoom.length));
    $(".netlogo-view-container").removeClass("hidden");
    $(".netlogo-tab-area").removeClass("hidden");
    $(".admin-body").css("display","none");
  }

  function displayStudentInterface(room, components, activityType) {
    showItems(components.componentRange[0], components.componentRange[1]);
    //var sanitizedRoom = markdown.toHTML(room);
    var sanitizedRoom = room;
    $("#netlogo-title").html("<p>"+$("#netlogo-title").html()+" "+sanitizedRoom.substr(3,sanitizedRoom.length));
    $(".netlogo-view-container").removeClass("hidden");
    $(".admin-body").css("display","none");
    $(".teacher-controls").css("display","none");
    if (activityType === "hubnet") {
      $(".netlogo-view-container").css("pointer-events","auto");
      $(".netlogo-button:not(.hidden)").click(function(e){clickHandler(this, e, "button");});
      $(".netlogo-slider:not(.hidden)").click(function(e){clickHandler(this, e, "slider");});
      $(".netlogo-switcher:not(.hidden)").click(function(e){clickHandler(this, e, "switcher");});
      $(".netlogo-chooser:not(.hidden)").click(function(e){clickHandler(this, e, "chooser");});
      $(".netlogo-input-box:not(.hidden)").click(function(e){clickHandler(this, e, "inputBox");});
      $(".netlogo-view-container").click(function(e){clickHandler(this, e, "view");});
    } else {
      $(".netlogo-tab-area").removeClass("hidden");
    }
  }

  function displayDisconnectedInterface() {
    $(".admin-body").css("display","inline");
    $(".admin-body").html("You have been disconnected. Please refresh the page to continue.");
    $(".netlogo-widget").addClass("hidden");
    $("#netlogo-model-container").css("display","none");
  }

  function displayAdminInterface(rooms) {
    $(".netlogo-widget").addClass("hidden");
    $("#netlogo-model-container").css("display","none");
    $(".admin-body").html(rooms);
  }

  function clearRoom(roomName, school) {
    socket.emit("admin clear room", {roomName: roomName, school: school});
  }

  function clickHandler(thisElement, e, widget) {
    var value;
    var id = $(thisElement).attr("id");
    var label = $("#"+id+" .netlogo-label").text();
    if (widget === "view") {
      label = "view";
      offset = $(thisElement).offset();
      value = [ universe.view.xPixToPcor(e.clientX - offset.left), universe.view.yPixToPcor(e.clientY - offset.top) ];
    } else if (widget === "button" ) {
      value = "";
    } else {
      value = world.observer.getGlobal(label.toLowerCase());
      socket.emit("send reporter", {hubnetMessageSource: "server", hubnetMessageTag: label, hubnetMessage:value});
    }
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
      $(".netlogo-widget-container").append("<span class='teacher-controls hidden' style='float:right'><input id='enableMirroring' type='checkbox'>Enable Mirroring</span>");
      $(".teacher-controls").css("top", parseFloat($(".netlogo-view-container").css("top")) + parseFloat($(".netlogo-view-container").css("height")) - 0 + "px");
      $(".teacher-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-view-container").css("width")) - 112 + "px");
    } else {
      spanText = "<span class='teacher-controls hidden' style='float:right'>Enable:";
      spanText += "<input id='enableView' checked type='checkbox'>View";
      spanText += "<input id='enableTabs' checked type='checkbox'>Tabs";
      spanText += "<input id='enableGallery' checked type='checkbox'>Gallery</span>";
      $(".netlogo-widget-container").append(spanText);
      $(".teacher-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) - 200 + "px");
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
      socket.emit('teacher requests UI change', {'display': mirroringEnabled, 'type': 'mirror'});
      socket.emit('teacher requests UI change', {'display': mirroringEnabled, 'type': 'view'});
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
  
  function setupExtensions() {
    Graph.setupInterface();
  }
  
  function importImageFile() {
    var fileInput = document.getElementById("importDrawingFileElem");
    var xmin = $("#importDrawingFileElem").attr("xmin");
    var ymin = $("#importDrawingFileElem").attr("ymin");
    var width = $("#importDrawingFileElem").attr("width");
    var height = $("#importDrawingFileElem").attr("height");
    //var files = fileInput.files;
    var file = fileInput.files[0];
    var filename = file.name;
    var src = (window.URL || window.webkitURL).createObjectURL(file);
    if ($("#"+filename.replace(".","")+"-"+xmin+"-"+ymin+"-"+width+"-"+height).length > 0) {
      $("#"+filename.replace(".","")+"-"+xmin+"-"+ymin+"-"+width+"-"+height).attr("src",src);
    } else {
      $("body").append("<img class='uploadImage' id='"+filename.replace(".","")+"-"+xmin+"-"+ymin+"-"+width+"-"+height+"' xmin=\""+xmin+"\" ymin=\""+ymin+"\" width=\""+width+"\" height=\""+height+"\" src='"+src+"' style='display:none'>");
    }
    universe.repaint();
  }
  
  //gbcc:import-drawing ["img-from-webpage" "https://www.google.com" 0 0 200 200]
  //gbcc:import-drawing ["img-from-file-upload" "" 0 0 200 200 ]
  //gbcc:import-drawing ["img-from-file" "glacier.jpg" 0 0 200 200]
  //gbcc:import-drawing ["img-remove" "" 0 0 0 0]
  function importDrawing(data) {
    var action = data[0];
    var filename = data[1];
    var xmin = data[2];
    var ymin = data[3];
    var width = data[4];
    var height = data[5];
    if (action === "img-remove") {
      repaintPatches = true;
      $(".uploadImage").remove();
      universe.repaint();
    } else {
      repaintPatches = false;
      if (action === "img-from-webpage") {
        // Code from: https://shkspr.mobi/blog/2015/11/google-secret-screenshot-api/
        site = filename;
        filename = "screenshot-from-url-"+$(".uploadImage").length;
        $.ajax({
          url: 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?url=' + site + '&screenshot=true',
          context: this,
          type: 'GET',
          dataType: 'json',
          success: function(allData) {
            imgData = allData.screenshot.data.replace(/_/g, '/').replace(/-/g, '+');
            imgData = 'data:image/jpeg;base64,' + imgData;
            if ($("#"+filename.replace(".","")+"-"+xmin+"-"+ymin+"-"+width+"-"+height).length > 0) {
              $("#"+filename.replace(".","")+"-"+xmin+"-"+ymin+"-"+width+"-"+height).attr("src",imgData);
            } else {
              $("body").append("<img class='uploadImage' id='"+filename+"-"+xmin+"-"+ymin+"-"+width+"-"+height+"' xmin=\""+xmin+"\" ymin=\""+ymin+"\" width=\""+width+"\" height=\""+height+"\" src='"+imgData+"' style='display:none'>");
            }
            universe.repaint();
          }
        });
      } else if (action === "img-from-file-upload") {
        $("#importDrawingFileElem").attr("xmin",xmin);
        $("#importDrawingFileElem").attr("ymin",ymin);
        $("#importDrawingFileElem").attr("width",width);
        $("#importDrawingFileElem").attr("height",height);
        $("#importDrawingFileElem").click();
      } else if (action === "img-from-file") {
        $.get("images/"+filename)
        .done(function() { 
          // Do something now you know the image exists.
          if ($("#"+filename.replace(".","")+"-"+xmin+"-"+ymin+"-"+width+"-"+height).length > 0) {
            $("#"+filename.replace(".","")+"-"+xmin+"-"+ymin+"-"+width+"-"+height).attr("src","images/"+filename);
          } else {
            $("body").append("<img class='uploadImage' id='"+filename.replace(".","")+"-"+xmin+"-"+ymin+"-"+width+"-"+height+"' xmin=\""+xmin+"\" ymin=\""+ymin+"\" width=\""+width+"\" height=\""+height+"\" src='images/"+filename+"' style='display:none'>");
          }
          universe.repaint();
        }).fail(function() { 
        // Image doesn't exist - do something else.
        });
        
        
      }
    }
  }

  return {
    showLogin: displayLoginInterface,
    showTeacher: displayTeacherInterface,
    showStudent: displayStudentInterface,
    showDisconnected: displayDisconnectedInterface,
    showAdmin: displayAdminInterface,
    clearRoom: clearRoom,
    importDrawing: importDrawing,
    importImageFile: importImageFile
  };
 
})();
