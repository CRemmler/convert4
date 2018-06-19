var map;
var markers;
Maps = (function() {

  var zoom = 11;
  var center = [ 30.2672, -97.7431];
  //var map;
  markers = {};
  paths = {};
  var viewWidth;
  var viewHeight;
  var boundaries;
  
  //NOTES 
  // show/hide using options.opacity 
  // title using options.title
  // make a path... ?
  ////// SETUP MAP //////
  
  function setupInterface() {
    //console.log("setupInterface for maps");
    viewWidth = parseFloat($(".netlogo-canvas").css("width"));
    viewHeight = parseFloat($(".netlogo-canvas").css("height"));
    var spanText =    "<div id='mapContainer'></div>";
    $(".netlogo-widget-container").append(spanText);
    $("#mapContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
    $("#mapContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
    $("#mapContainer").css("left", $(".netlogo-view-container").css("left"));
    $("#mapContainer").css("top", $(".netlogo-view-container").css("top"));
    //$("#mapContainer").css("display", "none");
    $("#mapContainer").css("display","inline-block");
    if (L) {
      map = L.map('mapContainer').setView([ 30.2672, -97.7431], 11);      
      if (map) { 
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        updateMap();
      }
    }
    setupEventListeners();
    hideMap();
    $("#mapContainer").css("display","none");
    $(".netlogo-view-container").css("pointer-events","none");
  }

  function setupEventListeners() {
    $(".netlogo-view-container").css("background-color","transparent"); 
    //map.on('dragend', function onDragEnd(){
    //  updateMap();
    //});
  }
  
  ////// DISPLAY MAP //////
  
  function updateMap() {
    var bounds = map ? map.getBounds() : { "_northEast": {"lat": 0, "lng": 0}, "_southWest": {"lat": 0, "lng": 0}};
    var xMin = bounds._northEast.lng;
    var yMin = bounds._northEast.lat;
    var xMax = bounds._southWest.lng;
    var yMax = bounds._southWest.lat;
    boundaries = {xmin: xMin, xmax: xMax, ymin: yMin, ymax: yMax};
  }


  ////// COORDINATE CONVERSION //////
  
  function patchToLatlng(coords) {
    var xcor = coords[0];
    var ycor = coords[1];
    var pixelX = universe.view.xPcorToCanvas(xcor);
    var pixelY = universe.view.yPcorToCanvas(ycor);
    var pixelPercentX = 1 - (pixelX / (viewWidth * 2));
    var pixelPercentY = (pixelY / (viewHeight * 2));
    var boundaryMinX = boundaries.xmin;
    var boundaryMinY = boundaries.ymin;
    var boundaryMaxX = boundaries.xmax;
    var boundaryMaxY = boundaries.ymax;
    var markerX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
    var markerY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
    return ([markerY, markerX]);
  }
  
  function latlngToPatch(coords) {
    var markerPositionX = coords[1];
    var markerPositionY = coords[0];
    var boundaryMinX = boundaries.xmin;
    var boundaryMinY = boundaries.ymin;
    var boundaryMaxX = boundaries.xmax;
    var boundaryMaxY = boundaries.ymax;
    if ( markerPositionX < boundaryMinX 
      || markerPositionX > boundaryMaxX
      || markerPositionY < boundaryMinY
      || markerPositionY > boundaryMaxY) {
      return (["out of bounds"]);
    }
    var markerPercentX = 1 - ((boundaryMaxX - markerPositionX) / (boundaryMaxX - boundaryMinX));
    var markerPercentY = (boundaryMaxY - markerPositionY) / (boundaryMaxY - boundaryMinY);
    var pixelX = markerPercentX * viewWidth;
    var pixelY = markerPercentY * viewHeight;
    var patchXcor = universe.view.xPixToPcor(pixelX);
    var patchYcor = universe.view.yPixToPcor(pixelY);
    return ([patchXcor, patchYcor]);
  }

  ////// SHOW AND HIDE MAP //////
  
  function showMap() {
    map.setView(center, zoom);
    updateMap();
    if (map) { map.invalidateSize(); }
    $("#mapContainer").css("display","inline-block");
    $("#mapContainer").css("z-index","0");
    $(".netlogo-view-container").css("pointer-events","none");
    $(".netlogo-view-container").css("z-index","1");
    // left, top, width, height
    // if (settings.length == 4) {
      //$("#mapContainer").css("left", settings[0] + "px");
      //$("#mapContainer").css("top", settings[1] + "px");
      //$("#mapContainer").css("width", settings[2] + "px");
      //$("#mapContainer").css("height", settings[3] + "px");
    //}
    drawPatches = false;
  
    world.triggerUpdate();
  }
  
  function hideMap() {
    $("#mapContainer").css("display","none");
    $("#mapContainer").css("z-index","1");
    $(".netlogo-view-container").css("pointer-events","auto");
    $(".netlogo-view-container").css("z-index","0");
    drawPatches = true;
    world.triggerUpdate();
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
    var leafletMarker = map ? L.marker(newLatlng).addTo(map) : null;
    markers[name].marker = leafletMarker;
  }
  
  function createMarkers(data) {
    for (var i=0; i<data.length; i++) {
      createMarker(data[i][0], data[i][1]);
    }
  }
  
  function getMarker(name) {
    return [name, getLatlng(name)];
  }
  
  function getMarkers() {
    var markers = [];
    for (var key in markers) {
      markers.push(getMarker(key));
    }
  }
  
  function deleteMarker(name) {
    if (markers[name] && markers[name].marker) {
      delete markers[name];
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
  
  function createPath(name, vertices) {
    var latlngs = vertices;
    paths[name] = L.polyline(latlngs, {color: 'black'}).addTo(map);
    map.addLayer(paths[name]);
  }
  
  function getVertices(name) {
    return paths[name];
  }
  
  function setVertices(name, vertices) {
    
  }
  
  function hidePath(name) {
    map.removeLayer(paths[name]);
  }
  
  function showPath(name) {
    map.addLayer(paths[name]);
  }
  
  function deletePath(name) {
    map.removeLayer(paths[name]);
    delete paths[name];
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
    getMarkers: getMarkers,
    deleteMarker: deleteMarker,
    setLat: setLat,
    setLng: setLng,
    setLatlng: setLatlng,
    getLat: getLat,
    getLng: getLng,
    getLatlng: getLatlng,
    //importFile: importFile,
    //exportFile: exportFile,
    //setData: setData,
    //getData: getData,
    latlngToPatch: latlngToPatch,
    patchToLatlng: patchToLatlng,
    updateMap: updateMap,
    createPath: createPath,
    getPath: getVertices,
    hidePath: hidePath,
    showPath: showPath,
    deletePath: deletePath
    

  };
 
})();
