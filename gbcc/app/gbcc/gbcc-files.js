GbccFileManager = (function() {
  
  function getFileList() {
    return []
  }
  
  function importUniverseFile(filename) {
    //console.log(filepath);
    //console.log(filename);
    //console.log("import gbcc universe file");
    var filepath = "";
    if (myUserType === "teacher") {
      socket.emit('unzip gbcc universe', {'filepath': filepath, 'filename': filename, schoolName: $(".schoolNameInput").val(), roomName: $(".roomNameInput").val()});
    } else {
      alert("You must have the role of teacher to import a gbcc universe.")
    }
  }
  
  function importUniverse() {
    importGbcc("universe");
  }
  
  function importGbcc(contenttype) {
    console.log("import gbcc contenttype "+contenttype);
    $("#importgbccfile").one("change", function() {
      $("#importgbccfile").off();
      //$("#importgbcctype").val(contenttype);
      var files = $(this).get(0).files;
      if (files.length > 0){
        var formData = new FormData();
        var file = files[0];
        formData.append(socket.id, file, file.name);
        $.ajax({
           url: '/importgbccform?filetype='+contenttype,
           type: 'POST',
           data: formData,
           processData: false,
           contentType: false,
           success: function(data){
               console.log('upload successful!\n' + data);
              $("#importgbccfile").val("");
           }
         });
       }
    });
    $("#importgbccfile").click();
    $("#importgbccfile").value = "";
  }

  function exportUniverse(filename) {
    $("#exportgbccfilename").val(filename);
    $("#exportgbcctype").val("universe");
    $("#exportgbccform").submit();
  }
  
  return {
    //uploadFile: uploadFile,
    getFileList: getFileList,
    importUniverse: importUniverse,
    exportUniverse: exportUniverse,
    importUniverseFile: importUniverseFile,
    //importWorld: importWorld,
    //exportWorld: exportWorld
  };

})();