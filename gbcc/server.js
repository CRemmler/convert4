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
var schools = {};
var socketDictionary = {};
var JSZip = require("jszip");
var FileReader = require("filereader");
 
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
      // declare myUserType, first user in is a teacher, rest are students
      socket.myUserType = (countUsers(myRoom, school) === 0) ? "teacher" : "student";
      myUserType = socket.myUserType;
      // declare myUserId
      myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
      socketDictionary[socket.id] = myUserId;
      if (!allRooms[myRoom]) {
        allRooms[myRoom] = {};
        allRooms[myRoom].userData = {};
        allRooms[myRoom].userStreamData = {};
        allRooms[myRoom].canvasOrder = [];
        allRooms[myRoom].settings = {};
        allRooms[myRoom].settings.view = true;
        allRooms[myRoom].settings.gallery = true;
        allRooms[myRoom].settings.tabs = true;
        allRooms[myRoom].settings.mirror = (activityType == "hubnet") ? true : false;
        allRooms[myRoom].settings.teacherId = "";
        allRooms[myRoom].settings.adoptCanvasDict = {};
      }
      if (myUserType === "teacher") { allRooms[myRoom].settings.teacherId = myUserId; }
      teacherId = allRooms[myRoom].settings.teacherId;
      //socketDictionary[socket.id] = myUserId;
      allRooms[myRoom].userData[myUserId] = {};
      allRooms[myRoom].userStreamData[myUserId] = {};
      //allRooms[myRoom].userData[myUserId].exists = true;
      allRooms[myRoom].userData[myUserId].reserved = {};
      allRooms[myRoom].userData[myUserId].reserved.userType = myUserType;
      allRooms[myRoom].userData[myUserId].reserved.claimed = true;
      allRooms[myRoom].userData[myUserId].reserved.exists = true;
      allRooms[myRoom].userData[myUserId].reserved.muted = false;
      allRooms[myRoom].userData[myUserId].reserved.overrides = {};

      socket.emit("save settings", {userType: myUserType, userId: myUserId, gallerySettings: config.galleryJs, myRoom: myRoom, school: school, teacherId: teacherId});
      socket.to(school+"-"+myRoom+"-teacher").emit("teacher accepts new entry request", {"userId": myUserId }); 
      if (activityType === "hubnet") {
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
                socket.emit("gbcc user enters", {userId: user, userData: allRooms[myRoom].userData[user], userType: allRooms[myRoom].userData[user].reserved.userType });
              }
            }
            var canvases;
            loadCanvases(school, myRoom, allRooms[myRoom].canvasOrder, allRooms[myRoom].userData, true);
          }
          socket.emit("gbcc user enters", {userId: myUserId, userData: allRooms[myRoom].userData[myUserId], userType: myUserType});
          socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user enters", {userId: myUserId, userData: allRooms[myRoom].userData[myUserId], userType: myUserType });
          socket.to(school+"-"+myRoom+"-student").emit("gbcc user enters", {userId: myUserId, userData: allRooms[myRoom].userData[myUserId], userType: myUserType });
        }
      }
    }
    schools[school] = allRooms;
    //countUsers(myRoom, school);
	});
  
  socket.on("request user broadcast data", function() {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
      return;
    }
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var canvases;
    if (allRooms[myRoom] != undefined) {
      for (var j=0; j < allRooms[myRoom].canvasOrder.length; j++) {
        canvases = allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["canvas"];
        if (canvases != undefined) {
          for (var canvas in canvases) {
            if (allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]].reserved != undefined)  {
              dataObject = {
                hubnetMessageSource: allRooms[myRoom].canvasOrder[j],
                hubnetMessageTag: canvas,
                hubnetMessage: canvases[canvas],
                userId: myUserId,
                activityType: activityType,
                userType: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]].reserved.userType
              };  
              socket.emit("display canvas reporter", dataObject);
            }
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
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
      return;
    }
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
     if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
       return;
     }
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
     if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
       return;
     }
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
     if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
       return;
     }
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
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
      return;
    }
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
    var destination = data.hubnetMessageSource;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId]) {
        if (destination === "server") {
          if (data.hubnetMessageTag != "reserved") {
            allRooms[myRoom].userData[myUserId][data.hubnetMessageTag] = data.hubnetMessage;
            socket.to(school+"-"+myRoom+"-teacher").emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
            socket.to(school+"-"+myRoom+"-student").emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
            socket.emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
          }
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
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
      return;
    }
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    if (!(allRooms[myRoom].userData[myUserId] != undefined)) { return; }
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
    var destination = data.hubnetMessageSource;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId] && allRooms[myRoom].userData[myUserId] && allRooms[myRoom].userData[myUserId].reserved != undefined) {
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
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
      return;
    }
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;
    if (allRooms[myRoom].userData[myUserId]) {
      var destination = data.hubnetMessageSource;
      var dataObject = {
        messageType: data.hubnetMessageType,
        agents: data.hubnetAgentOrSet,
        source: destination,
        tag: data.hubnetMessageTag,
        message: data.hubnetMessage
      }
      io.to(getDestination(destination, allRooms[myRoom].settings.adoptCanvasDict)).emit("accept user override", dataObject); 
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
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
      return;
    }
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    if (!(allRooms[myRoom].userData[myUserId] != undefined)) { return; }  
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;    
    var adoptedCanvas = undefined;
    var hubnetMessageTag = data.hubnetMessageTag;
    var hubnetMessage = undefined;
    var sendResponse = false;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId] && allRooms[myRoom].userData[myUserId].reserved != undefined) {
        var assignUserId = data.hubnetMessage.userId;
        var assignCanvasNumber = data.hubnetMessage.canvasId;
        var assignCanvasId = allRooms[myRoom].canvasOrder[assignCanvasNumber] ? allRooms[myRoom].canvasOrder[assignCanvasNumber] : -1;
        var adoptedCanvas = allRooms[myRoom].settings.adoptCanvasDict[assignCanvasId];
        if (hubnetMessageTag === "adopt-canvas") {
          if (allRooms[myRoom].userData[assignUserId] && allRooms[myRoom].userData[assignCanvasId]
            && allRooms[myRoom].userData[assignCanvasId].reserved
            && allRooms[myRoom].userData[assignCanvasId].reserved.claimed === false) {
            sendResponse = true;
            allRooms[myRoom].settings.adoptCanvasDict[assignUserId] = undefined;
            allRooms[myRoom].settings.adoptCanvasDict[assignCanvasId] = socketDictionary[socket.id];//assignUserId;
            allRooms[myRoom].userData[assignUserId].reserved.claimed = false; 
            allRooms[myRoom].userData[assignUserId].reserved.exists = false;
            allRooms[myRoom].userData[assignCanvasId].reserved.claimed = true; 
            allRooms[myRoom].userData[assignCanvasId].reserved.exists = true;   
            hubnetMessage = { adoptedUserId: assignCanvasId,
                              originalUserId: assignUserId }
          }
        } else if (hubnetMessageTag === "mute-canvas") {
          if (allRooms[myRoom].userData[assignCanvasId]
            && allRooms[myRoom].userData[assignCanvasId].reserved) {
            sendResponse = true;
            allRooms[myRoom].userData[assignCanvasId].reserved.muted = true; 
            hubnetMessage = { 
               adoptedUserId: assignCanvasId,
               canvasId: data.hubnetMessage.canvasId }
          }
        } else if (hubnetMessageTag === "unmute-canvas") {
          if (allRooms[myRoom].userData[assignCanvasId]
            && allRooms[myRoom].userData[assignCanvasId].reserved) {
            sendResponse = true;
            allRooms[myRoom].userData[assignCanvasId].reserved.muted = false; 
            hubnetMessage = { 
               adoptedUserId: assignCanvasId,
               canvasId: data.hubnetMessage.canvasId }
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
      exportworld.exportGbccReport(allRooms[myRoom], settings, res);
    });
  });
  
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
    var scope = req.query.filetype;
    var myRoom = req.query.myroom;
    new formidable.IncomingForm().parse(req)
    .on('file', function(socketid, file) {
      var reader = new FileReader();
      reader.onerror = function(event) {
        reader.abort();
      };
      if (scope == "universe" || scope === "my-universe") {
        //reader.readAsArrayBuffer(file);
        reader.readAsText(file);
        reader.onload = function (evt) {
          setupUniverse(evt.target.result, scope, myRoom);
        };
      } else if (scope === "ggb") {
        reader.readAsBinaryString(file);
        reader.onload = function (evt) {
          JSZip.loadAsync(evt.target.result).then(function(zip){
            for (filename in zip.files) {
              if (filename  === "geogebra.xml") {
                zip.files[filename].async("string").then(function(data) {
                  var dataObject = {
                    filetype: scope,
                    xml: data
                  };
                  io.to(socketid).emit("trigger file import", dataObject); 
                }, function (e) { console.log(e); });
              }
            } 
          }, function (e) { console.log(e); });
        }
      } 
    })
    .on('end', function() {
      res.end('success');
    });
  });
  
  function setupUniverse(contentString, scope, myRoom) {
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
            newUserData[user].reserved.exists = false;
            socket.emit("gbcc user enters", {userId: user, userData: newUserData[user], userType: newUserData[user].reserved.userType });
            socket.to(school+"-"+myRoom+"-student").emit("gbcc user enters", {userId: user, userData: newUserData[user], userType: newUserData[user].reserved.userType });
            socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user enters", {userId: user, userData: newUserData[user], userType: newUserData[user].reserved.userType });
          }
        }
        loadCanvases(school, myRoom, newCanvasOrder, newUserData, false);
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
  }
  
  function loadCanvases(school, myRoom, canvasOrder, userData, preserveClaimStatus) {
    var canvases, claimed;
    for (var j=0; j < canvasOrder.length; j++) {
      canvases = userData[canvasOrder[j]]["canvas"];
      claimed = preserveClaimStatus ? userData[canvasOrder[j]].reserved.claimed : false;
      if (canvases != undefined  && typeof canvases === "object") {
        if (Object.keys(canvases).length === 0 ) {
          var dataObject = {
            hubnetMessageSource: canvasOrder[j],
            hubnetMessageTag: "canvas-clear-all",
            hubnetMessage: "canvas-clear-all",
            userType: userData[canvasOrder[j]].reserved.userType,
            claimed: claimed
          };
          socket.to(school+"-"+myRoom+"-teacher").emit("display canvas reporter", dataObject);
          socket.to(school+"-"+myRoom+"-student").emit("display canvas reporter", dataObject);
          socket.emit("display canvas reporter", dataObject);
        } else {
          for (var canvas in canvases) {
            if (userData[canvasOrder[j]].reserved != undefined) {
              dataObject = {
                hubnetMessageSource: canvasOrder[j],
                hubnetMessageTag: canvas,
                hubnetMessage: userData[canvasOrder[j]]["canvas"][canvas],
                userType: userData[canvasOrder[j]].reserved.userType,
                claimed: claimed
              };  
              socket.emit("display canvas reporter", dataObject);
              socket.to(school+"-"+myRoom+"-student").emit("display canvas reporter", dataObject);
              socket.to(school+"-"+myRoom+"-teacher").emit("display canvas reporter", dataObject);
            }
          }
        }
      }
    }
  }
  
  socket.on("unzip gbcc universe", function(data) {
    var myRoom = data.roomName;
    var filepathlocal = __dirname + data.filename;
    var filepath = data.filepath;
    var filename = data.filename;
    var scope = data.scope;
    fs.readFile( filename, function(err, data){
      loadUniverse(data, myRoom, filename, scope);
    });
  });

  function loadUniverse(data, myRoom, zipFileName, scope) {
    var newUserData, newCanvasOrder, newUserStreamData;
    var dataObject;
    var zip = new JSZip();
    JSZip.loadAsync(data).then( function(zip) {
      for (filename in zip.files) {
        zip.files[filename].async("string").then(function(contentString) {
          setupUniverse(contentString, scope, myRoom);
        }, function (e) { console.log(e); });  
      }
    }, function (e) { console.log(e); });
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
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
      return;
    }
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
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined && allRooms[myRoom].settings.adoptCanvasDict != undefined)) {
      return;
    }
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
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined)) {
      return;
    }
    allRooms[myRoom].settings[data.type] = data.display; 
    socket.to(school+"-"+myRoom+"-student").emit("student accepts UI change", {"display":data.display, "type":data.type, "state": data.state, "image": data.image});      
    schools[school] = allRooms;
  });
  
  socket.on("teacher requests UI change new entry", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined)) {
      return;
    }
    allRooms[myRoom].settings[data.type] = data.display; 
    var myUserId = getSocketId(data.userId);
    io.to(myUserId).emit("student accepts UI change", {"display": allRooms[myRoom].settings["mirror"], "type": "mirror", "state": data.state, "image": data.image});
  });
  
  socket.on("student triggers state request", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined)) {
      return;
    }
    allRooms[myRoom].settings[data.type] = data.display; 
    var userId = getSocketId(data.targetUserId);
    io.to(userId).emit("student accepts state request", {userId: data.requestUserId});
  });
  
  socket.on("student replies state request", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    if (!(allRooms[myRoom] != undefined && allRooms[myRoom].settings != undefined)) {
      return;
    }
    allRooms[myRoom].settings[data.type] = data.display; 
    var myUserId = getSocketId(data.userId);
    io.to(myUserId).emit("student accepts state change", {state: data.state});
  });
	
  // user exits
  socket.on('disconnect', function () {
    //console.log("disconnect");
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;

    if (!(allRooms[myRoom] != undefined 
      && allRooms[myRoom].settings != undefined 
      && allRooms[myRoom].settings.adoptCanvasDict != undefined 
      && allRooms[myRoom].userData != undefined)) {
      return;
    }
    var myUserId = getRecipient(socket.id, allRooms[myRoom].settings.adoptCanvasDict);
    if (!(allRooms[myRoom].userData[myUserId] != undefined)) { return; }
    var myUserType = (myUserId === allRooms[myRoom].settings.teacherId) ? "teacher" : "student"; //socket.myUserType;    
    if (activityType != "hubnet") { 
      if (allRooms[myRoom].userData[myUserId].reserved != undefined) {
        if (allRooms[myRoom].userData[myUserId] && allRooms[myRoom].userData[myUserId].reserved) {
          allRooms[myRoom].userData[myUserId].reserved.exists = false;
        }
        socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user exits", {userId: myUserId,  userData: allRooms[myRoom].userData[myUserId], userType: myUserType});
        socket.to(school+"-"+myRoom+"-student").emit("gbcc user exits", {userId: myUserId,  userData: allRooms[myRoom].userData[myUserId], userType: myUserType});
      }
    }
    var recipient = myUserId;
    var adoptee = undefined;
    for (a in allRooms[myRoom].settings.adoptCanvasDict) {
      if (allRooms[myRoom].settings.adoptCanvasDict[a] === recipient) {
        adoptee = a;
      }
    }
    sendResponse = true;
    var dataObject = {
      hubnetMessageTag: "release-canvas",
      hubnetMessage: { adoptedUserId: adoptee,
                      originalUserId: recipient }
    }
    socket.to(school+"-"+myRoom+"-teacher").emit("accept canvas override", dataObject);
    socket.to(school+"-"+myRoom+"-student").emit("accept canvas override", dataObject);
    if (allRooms[myRoom].userData[adoptee] != undefined 
      && allRooms[myRoom].userData[adoptee].reserved != undefined) {
      allRooms[myRoom].userData[adoptee].reserved.claimed = false;
    } else if (allRooms[myRoom].userData[recipient] != undefined 
      && allRooms[myRoom].userData[recipient].reserved != undefined) {
      allRooms[myRoom].userData[recipient].reserved.claimed = false;
    } 
    delete socketDictionary[myUserId];
    if (allRooms[myRoom].settings.adoptCanvasDict != undefined
      && allRooms[myRoom].settings.adoptCanvasDict[myUserId] != undefined) {
      delete allRooms[myRoom].settings.adoptCanvasDict[myUserId];
    }
    if (myUserType === "teacher") {
      if (activityType === "hubnet") {
        clearRoom(myRoom, school);
      } else {
        if (countUsers(myRoom, school) === 0) {	
          io.to("login").emit("display interface", {userType: "remove login", room: myRoom});
          delete allRooms[myRoom]; 
        }
      }
    } else {
      if (allRooms[myRoom] != undefined) {
        socket.to(school+"-"+myRoom+"-teacher").emit("execute command", {
          hubnetMessageSource: myUserId,
          hubnetMessageTag: "hubnet-exit-message",
          hubnetMessage: ""
        });
        if (countUsers(myRoom, school) === 0) {
          delete allRooms[myRoom];
        }
      }
    }
    schools[school] = allRooms;
  });
});

http.listen(PORT, function(){
  console.log('listening on ' + PORT );
});

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
        //socket.to("login").emit("display interface", {userType: "login", rooms: rooms, components: config.interfaceJs.loginComponents, activityType: null));
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
      if (allRooms[roomName].userData[key].reserved != undefined 
        && allRooms[roomName].userData[key].reserved.exists == false) { 
          // user does not exist
      } else { 
        // user does exist, or reserved is undefined
        users++; 
      }
    }
  }
  //console.log("number of users "+users);
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

