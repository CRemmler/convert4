
Images = (function() {
  
  function setupInterface() {
    if ($("#imageContainer").length === 0) {
      viewWidth = parseFloat($(".netlogo-canvas").css("width"));
      viewHeight = parseFloat($(".netlogo-canvas").css("height"));
      Interface.setupEnvironment("image");
      var spanText = "<img id='imageInImageContainer'>";
      $("#imageContainer").append(spanText);
      $("#imageInImageContainer").css("width",viewWidth);
      $("#imageInImageContainer").css("height",viewHeight);
      $("#imageContainer").css("position", "absolute");
      $("body").append('<input id="the-file-input" type="file">');
      $("#the-file-input").change(function() {
        console.log("file input changed");
        renderImage(this.files[0])
      });
    }
  }
  
  function showImage() {
    Interface.showEnvironment("image");
    world.triggerUpdate();
  }
  
  function hideImage() {
    Interface.hideEnvironment("image");
  }  
  
  function renderImage(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
      the_url = event.target.result;
      $("#imageInImageContainer").prop("src",the_url);
    }
    reader.readAsDataURL(file);
  }  
  function bringToFront() {
    Interface.bringToFront("image"); 
  }
  
  function sendToBack() {
    Interface.sendToBack("image");
  }
  
  function importFile(filename) {
    world.importDrawing(filename);
  }

  function importPcolors() {
    
  }
  function clearImage() {
    $("#imageLayer").prop("src","");
    world.triggerUpdate();
  }
  function importFromUser(userId) {
    var $img;
    var $images = $("#gallery-item-"+userId).find(".card img");
    var maxZIndex = -1;
    for (var i=0; i<$images.length; i++) {
      var zIndex = parseInt($($images[i]).parent().css("z-index"));
      if (zIndex > maxZIndex) {
        maxZIndex = zIndex;
        $img = $($images[i]); 
      }
    }
    if ($img) {
      $("#imageInImageContainer").prop("src",$img.attr("src"));
    }
    world.triggerUpdate();
  }

  return {
    importFile: importFile,
    importPcolors: importPcolors,
    clearImage: clearImage,
    importFromUser: importFromUser, 
    setupInterface: setupInterface,
    showImage: showImage,
    hideImage: hideImage,
    sendToBack: sendToBack,
    bringToFront: bringToFront
  };
 
})();
