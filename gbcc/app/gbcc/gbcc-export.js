
function createHtmlReport(data, settings) {
  var webpage = "";
  var value;
  webpage += "<html>\n";
  webpage += "  <head><style>p {margin-left:20px} h2 {background-color:#ddd;} h3 {background-color:yellow;}</style>\n";
  webpage += "  </head>\n";
  webpage += "  <body>\n";
  webpage += "    <h1>"+settings.schoolName+"</h1>\n";
  webpage += "    "+settings.time+"\n";
  if (data != undefined) {
    for (var room in data) {
      webpage += "<h2>Room: "+room+"</h2>\n";
      for (var user in data[room].userData) {
        webpage += "    <h3><p><span><b>UserID: "+user+"</b></span></h3>\n";
        for (var key in data[room].userData[user] ) {
          value = data[room].userData[user][key];
          if (key.includes("canvas")) {
            for (var canvas in value) {
              if (canvas === "canvas-text") {            
                webpage += "    <p><span><b>text</b></span>\n";
                webpage += "    <br><span>"+value[canvas].replace("gallery-text","")+"</span>\n";
              } else {
                webpage += "    <p><img src='"+value[canvas]+"'>";
              }
            }
          } else { if (key != "exists") {
              webpage += "    <p><span><b>"+key+"</b></span>\n";
              webpage += "    <br><span>"+value+"</span>\n";
            }
          }
        }
        webpage += "\n";
      }
    }
  }
  webpage += "  </body>\n";
  webpage+= "</html>";
  return webpage;
}

function createJsonReport(data, settings) {
  var reportObj = {};
  var roomObj, userObj, valueObj;
  var value;
  if (data != undefined) {
    for (var room in data) {
      reportObj[room] = {};
      for (var user in data[room].userData) {
        reportObj[room][user] = {};
        for (var key in data[room].userData[user] ) {
          value = data[room].userData[user][key];
          if (key.includes("canvas")) {
            for (var canvas in value) {
              if (canvas === "gallery-text") {            
                reportObj[room][user]["gallery-text"] = value[canvas].replace("gallery-text","");
              } 
            }
          } else { 
            if (key != "exists") {
              reportObj[room][user][key] = value;
            }
          }
        }
      }
    }
  }
  return JSON.stringify(reportObj);
}

function sendResponse(htmlReport,jsonReport, zip, res, fileName) {
  zip.file("htmlReport.html", htmlReport);
  zip.file("jsonReport.json", jsonReport);
  zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
  .pipe(fs.createWriteStream(fileName+".zip"))
  .on('finish', function () {
    res.download(fileName+".zip", function() {
    });
  });
}

function createGgbFile() {
  console.log("create ggb file");
  
  var zip = new JSZip();
  zip.file("Hello.txt", "Hello World\n");
  zip.file("app/gbcc/geogebra_defaults2d.xml").async("string").then(function (data) {
  // data is "Hello World\n"
  });

  zip.generateAsync({type:"blob"})
  .then(function(content) {
      // see FileSaver.js
      window.saveAs(content, "example.zip");
  });
}

