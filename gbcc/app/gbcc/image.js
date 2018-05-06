
Images = (function() {
  
  function importImage(filename) {
    //clearImage();
    var image = new Image();
    image.onload = function() {
      $("#imageLayer").prop("src",filename);
      world.triggerUpdate();
    };
    image.src = filename;
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
      $("#imageLayer").prop("src",$img.attr("src"));
    }
    world.triggerUpdate();
  }

  return {
    importImage: importImage,
    importPcolors: importPcolors,
    clearImage: clearImage,
    importFromUser: importFromUser
  };
 
})();
