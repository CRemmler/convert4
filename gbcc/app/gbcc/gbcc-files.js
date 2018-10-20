GbccFileManager = (function() {
  
  function getFileList() {
    return []
  }
  
  function importOurDataFile(filename) {
    var filepath = "";
    if (myUserType === "teacher") {
      socket.emit('unzip gbcc universe', {
        'filepath': filepath, 
        'filename': filename, 
        'scope': "universe",
        schoolName: $(".schoolNameInput").val(), 
        roomName: $(".roomNameInput").val()});
    } else {
      alert("You must have the role of teacher to gbcc:import-our-data.")
    }
  }
  
  function importOurData() {
    importGbcc("universe");
  }
  
  function importGbcc(contenttype) {
    $("#importgbccfile").one("change", function() {
      $("#importgbccfile").off();
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

  function exportOurData(filename) {
    $("#exportgbccfilename").val(filename);
    $("#exportgbcctype").val("universe");
    $("#exportgbccform").submit();
  }
  
  function importMyData() {
    importGbcc("my-universe");
  }
  

  function exportMyData(filename) {
    $("#exportgbccfilename").val(filename);
    $("#exportgbcctype").val("my-universe");
    $("#exportgbccform").submit();
  }
  
  function importMyDataFile(filename) {
    var filepath = "";
    socket.emit('unzip gbcc universe', {
      'filepath': filepath, 
      'filename': filename,
      'scope': "my-universe",
      schoolName: $(".schoolNameInput").val(), 
      roomName: $(".roomNameInput").val()});
  }
  
  return {
    getFileList: getFileList,
    importOurData: importOurData,
    exportOurData: exportOurData,
    importOurDataFile: importOurDataFile,
    importMyData: importMyData,
    exportMyData: exportMyData,
    importMyDataFile: importMyDataFile,
  };

})();