jQuery(document).ready(function() {
  
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

  // so teacher can toggle view on and off
  $(".netlogo-view-container").css("width", $(".netlogo-view-container canvas").css("width"));
  $("#shareClientView").click(function() {
    ($(this).prop("checked")) ? socket.emit('display view', {'display':true}) : socket.emit('display view', {'display':false});
  });
  
  // add GbCC link
  $(".netlogo-powered-by").append("<span style='font-size: 16px;'> & <a href='https://www.gbccstem.com/'>GbCC</a></span>");
  
  // add export
  $(".netlogo-export-wrapper").css("display","none");
  
  // add hidden div to hold image for import-drawing
  $("body").append("<input type=\"file\" id=\"importDrawingFileElem\" name='importDrawingFile' accept='image/*' style='display:none' >");
  $("#importDrawingFileElem").change(function(event) {
    Interface.importImageFile();
  });
  
  // trigger recompile of reserved gbcc procedures
  setupRecompileGbCC = function() {
    //console.log("recompile");
    var uType;
    var countStudentCompilations = 0;
    var fId;
    for (var uId in userData) {
      uType = userData[uId]["gbcc-user-type"];
      if (uType === "teacher" || countStudentCompilations === 0) {
        if (procedures.gbccOnEnter) { session.compileObserverCode("gbcc-enter-button-code-"+uId, "gbcc-on-enter \""+uId+"\" \""+uType+"\""); }
        if (procedures.gbccOnSelect) { session.compileObserverCode("gbcc-select-button-code-"+uId, "gbcc-on-select \""+uId+"\" \""+uType+"\""); }
        if (procedures.gbccOnDeselect) { session.compileObserverCode("gbcc-deselect-button-code-"+uId, "gbcc-on-deselect \""+uId+"\" \""+uType+"\""); }
        if (procedures.gbccOnExit) { session.compileObserverCode("gbcc-exit-button-code-"+uId, "gbcc-on-exit \""+uId+"\" \""+uType+"\""); }
        if (procedures.gbccOnGo) { session.compileObserverCode("gbcc-forever-button-code-"+uId, "gbcc-on-go \""+uId+"\" \""+uType+"\""); }
        if (uType === "student") {
          countStudentCompilations++;
          fId = uId;
        }
      } else {
        if (procedures.gbccOnEnter) { userData[uId]["gbcc-enter-button-code-"+uId] = userData[fId]["gbcc-enter-button-code-"+fId].replace(fId,uId); }
        if (procedures.gbccOnSelect) { userData[uId]["gbcc-select-button-code-"+uId] = userData[fId]["gbcc-select-button-code-"+fId].replace(fId,uId); ; }
        if (procedures.gbccOnDeselect) { userData[uId]["gbcc-deselect-button-code-"+uId] = userData[fId]["gbcc-deselect-button-code-"+fId].replace(fId,uId); ; }
        if (procedures.gbccOnExit) { userData[uId]["gbcc-exit-button-code-"+uId] = userData[fId]["gbcc-exit-button-code-"+fId].replace(fId,uId); ; }
        if (procedures.gbccOnGo) { userData[uId]["gbcc-forever-button-code-"+uId] = userData[fId]["gbcc-forever-button-code-"+fId].replace(fId,uId); ; }
      }
    }
  }

});