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
  
  // require confirmation before leaving site
  window.onbeforeunload = function() {
      return true;
  };
  document.title = "GbCC: "+$("#nlogo-code").attr("data-filename").replace(".nlogo","");
});