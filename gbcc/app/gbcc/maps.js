var map;
Maps = (function() {

  var zoom = 11;
  var center = [ 30.2672, -97.7431];
  //var map;
  var markers = {};
  var paths = {};
  var viewWidth;
  var viewHeight;
  var boundaries;
  var myLatlng = undefined;
  
  function setupInterface() {
    if ($("#mapContainer").length === 0) {
      Interface.setupEnvironment("map");
      if (L) {
        map = L.map('mapContainer').setView([ 30.2672, -97.7431], 11);      
        if (map) { 
          L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          updateMap();
        }
      }
    }
  }

  function setupEventListeners() {
    //map.on('dragend', function onDragEnd(){
    //  updateMap();
    //});
  }
  
  ////// DISPLAY MAP //////
  
  function updateMap() {
    var bounds = map ? map.getBounds() : { "_northEast": {"lat": 0, "lng": 0}, "_southWest": {"lat": 0, "lng": 0}};
    var yMax = bounds._northEast.lng;
    var xMax = bounds._northEast.lat;
    var yMin = bounds._southWest.lng;
    var xMin = bounds._southWest.lat;
    boundaries = {xmin: xMin, xmax: xMax, ymin: yMin, ymax: yMax};
  }


  ////// COORDINATE CONVERSION //////

  function patchToLatlng(coords) {
    var xcor = coords[0];
    var ycor = coords[1];
    var pixelX = universe.view.xPcorToPix(xcor);
    var pixelY = universe.view.yPcorToPix(ycor);
    var newLatlng = map.containerPointToLatLng({x: pixelX, y: pixelY});
    var markerX = newLatlng.lat;
    var markerY = newLatlng.lng;
    return ([roundDecimal(markerX, 15), roundDecimal(markerY, 15)]);
  }
  
  function latlngToPatch(coords) {
    
    var newLatlng = L.latLng(coords[0], coords[1]);
    var pixel = map.latLngToContainerPoint(newLatlng);
    var patchXcor = universe.view.xPixToPcor(pixel.x);
    var patchYcor = universe.view.yPixToPcor(pixel.y);
    return ([roundDecimal(patchXcor, 15), roundDecimal(patchYcor, 15)]);
  }

  function roundDecimal(number, decimalPlaces) {
    return parseFloat(parseFloat(number).toFixed(decimalPlaces));
  }

  ////// SHOW AND HIDE MAP //////
  
  function showMap() {
    Interface.showEnvironment("map");

    map.setView(center, zoom);
    updateMap();
    if (map) { map.invalidateSize(); }
    map.invalidateSize()
    world.triggerUpdate();
  }
  
  function hideMap() {
    Interface.hideEnvironment("map");
  }

  ////// MAP SETTINGS //////
  
  function setZoom(value) {
    zoom = value;
    map.setZoom(zoom);
  }
  
  function getZoom() {
    zoom = map.getZoom();
    return zoom;
  }
  
  function setCenterLatlng(value) {
    center = L.latLng(value[0], value[1]);
    zoom = map.getZoom();
    map.setView(center, zoom);
  }
  
  function getCenterLatlng() {
    center = map.getCenter();
    return [center.lat, center.lng];
  }
  
  //////// MARKERS //////////
  
  function createMarker(name, settings) {
    if (!markers[name]) { markers[name] = {}; }
    var newLatlng = L.latLng(settings[0], settings[1]);
    markers[name].latlng = newLatlng;
    var draggable = false;
    markers[name].draggable = draggable;
    //L.marker(newLatlng, {draggable:draggable, icon: new L.DivIcon({ className: 'my-div-icon', html: '<span>carolyn</span>'})}).addTo(map);
    map ? markers[name].marker = L.marker(newLatlng, {draggable:draggable}).addTo(map) : null;
  }
  
  function createMarkers(data) {
    for (var i=0; i<data.length; i++) {
      createMarker(data[i][0], data[i][1]);
    }
  }
  
  function getMarker(name) {
    return [name, getLatlng(name)];
  }
  
  function setDraggable(name, draggable) {
    map.removeLayer(markers[name].marker);  
    var latlng = markers[name].latlng;  
    markers[name].marker = L.marker(latlng, {draggable:draggable}).addTo(map);
    map.addLayer(markers[name].marker);     
  }
  
  function getDraggable(name) {
    return (markers[name] && markers[name].draggable) ? true : false;
  }
  
  function getMarkers() {
    var markerList = [];
    for (var key in markers) {
      markerList.push(getMarker(key));
    }
    return markerList;
  }
  
  function deleteMarker(name) {
    if (markers[name] && markers[name].marker) {
      hideObject(name);
      //map.removeLayer(markers[name].marker);
      delete markers[name];
    }
  }
  
  function deleteMarkers() {
    for (marker in markers) {
      deleteMarker(marker);
    }
  }
  
  ///////// MARKER ATTRIBUTES /////////
  
  function setLat(name, lat) {
    if (markers[name] && markers[name].marker) {
      var lng = markers[name].marker.getLatLng().lng;
      markers[name].marker.setLatLng(L.latLng(lat, lng));
    }
  }
  
  function setLng(name, lng) {
    if (markers[name] && markers[name].marker) {
      var lat = markers[name].marker.getLatLng().lat;
      markers[name].marker.setLatLng(L.latLng(lat, lng));
    }
  }
  function setLatlng(name, latlng) {
    if (markers[name] && markers[name].marker) {
      markers[name].marker.setLatLng(L.latLng(latlng[0], latlng[1]));
    }
  }
  function getLat(name) {
    if (markers[name] && markers[name].marker) {
      return markers[name].marker.getLatLng().lat;
    }
    return 0;
  }
  function getLng(name) {
    if (markers[name] && markers[name].marker) {
      return markers[name].marker.getLatLng().lng;
    }
    return 0;
  }
  function getLatlng(name) {
    if (markers[name] && markers[name].marker) {
      return [ markers[name].marker.getLatLng().lat, markers[name].marker.getLatLng().lng];
    }
    return [0, 0];
  }
  function getMyLatlng() {
    if (navigator.geolocation && myLatlng) {
      return myLatlng;
    }
    return getCenterLatlng(); 
  }
  function updateMyLatlng() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        myLatlng = [ position.coords.latitude, position.coords.longitude ];
      });
    } else {
      myLatlng = getCenterLatlng();
    }
  }
  
    ///////// PATHS /////////
  
  function createPath(name, vertices) {
    var latlngs = vertices;
    paths[name] = {};
    paths[name].latlngs = latlngs;
    paths[name].color = "#000000";
    paths[name].polyline = L.polyline(latlngs, {color: paths[name].color});
    map.addLayer(paths[name].polyline);
  }

  function createPaths(paths) {
    for (var i=0; i<paths.length; i++) {
      createPath[paths[i][0], paths[i][1]];
    }
  }
  
  function hidePath(name) {
    hideObject(name);
    //map.removeLayer(paths[name]);
  }
  
  function showPath(name) {
    showObject(name);
    //map.addLayer(paths[name]);
  }
  
  function deletePath(name) {
    if (paths[name] && paths[name].polyline) {
      hideObject(name);
      delete paths[name];
    }
  }
  
  function deletePaths() {
    for (path in paths) {
      deletePath(path);
    }
  }
  
  ///////// PATH ATTRIBUTES /////////
    
  function setPathColor(name, color) {
    if (paths[name]) {
      map.removeLayer(paths[name].polyline);
      paths[name].color = color;
      paths[name].polyline = L.polyline(paths[name].latlngs, {color: color});
      map.addLayer(paths[name].polyline);
    }
  } 
  
  function getPathColor(name) {
    if (paths[name] && paths[name].color) {
      return paths[name].color;
    } else {
      return "#000000";
    }
  } 
  
  function getPathVertices(name) {
    if (paths[name]) {
      return paths[name].latlngs;
    } else {
      return "undefined";
    }
  }
  
  function setPathVertices(name, vertices) {
    var latlngs = vertices;
    if (paths[name]) {
      map.removeLayer(paths[name].polyline);
      paths[name].latlngs = latlngs;
      maps[name].polyline = L.polyline(latlngs, {color: paths[name].color }).addTo(map);
      map.addLayer(maps[name].polyline);
    } else {
      createPath(name, vertices);
    }
  }
  
  ////////// oBJECTS ///////////
  function createObject(objectList) {
    var name = objectList[0];
    var result = JSON.parse(objectList[1]);
    var type = result.type;
    if (type === "marker") {
      createMarker(name, result.latlng);
    } else if (type === "path") {
      createPath(name, result.vertices);
      setPathColor(name, result.color);
    }
  }
  
  function createObjects(objects) {
    for (var i=0; i<objects.length; i++) {
      createObject(objects[i]);
    }
  }
  
  function getObject(name) {
    var result = {};
    if (getObjectType(name) === "marker") {
      result.type = "marker";
      result.latlng = getLatlng(name);
    } else if (getObjectType(name) === "path") {
      result.type = "path";
      result.vertices = getPathVertices(name);
      result.color = getPathColor(name);
    }    
    var resultString = JSON.stringify(result);
    return [ name, resultString ];  
  }

  function getObjects() {
    var objectList = [];
    var name;
    var value;
    for (marker in markers) {
      name = marker;
      value = getObject(name);
      objectList.push(value);
    }
    for (path in paths) {
      name = path;
      value = getObject(name);
      objectList.push(value);
    }
    return objectList;
  }
  
  function deleteObject(name) {
    if (getObjectType(name) === "marker") {
      deleteMarker(name);
    } else if (getObjectType(name) === "path") {
      deletePath(name);
    }
  }
  
  function deleteObjects() {
    deleteMarkers();
    deletePaths();
  }
  
  function getObjectType(name) {
    if (markers[name]) {
      return "marker";
    } else if (paths[name]) {
      return "path";
    } else {
      return "none";
    }  
  }
  
  function objectExists(name) {
    return (markers[name] || paths[name]) ? true : false;
  }
  
  function showObject(name) {
    var objectType = getObjectType(name);
    if (objectType === "path") {
      paths[name].visible = true;
      map.removeLayer(paths[name].polyline);
      map.addLayer(paths[name].polyline);
    } else if (objectType === "marker") {
      markers[name].visible = true;
      map.removeLayer(markers[name].marker);    
      map.addLayer(markers[name].marker);    
    }
  }

  function hideObject(name) {
    var objectType = getObjectType(name);
    if (objectType === "path") {
      paths[name].visible = false;
      map.removeLayer(paths[name].polyline);
    } else if (objectType === "marker") {
      markers[name].visible = false;
      map.removeLayer(markers[name].marker);    
    }
  }
  
  ////////// MAP SETTINGS //////////
  
  function bringToFront() {
    Interface.bringToFront("map"); 
  }
  
  function sendToBack() {
    Interface.sendToBack("map");
  }
  
  function setOpacity(value) {
    Interface.setOpacity("map", value);
  }
  
  function getOpacity() {
    return Interface.getOpacity("map");
  }
  
  function setMapOffset(offset) {
    Interface.setGraphOffset("map", offset);
    updateGraph();
  }
  function getMapOffset() {
    return Interface.getGraphOffset();
  }
  
  function mouseOn() {
    Interface.mouseOn("map");
  }
  
  function mouseOff() {   
    Interface.mouseOff("map");   
  }
  
  //////// DATA //////////
  
  function getAll() {
    var data = {};
    data.objects = getObjects();
    data.settings = getSettings();
    return JSON.stringify(data);
  }
  function setAll(dataString) {
    data = JSON.parse(dataString);
    if (data.objects) { createObjects(data.objects); }
    if (data.settings) { setSettings(data.settings); }
  }
  function getSettings() {
    var data = {};
    data.zoom = getZoom();
    data.centerLatlng = getCenterLatlng();
    return data;
    //return JSON.stringify(data);
  }
  function setSettings(data) {
    //var data = JSON.parse(results); 
    setZoom(data.zoom);
    setCenterLatlng(data.centerLatlng);
  }
  
  return {
    setupInterface: setupInterface,
    showMap: showMap,
    hideMap: hideMap,
    setZoom: setZoom,
    getZoom: getZoom,
    setCenterLatlng: setCenterLatlng,
    getCenterLatlng: getCenterLatlng,
    
    createMarker: createMarker,
    createMarkers: createMarkers,
    getMarker: getMarker,
    getMarkers: getMarkers,
    deleteMarker: deleteMarker,
    deleteMarkers: deleteMarkers,
    
    setLat: setLat,
    setLng: setLng,
    setLatlng: setLatlng,
    getLat: getLat,
    getLng: getLng,
    getLatlng: getLatlng,
    setDraggable: setDraggable,
    getDraggable: getDraggable,
    latlngToPatch: latlngToPatch,
    patchToLatlng: patchToLatlng,
    updateMap: updateMap,
    getMyLatlng: getMyLatlng,
    updateMyLatlng: updateMyLatlng,
    
    createPath: createPath,
    createPaths: createPaths,
    deletePath: deletePath,
    deletePaths: deletePaths,
        
    setPathColor: setPathColor,
    getPathColor: getPathColor,
    setPathVertices: setPathVertices,
    getPathVertices: getPathVertices,
    
    hidePath: hidePath,
    showPath: showPath,
    
    bringToFront: bringToFront,
    sendToBack: sendToBack,
    setOpacity: setOpacity,
    getOpacity: getOpacity,
    setMapOffset: setMapOffset,
    getMapOffset: getMapOffset,
    mouseOff: mouseOff,
    mouseOn: mouseOn,
    
    createObject: createObject,
    createObjects: createObjects,
    getObject: getObject,
    getObjects: getObjects,
    deleteObject: deleteObject,
    deleteObjects: deleteObjects,
    getObjectType: getObjectType,
    objectExists: objectExists,
    showObject: showObject,
    hideObject: hideObject,
    
    setAll: setAll,
    getAll: getAll

  };
 
})();
