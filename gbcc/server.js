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

  function enableTimer() {
    //console.log("enable");
    var myTimer = setInterval(function() {
      for (var school in schools) {
        allRooms = schools[school];
        for (var key in allRooms) {
          if (socket && allRooms[key].settings && allRooms[key].settings.displayView) {
            socket.to(school+"-"+key+"-student").emit("send update", {turtles: allRooms[key].turtles, patches: allRooms[key].patches});
          }
        }
      }
    }, 250);
  }

  function disableTimer() {
    clearInterval(myTimer);
  }

  // user enters room
  socket.on("enter room", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myUserType, myUserId;
    socket.leave("login");
    if (data.room === "admin") {
      socket.emit("display admin", {roomData: getAdminData(allRooms, school)});
    } else {
      // if user is first to enter a room, and only one room exists, then enable the timer
      if (Object.keys(allRooms).length === 0) {
        if (activityType === "hubnet")
        { enableTimer(); }
      }
      // declare myRoom
      socket.myRoom = data.room;
      var myRoom = socket.myRoom;
      if (!allRooms[myRoom]) {
        allRooms[myRoom] = {};
        allRooms[myRoom].turtles = {};
        allRooms[myRoom].patches = {};
        allRooms[myRoom].userData = {};
        allRooms[myRoom].userStreamData = {};
        allRooms[myRoom].canvasOrder = [];
        allRooms[myRoom].settings = {};
      }
      // declare myUserType, first user in is a teacher, rest are students
      socket.myUserType = (countUsers(myRoom, school) === 0) ? "teacher" : "student";
      myUserType = socket.myUserType;
      // declare myUserId
      myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');;
      allRooms[myRoom].userData[myUserId] = {};
      allRooms[myRoom].userStreamData[myUserId] = {};
      allRooms[myRoom].userData[myUserId].exists = true;
      allRooms[myRoom].userData[myUserId]["userType"] = myUserType;
      // send settings to client
      socket.emit("save settings", {userType: myUserType, userId: myUserId, gallerySettings: config.galleryJs, myRoom: myRoom, school: school});
      if (activityType != "hubnet") { 
        socket.emit("gbcc user enters", {userId: myUserId, userType: myUserType});
        socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user enters", {userId: myUserId, userType: myUserType });
        socket.to(school+"-"+myRoom+"-student").emit("gbcc user enters", {userId: myUserId, userType: myUserType });
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
        if (activityType === "hubnet") { 
          allRooms[myRoom].settings.displayView = false;
          allRooms[myRoom].settings.mirrorView = false;
        }
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
          // send student a student interface
          //socket.emit("display interface", {userType: "hubnet student", room: myRoom, components: config.interfaceJs.studentComponents, gallery: config.galleryJs});
          // send teacher a hubnet-enter-message
          socket.to(school+"-"+myRoom+"-teacher").emit("execute command", {hubnetMessageSource: myUserId, hubnetMessageTag: "hubnet-enter-message", hubnetMessage: ""});
          //socket.emit("display my view", {"display":allRooms[myRoom].settings.displayView});
          socket.emit("student accepts UI change", {"display":allRooms[myRoom].settings.mirrorView, "type":"mirror"});
          socket.emit("student accepts UI change", {"display":allRooms[myRoom].settings.displayView, "type":"view"});
        } else {
          // it's gbcc, so send student a teacher interface
          //socket.emit("display interface", {userType: "gbcc student", room: myRoom, components: config.interfaceJs.teacherComponents});
          var dataObject;
          if (allRooms[myRoom].userData != {}) {
            //console.log("user enters "+myUserId);
            for (var user in allRooms[myRoom].userData) {
              //console.log("loop through "+user);
              if (user != myUserId) {
                //console.log("user enters!!!");
                socket.emit("gbcc user enters", {userId: user, userData: allRooms[myRoom].userData[user], userType: allRooms[myRoom].userData[user]["userType"] });
              }
            }
            
            var canvases;
            for (var j=0; j < allRooms[myRoom].canvasOrder.length; j++) {
              //console.log(j+" "+allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["userType"]);
              //socket.emit("gbcc user enters", {userId: allRooms[myRoom].canvasOrder[j], userData: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]], userType: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["userType"] });
              canvases = allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["canvas"];
              if (canvases != undefined) {
                for (var canvas in canvases) {
                  dataObject = {
                    hubnetMessageSource: allRooms[myRoom].canvasOrder[j],
                    hubnetMessageTag: canvas,
                    hubnetMessage: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["canvas"][canvas],
                    userId: myUserId,
                    activityType: activityType,
                    userType: allRooms[myRoom].userData[allRooms[myRoom].canvasOrder[j]]["userType"]
                  };  
                  socket.emit("display reporter", dataObject);
                }
              }
            }
          }
        }
      }
    }
    schools[school] = allRooms;
	});
  
  socket.on("request user broadcast data", function() {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    var myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
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
            socket.emit("display reporter", dataObject);
          }
        }
      }
    }
  });

	// store updates to world
	socket.on("update", function(data) {
    var school = socket.school;
    var allRooms = schools[school]; 
    var myRoom = socket.myRoom; 
    var turtleId, turtle;
    var patchId, patch;
    for (var key in data.turtles)
    {
      turtle = data.turtles[key];
      turtleId = key;
      if (allRooms[myRoom].turtles[turtleId] === undefined) {
        allRooms[myRoom].turtles[turtleId] = {};
      }
      if (Object.keys(turtle).length > 0) {
        for (var attribute in turtle) {
          allRooms[myRoom].turtles[turtleId][attribute] = turtle[attribute];
        }
      }
    }
    for (var key in data.patches)
    {
      patch = data.patches[key];
      patchId = key;
      if (allRooms[myRoom].patches[patchId] === undefined) {
        allRooms[myRoom].patches[patchId] = {};
      }
      if (Object.keys(patch).length > 0) {
        for (var attribute in patch) {
          allRooms[myRoom].patches[patchId][attribute] = patch[attribute];
        }
      }
    }
    schools[school] = allRooms;
  });

  // pass command from student to teacher
  socket.on("send command", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom; 
    var myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    socket.to(school+"-"+myRoom+"-teacher").emit("execute command", {
      hubnetMessageSource: myUserId,
      hubnetMessageTag: data.hubnetMessageTag,
      hubnetMessage: data.hubnetMessage
    });
  });

   // pass stream of data from server to student
   socket.on("send stream reporter", function(data) {
     var school = socket.school;
     var allRooms = schools[school];
     var myRoom = socket.myRoom;
     var myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
     var myUserType = socket.myUserType;
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

  // pass reporter from server to student
  socket.on("send reporter", function(data) {
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    var myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    var myUserType = socket.myUserType;
    var destination = data.hubnetMessageSource;
    if (data.hubnetMessageTag === "canvas-text") {
      data.hubnetMessage = markdown.toHTML(data.hubnetMessage);
    }
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId]) {
        if (( data.hubnetMessageTag.includes("canvas")) && (allRooms[myRoom].userData[myUserId]["canvas"] === undefined)) {
          allRooms[myRoom].canvasOrder.push(myUserId);
          allRooms[myRoom].userData[myUserId]["canvas"] = {};
        }
        if (destination === "server") {
          allRooms[myRoom].userData[myUserId][data.hubnetMessageTag] = data.hubnetMessage;
          socket.to(school+"-"+myRoom+"-teacher").emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
          socket.to(school+"-"+myRoom+"-student").emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
          socket.emit("accept user data", {userId: myUserId, tag: data.hubnetMessageTag, value: data.hubnetMessage});
        } else {
          var dataObject = {
            hubnetMessageSource: myUserId,
            hubnetMessageTag: data.hubnetMessageTag,
            hubnetMessage: data.hubnetMessage,
            userId: myUserId,
            activityType: activityType,
            userType: myUserType
          };
          if (destination === "all-users"){
            if ( data.hubnetMessageTag.includes("canvas")) {
              if (data.hubnetMessageTag === "canvas-clear") {
                allRooms[myRoom].userData[myUserId]["canvas"] = {};
              }
              allRooms[myRoom].userData[myUserId]["canvas"][data.hubnetMessageTag] = data.hubnetMessage;
            }  
            dataObject.hubnetMessage = data.hubnetMessage;
            socket.to(school+"-"+myRoom+"-teacher").emit("display reporter", dataObject);
            socket.to(school+"-"+myRoom+"-student").emit("display reporter", dataObject);
            socket.emit("display reporter", dataObject);
          } else {
            io.to(destination).emit("display reporter", dataObject);
          }
        }
      }
    }
    schools[school] = allRooms;
  });

  app.post('/exportgbccreport', function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var myRoom = fields.roomname;
      var mySchool = fields.schoolname;
      var allRooms = schools[mySchool];
      var settings = {schoolName: mySchool};
      exportworld.exportData(allRooms, settings, res);
    });
  });
  
  app.post('/exportggb', function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var xml = fields.ggbxml;
      var filename = fields.ggbfilename;
      exportworld.exportGgb(xml, filename, res);
    });
  });
  
  app.post('/uploadggb', function(req,res){
    var filename;
    new formidable.IncomingForm().parse(req)
      .on('file', function(name, file) {
        filename = file.name;
          fs.rename(file.path, file.name, function() {
          });
      })
      .on('end', function() {
        res.end('success '+filename);
      });
  });
  
  app.post('/exportgbccworld', function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var myRoom = fields.gbccroomname;
      var mySchool = fields.gbccschoolname;
      var allRooms = schools[mySchool];
      var settings = {schoolName: mySchool};
      var filename = fields.gbccworldfilename;
      exportworld.exportGbccWorld(allRooms, settings, filename, res);
    });
  });

  // select, deselect, forever-select, forever-deselect
  socket.on("request user action", function(data) {
    var allRooms = schools[socket.school];
    var myRoom = socket.myRoom;
    var userType = data.userType;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData != undefined) {
        var userData = allRooms[myRoom].userData[data.userId];
        var key = (data.status === "forever-select") ? "gbcc-forever-button-code-"+data.userId : undefined;
        socket.emit("accept user action", {userId: data.userId, status: data.status, userData: userData, key: key, userType: userType});
      }
    }
  });

  // pass reporter from student to server
  socket.on("get reporter", function(data) {
    //console.log("get reporter "+ data.hubnetMessageTag);
    var allRooms = schools[socket.school];
    var myRoom = socket.myRoom;
    var myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    var myUserType = socket.userType;
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
    var myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
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
    if (data.type === "view") { allRooms[myRoom].settings.displayView = data.display; }
    if (data.type === "mirror") { allRooms[myRoom].settings.mirrorView = data.display; }
    socket.to(school+"-"+myRoom+"-student").emit("student accepts UI change", {"display":data.display, "type":data.type});
    schools[school] = allRooms;
  });
	
  // user exits
  socket.on('disconnect', function () {
    //clearInterval(myTimer);
    var school = socket.school;
    var allRooms = schools[school];
    var myRoom = socket.myRoom;
    var myUserId = socket.id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    var myUserType = socket.userType;
    if (allRooms[myRoom] != undefined) {
      if (allRooms[myRoom].userData[myUserId] != undefined) {
        allRooms[myRoom].userData[myUserId].exists = false;
      }
    }
    if (activityStyle === "hierarchy") { 
      socket.to(school+"-"+myRoom+"-teacher").emit("gbcc user exits", {userId: myUserId, userType: myUserType});
    }
    if (socket.myUserType === "teacher") {
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
      if (allRooms[roomName].userData[key].exists) { users++; }
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

