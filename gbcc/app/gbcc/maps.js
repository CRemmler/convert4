var map;
var markers;
Maps = (function() {

  var zoom = 11;
  var center = [ 30.2672, -97.7431];
  //var map;
  markers = {};
  var viewWidth;
  var viewHeight;
  
  //NOTES 
  // show/hide using options.opacity 
  // title using options.title
  // make a path... ?
  ////// SETUP MAP //////
  
  function setupInterface() {
    console.log("setupInterface for maps");
    viewWidth = parseFloat($(".netlogo-canvas").css("width"));
    viewHeight = parseFloat($(".netlogo-canvas").css("height"));
    var spanText = "<div class='map-controls'>";
    spanText +=       "<i id='mapOn' class='fa fa-toggle-on' aria-hidden='true'></i>";
    spanText +=       "<i id='mapOff' class='fa fa-toggle-off' aria-hidden='true'></i>";
    spanText +=    "</div>";
    $(".netlogo-widget-container").append(spanText);
    spanText =    "<div id='mapContainer'></div>";
    $(".netlogo-widget-container").append(spanText);
    $(".map-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) + 8 + "px");
    $(".map-controls").css("top", $(".netlogo-view-container").css("top"));
    $("#mapContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
    $("#mapContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
    $("#mapContainer").css("left", $(".netlogo-view-container").css("left"));
    $("#mapContainer").css("top", $(".netlogo-view-container").css("top"));
    $("#mapContainer").css("display", "none");
    if (L) {
      map = L.map('mapContainer').setView([ 30.2672, -97.7431], 11);      
      if (map) { 
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
      }
    }
    setupEventListeners();
    updateMap("mapOff");
    hideMap();
  }
  
  function setupEventListeners() {
    $(".map-controls").on("click", "#mapOn", function() {
      updateMap("mapOn");
      triggerMapUpdate();
    });
    $(".map-controls").on("click", "#mapOff", function() {
      updateMap("mapOff");
    });
    $(".netlogo-view-container").css("background-color","transparent"); 
  }
  
  ////// DISPLAY MAP //////
  
  function updateMap(state) {
    if (map) { map.invalidateSize(); }
    if (state === "mapOff") {
      $("#mapOff").removeClass("selected");
      $("#mapOn").addClass("selected");
      $("#mapContainer").addClass("selected");
      $(".netlogo-view-container").css("z-index","0");
      drawPatches = true;
    } else {
      $("#mapOn").removeClass("selected");
      $("#mapOff").addClass("selected");
      $("#mapContainer").removeClass("selected");
      $(".netlogo-view-container").css("z-index","1");
      drawPatches = false;
    }
    world.triggerUpdate();
  }
  
  function triggerMapUpdate() {
    if (procedures.gbccOnMapUpdate != undefined) { session.run('gbcc-on-map-update'); }
  }
  
  ////// COORDINATE CONVERSION //////
  
  function patchToLatlng(coords) {
    var xcor = coords[0];
    var ycor = coords[1];
    var pixelX = universe.view.xPcorToCanvas(xcor);
    var pixelY = universe.view.yPcorToCanvas(ycor);
    var pixelPercentX = 1 - (pixelX / (viewWidth * 2));
    var pixelPercentY = (pixelY / (viewHeight * 2));
    var boundaries = map ? map.getBounds() : { "_northEast": {"lat": 0, "lng": 0}, "_southWest": {"lat": 0, "lng": 0}};
    var boundaryMinX = boundaries._northEast.lng;
    var boundaryMinY = boundaries._northEast.lat;
    var boundaryMaxX = boundaries._southWest.lng;
    var boundaryMaxY = boundaries._southWest.lat;
    var markerX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
    var markerY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
    return ([markerY, markerX]);
  }
  
  function latlngToPatch(coords) {
    var markerPositionX = coords[1];
    var markerPositionY = coords[0];
    var boundaries = map ? map.getBounds() : { "_northEast": {"lat": 0, "lng": 0}, "_southWest": {"lat": 0, "lng": 0}};
    var boundaryMaxX = boundaries._northEast.lng;
    var boundaryMaxY = boundaries._northEast.lat;
    var boundaryMinX = boundaries._southWest.lng;
    var boundaryMinY = boundaries._southWest.lat;
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
    $("#mapContainer").css("display","inline-block");
    $(".map-controls").css("display","inline-block");
    updateMap("mapOn");
    map.setView(center, zoom);

    // left, top, width, height
    // if (settings.length == 4) {
      //$("#mapContainer").css("left", settings[0] + "px");
      //$("#mapContainer").css("top", settings[1] + "px");
      //$("#mapContainer").css("width", settings[2] + "px");
      //$("#mapContainer").css("height", settings[3] + "px");
    //}
  }
  
  function hideMap() {
    updateMap("mapOff");
    $(".map-controls").css("display","none");
    $("#mapContainer").css("display","none");
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
    patchToLatlng: patchToLatlng
  };
 
})();
