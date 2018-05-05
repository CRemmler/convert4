
  jQuery(document).ready(function() {

    // init
    init();
    
    function init() {
      // hide contents for each step
      $(".initHidden").css("display","none");
      $("#gbccFlat").click();
      displayModel('gbccFlat');
    }
    
    // event listeners
    $(".createIcon").on("click", function() {
      var id = $(this).attr("id");
      $("#"+id+"Container").toggle();
    });

    $(".modelType").on("click", function() {
      var id = $(this).attr("id");
      displayModel(id);
    });
    
    function displayModel(id) {
      $(".modelTypeImage").css("display", "none");
      $("#"+id+"Image").css("display","inline-block");
      $(".selectFileSpan").css("display","none"); 
      if (id === 'legacyHubnet') {
        $("#troubleshoot").css("display","block");
        $("#gbccFeatures").css("display","none");
      } else {
        $("#troubleshoot").css("display","none");
        $("#gbccFeatures").css("display","block");
      }
      (id === 'legacyHubnet') ? 
        $(".legacyHubnetFile").css("display","inline-block") : 
        (id === 'gbccFlat') ? 
        $(".gbccFlatFile").css("display","inline-block") : 
        $(".gbccHierFile").css("display","inline-block");
      
    }

    $(".demo").css("display","none");
    $("[choice='1']").click();
    $("[choice='6']").click();
    $("#container0 .basicTabs").css("display","block");
    $("#container1 .tabCover").css("display","block");
    $(".basicModel.notes").css("display","block");
    $(".basicModelEmpty").css("display","none");
    $("#tabWarning").css("display","none");
    $("#viewWarning").css("display","none");
    $(".allTabs.notes").css("display","block");
    $(".allTabs.notes.student").css("display","none");
    $("#settings").css("visibility","hidden");
    $(".choice").change(function() {
      var choice = $(this).attr("choice");
      var choiceImage = ".demo"+choice;
      if ($(this).is(":checked")) {
        $(choiceImage).css("display","block");
      } else {
        $(choiceImage).css("display","none");
      }
      if (choice === "1") {
        if ($(this).is(":checked")) {
          $(".tabCover").css("display","none");
          $("#tabWarning").css("display","none");
          $("#container0 .demo1").css("display","block");
          $(".demo3a").css("display","block");
          $(".basicTabs").css("display","none");
          $("#settings").css("visibility","visible");
          $(".allTabs.notes.student").css("display","block");
          $(".galleryTab.notes").css("display","block");
          $(".basicModel.notes.student").css("display","block");
        } else {
          $(".tabCover").css("display","block");
          $("#tabWarning").css("display","inline-block");
          $(".basicTabs").css("display","block");
          $("#settings").css("visibility","hidden");
          $(".allTabs.notes.student").css("display","none");
          $(".galleryTab.notes").css("display","none");
            $(".basicModel.notes.student").css("display","none");            
          if ($("[choice=2]").is(":checked")) { $("[choice=2]").click(); $(".demo2").css("display","none"); }
          if ($("[choice=3]").is(":checked")) { $("[choice=3]").click(); $(".demo3").css("display","none");}
          if ($("[choice=4]").is(":checked")) { $("[choice=4]").click(); $(".demo4").css("display","none");}
          if ($("[choice=5]").is(":checked")) { $("[choice=5]").click(); $(".demo5").css("display","none");}
          $(".demo3a").css("display","none");
        }
      }
      
      if (choice === "6") {
        if ($(this).is(":checked")) {
          $(".basicModel").css("display","block");
          $(".basicModelEmpty").css("display","none");
          $("#viewWarning").css("display","none");
        } else {
          $(".basicModel").css("display","none");
          $(".basicModelEmpty").css("display","block");
          $("#viewWarning").css("display","inline-block");
          if ($("[choice=0]").is(":checked")) { $("[choice=0]").click(); $(".demo0").css("display","none"); }
        }
      }
      // if you uncheck 3 and 4 is checked, then hide 3a
      if (choice === "3" && !$("[choice=3]").is(":checked") && $("[choice=4]").is(":checked")) {
        $(".demo3a").css("display","none");
      }
      // if you check 3, show 3a
      if (choice === "3" && $("[choice=3]").is(":checked")) {
        $(".demo3a").css("display","block");
      }
      // if you check 4, and 3 is not checked, hide 3a
      if (choice === "4" && $("[choice=4]").is(":checked") && !$("[choice=3]").is(":checked")) {
        $(".demo3a").css("display","none");
      }
    });
    choiceList = {};
    choiceList["disease"] = {"on":[], "off":[0,1,2,3,4,5] };
    choiceList["introbuttons"] = {"on":[1], "off":[0,2,3,4,5] };
    $("#disease").click();
    $("#custom").change(function() {
      if (!$("[choice=1]").is("checked")) {
        $("[choice=1]").click();            
      }
    });
    $("[name='template']").change(function() {
      var choice = $(this).attr("id");
      if (choiceList[choice] != undefined) {
        var on = choiceList[choice].on;
        for (var i=0; i<on.length; i++) {
          if (!$("[choice="+on[i]+"]").is(":checked")) {
            $("[choice="+on[i]+"]").click();
          }
        }
        var off = choiceList[choice].off;
        for (var i=0; i<off.length; i++) {
          if ($("[choice="+off[i]+"]").is(":checked")) {
            $("[choice="+off[i]+"]").click();
          }
        }
      }
      if (choice != "custom" && choice != "disease" && $(".demo3a").css("display") === "none") {
        $(".demo3a").css("display","block");
      }
    });
    var filename;
    $("#addModel").on("click",function() {
      alert("Email your model to c_remmler@yahoo.com, and I can post it. Thanks! - C");
    });
    $(".demo1").css("display","block");
    var readyForUpload;
    $(".selectFileButton").on("change", function() {
      updateReadyForUpload();
    });
    $(".modelType").on("change", function() {
      updateReadyForUpload();
    });
    function updateReadyForUpload() {
      readyForUpload = false;
      switch ($("input[name='modelType']:checked").val()) {
        case "legacyHubnet":
          if ($("[name=hubnetfiletoupload]").val() != "") { readyForUpload = true; }
          break;
        case "gbccFlat":
          if ($("[name=userfiletoupload]").val() != "") { readyForUpload = true; }
          break;
        case "gbccHierarchical":
          if (($("[name=studentfiletoupload]").val() != "") && ($("[name=teacherfiletoupload]").val() != ""))
          { readyForUpload = true; }
          break;
        default:
          break;
      }
      if (readyForUpload) {
        $("#downloadEnabled").css("display","inline-block");
        $("#downloadDisabled").css("display","none");
        $("#correctFilename").css("display","inline-block");
      } else {
        $("#downloadEnabled").css("display","none");
        $("#downloadDisabled").css("display","inline-block");
        $("#correctFilename").css("display","none");  
      }
    }
  });