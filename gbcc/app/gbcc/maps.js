Maps = (function() {

  var zoom = 9;
  var location = "Austin TX";
  var map;
  var markers = {};
  var viewWidth;
  var viewHeight;
  
  function setupInterface() {
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
      map = L.map('mapContainer').setView([0,0], 13);
    }
    setupEventListeners();
  }
  
  function setupEventListeners() {
    $(".map-controls").on("click", "#mapOn", function() {
      updateMap("mapOff");
      triggerMapUpdate();
    });
    $(".map-controls").on("click", "#mapOff", function() {
      updateMap("mapOn");
    });
    $(".netlogo-view-container").css("background-color","transparent"); 
  }
  
  function resetInterface() {
    $("#mapContainer").css("display","inline-block");
    $(".map-controls").css("display","inline-block");
    updateMap("mapOff");
  }
  
  function updateMap(state) {
  //  map.redraw();

    if (map) { map.invalidateSize(); }
    if (state === "mapOn") {
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


  function getMapAsString() {

  }
  
  function redrawMap() {

  }
  
  function triggerMapUpdate() {
    if (procedures.gbccOnMapUpdate != undefined) { session.run('gbcc-on-map-update'); }
  }

  function importMap(data) {
    var settings = data[0];
    var allMarkers = data[1];
    zoom = settings[0];
    location = settings[1];
    if (map) { 
      map.setView(location, zoom);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }
    //Images.clearImage();
    Physics.removePhysics();
    Maps.removeMap();
    Graph.removeGraph();
    world.triggerUpdate();
    if (allMarkers != "") { 
      for (var i=0; i<allMarkers.length; i++) {
        createMarker(allMarkers[i][0], allMarkers[i][1]);
      }
    }
    redrawMap();
    resetInterface();
  }
  
  function exportMap() {
    //returns a list of settings and markers 
    return [ [zoom, location], getMarkers() ];
  }
  
  function createMarker(name, settings) {
    var newLatLng = assignMarkerSettings(name, settings);
    var leafletMarker = map ? L.marker(newLatLng).addTo(map) : null;
    markers[name].marker = leafletMarker;
  }
  
  function updateMarker(name, settings) {
    console.log("update marker ",name,settings)
    var newLatLng = assignMarkerSettings(name, settings);
    try {
      markers[name].marker.setLatLng(newLatLng);
    } catch(ex) {
    }
  }
  
  function assignMarkerSettings(name, settings) {
    if (!markers[name]) { markers[name] = {}; }
    if (!markers[name].settings) { markers[name].settings = {}; }
    markers[name].settings["patch-coords"] = [ 0, 0 ];
    markers[name].settings["lngLat"] = undefined;
    for (var i=0; i<settings.length; i++) {
      key = settings[i][0];
      value = settings[i][1];
      markers[name].settings[key] = value;
    }
    var lngLat = markers[name].settings["lngLat"];
    if (!lngLat) {
      lngLat = patchToLnglat(markers[name].settings["patch-coords"]);
      markers[name].settings["lngLat"] = lngLat;
    } 
    return newLatLng = new L.LatLng(lngLat[0], lngLat[1]);
  }

  function getMarker(name, key) {
    if (markers[name] && markers[name].settings) {
      if (markers[name].settings[key]) {
        return markers[name].settings[key];
      }
    }
    return [ "does not exist" ]
  }
  
  
  function getMarkers() {
    var markerList = [];
    var mark, latLng, lng, lat;
    for (marker in markers) {
      markerSettings = [];
      for (setting in markers[marker].settings) {
        mark = [ setting, markers[marker].settings[setting]];
        markerSettings.push(mark);
      }
      markerList.push([marker, markerSettings]);
      
    }
    return markerList;
  }
  
  function getMarkerList() {
    return markers;
  }
  
  function deleteMarker(name) {
    if (map) { 
      map.removeLayer(markers[name].marker); 
      delete markers[name];
    }
  }
  
  function removeMap() {
    $(".map-controls").css("display","none");
    $("#mapContainer").css("display","none");
    for (marker in markers) {
      deleteMarker(marker);
    }
    markers = {};
    updateMap("mapOn");
  }
  
  // for testing 
  function getMap() {
    return map;
  }
  
  function patchToLnglat(coords) {
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
    return ([markerX, markerY]);
  }
  
  function lnglatToPatch(coords) {
    var markerPositionX = coords[0];
    var markerPositionY = coords[1];
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
  
  return {
    setupInterface: setupInterface,
    importMap: importMap,
    createMarker: createMarker,
    deleteMarker: deleteMarker,
    updateMarker: updateMarker,
    getMap: getMap,
    getMarkers, getMarkers,
    exportMap: exportMap,
    redrawMap: redrawMap,
    //getMarkerXY: getMarkerXY,
    //setMarkerXY: setMarkerXY,
    //getMarkerLngLat: getMarkerLngLat,
    //setMarkerLngLat: setMarkerLngLat,
    getMapAsString: getMapAsString,
    patchToLnglat: patchToLnglat,
    lnglatToPatch: lnglatToPatch,
    removeMap: removeMap,
    getMarker: getMarker,
    getMarkerList: getMarkerList
  };
 
})();
