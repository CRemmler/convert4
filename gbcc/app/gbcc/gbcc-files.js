GbccFileManager = (function() {
  
  function uploadFile() {
    $("#ggbzip").one("change", function() {
      $("#ggbzip").off();
      var files = $(this).get(0).files;
      if (files.length > 0){
        var formData = new FormData();
        var file = files[0];
        formData.append('uploads[]', file, file.name);
        $.ajax({
           url: '/uploadggb',
           type: 'POST',
           data: formData,
           processData: false,
           contentType: false,
           success: function(data){
               console.log('upload successful!\n' + data);
           }
         });
       }
    });
    $("#ggbzip").click();
    $("#ggbzip").value = "";
  }
  
  function getFileList() {
    return []
  }
  
  function importUniverse(filepath, filename) {
    console.log("import universe");
    if (myUserType === "teacher") {
      socket.emit('unzip gbcc universe', {'filepath': filepath, 'filename': filename, schoolName: $(".schoolNameInput").val(), roomName: $(".roomNameInput").val()});
    } else {
      alert("You must have the role of teacher to import a gbcc universe.")
    }
  }
  
  function importUniverseFromPopup() {
    $("#gbccuniverse").one("change", function() {
      $("#ggbcuniverse").off();
      var files = $(this).get(0).files;
      if (files.length > 0){
        var formData = new FormData();
        var file = files[0];
        formData.append(socket.id, file, file.name);
        $.ajax({
           url: '/importuniversefrompopup',
           type: 'POST',
           data: formData,
           processData: false,
           contentType: false,
           success: function(data){
               console.log('upload successful!\n' + data);
              $("#ggbzip").val("");
           }
         });
       }
    });
    $("#gbccuniverse").click();
    $("#gbccuniverse").value = "";
  }

  function exportUniverse(filename) {
    //console.log("export world");
    //also save turtles and patches 
    /*
    socket.emit('send reporter', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "gbccPhysicsGetAll",
      hubnetMessage: Physics.getAll()
    });
    socket.emit('send reporter', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "gbccMapsGetAll",
      hubnetMessage: Maps.getAll()
    });
    socket.emit('send reporter', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "gbccGraphGetAll",
      hubnetMessage: Graph.getAll()
    });
    socket.emit('send reporter', {
      hubnetMessageSource: "server",
      hubnetMessageTag: "gbccWorldExportCSV",
      hubnetMessage: JSON.stringify(world.exportCSV())
    });*/
    $("#gbccworldfilename").val(filename);
    $("#exportgbccworld").submit();
  }
  
  return {
    uploadFile: uploadFile,
    getFileList: getFileList,
    importUniverse: importUniverse,
    exportUniverse: exportUniverse,
    importUniverseFromPopup: importUniverseFromPopup,
  };

})();