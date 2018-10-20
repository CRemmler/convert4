var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {path:'/socket.io'});
var express = require('express');
var config = require('./config.json');
var exportworld = require('./app/gbcc/exportworld.js');
var formidable = require('formidable');
var fs = require("node-fs");
var markdown = require("markdown").markdown;
const PORT = process.env.PORT || 3000;
var myTimer;
var schools = {};
var socketDictionary = {};
var JSZip = require("jszip");

 
app.use(express.static(__dirname));

var activityType = config.galleryJs.legacyHubnet ? "hubnet" : "gbcc";

var activityStyle = ((config.interfaceJs.teacherComponents.componentRange[0] === config.interfaceJs.studentComponents.componentRange[0])
  && (config.interfaceJs.teacherComponents.componentRange[1] === config.interfaceJs.studentComponents.componentRange[1])) ?
  "flat" : "hierarchy";
  
app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/:id',function(req,res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  var url = socket.handshake.headers.referer;
  var school = url.substr(url.lastIndexOf("/")+1,url.length);
  socket.school = school;
  
  var rooms = [];
  if (schools[school] === undefined) {
    schools[school] = {};
  } 
  var allRooms = schools[school];
	
  for (var key in allRooms) { rooms.push(key); }
  socket.emit("display interface", {userType: "login", rooms: rooms, components: config.interfaceJs.loginComponents, activityType: activityType });
  socket.join("login");

  function disableTimer() {
    clearInterval(myTimer);
  }

  // user enters room
  socket.on("enter room", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myUserType, myUserId, teacherId;
    socket.leave("login");
    if (data.room === "admin") {
      socket.emit("display admin", {roomData: getAdminData(allRooms, school)});
    } else {
      // declare myRoom
      socket.myRoom = data.room;
      var myRoom = socket.myRoom;
      if (!allRooms[myRoom]) {
        allRooms[myRoom] = {};
        allRooms[myRoom].userData = {};
        allRooms[myRoom].userStreamData = {};
        allRooms[myRoom].canvasOrder = [];
        allRooms[myRoom].settings = {};
        allRooms[myRoom].settings.view = true;
        allRooms[myRoom].settings.gallery = true;
        allRooms[myRoom].settings.tabs = true;
        allRooms[myRoom].settings.mirror = true;
        allRooms[myRoom].settings.teacherId = "";
        allRooms[myRoom].settings.adoptCanvasDict = {};
      }
      // declare myUserType, first user in is a teacher, rest are students
      socket.myUserType = (countUsers(myRoom, school) === 0) ? "teacher" : "student";
      myUserType = socket.myUserType;
      // declare myUserId
      myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
      if (myUserType === "teacher") { allRooms[myRoom].settings.teacherId = myUserId; }
      teacherId = allRooms[myRoom].settings.teacherId;
      socketDictionary[socket.id] = myUserId;
      allRooms[myRoom].userData[myUserId] = {};
      allRooms[myRoom].userStreamData[myUserId] = {};
      //allRooms[myRoom].userData[myUserId].exists = true;
      allRooms[myRoom].userData[myUserId]["userType"] = myUserType;
      allRooms[myRoom].userData[myUserId].reserved = {};
      allRooms[myRoom].userData[myUserId].reserved.claimed = true;
      allRooms[myRoom].userData[myUserId].reserved.exists = true;
      allRooms[myRoom].userData[myUserId].reserved.overrides = {};

      socket.emit("save settings", {userType: myUserType, userId: myUserId, gallerySettings: config.galleryJs, myRoom: myRoom, school: school, teacherId: teacherId});

      if (activityType === "hubnet") {
          socket.to(school+"-"+myRoom+"-teacher").emit("teacher accepts new entry request", {"userId": myUserId }); 
          socket.to(school+"-"+myRoom+"-student").emit("student accepts UI change", {userId: myUserId, type: 'view', display: allRooms[myRoom].settings.view });
      } else if (activityType === "gbcc") {
          socket.emit("student accepts UI change", {userId: myUserId, type: 'tabs', display: allRooms[myRoom].settings.tabs });
          socket.emit("student accepts UI change", {userId: myUserId, type: 'gallery', display: allRooms[myRoom].settings.gallery });
          socket.emit("student accepts UI change", {userId: myUserId, type: 'view', display: allRooms[myRoom].settings.view });
          allRooms[myRoom].settings.adoptCanvasDict[myUserId] = undefined;
      }
    
      // join myRoom
      socket.join(school+"-"+myRoom+"-"+myUserType);
      // tell teacher or student to display their interface
      if (myUserType === "teacher") {
        // send the teacher a teacher interface
        socket.emit("display interface", {userType: "teacher", room: myRoom, components: config.interfaceJs.teacherComponents});
        //send to all students on intro page
        rooms = [];
        for (var key in allRooms) { rooms.push(key); }
        socket.to("login").emit("display interface", {userType: "login", rooms: rooms, components: config.interfaceJs.loginComponents, activityType: activityType});
        socket.emit("gbcc user enters", {userId: myUserId, userData: allRooms[myRoom].userData[myUserId], userType: myUserType });
      } else {
        if (activityStyle === "flat") {
          socket.emit("display interface", {userType: "flat student", room: myRoom, components: config.interfaceJs.teacherComponents});
        } else {
          if (activityType === "hubnet") {
            socket.emit("display interface", {userType: "hierarchy hubnet student", room: myRoom, components: config.interfaceJs.studentComponents, gallery: config.galleryJs});
          } else {
            socket.emit("display interface", {userType: "hierarchy gbcc student", room: myRoom, components: config.interfaceJs.studentComponents, gallery: config.galleryJs});          
          }
        }
        if (activityType === "hubnet") {
          socket.to(school+"-"+myRoom+"-teacher").emit("execute command", {hubnetMessageSource: myUserId, hubnetMessageTag: "hubnet-enter-message", hubnetMessage: ""});
        } else {
          // it's gbcc, so send student a teacher interface
          var dataObject;
          if (allRooms[myRoom].userData != {}) {
            for (var user in allRooms[myRoom].userData) {
              if (user != myUserId) {
                socket.emit("gbcc user enters", {userId: user, userData: allRooms[myRoom].userData[user], userType: allRooms[myRoom].userData[user]["userType"] });
              }
            }
            var canvases;
            for (var j=0; j < allRooms[myRoom].canvasOrder.length; j++) {
              canvases = allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["canvas"];
              if (canvases != undefined) {
                for (var canvas in canvases) {
                  dataObject = {
                    hubnetMessageSource: allRooms[myRoom].canvasOrder[j],
                    hubnetMessageTag: canvas,
                    hubnetMessage: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["canvas"][canvas],
                    userId: myUserId,
                    activityType: activityType,
                    userType: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["userType"],
                    //claimed: (allRooms[myRoom].settings.adoptCanvasDict[myUserId] != undefined)
                    claimed: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]].reserved.claimed
                  };  
                  socket.emit("display canvas reporter", dataObject);
                }
              }
            }
          }
          socket.emit("gbcc user enters", {userId: myUserId, userData: allRooms[myRoom].userData[myUserId], userType: myUserType});
          socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user enters", {userId: myUserId, userData: allRooms[myRoom].userData[myUserId], userType: myUserType });
          socket.to(school+"-"+myRoom+"-student").emit("gbcc user enters", {userId: myUserId, userData: allRooms[myRoom].userData[myUserId], userType: myUserType });
        }
      }
    }
    schools[school] = allRooms;
	});
  
  socket.on("request user broadcast data", function() {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var canvases;
    if (allRooms[myRoom] != undefined) {
      for (var j=0; j < allRooms[myRoom].canvasOrder.length; j++) {
        canvases = allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["canvas"];
        if (canvases != undefined) {
          for (var canvas in canvases) {
            dataObject = {
              hubnetMessageSource: allRooms[myRoom].canvasOrder[j],
              hubnetMessageTag: canvas,
              hubnetMessage: canvases[canvas],
              userId: myUserId,
              activityType: activityType,
              userType: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["userType"]
            };  
            socket.emit("display canvas reporter", dataObject);
          }
        }
      }
    }
  });

  // pass command from student to teacher
  socket.on("send command", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom; 
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    socket.to(school+"-"+myRoom+"-teacher").emit("execute command", {
      hubnetMessageSource: myUserId,
      hubnetMessageTag: data.hubnetMessageTag,
      hubnetMessage: data.hubnetMessage
    });
  });

   // pass stream of data from server to student
   socket.on("send stream reporter", function(data) {
     //console.log("send stream reporter");
     var school = socket.school;
     var allRooms = schools[school];
     var myRoom = socket.myRoom;
     var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
     var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
     var destination = data.hubnetMessageSource;
     if (allRooms[myRoom] != undefined) {
       if (allRooms[myRoom].userData[myUserId]) {
         if (destination === "server") {
           allRooms[myRoom].userStreamData[myUserId][data.hubnetMessageTag] = data.hubnetMessage;
           socket.to(school+"-"+myRoom+"-teacher").emit("accept user stream data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
           socket.to(school+"-"+myRoom+"-student").emit("accept user stream data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
           socket.emit("accept user stream data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
         } 
       }
     }
     schools[school] = allRooms;
   });
   
   // pass stream of data from server to student
   socket.on("send mirror reporter", function(data) {
     var school = socket.school;
     var allRooms = schools[school];
     var myRoom = socket.myRoom;
     var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
     var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
     var destination = data.hubnetMessageSource;
     if (allRooms[myRoom] != undefined) {
       if (allRooms[myRoom].userData[myUserId]) {
         if (destination === "server") {
           socket.to(school+"-"+myRoom+"-student").emit("accept user mirror data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
         } 
       }
     }
     schools[school] = allRooms;
   });

   socket.on("send message reporter", function(data) {
     var school = socket.school;
     var allRooms = schools[school];
     var myRoom = socket.myRoom;
     var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
     var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
     var destination = data.hubnetMessageSource;
     if (allRooms[myRoom] != undefined) {
       if (allRooms[myRoom].userData[myUserId]) {
         var dataObject = {
           hubnetMessageSource: myUserId,
           hubnetMessageTag: data.hubnetMessageTag,
           hubnetMessage: data.hubnetMessage,
           userType: myUserType
         };
         if (destination === "all-users") {
           dataObject.hubnetMessage = data.hubnetMessage;
           socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user message", dataObject);
           socket.to(school+"-"+myRoom+"-student").emit("gbcc user message", dataObject);
           socket.emit("gbcc user message", dataObject);
         } else {
           io.to(getDestination(destination, allRooms[myRoom].settings.adoptCanvasDict)).emit("gbcc user message", dataObject); 
         }
       }
     }
   });

  // pass reporter from server to student
  socket.on("send reporter", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
    var destination = data.hubnetMessageSource;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId]) {
        if (destination === "server") {
          allRooms[myRoom].userData[myUserId][data.hubnetMessageTag] = data.hubnetMessage;
          socket.to(school+"-"+myRoom+"-teacher").emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
          socket.to(school+"-"+myRoom+"-student").emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
          socket.emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
        } else {
          var dataObject = {
            hubnetMessageSource: destination,
            hubnetMessageTag: data.hubnetMessageTag,
            hubnetMessage: data.hubnetMessage,
            userId: myUserId,
            activityType: activityType,
            userType: myUserType
          };
          if (destination === "all-users"){
            dataObject.hubnetMessage = data.hubnetMessage;
            socket.to(school+"-"+myRoom+"-teacher").emit("display reporter", dataObject);
            socket.to(school+"-"+myRoom+"-student").emit("display reporter", dataObject);
            socket.emit("display reporter", dataObject);
          } else {
            io.to(getDestination(destination, allRooms[myRoom].settings.adoptCanvasDict)).emit("display reporter", dataObject); 
          }
        }
      }
    }
    schools[school] = allRooms;
  });

  socket.on("send canvas reporter", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
    var destination = data.hubnetMessageSource;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId]) {
        if (allRooms[myRoom].userData[myUserId]["canvas"] === undefined) {
          allRooms[myRoom].canvasOrder.push(myUserId);
          allRooms[myRoom].userData[myUserId]["canvas"] = {};
        }
        if (data.hubnetMessageTag === "canvas-text") {
          data.hubnetMessage = markdown.toHTML(data.hubnetMessage);
        }
        var dataObject = {
          hubnetMessageSource: myUserId,
          hubnetMessageTag: data.hubnetMessageTag,
          hubnetMessage: data.hubnetMessage,
          userId: myUserId,
          activityType: activityType,
          userType: myUserType,
          claimed: allRooms[myRoom].userData[myUserId].reserved.claimed 
        };
          if (data.hubnetMessageTag === "canvas-clear-all") {
            allRooms[myRoom].userData[myUserId]["canvas"] = {};
          } else if (data.hubnetMessageTag === "canvas-clear") {
            if (allRooms[myRoom].userData[myUserId]["canvas"][data.hubnetMessage]) {
              allRooms[myRoom].userData[myUserId]["canvas"][data.hubnetMessage] = {};
            }
          } else {  // plot, view or avatar
            allRooms[myRoom].userData[myUserId]["canvas"][data.hubnetMessageTag] = data.hubnetMessage;
          }

        dataObject.hubnetMessage = data.hubnetMessage;
        socket.to(school+"-"+myRoom+"-teacher").emit("display canvas reporter", dataObject);
        socket.to(school+"-"+myRoom+"-student").emit("display canvas reporter", dataObject);
        socket.emit("display canvas reporter", dataObject);
      }
    }
    schools[school] = allRooms;
  });
  
  socket.on("send override", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId]) {
        var destination = data.hubnetMessageSource;
        var dataObject = {
          messageType: data.hubnetMessageType,
          agents: data.hubnetAgentOrSet,
          source: destination,
          tag: data.hubnetMessageTag,
          message: data.hubnetMessage
        }
        //console.log("sending to "+getDestination(destination, allRooms[myRoom].settings.adoptCanvasDict));
        io.to(getDestination(destination, allRooms[myRoom].settings.adoptCanvasDict)).emit("accept user override", dataObject); 
      }
    }
  });
  
  
  function getRecipient(destination, adoptCanvasDict) {
    var destination = socketDictionary[destination];
    var adoptees = adoptCanvasDict;
    for (adoptee in adoptees) {
      if (adoptees[adoptee] === destination) {
        return adoptee;
      }
    }
    return destination;
  }
  
  function getDestination(recipient, adoptCanvasDict) {
    //console.log("my socket id is "+recipient);
    if (adoptCanvasDict[recipient]) { 
      return getSocketId(adoptCanvasDict[recipient]);
    }
    var adoptees = adoptCanvasDict;
    for (adoptee in adoptees) {
      if (adoptees[adoptee] === recipient) {
        return getSocketId(adoptee);
      }
    }
    return getSocketId(recipient);
  }
  
  function getSocketId(destination) {
    for (id in socketDictionary) {
      if (socketDictionary[id] === destination) {
        return id;
      }
    }
    return destination;
  }
  
  socket.on("send canvas override", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;    
    var adoptedCanvas = undefined;
    var hubnetMessageTag = data.hubnetMessageTag;
    var hubnetMessage = undefined;
    var sendResponse = false;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId]) {
        if (hubnetMessageTag === "adopt-canvas") {
          var assignUserId = data.hubnetMessage.userId;
          var assignCanvasNumber = data.hubnetMessage.canvasId;
          var assignCanvasId = allRooms[myRoom].canvasOrder[assignCanvasNumber] ? allRooms[myRoom].canvasOrder[assignCanvasNumber] : -1;
          var adoptedCanvas = allRooms[myRoom].settings.adoptCanvasDict[assignCanvasId];
          if (allRooms[myRoom].userData[assignUserId] && allRooms[myRoom].userData[assignCanvasId]
            && allRooms[myRoom].userData[assignCanvasId].reserved
            && allRooms[myRoom].userData[assignCanvasId].reserved.claimed === false) {
            sendResponse = true;
            allRooms[myRoom].settings.adoptCanvasDict[assignUserId] = undefined;
            allRooms[myRoom].settings.adoptCanvasDict[assignCanvasId] = socketDictionary[socket.id];//assignUserId;
            allRooms[myRoom].userData[assignUserId].reserved.claimed = false; 
            allRooms[myRoom].userData[assignCanvasId].reserved.claimed = true;  
            hubnetMessage = { adoptedUserId: assignCanvasId,
                              originalUserId: assignUserId }
          }
        } else if (hubnetMessageTag === "clone-canvas") {
          if (allRooms[myRoom].userData[myUserId] && allRooms[myRoom].userData[myUserId]) {
            var newUserId = createUid();
            allRooms[myRoom].userData[newUserId] = allRooms[myRoom].userData[myUserId];
            allRooms[myRoom].userStreamData[newUserId] = allRooms[myRoom].userStreamData[myUserId];
            allRooms[myRoom].canvasOrder.push(newUserId);
            if (allRooms[myRoom].userData[newUserId].reserved) {
              allRooms[myRoom].userData[newUserId].reserved.claimed = false;
              allRooms[myRoom].userData[newUserId].reserved.exists = false;  
            }
            socket.emit("gbcc user enters", {userId: newUserId, userData: allRooms[myRoom].userData[newUserId], userType: myUserType});
            socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user enters", {userId: newUserId, userData: allRooms[myRoom].userData[newUserId], userType: myUserType});
            socket.to(school+"-"+myRoom+"-student").emit("gbcc user enters", {userId: newUserId, userData: allRooms[myRoom].userData[newUserId], userType: myUserType});
            canvases = allRooms[myRoom].userData[newUserId]["canvas"];
            if (canvases != undefined) {
              for (var canvas in canvases) {
                dataObject = {
                  hubnetMessageSource: newUserId,
                  hubnetMessageTag: canvas,
                  hubnetMessage: allRooms[myRoom].userData[newUserId]["canvas"][canvas],
                  userId: "",
                  activityType: activityType,
                  userType: myUserType,
                  claimed: false //newUserData[newCanvasOrder[j]].reserved.claimed
                };  
                socket.emit("display canvas reporter", dataObject);
                socket.to(school+"-"+myRoom+"-teacher").emit("display canvas reporter", dataObject);
                socket.to(school+"-"+myRoom+"-student").emit("display canvas reporter", dataObject);
              }
            }
          }
        }
        if (sendResponse) {
          var dataObject = {
            hubnetMessageTag: hubnetMessageTag,
            hubnetMessage: hubnetMessage
          };
          socket.to(school+"-"+myRoom+"-teacher").emit("accept canvas override", dataObject);
          socket.to(school+"-"+myRoom+"-student").emit("accept canvas override", dataObject);
          socket.emit("accept canvas override", dataObject);
        }
      }
    }
  });

  app.post('/exportgbccreport', function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var myRoom = fields.roomname;
      var mySchool = fields.schoolname;
      var allRooms = schools[mySchool];
      var settings = {schoolName: mySchool};
      exportworld.exportGbccReport(allRooms, settings, res);
    });
  });
  
  /*
  app.post('/exportggb', function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var xml = fields.ggbxml;
      var filename = fields.ggbfilename;
      exportworld.exportGgb(xml, filename, res);
    });
  });*/
  
  app.post('/exportgbccform', function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var filetype = fields.exportgbcctype || "";
      var xml = fields.ggbxml || "";
      var myRoom = fields.gbccroomname || "";
      var mySchool = fields.gbccschoolname || "";
      var allRooms = schools[mySchool];
      var settings = {schoolName: mySchool, myUserId: getSocketId(fields.gbccmyuserid) || ""};
      var filename = fields.exportgbccfilename || "";
      try {
        if (filetype === "ggb") {
          exportworld.exportGgb(xml, filename, res);  
        } else if (filetype === "universe") {
          exportworld.exportGbccUniverse(allRooms[myRoom], settings, filename, res, socket.id);
        } else if (filetype === "my-universe") {
          exportworld.exportGbccMyUniverse(allRooms[myRoom], settings, filename, res, socket.id);
        } 
      } catch (ex) {
      }
    });
  });
  
  app.post('/importgbccform', function(req,res){
    var filename;
    new formidable.IncomingForm().parse(req)
      .on('file', function(socketid, file) {
        filename = socketid + "-" + file.name;
          fs.rename(file.path, filename, function() {
            var dataObject = {
              filetype: req.query.filetype,//filetype, // "universe", "world"
              filename: filename,
              filepath: file.path
            };
            io.to(socketid).emit("trigger file import", dataObject); 
          });
      })
      .on('end', function() {
        res.end('success '+filename);
      });
  });
  
  socket.on("delete file", function(data) {
    deleteFile(data.filename);
  });
  
  socket.on("unzip gbcc universe", function(data) {
    var myRoom = data.roomName;
    var filepathlocal = __dirname + data.filename;
    var filepath = data.filepath;
    var filename = data.filename;
    var scope = data.scope;
    fs.readFile( filename, function(err, data){
      if (!err && filename) {
        console.log("unzip "+filename);
        setupUniverse(data, myRoom, filename, scope);
      } else {
        fs.readFile(filepathlocal, function(err, data2){
          if (!err && filepathlocal) {
            console.log("unzip "+filepathlocal);
            setupUniverse(data2, myRoom, filepathlocal, scope);
          } else {
            console.log(filepath);
            fs.readFile( filepath, function(err, data3) {
              if (!err && filepath) {
                console.log("unzip "+filepath);
                setupUniverse(data3, myRoom, filepath, scope);
              } 
            });          
          }
        });
      }
    });
  });

  function setupUniverse(data, myRoom, zipFileName, scope) {
    console.log("setup univ");
    var newUserData, newCanvasOrder, newUserStreamData;
    var dataObject;
    var zip = new JSZip();
    JSZip.loadAsync(data).then(function(zip){
      for (filename in zip.files) {
        try {
          zip.files[filename].async("string").then(function(contentString) {
            try {
              content = JSON.parse(contentString);
              newUserData = content.userData ? content.userData : {};
              newCanvasOrder = content.canvasOrder ? content.canvasOrder : [];
              newUserStreamData = content.userStreamData ? content.userStreamData : {};
              var scopeAllowed = true;
              if (scope === "my-universe" && Object.keys(newUserData).length > 1 ) { scopeAllowed = false; }
              
              if (allRooms[myRoom].userData != {} && scopeAllowed) {
                for (var user in newUserData) {
                  if (newUserData[user].reserved) {
                    newUserData[user].reserved.claimed = false;
                    newUserData[user].reserved.exists = true;
                  }
                  socket.emit("gbcc user enters", {userId: user, userData: newUserData[user], userType: newUserData[user]["userType"] });
                  socket.to(school+"-"+myRoom+"-student").emit("gbcc user enters", {userId: user, userData: newUserData[user], userType: newUserData[user]["userType"] });
                  socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user enters", {userId: user, userData: newUserData[user], userType: newUserData[user]["userType"] });
                }
                var canvases;
                for (var j=0; j < newCanvasOrder.length; j++) {
                  canvases = newUserData[newCanvasOrder[j]]["canvas"];
                  if (canvases != undefined) {
                    for (var canvas in canvases) {
                      dataObject = {
                        hubnetMessageSource: newCanvasOrder[j],
                        hubnetMessageTag: canvas,
                        hubnetMessage: newUserData[newCanvasOrder[j]]["canvas"][canvas],
                        userId: "",
                        activityType: activityType,
                        userType: newUserData[newCanvasOrder[j]]["userType"],
                        claimed: false //newUserData[newCanvasOrder[j]].reserved.claimed
                      };  
                      socket.emit("display canvas reporter", dataObject);
                      socket.to(school+"-"+myRoom+"-student").emit("display canvas reporter", dataObject);
                      socket.to(school+"-"+myRoom+"-teacher").emit("display canvas reporter", dataObject);
                    }
                  }
                }
                for(var user in newUserData) {
                  allRooms[myRoom]["userData"][user] = newUserData[user];
                }
                for(var user in newUserStreamData) {
                  allRooms[myRoom]["userStreamData"][user] = newUserStreamData[user];
                }
                for (var canvas in newCanvasOrder) {
                  allRooms[myRoom].canvasOrder.push(newCanvasOrder[canvas]);
                }
              }
            } catch (err) {
              console.log("caught error transforming contents of universe from string to object")
            }
          });
          deleteFile(filename);
        } catch (err) {
          console.log("caught error unzipping file")
        }
      }
      deleteFile(zipFileName);
    });
  }

  // select, deselect, forever-select, forever-deselect
  socket.on("request user action", function(data) {
    var allRooms = schools[socket.school];
    var myRoom = socket.myRoom;
    var userType = data.userType;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData != undefined) {
        socket.emit("accept user action", {userId: data.userId, status: data.status, userType: userType});
      }
    }
  });

  // pass reporter from student to server
  socket.on("get reporter", function(data) {
    //console.log("get reporter "+ data.hubnetMessageTag);
    var allRooms = schools[socket.school];
    var myRoom = socket.myRoom;
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;    
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[data.hubnetMessageSource]) {
        var dataObject = {
          hubnetMessageSource: data.hubnetMessageSource,
          hubnetMessageTag: data.hubnetMessageTag,
          hubnetMessage: allRooms[myRoom].userData[data.hubnetMessageSource][data.hubnetMessageTag],
          userId: myUserId,
          activityType: activityType,
          userType: myUserType
        };
        socket.emit("display reporter", dataObject);
      }
    }
  });

  // get value from server
  socket.on("get value", function(data) {
    var allRooms = schools[socket.school];
    var myRoom = socket.myRoom;
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    if (data.hubnetMessageSource === "") { data.hubnetMessageSource = myUserId; }
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[data.hubnetMessageSource]) {
        var dataObject = {
          hubnetMessageSource: data.hubnetMessageSource,
          hubnetMessageTag: data.hubnetMessageTag,
          hubnetMessage: allRooms[myRoom].userData[data.hubnetMessageSource][data.hubnetMessageTag],
        };
        socket.emit("display value", dataObject);
      }
    }
  });

  socket.on("admin clear room", function(data) {  
    clearRoom(data.roomName, data.school);
  });
  
  socket.on("teacher requests UI change", function(data) {
    console.log("teaecher requset ui change");
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    if (allRooms[myRoom].settings) {
      allRooms[myRoom].settings[data.type] = data.display; 
      socket.to(school+"-"+myRoom+"-student").emit("student accepts UI change", {"display":data.display, "type":data.type, "state": data.state, "image": data.image});      
      schools[school] = allRooms;
    }
  });
  
  socket.on("teacher requests UI change new entry", function(data) {
    console.log("teaechre  rqusets ui change nw eenetry");
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    allRooms[myRoom].settings[data.type] = data.display; 
    io.to(socketDictionary[data.userId]).emit("student accepts UI change", {"display": allRooms[myRoom].settings["mirror"], "type": "mirror", "state": data.state, "image": data.image});
  });
	
  // user exits
  socket.on('disconnect', function () {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    if (!(allRooms[myRoom] && allRooms[myRoom].settings && allRooms[myRoom].settings.adoptCanvasDict)) {
      return;
    }
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;    
    if (activityType != "hubnet") { 
      if (allRooms[myRoom] != undefined) {
        if (allRooms[myRoom].userData[myUserId] && allRooms[myRoom].userData[myUserId].reserved) {
          allRooms[myRoom].userData[myUserId].reserved.exists = false;
        }
        socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user exits", {userId: myUserId,  userData: allRooms[myRoom].userData[myUserId], userType: myUserType});
        socket.to(school+"-"+myRoom+"-student").emit("gbcc user exits", {userId: myUserId,  userData: allRooms[myRoom].userData[myUserId], userType: myUserType});
      }
    }
    var recipient = myUserId;
    var adoptee = undefined;
    if (allRooms[myRoom] && allRooms[myRoom].settings && allRooms[myRoom].settings.adoptCanvasDict) {
      for (a in allRooms[myRoom].settings.adoptCanvasDict) {
        if (allRooms[myRoom].settings.adoptCanvasDict[a] === recipient) {
          adoptee = a;
        }
      }
    }
    if (allRooms[myRoom] && allRooms[myRoom].settings.adoptCanvasDict) {
      sendResponse = true;
      var dataObject = {
        hubnetMessageTag: "release-canvas",
        hubnetMessage: { adoptedUserId: adoptee,
                        originalUserId: recipient }
      }
      socket.to(school+"-"+myRoom+"-teacher").emit("accept canvas override", dataObject);
      socket.to(school+"-"+myRoom+"-student").emit("accept canvas override", dataObject);
      if (allRooms[myRoom].userData[adoptee] 
        && allRooms[myRoom].userData[adoptee].reserved) {
        allRooms[myRoom].userData[adoptee].reserved.claimed = false;
      } else if (allRooms[myRoom].userData[recipient] 
        && allRooms[myRoom].userData[recipient].reserved) {
        allRooms[myRoom].userData[recipient].reserved.claimed = false;
      } 
    }
    delete socketDictionary[myUserId];
    if (allRooms[myRoom] != undefined) {
      delete allRooms[myRoom].settings.adoptCanvasDict[myUserId];
    }
    if (myUserType === "teacher") {
      if (activityType === "hubnet") {
        clearRoom(myRoom, school);
        disableTimer();
      } else {
        if (countUsers(myRoom, school) === 0) {	delete allRooms[myRoom]; }
      }
    } else {
      if (allRooms[myRoom] != undefined) {
        socket.to(school+"-"+myRoom+"-teacher").emit("execute command", {
          hubnetMessageSource: myUserId,
          hubnetMessageTag: "hubnet-exit-message",
          hubnetMessage: ""
        });
        if (countUsers(myRoom, school) === 0) { delete allRooms[myRoom];}
        if (Object.keys(allRooms).length === 0) { disableTimer();}
      }
    }
    schools[school] = allRooms;
  });
});

http.listen(PORT, function(){
  console.log('listening on ' + PORT );
});

function deleteFile(filename) {
  console.log("delete file");
  setTimeout(function(){ 
    var fullPath= __dirname + '/'+filename;
    try {
      console.log(fullPath);
      fs.unlink(fullPath, function() {
        console.log(fullPath + " deleted");
      });
    } catch (e) {
      console.log(e);
    }
  }, 3000);
}

function clearRoom(roomName, school) {
  var allRooms = schools[school];
  var myRoom = roomName;
  var clientList = [];
  if (allRooms && allRooms[myRoom]) {
    for (var key in allRooms[myRoom].userData) {
      clientList.push(key);
    }
    for (var i=0; i<clientList.length; i++) {
      if (io.sockets.sockets[clientList[i]]) {
        io.to(clientList[i]).emit("display interface", {userType: "disconnected"});
        io.sockets.sockets[clientList[i]].disconnect();
      }
    }
    delete allRooms[myRoom];
    schools[school] = allRooms;
  }
}

function countUsers(roomName, school) {
  var allRooms = schools[school];
  var users = 0;
  if (allRooms[roomName] != undefined) {
    for (var key in allRooms[roomName].userData) {
      if (allRooms[roomName].userData[key].reserved && allRooms[roomName].userData[key].reserved.exists) { users++; }
    }
  }
  return users;
}

function getAdminData(allRooms, school) {
  var displayData = "";
  displayData = displayData + "<hr>Any rooms?";
  for (var roomKey in allRooms) {
    displayData = displayData + "<hr>Which room? " + roomKey;
    displayData = displayData + "<br>How many users?" + (countUsers(roomKey, school));
    displayData = displayData + "<br><button onclick=Interface.clearRoom('"+roomKey+"','"+school+"')>Clear Room</button>";
	}
	return displayData;
}

function createUid() {
  return "U"+Math.pow(10, 18)*Math.random();
}

