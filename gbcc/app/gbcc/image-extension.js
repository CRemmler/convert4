
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
    //console.log("clear image");
    $("#imageLayer").prop("src","");
    //Physics.clearWorld();
    //Maps.clearMap();
    //Graph.clearGraph();
    world.triggerUpdate();
  }
  function importFromUser(userId) {
    //tag = tag.replace(" ","-");
    //var id = "canvas-"+tag+"-"+userId;
    console.log(userId);
    var $img = $("#gallery-item-"+userId).find(".card img");

    $("#imageLayer").prop("src",$img.prop("src"));
    world.triggerUpdate();
  }

  return {
    importImage: importImage,
    importPcolors: importPcolors,
    clearImage: clearImage,
    importFromUser: importFromUser
  };
 
})();
