Gallery = (function() {
  
  var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
  var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
  var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
  var is_safari = navigator.userAgent.indexOf("Safari") > -1;
  var is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
  if ((is_chrome)&&(is_safari)) { is_safari = false; }
  if ((is_chrome)&&(is_opera)) { is_chrome = false; }
  
  is_safari = true; // use smaller temporary drawing canvas that is 200x200
  
  var allowTabs;                 
  var allowMultipleLayers;       
  var allowMultipleSelections;   
  var allowCanvasForeverButtons; 
  var allowGalleryControls; 
  var allowTeacherControls;
  var galleryForeverButton = "on";
  
  var plotsObject = {};
  var canvasHeight, canvasWidth, imageQuality;

  function setupGallery(data) {
    var settings = data.settings;
    myUserId = data.userId;
    allowTabs = settings.allowTabs || false;
    allowMultipleLayers = settings.allowMultipleLayers || false;
    allowMultipleSelections = settings.allowMultipleSelections || false;
    allowCanvasForeverButtons = settings.allowCanvasForeverButtons || false;
    allowGalleryControls = settings.allowGalleryControls || false;
    allowTeacherControls = settings.allowTeacherControls || false;
    if (allowTabs) { // student, hubnet
      $(".netlogo-tab-area").removeClass("hidden");
    } else {
      $(".netlogo-gallery-tab").css("display","none");
    }
    if (allowGalleryControls) {
      var galleryControlSpan = "<div class='gallery-controls'>";
      galleryControlSpan += "<span class='gallery-right'>Size: <select id='canvasSize'><option value='small'>Small</option><option value='medium'>Medium</option><option value='large'>Large</option><option value='extra-large'>Extra Large</option></select>";
      galleryControlSpan += "<input type='checkbox' checked id='galleryUpdates'> Listen</span>";
      if (allowMultipleSelections) {
        galleryControlSpan += "<span class='gallery-left'><button id='selectAll'>Select All</button> ";
        galleryControlSpan += "<button id='deselectAll'>Deselect All</button> ";
      }
      if (allowCanvasForeverButtons) {
        galleryControlSpan += "<button id='foreverSelectAll'><i class='fa fa-refresh' aria-hidden='true'></i> Forever</button></span>";
      }
      galleryControlSpan += "</div>";
      $(".netlogo-gallery-tab-content").append(galleryControlSpan);
      socket.emit("request gallery data", {userId: myUserId, status: "select"});
      var defaultTabAreaWidth = parseFloat($(".netlogo-tab-area").css("width"));
      var galleryTabWidth =  (parseFloat($(".netlogo-tab-area").css("width")) - 48) + "px";
      var galleryExpandSpan = "<span id='galleryExpandIcon' style='left:"+galleryTabWidth+"'><i class='fa fa-expand' aria-hidden='true'></i></span>";
      
      $(".netlogo-gallery-tab").append(galleryExpandSpan);
      $( window ).resize(function() {
        if ($(".netlogo-gallery-tab").hasClass("expand")) {
          var galleryExpandWidth = parseFloat($("body").css("width")) - parseFloat($(".netlogo-tab").css("width"));
          $(".netlogo-gallery-tab").css("width", galleryExpandWidth - 80 + "px");
          $(".netlogo-gallery-tab-content").css("width", galleryExpandWidth - 62 + "px");
          var galleryTabWidth =  galleryExpandWidth - 98 + "px";
          $("#galleryExpandIcon").css("left",galleryTabWidth);
        }
      });

      $("#galleryExpandIcon").on("click", function() {
        if ($(".netlogo-gallery-tab").hasClass("expand")) {
          $(".netlogo-gallery-tab").removeClass("expand");
          $(".netlogo-gallery-tab-content").removeClass("expand");
          $(".netlogo-gallery-tab").css("width", defaultTabAreaWidth - 18 + "px");          
          $(".netlogo-gallery-tab-content").css("width", defaultTabAreaWidth);
          $("#galleryExpandIcon").css("left", defaultTabAreaWidth - 35 + "px");
        } else {
          $(".netlogo-gallery-tab").addClass("expand");
          $(".netlogo-gallery-tab-content").addClass("expand");
          var galleryExpandWidth = parseFloat($("body").css("width")) - parseFloat($(".netlogo-tab").css("width"));
          $(".netlogo-gallery-tab").css("width", galleryExpandWidth - 80 + "px");
          $(".netlogo-gallery-tab-content").css("width", galleryExpandWidth - 62 + "px");
          var galleryTabWidth =  galleryExpandWidth - 98 + "px";
          $("#galleryExpandIcon").css("left",galleryTabWidth);
        }
      });
      $("#canvasSize").on("change", function() {
        if ($(".gbcc-gallery").hasClass("small")) { $(".gbcc-gallery").removeClass("small"); }
        if ($(".gbcc-gallery").hasClass("medium")) { $(".gbcc-gallery").removeClass("medium") }
        if ($(".gbcc-gallery").hasClass("large")) { $(".gbcc-gallery").removeClass("large") }
        if ($(".gbcc-gallery").hasClass("extra-large")) { $(".gbcc-gallery").removeClass("extra-large") }
        $(".gbcc-gallery").addClass($(this).val());
      });
      $("#galleryUpdates").on("click",function() {
        if ($(this).is(":checked")) {
          //$(".netlogo-gallery-tab").removeClass("selected");
          $(".netlogo-gallery-tab-content").removeClass("selected");
          $(".gbcc-gallery li").removeClass("gray-border");
          galleryForeverButton = "on";
          socket.emit("request user broadcast data");
          //socket.emit("request user data");
        } else {
          //$(".netlogo-gallery-tab").addClass("selected");
          $(".netlogo-gallery-tab-content").addClass("selected");
          $(".gbcc-gallery li").addClass("gray-border");
          galleryForeverButton = "off"; 
        }
      });
      $("#selectAll").on("click", function() {
        selectAll();
      });
      $("#deselectAll").on("click", function() {
        deselectAll();
      });
      $("#foreverSelectAll").on("click", function() {
        foreverSelectSelected();
      });
    }
    if (!allowGalleryControls) { $(".gallery-controls").css("display","none"); }
    if (!allowTeacherControls) { $(".teacher-controls").css("display","none"); }
    if (is_safari) {
      //$("body").append("<canvas id=\"miniSafariCanvasView\" width=\"200\" height=\"200\" style=\"display:none\"></canvas>");
      $("body").append("<canvas id=\"miniSafariCanvasView\" width=\"250\" height=\"250\" style=\"display:none\"></canvas>");

      canvasHeight = 250; canvasWidth = 250;
      imageQuality = 0.5;
    } else {
      $("body").append("<canvas id=\"miniCanvasView\" width=\"500\" height=\"500\" style=\"display:none\"></canvas>");
      canvasHeight = 500; canvasWidth = 500;
      imageQuality = 0.75;
    }
    $("body").append("<canvas id=\"avatarCanvasView\" width=\"300\" height=\"300\" style=\"display:none\"></canvas>");
    $(".netlogo-widget-container").append('<div style="position:absolute; top:-10px; left:210px" id="opacityWrapper"><input type="range" value="100" max="100" min="0" id="opacity" style="z-index: -1;"></div>')
    $('.netlogo-widget-container').on("input","#opacity", function() { 
      $("#graphContainer").css("opacity", $(this).val() / 100);
      $("#mapContainer").css("opacity", $(this).val() / 100); 
    });
    $("#opacityWrapper").css("display", "none");
    
    $("body").append("<div class='hiddenfile'><input id='importggb' type='file' style='display:none'></div>");
    $("body").append("<div class='hiddenfile'><input id='importgbccworld' type='file' style='display:none'></div>");
    spanText = "<form action='exportgbccworld' method='post' id='exportgbccworld' enctype='multipart/form-data' style='display: none;'>";
    spanText += "<input id='gbccworldfilename' type='text' name='gbccworldfilename' value='' style='display: none;'>";
    spanText += "<input class='roomNameInput' type='text' name='gbccroomname' value='' style='display: none;'>";
    spanText += "<input class='schoolNameInput' type='text' name='gbccschoolname' value='' style='display: none;'>";
    spanText += "<button type='submit'></button></form>";
    $("body").append(spanText);
  }

  function selectAll() {
    $("li").each(function() {
      myId = $(this).attr("id")
      $elt = $("#"+myId+" .card.card-image");
      if (!$elt.parent().hasClass("selected")) {
        //$elt.parent().click(); 
        cardClickHandler($elt);
        $("#"+myId+" .forever-icon:not(.selected)").css("display","none");     
      }
    });
  }
  function deselectAll() {
    $("li").each(function() {
      myId = $(this).attr("id")
      $elt = $("#"+myId+" .card.card-image");
      if ($elt.parent().hasClass("selected")) {
        //$elt.click(); 
        cardClickHandler($elt);
        $("#"+myId+" .forever-icon:not(.selected)").css("display","none");     
      }
    });
  }
  function foreverSelectSelected() {
    $(".forever-icon").each(function() {
      if ($(this).parent().hasClass("selected")) {
        $(this).click(); 
        $(this).css("display","block");
      }
    });
  }
  
  function assignZIndex() {
    $("li").each(function() {
      var index = 0;
      $(this).children().each( function() {
        if ($(this).hasClass("card")) {
          //console.log("give it index",index);
          $(this).css("z-index",index);
          index++;
        }
      });
    });
  }
  
  if (!allowCanvasForeverButtons) {
    $(".forever-icon").remove();
  }
  
  function itemMouseoverHandler(thisLi) {
    var thisId = $(thisLi).attr("id") || "";
    if ($("#"+thisId).find(".card").length > 1) { 
      $("#"+thisId+" .arrow").css("display","block");
    } 
    if ($("#"+thisId).hasClass("selected")) {
      $("#"+thisId+" .forever-icon").css("display","block");
    }
  }
      
  function itemMouseoutHandler(thisLi) {
    var thisId = $(thisLi).attr("id") || "";
    if ($("#"+thisId).find(".card").length > 0) { 
      $("#"+thisId+" .arrow").css("display","none");
    } 
    if ($("#"+thisId).hasClass("selected")) {
      $("#"+thisId+" .forever-icon:not(.selected)").css("display","none");   
    }
  }
  
  function cardClickHandler(thisElt) {
    //console.log("add click handler",thisElt);
    var userId = $(thisElt).parent().attr("userid");
    var userType = $(thisElt).parent().attr("usertype");
    //console.log(userType);
    if (procedures.gbccOnGo != undefined) {
      if ($(thisElt).parent().hasClass("selected")) {
        $("#gallery-item-"+userId+" .forever-icon").css("display","none").removeClass("selected");
        socket.emit("request user action", {userId: userId, status: "forever-deselect", userType: userType});  
      } else {
        $("#gallery-item-"+userId+" .forever-icon").css("display","block");
      }
    }
    if ($(thisElt).parent().hasClass("selected")) {
      $(thisElt).parent().removeClass("selected");
      socket.emit("request user action", {userId: userId, status: "deselect", userType: userType}); 
    } else { 
      if (allowMultipleSelections) {
        $(thisElt).parent().addClass("selected"); 
        socket.emit("request user action", {userId: userId, status: "select", userType: userType});
        if ($(this).children(".forever-icon").hasClass("selected")) {
          $(this).children(".forever-icon").removeClass("selected").css("display","none");
          socket.emit("request user action", {userId: thisUserId, status: "forever-deselect", userType: userType});  
        }
      } else {
        $(".selected").each(function() {
          if ($(this).attr("id") && $(this).attr("id").includes("gallery-item-")) {
            //thisUserId = $(this).attr("id").replace("gallery-item-","");
            thisUserId = $(this).attr("userid");
            socket.emit("request user action", {userId: thisUserId, status: "deselect", userType: userType}); 
            $(this).removeClass("selected");
            if ($(this).children(".forever-icon").hasClass("selected")) {
              $(this).children(".forever-icon").removeClass("selected").css("display","none");
              socket.emit("request user action", {userId: thisUserId, status: "forever-deselect", userType: userType});  
            }
          }
        });
        $(thisElt).parent().addClass("selected");
        socket.emit("request user action", {userId: userId, status: "select", userType: userType}); 
      }
    }
  }

  function arrowClickHandler(thisSpan) {
    //console.log("arrow clicked");
    var direction = $(thisSpan).hasClass("arrow-left") ? "left" : "right";
    var cards = [];
    $(thisSpan).parent().children().each(function() {
      if ($(this).hasClass("card")) { cards.push(this);}
    });
    rotateCards(direction, cards);    
  }
  
  function foreverClickHandler(thisSpan, userId, userType) {
    if (!procedures.gbccOnGo) { return; }
    if ($(thisSpan).hasClass("selected")) {  
      $(thisSpan).removeClass("selected");
      socket.emit("request user action", {userId: userId, status: "forever-deselect", userType: userType});  
    } else {
      $(thisSpan).addClass("selected");
      $(thisSpan).parent().addClass("selected");
      session.compileObserverCode("gbcc-forever-button-code-"+userId, "gbcc-on-go \""+userId+"\" \""+userType+"\"");
      socket.emit("request user action", {userId: userId, status: "forever-select", userType: userType})  
    }      
  }

  function rotateCards(direction, cards) {
    var length = cards.length;
    var zIndex;
    if (direction === "right") {
      for (card in cards) {
        zIndex = $(cards[card]).css("z-index");
        if (zIndex === (length - 1)+"") {
          $(cards[card]).css("z-index",0);
        } else {
          $(cards[card]).css("z-index",zIndex - -1);		
        }
      }
    } else {
      for (card in cards) {
        zIndex = $(cards[card]).css("z-index");
        if (zIndex === "0") {
          $(cards[card]).css("z-index",length - 1);
        } else {
          $(cards[card]).css("z-index",zIndex - 1);					
        }
      }
    }
  }
  
  function createCanvas(data) {
    //console.log(data.userType);
    var canvasImg = new Image();
    canvasImg.id = data.id;
    canvasImg.userId = data.userId;
    var label = $(".gbcc-gallery li").length;
    if ($(".gbcc-gallery").length === 0) { 
      $(".netlogo-gallery-tab-content").append("<div class='gbcc-gallery'><ul></ul></div>"); 
      $(".canvasSize").val("small");
      $(".gbcc-gallery").addClass("small");
    }
    //var newLiHtml = "<li id='gallery-item-"+data.userId+"' usertype='"+data.userType+"' userid='"+data.userId+"'>";
    var newLiHtml = "<li id='gallery-item-"+data.userId+"' usertype='"+data.userType+"' userid='"+data.userId+"' ";
    newLiHtml += (myUserId === data.userId) ? "myUser=\"true\">" : "myUser=\"false\">";
    newLiHtml += (myUserId === data.userId) ? "<span class=\"label z20 selected\">"+label+"</span>" : "<span class=\"label z20\">"+label+"</span>";
    newLiHtml += "<span class=\"arrow arrow-left z20\" style=\"display:none\"></span>";//"<i class='fa fa-chevron-left' aria-hidden='true'></i></span>";
    newLiHtml += "<span class=\"arrow arrow-right z20\" style=\"display:none\"></span>";//"<i class='fa fa-chevron-right' aria-hidden='true'></i></span>";
    if (allowCanvasForeverButtons) {
      newLiHtml += "<span class=\"forever-icon z20\"><i class='fa fa-refresh' aria-hidden='true'></i></span>";
    } else {
      newLiHtml += "<span></span>";      
    }
    newLiHtml += (myUserId === data.userId) ? "<span class=\"label z20 selected\">"+label+"</span>" : "<span class=\"label z20\">"+label+"</span>";
    newLiHtml += "</li>";
    $(".gbcc-gallery ul").append(newLiHtml);
    $("#gallery-item-"+label+" .card-image").append(canvasImg);
    $("#gallery-item-"+data.userId+" .arrow").click(function() { arrowClickHandler(this) });
    $("#gallery-item-"+data.userId+" .forever-icon").click(function() { foreverClickHandler(this, data.userId, data.userType) });
    $("#gallery-item-"+data.userId).mouseover(function() { itemMouseoverHandler(this); });
    $("#gallery-item-"+data.userId).mouseout(function() { itemMouseoutHandler(this); });
    //$("#"+myUserId+" .arrow").css("display","none");
  }
  
  function createImageCard(data) {
    //console.log("create image card");
    var canvasImg = new Image();
    canvasImg.id = data.id;
    data.id = data.id.replace(" ","-");
    canvasImg.src = data.src;
    canvasImg.userId = data.userId;
    newSpan = "<span class=\"card card-image\"><img id='"+data.id+"' src='"+data.src+"'></span>";
    $("#gallery-item-"+data.userId).append(newSpan);
    var zIndex = $("#gallery-item-"+data.userId+" span:not(.text-span)").length - 5;
    $("#"+data.id).parent().css("z-index",zIndex);
    ($("#"+data.id).parent()).click(function() { cardClickHandler(this); });
      assignZIndex();
  }
  
  function updateImageCard(data) {
    //console.log("update image card");
    data.id = data.id.replace(" ","-");
    $("#"+data.id).attr("src", data.src);
  }


  function createTextCard(data) {
    newSpan = "<span class=\"card card-text\"><span id=\""+data.id+"\" class=\"text-span\"><br>"+data.src.replace("gallery-text","")+"</span></span>";
    $("#gallery-item-"+data.userId).append(newSpan);
    var zIndex = $("#gallery-item-"+data.userId+" span:not(.text-span)").length - 5;
    $("#"+data.id).parent().css("z-index",zIndex);
    ($("#"+data.id).parent()).click(function() { cardClickHandler(this); });
      assignZIndex();
  }
  
  function updateTextCard(data) {
    $("#"+data.id).html("<br>"+data.src.replace("gallery-text",""));
  }
  
  function displayCanvas(data) {
    if (galleryForeverButton === "off") { return; } 
    var canvasData = { 
            id : data.tag + "-" + data.source,
            src : data.message,
            userId : data.source,
            userType: data.userType
          }
    if ($("#gallery-item-"+data.source).length === 0 ) { createCanvas(canvasData); } 
    if (data.message.substring(0,13) === "gallery-clear") {
      $("#gallery-item-" + data.source +" .card").remove(); 
      canvasData.src="";
      createTextCard(canvasData);
      return;
    }
    if (allowMultipleLayers) {
      if (data.message.substring(0,15) === "<p>gallery-text") {
        ($("#" + data.tag + "-" + data.source).length === 0) ? createTextCard(canvasData) : updateTextCard(canvasData); 
      } else {
        ($("#" + data.tag + "-" + data.source).length === 0) ? createImageCard(canvasData) : updateImageCard(canvasData);
      }
    } else {
      // remove existing cards
      $("#gallery-item-" + data.source +" .card").remove(); 
      // make another one
      if (data.message.substring(0,15) === "<p>gallery-text") {
        createTextCard(canvasData);
      } else {
        createImageCard(canvasData);
      } 
    }
  }

  /*
  function broadcastToGallery(key, value) {
    if (key === "view") {
      drawView(value.replace(" ","-"));
    } else if (key === "plot") {
      drawPlot(value);
    } else if (key === "text") {
      drawText(value);
    } else if (key === "clear") {
      drawClear();
    } else if (key === "avatar") {
      drawAvatar(value);
    }
  }
  */
  
  
  function clearBroadcast() {
    var message = "gallery-clear";
    socket.emit("send reporter", {
      hubnetMessageSource: "all-users", 
      hubnetMessageTag: "canvas-clear", 
      hubnetMessage: message
    }); 
  }
  
  function broadcastText(text) {
    var message = "gallery-text"+text;
    socket.emit("send reporter", {
      hubnetMessageSource: "all-users", 
      hubnetMessageTag: "canvas-text", 
      hubnetMessage: message
    }); 
  }
  
  function drawHoverText(text) {
    console.log("draw hover text",text);
  }
  
  function scaleCanvas(sourceWidth, sourceHeight) {
    var dataObj = {};
    var ratio = sourceWidth / sourceHeight;
    var width = canvasWidth;
    var height = canvasWidth;
    (sourceWidth > sourceHeight) ? height = width / ratio : width = height * ratio;
    dataObj.width = width;
    dataObj.height = height;
    return dataObj;
  }
  
  function broadcastView(key) {
    var mapVisible = ($("#mapContainer").css("display") === "none") ? false : true;
    var graphVisible = ($("#graphContainer").css("display") === "none") ? false : true;
    var mapControlsVisible = ($(".map-controls").css("display") === "none") ? false : true;
    var graphControlsVisible = ($(".graph-controls").css("display") === "none") ? false : true;
    var mapOff = ($("#mapOff").hasClass("selected")) ? true : false;
    var graphOff = ($("#graphOff").hasClass("selected")) ? true : false;
    var drawMapLayer = (mapVisible && mapControlsVisible && true) ? true : false;
    var drawGraphLayer = (graphVisible && graphControlsVisible && true) ? true : false;
    var drawNetLogoCanvas = ((mapVisible && mapOff && true) || (graphVisible && graphOff && true) || (mapVisible === graphVisible)) ? true : false;
    if (drawMapLayer || drawGraphLayer) {
      var container = drawMapLayer ? "mapContainer" : "graphContainer";
      html2canvas(document.getElementById(container), {
        useCORS: true
        }).then(function (canvas) {
          var miniCanvasId = "miniSafariCanvasView";
          var dataObj = scaleCanvas($(".netlogo-canvas").width(), $(".netlogo-canvas").height());
          var width = dataObj.width;
          var height = dataObj.height;
          var miniCanvas = document.getElementById(miniCanvasId);
          var miniCtx = miniCanvas.getContext('2d');
          miniCtx.fillStyle="#ffffff";
          miniCtx.fillRect(0,0,canvasWidth,canvasHeight);
          miniCtx.fillStyle="#000000";
          miniCtx.fillRect(0,((canvasWidth - height) / 2),width,height + 2);
          miniCtx.drawImage(canvas, 1, ((canvasWidth - height) / 2) + 1, width - 2, height);
          if (drawNetLogoCanvas) {
            miniCtx.drawImage(document.getElementsByClassName("netlogo-canvas")[0], 1, ((canvasWidth - height) / 2) + 1, width - 2, height);
          }
          message = document.getElementById(miniCanvasId).toDataURL("image/jpeg", imageQuality); 
          socket.emit("send reporter", {
            hubnetMessageSource: "all-users", 
            hubnetMessageTag: "canvas-view-"+key, 
            hubnetMessage: message
          }); 
        });  
    } else {    
      //var miniCanvasId = is_safari ? "miniSafariCanvasView" : "miniCanvasView";
      var miniCanvasId = "miniSafariCanvasView";
      var dataObj = scaleCanvas($(".netlogo-canvas").width(), $(".netlogo-canvas").height());
      var width = dataObj.width;
      var height = dataObj.height;
      var miniCanvas = document.getElementById(miniCanvasId);
      var miniCtx = miniCanvas.getContext('2d');
      miniCtx.fillStyle="#ffffff";
      miniCtx.fillRect(0,0,canvasWidth,canvasWidth);
      miniCtx.fillStyle="#000000";
      miniCtx.fillRect(0,((canvasWidth - height) / 2),width,height + 2);
      miniCtx.drawImage(document.getElementsByClassName("netlogo-canvas")[0], 1, ((canvasWidth - height) / 2) + 1, width - 2, height);
      message = document.getElementById(miniCanvasId).toDataURL("image/jpeg", imageQuality); 
      //console.log(message);
      
      //$("#miniSafariCanvasView").css("display","inline-block");
      socket.emit("send reporter", {
        hubnetMessageSource: "all-users", 
        hubnetMessageTag: "canvas-view-"+key, 
        hubnetMessage: message
      }); 
    }
  }
  
  function broadcastAvatar(shape, color, text) {
    //var shape = key.substring(0, key.indexOf("-"));
    //var color = parseFloat(key.substring( key.indexOf("-") + 1, key.length));
    //var shape = shape;
    //var color = data[1];
    var avatarCanvasId = "avatarCanvasView";
    var width = 200;
    var height = 200;
    var miniCanvas = document.getElementById(avatarCanvasId);
    var miniCtx = miniCanvas.getContext('2d');
    miniCtx.fillStyle="#000000";
    miniCtx.fillRect(0,0,300, 300);
    avatarShapeDrawer = new ShapeDrawer({}, miniCtx.onePixel);
    universe.turtleDrawer.turtleShapeDrawer.drawAvatar(miniCtx, color, shape, 20);
    message = document.getElementById(avatarCanvasId).toDataURL("image/jpeg", imageQuality); 
    //console.log(message);
    socket.emit("send reporter", {
      hubnetMessageSource: "all-users", 
      hubnetMessageTag: "canvas-avatar", 
      hubnetMessage: message
    }); 
  }
  
  function drawMap(key) {
    Maps.broadcastMap();
  }
  
  function drawGraph(key) {
    Graph.broadcastGraph();
  }
  
  function broadcastPlot(originalPlotName) {
    var miniCanvasId;
    var plotName = originalPlotName.replace(" ","-");
    if (is_safari) {
      if ($("#miniSafariCanvas"+plotName).length === 0) {
        $("body").append("<canvas id=\"miniSafariCanvas"+plotName+"\" width=\"200\" height=\"200\" style=\"display:none\"></canvas>");
      }
      miniCanvasId = "miniSafariCanvas"+plotName;
    } else {
      if ($("#miniCanvas"+plotName).length === 0) {
        $("body").append("<canvas id=\"miniCanvas"+plotName+"\" width=\"500\" height=\"500\" style=\"display:none\"></canvas>");
      }
      miniCanvasId = "miniCanvas"+plotName;
    }
    var matchingPlots;
    matchingPlots =  $("svg").filter(function() {
      if ($(".highcharts-title tspan", this).text() === originalPlotName){ 
        return this; } 
    });
    if (matchingPlots.length > 0) {
      var dataObj = scaleCanvas($(matchingPlots[0]).width(), $(matchingPlots[0]).height());
      plotsObject[plotName] = document.createElement("img");
      var svgData = new XMLSerializer().serializeToString(matchingPlots[0]);
      plotsObject[plotName].setAttribute("src","data:image/svg+xml;base64,"+btoa(unescape(encodeURIComponent(svgData))))
      plotsObject[plotName].setAttribute("plotName",plotName);
      plotsObject[plotName].setAttribute("miniCanvasId",miniCanvasId);
      plotsObject[plotName].setAttribute("width",dataObj.width);
      plotsObject[plotName].setAttribute("height",dataObj.height);
      plotsObject[plotName].onload = function () {
        var miniCanvas = document.getElementById(this.getAttribute("miniCanvasId"));
        var miniCtx = miniCanvas.getContext('2d');  
        miniCtx.fillStyle="#FFFFFF";
        miniCtx.fillRect(0,0,canvasWidth,canvasWidth);
        miniCtx.fillStyle="#000000";
        miniCtx.fillRect(0,((canvasWidth - this.getAttribute("height")) / 2),this.getAttribute("width"),this.getAttribute("height") + 2);
        miniCtx.drawImage(
          plotsObject[this.getAttribute("plotName")], 
          1, 
          ((canvasWidth - this.getAttribute("height")) / 2) + 1, 
          this.getAttribute("width") - 2, 
          this.getAttribute("height")
        );
        socket.emit("send reporter", {
          hubnetMessageSource: "all-users", 
          hubnetMessageTag: "canvas-plot-"+this.getAttribute("plotName"), 
          hubnetMessage: document.getElementById(this.getAttribute("miniCanvasId")).toDataURL("image/jpeg", imageQuality)
        });
      }
    }
  }
  
  function whoAmI() {
    return myUserId;
  }
  
  function showPatches() {
    drawPatches = true;
    universe.repaint();
  }
  
  function hidePatches() {
    drawPatches = false;
    universe.repaint();
  }
  
  function importWorld(filename) {
    //console.log("import world");
    //console.log(filename);
    //server emulates student entering, with all data 
    var elem, listener, result;
    listener = function(event) {
      var reader;
      reader = new FileReader();
      reader.onload = function(e) {
        console.log(JSON.parse(e.target.result));
        result = e.target.result;
        Physics.setAll(result.gbcc-physics-get-all);
        Maps.setAll(result.gbcc-maps-get-all);
        Graph.setAll(result.gbcc-graph-get-all);
        //world.importstate(JSON.parse(result.gbcc-world-export-state));

      };
      if (event.target.files.length > 0) {
        reader.readAsText(event.target.files[0]);
      }
      return $("#importgbccworld").off();
    };
    $("#importgbccworld").one("change",listener);
    $("#importgbccworld").click();
    $("#importgbccworld").value = "";
  }
  
  function exportWorld(filename) {
    //console.log("export world");
    //also save turtles and patches 
    socket.emit('send reporter', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "gbcc-physics-get-all",
      hubnetMessage: Physics.getAll()
    });
    socket.emit('send reporter', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "gbcc-maps-get-all",
      hubnetMessage: Maps.getAll()
    });
    socket.emit('send reporter', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "gbcc-graph-get-all",
      hubnetMessage: Graph.getAll()
    });
    socket.emit('send reporter', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "gbcc-world-export-state",
      hubnetMessage: JSON.stringify(world.exportState())
    });
    $("#gbccworldfilename").val(filename);
    $("#exportgbccworld").submit();
  }
  
  return {
    displayCanvas: displayCanvas,
    broadcastView: broadcastView,
    broadcastPlot: broadcastPlot,
    broadcastText: broadcastText,
    broadcastAvatar: broadcastAvatar,
    clearBroadcast: clearBroadcast,
    setupGallery: setupGallery,
    whoAmI: whoAmI,
    showPatches: showPatches,
    hidePatches: hidePatches,
    importWorld: importWorld,
    exportWorld: exportWorld
  };

})();