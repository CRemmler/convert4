'use strict';

var fs = require("node-fs");
var JSZip = require("jszip");
var Promise = require("bluebird");

Promise.promisifyAll(fs);

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
    //webpage += "<h2>Room: "+room+"</h2>\n";
    for (var user in data.userData) {
      webpage += "    <h3><p><span><b>UserID: "+user+"</b></span></h3>\n";
      for (var key in data.userData[user] ) {
        value = data.userData[user][key];
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

function createJsonUniverse(data) {
  var reportObj = {};
  if (data != undefined) {
    reportObj["userData"] = data.userData;
    reportObj["canvasOrder"] = data.canvasOrder;
    reportObj["userStreamData"] = data.userStreamData;
  }
  return JSON.stringify(reportObj);
}

function createJsonMyUniverse(data, settings) {
  var reportObj = {};
  reportObj["userData"] = {};
  reportObj["userStreamData"] = {};
  if (data != undefined) {
    if (settings.myUserId != undefined && data.userData != undefined && data.userStreamData != undefined) {
      reportObj["userData"][settings.myUserId] = data.userData[settings.myUserId];
      reportObj["canvasOrder"] = [settings.myUserId];
      reportObj["userStreamData"][settings.myUserId] = data.userStreamData[settings.myUserId];
    }
  }
  return JSON.stringify(reportObj);
}

function sendResponse(htmlReport,jsonReport, jsonUniverse, zip, res, filename) {
  console.log(zip);
  zip.file("htmlReport.html", htmlReport);
  zip.file("ourDataReport.txt", jsonUniverse);
  //zip.file("ourData.json",jsonUniverse);
  zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
  .pipe(fs.createWriteStream(filename+".zip"))
  .on('finish', function () {
    res.download(filename+".zip", function() {
    });
  });
}

function sendGgbResponse(xml, filename, zip, res) {
  filename = (filename) ? filename : "geogebra-default.ggb";
  zip.file("geogebra.xml", xml, 'binary');

  fs.readFileAsync("app/gbcc/geogebra_defaults2d.xml", "utf8").then(function(data) {
    zip.file("geogebra_defaults2d.xml", data, 'binary');
  }).then(function() {  
  fs.readFileAsync("app/gbcc/geogebra_defaults3d.xml", "utf8").then(function(data) {
    zip.file("geogebra_defaults3d.xml", data, 'binary');
  }).then(function() {
  fs.readFileAsync("app/gbcc/geogebra_javascript.js", "utf8").then(function(data) {
    zip.file("geogebra_javascript.js", data, 'binary');
  }).then(function() {
    zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream(filename))
    .on('finish', function () {
      res.download(filename, function() {

      });
    });
  }); }); });
}

function sendGbCCWorldResponse(worldReport, filename, zip, res, socketid) {
  fs.writeFile(filename, worldReport, (err) => {  
      if (err) throw err;
      res.download(filename, function() {
      });
  });
}

module.exports = {
  exportGbccReport: function (data, settings, res) {
    var zip = new JSZip();
    var d = new Date();
    settings.year = d.getFullYear();
    settings.month = d.getMonth()+1;
    settings.date = d.getDate();
    settings.hour = d.getHours();
    settings.minute = d.getMinutes();
    settings.time = d.toString("hh:mm")
    var filename = settings.year+"-"+settings.month+"-"+settings.date+"-"+settings.hour+"-"+settings.minute;
    if (data != undefined) {
      //for (var room in data) {
        for (var user in data.userData) {
          for (var key in data.userData[user] ) { if (key === "exists") { data.userData[user][key]=false; } }
        }
      //}
    }
    sendResponse(createHtmlReport(data, settings), createJsonReport(data, settings), createJsonUniverse(data), zip, res, filename);
  },
  
  exportGgb: function (xml, filename, res) {
    var zip = new JSZip();
    sendGgbResponse(xml, filename, zip, res);
  },
  
  exportGbccUniverse: function (data, settings, filename, res, socketid) {
    var zip = new JSZip();
    sendGbCCWorldResponse(createJsonUniverse(data, settings), filename, zip, res, socketid);
  },
  
  exportGbccMyUniverse: function (data, settings, filename, res, socketid) {
    var zip = new JSZip();
    sendGbCCWorldResponse(createJsonMyUniverse(data, settings), filename, zip, res, socketid);
  }

};
