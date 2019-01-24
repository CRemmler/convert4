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
  var allowMirrorControl;
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
    allowMirrorControl = settings.allowMirrorControl || false;
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
      $("#canvasSize").val("large");
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
          $(".netlogo-gallery-tab-content").removeClass("selected");
          $(".gbcc-gallery li").removeClass("gray-border");
          galleryForeverButton = "on";
          socket.emit("request user broadcast data");
        } else {
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
    if (!allowMirrorControl) { $(".mirror-controls").css("display","none"); } else {
      $(".mirror-controls").css("display","inline-block");
    }
    if (is_safari) {
      $("body").append("<canvas id=\"miniSafariCanvasView\" width=\"250\" height=\"250\" style=\"display:none\"></canvas>");
      canvasHeight = 250; canvasWidth = 250;
      imageQuality = 0.5;
    } else {
      $("body").append("<canvas id=\"miniCanvasView\" width=\"500\" height=\"500\" style=\"display:none\"></canvas>");
      canvasHeight = 500; canvasWidth = 500;
      imageQuality = 0.75;
    }
    $("body").append("<canvas id=\"avatarCanvasView\" width=\"300\" height=\"300\" style=\"display:none\"></canvas>");
    $(".netlogo-widget-container").append('<div class="gbcc-widget" style="position:absolute; top:-10px; left:210px" id="opacityWrapper"><input type="range" value="100" max="100" min="0" id="opacity" style="z-index: -1;"></div>')
    $('.netlogo-widget-container').on("input","#opacity", function() { 
      $("#graphContainer").css("opacity", $(this).val() / 100);
      $("#mapContainer").css("opacity", $(this).val() / 100); 
      $("#imageContainer").css("opacity", $(this).val() / 100); 
    });
    $("#opacityWrapper").css("display", "none");
    $("body").append("<div class='hiddenfile'><input id='importgbccworld' type='file' style='display:none'></div>");
    var spanText = "<form action='exportgbccform' method='post' id='exportgbccform' enctype='multipart/form-data' style='display: none;'>";
    spanText += "<input id='exportgbcctype' type='text' name='exportgbcctype' value=''>";//" style='display: none;'>";
    spanText += "<textarea cols='50' id='ggbxml' type='text' wrap='hard' name='ggbxml' value=''></textarea>";
    spanText += "<input id='exportgbccfilename' type='text' name='exportgbccfilename' value=''>";
    spanText += "<input class='roomNameInput' type='text' name='gbccroomname' value='' style='display: none;'>";
    spanText += "<input class='schoolNameInput' type='text' name='gbccschoolname' value='' style='display: none;'>";
    spanText += "<input class='myUserIdInput' type='text' name='gbccmyuserid' value='' style='display: none;'>";
    spanText += "<button type='submit' id='exportgbccbutton'></button></form>";
    spanText += "<form action='importgbccform' method='post' id='importgbccform' enctype='multipart/form-data' style='display: none;'>";
    spanText += "<input id='importgbccfile' type='file' name='importgbccfile' value=''>";//" style='display: none;'>";
    spanText += "<input id='importgbcctype' type='text' name='importgbcctype' value=''>";//" style='display: none;'>";
    spanText += "<button type='submit' id='importgbccbutton'></button></form>";
    $("body").append(spanText);
    $(".myUserIdInput").val(myUserId); 
  }

  function selectAll() {
    $(".gbcc-gallery li").each(function() {
      myId = $(this).attr("id");
      $elt = $("#"+myId+" .card.card-image");
      if (!$elt.parent().hasClass("selected")) {
        cardClickHandler($elt);
        $("#"+myId+" .forever-icon:not(.selected)").css("display","none");     
      }
    });
  }
  function deselectAll() {
    $(".gbcc-gallery li").each(function() {
      myId = $(this).attr("id");
      $elt = $("#"+myId+" .card.card-image");
      if ($elt.parent().hasClass("selected")) {
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
    var userId = $(thisElt).parent().attr("userid");
    if (!userId) { return; }
    var userType = $(thisElt).parent().attr("usertype");
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
  
  function resetCards(li) {
    var cards = [];
    $(li).children().each(function() {
      if ($(this).hasClass("card")) { cards.push(this);}
    });
    var index = 0;
    for (card in cards) {
      $(cards[card]).css("z-index",index);		
      index++;
    }
  }
  
  function createCanvas(data) {
    var canvasImg = new Image();
    canvasImg.id = data.id;
    canvasImg.userId = data.userId;
    claimed = data.claimed;
    var label = $(".gbcc-gallery li").length;
    if ($(".gbcc-gallery").length === 0) { 
      $(".netlogo-gallery-tab-content").append("<div class='gbcc-gallery'><ul></ul></div>"); 
      $(".gbcc-gallery").addClass("large");
    }
    var newLiHtml = "<li id='gallery-item-"+data.userId+"' usertype='"+data.userType+"' userid='"+data.userId+"' ";
    newLiHtml += (claimed) ? "claimed=\"true\"" : "claimed=\"false\"";
    newLiHtml += (myUserId === data.userId) ? " myUser=\"true\">" : " myUser=\"false\">";
    newLiHtml += (myUserId === data.userId) ? "<span class=\"label z20 selected\">"+label+"</span>" : "<span class=\"label z20\">"+label+"</span>";
    newLiHtml += "<span class=\"arrow arrow-left z20\" style=\"display:none\"><b>&lt;</b></span>";//"<i class='fa fa-chevron-left' aria-hidden='true'></i></span>";
    newLiHtml += "<span class=\"arrow arrow-right z20\" style=\"display:none\"><b>&gt;</b></span>";//"<i class='fa fa-chevron-right' aria-hidden='true'></i></span>";
    if (allowCanvasForeverButtons) {
      newLiHtml += "<span class=\"forever-icon z20\"><i class='fa fa-refresh' aria-hidden='true'></i></span>";
    } else {
      newLiHtml += "<span></span>";      
    }
    newLiHtml += "</li>";
    $(".gbcc-gallery ul").append(newLiHtml);
    $("#gallery-item-"+label+" .card-image").append(canvasImg);
    $("#gallery-item-"+data.userId+" .arrow").click(function() { arrowClickHandler(this) });
    $("#gallery-item-"+data.userId+" .forever-icon").click(function() { foreverClickHandler(this, data.userId, data.userType) });
    $("#gallery-item-"+data.userId).mouseover(function() { itemMouseoverHandler(this); });
    $("#gallery-item-"+data.userId).mouseout(function() { itemMouseoutHandler(this); });
  }
  
  function createImageCard(data) {
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
    var text = data.src.replace("canvas-text","").replace(/(?:\r\n|\n)/g, '<br>').replace(/ /g, "&nbsp;").replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    var newSpan = "<span class=\"card card-text\"><span id=\""+data.id+"\" class=\"text-span empty\"><br>";
    newSpan += "</span></span>";
    $("#gallery-item-"+data.userId).append(newSpan);
    $("#"+data.id).html("<br>"+text);
    var zIndex = $("#gallery-item-"+data.userId+" span:not(.text-span)").length - 5;
    $("#"+data.id).parent().css("z-index",zIndex);
    ($("#"+data.id).parent()).click(function() { cardClickHandler(this); });
      assignZIndex();
  }
  
  function createEmptyTextCard(data) {
    newSpan = "<span class=\"card card-text\"><span id=\""+data.id+"\" class=\"text-span empty\"><br>";
    $("#gallery-item-"+data.userId).append(newSpan);
    var zIndex = $("#gallery-item-"+data.userId+" span:not(.text-span)").length - 5;
    $("#"+data.id).parent().css("z-index",zIndex);
    ($("#"+data.id).parent()).click(function() { cardClickHandler(this); });
      assignZIndex();
  }
  
  function updateTextCard(data) {
    var text = data.src.replace("canvas-text","").replace(/(?:\r\n|\n)/g, '<br>').replace(/ /g, "&nbsp;").replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    $("#"+data.id).html("<br>"+text);
  }
  
  function displayCanvas(data) {
    data.tag = data.tag.replace(" ","-");
    var canvasType = data.tag; // canvas-text, canvas-avatar, canvas-clear, canvas-clear-all
    if (data.tag.indexOf("canvas-plot-") === 0) { canvasType = "canvas-plot"; }
    if (data.tag.indexOf("canvas-view-") === 0) { canvasType = "canvas-view"; }
    if (data.tag.indexOf("canvas-text-") === 0) { canvasType = "canvas-text"; }
    if (galleryForeverButton === "off") { return; } 
    var canvasData = { 
            id : data.tag + "-" + data.source,
            src : data.message,
            userId : data.source,
            userType: data.userType,
            claimed: data.claimed
          }
    if ($("#gallery-item-"+data.source).length === 0 ) { createCanvas(canvasData); } 
    if ($("#canvas-clear-all-" + data.source ).length > 0) {
      $("#canvas-clear-all-" + data.source).parent().remove();
    }
    if (canvasType === "canvas-clear-all") {
      $("#gallery-item-" + data.source +" .card").remove(); 
      canvasData.src="";
      createEmptyTextCard(canvasData);
      return;
    } else if (canvasType === "canvas-clear") {
      if ($("#canvas-view-" + data.message.replace(" ","-")+"-"+data.source).length > 0) {
        $("#canvas-view-" + data.message.replace(" ","-")+"-"+data.source).parent().remove(); 
        resetCards($("#gallery-item-"+data.source));
      } else  if ($("#canvas-plot-" + data.message.replace(" ","-")+"-"+data.source).length > 0) {
        $("#canvas-plot-" + data.message.replace(" ","-")+"-"+data.source).parent().remove();
        resetCards($("#gallery-item-"+data.source));
      } else  if ($("#canvas-text-" + data.message.replace(" ","-")+"-"+data.source).length > 0) {
        $("#canvas-text-" + data.message.replace(" ","-")+"-"+data.source).parent().remove();
        resetCards($("#gallery-item-"+data.source));
      }
    }
    if (allowMultipleLayers) {
      if (canvasType === "canvas-text") {
        ($("#" + data.tag + "-" + data.source).length === 0) ? createTextCard(canvasData) : updateTextCard(canvasData); 
      } if ((canvasType === "canvas-plot") || (canvasType === "canvas-view") || (canvasType === "canvas-avatar") ){ //else {
        ($("#" + data.tag + "-" + data.source).length === 0) ? createImageCard(canvasData) : updateImageCard(canvasData);
      }
    } else {
      // remove existing cards
      $("#gallery-item-" + data.source +" .card").remove(); 
      // make another one
      if (canvasType === "canvas-text") {
        createTextCard(canvasData);
      } else {
        createImageCard(canvasData);
      } 
    }
    if (userData[data.source] && userData[data.source].reserved && userData[data.source].reserved.muted) {
      $("#gallery-item-"+data.source).children().each(function() {
        if ($($(this)[0]).hasClass("label") === false) {
          $($(this)[0]).css("visibility","hidden");
        }
      });
    }
  }
  
  function clearBroadcasts() {
    socket.emit("send canvas reporter", {
      hubnetMessageSource: "all-users", 
      hubnetMessageTag: "canvas-clear-all", 
      hubnetMessage: ""
    }); 
  }
  
  function clearBroadcast(name) {
    socket.emit("send canvas reporter", {
      hubnetMessageSource: "all-users", 
      hubnetMessageTag: "canvas-clear", 
      hubnetMessage: name
    }); 
  }
  
  function broadcastText(tag, message) {
    socket.emit("send canvas reporter", {
      hubnetMessageSource: "all-users", 
      hubnetMessageTag: "canvas-text-"+tag, 
      hubnetMessage: message
    }); 
  }
  
  function drawHoverText(text) {
    //console.log("draw hover text",text);
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
      window.exports.html2canvas(document.getElementById(container), {
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
          socket.emit("send canvas reporter", {
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
      //$("#miniSafariCanvasView").css("display","inline-block");
      socket.emit("send canvas reporter", {
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
    var miniCanvas = document.getElementById(avatarCanvasId);
    var miniCtx = miniCanvas.getContext('2d');
    miniCtx.fillStyle="#000000";
    miniCtx.fillRect(0,0,300, 300);
    avatarShapeDrawer = new ShapeDrawer({}, miniCtx.onePixel);
    universe.turtleDrawer.turtleShapeDrawer.drawAvatar(miniCtx, color, shape, 1/8);
    message = document.getElementById(avatarCanvasId).toDataURL("image/jpeg", imageQuality); 
    socket.emit("send canvas reporter", {
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
    var width;
    var height;
    var plotName = originalPlotName.replace(" ","-");
    if (is_safari) {
      if ($("#miniSafariCanvas"+plotName).length === 0) {
        $("body").append("<canvas id=\"miniSafariCanvas"+plotName+"\" width=\"250\" height=\"250\" style=\"display:none\"></canvas>");
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
        width = this.getAttribute("width");
        height = this.getAttribute("height");
        var miniCanvas = document.getElementById(this.getAttribute("miniCanvasId"));
        var miniCtx = miniCanvas.getContext('2d');  
        miniCtx.fillStyle="#FFFFFF";
        miniCtx.fillRect(0,0,canvasWidth,canvasWidth);
        miniCtx.fillStyle="#000000";
        miniCtx.fillRect(0,((canvasWidth - height) / 2),width,height + 2);
        miniCtx.drawImage(
          plotsObject[this.getAttribute("plotName")], 
          1, 
          (((canvasWidth - height) / 2) + 1), 
          width - 2, 
          height - 2
        );
        socket.emit("send canvas reporter", {
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
  
  function myRole() {
    return myUserType;
  }
  
  function mirroring() {
    return mirroringEnabled; 
  }
  
  function showPatches() {
    drawPatches = true;
    universe.repaint();
  }
  
  function hidePatches() {
    drawPatches = false;
    universe.repaint();
  }
  
  function adoptCanvas(userId, canvasId) {
    socket.emit('send canvas override', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "adopt-canvas",
      hubnetMessage: {userId: userId, canvasId: canvasId}
    });
  }
  
  function muteCanvas(canvasId) {
    if (myUserType === "teacher") {
      socket.emit('send canvas override', {
        hubnetMessageSource: "server",
        hubnetMessageTag: "mute-canvas",
        hubnetMessage: {canvasId: canvasId}
      });
    } else {
      alert("You must have the role of teacher to gbcc:mute-canvas.")
    }
  }
  
  function unmuteCanvas(canvasId) {
    if (myUserType === "teacher") {
      socket.emit('send canvas override', {
        hubnetMessageSource: "server",
        hubnetMessageTag: "unmute-canvas",
        hubnetMessage: {canvasId: canvasId}
      });
    } else {
      alert("You must have the role of teacher to gbcc:unmute-canvas.")
    }
  }
  
  function getCanvasList() {
    var canvasList = [];
    $(".gbcc-gallery li").each(function() {
      canvasList.push($(this).prop("id").replace("gallery-item-",""))
    });
    return canvasList;
  }
  
  function getVacantIndices() {
    var canvasList = [];
    $(".gbcc-gallery li").each(function(index) {
      if ($(this).attr("claimed") == "false") {
        canvasList.push(index);
      }
    });
    return canvasList;
  }
  
  function getUserList() {
    var userList = [];
    for (var x in userData) {
      userList.push(x);
    }
    return userList;
  }
  
  function getActiveUserList() {
    var userList = [];
    for (var x in userData) {
      if (x && userData[x].reserved && userData[x].reserved.exists) { 
        userList.push(x); 
      }
    }
    return userList;
  }
  
  function acceptCanvasOverride(data) {
    var hubnetMessageTag = data.hubnetMessageTag;
    var hubnetMessage = data.hubnetMessage;
    var adoptedUserId = hubnetMessage.adoptedUserId;
    var originalUserId = hubnetMessage.originalUserId;
    var originalCanvasUserData = hubnetMessage.originalCanvasUserData;
    if (hubnetMessageTag === "adopt-canvas") {
      userData[originalUserId].reserved.exists = false;
      userData[originalUserId].reserved.claimed = false;
      $("#gallery-item-"+originalUserId).attr("claimed","false");
      userData[adoptedUserId].reserved.exists = true;
      userData[adoptedUserId].reserved.claimed = true;
      $("#gallery-item-"+adoptedUserId).attr("claimed","true");
      if (myUserId === originalUserId) {
        $("#gallery-item-"+originalUserId+" .label").removeClass("selected") 
        $("#gallery-item-"+adoptedUserId+" .label").addClass("selected") 
        myUserId = adoptedUserId;
        $(".myUserIdInput").val(myUserId);
      }
    } else if (hubnetMessageTag === "mute-canvas") {
      userData[adoptedUserId].reserved.muted = true;
      $("#gallery-item-"+adoptedUserId).children().each(function() {
        if ($($(this)[0]).hasClass("label") === false) {
          $($(this)[0]).css("visibility","hidden");
        }
      });
    } else if (hubnetMessageTag === "unmute-canvas") {
      userData[adoptedUserId].reserved.muted = false;
      $("#gallery-item-"+adoptedUserId).children().each(function() {
        $($(this)[0]).css("visibility","visible");
      });
    } else if (hubnetMessageTag === "release-canvas") {
      if (adoptedUserId) {
        $("#gallery-item-"+adoptedUserId).attr("claimed","false");
      } else {
        $("#gallery-item-"+originalUserId).attr("claimed","false");
      }
    }
  }
  
  function storeState() {
    if (userData[myUserId] && userData[myUserId].reserved) {
      var myWorld = world.exportCSV();
      var blob = myCanvas.toDataURL("image/png", 0.5);
      var graph = Graph.getAll();
      var maps = Maps.getAll();
      //state.physics = Physics.getAll();
      userData[myUserId].reserved.myWorld = myWorld;
      userData[myUserId].reserved.blob = blob;
      userData[myUserId].reserved.graph = graph;
      userData[myUserId].reserved.maps = maps;
      socket.emit('send state reporter', {
        myWorld: myWorld,
        blob: blob,
        graph: graph,
        maps: maps
        // physics: state.physics 
      });
    }
  }
  
  function restoreState() {
    if (userData[myUserId] && userData[myUserId].reserved) {
      restoreStateData({
        myWorld: userData[myUserId].reserved.myWorld,
        blob: userData[myUserId].reserved.blob,
        graph: userData[myUserId].reserved.graph,
        maps: userData[myUserId].reserved.maps
        // physics: userData[myUserId].reserved.physics
      });
    }
  }
  
  function restoreStateData(state) {
    if (state.myWorld) {
      ImportExportPrims.importWorldRaw(state.myWorld);
    }
    if (state.blob) {
      universe.model.drawingEvents.push({type: "import-drawing", sourcePath: state.blob});
    }
    if (state.graph) { Graph.setAll(state.graph); }
    if (state.maps) { Maps.setAll(state.maps); }
    // if (state.physics) { Physics.setAll(state.physics); }
  }
  
  function restoreStateFromUser(userId) {
    if (userId === myUserId) {
      restoreState();
    } else {
      storeState();
      socket.emit('student triggers state request', {targetUserId: userId, requestUserId: myUserId });
    }
  }
  
  return {
    displayCanvas: displayCanvas,
    broadcastView: broadcastView,
    broadcastPlot: broadcastPlot,
    broadcastText: broadcastText,
    broadcastAvatar: broadcastAvatar,
    clearBroadcast: clearBroadcast,
    clearBroadcasts: clearBroadcasts,
    setupGallery: setupGallery,
    whoAmI: whoAmI,
    showPatches: showPatches,
    hidePatches: hidePatches,
    adoptCanvas: adoptCanvas,
    getCanvasList: getCanvasList,
    getVacantIndices: getVacantIndices,
    getUserList: getUserList,
    getActiveUserList: getActiveUserList,
    acceptCanvasOverride: acceptCanvasOverride,
    myRole: myRole,
    muteCanvas: muteCanvas,
    unmuteCanvas: unmuteCanvas,
    mirroring: mirroring,
    storeState: storeState,
    restoreState: restoreState,
    restoreStateFromUser: restoreStateFromUser,
    restoreStateData: restoreStateData
  };

})();