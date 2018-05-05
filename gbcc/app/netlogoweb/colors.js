(function() {
  var b, baseIndex, cachedNetlogoColors, color, colorTimesTen, g, i, j, len, netlogoBaseColors, netlogoColorNamesIndices, r, ref, step;

  window.netlogoColorToCSS = function(netlogoColor) {
    var a, array, b, g, r, ref;
    ref = array = netlogoColorToRGB(netlogoColor), r = ref[0], g = ref[1], b = ref[2];
    a = array.length > 3 ? array[3] : 255;
    if (a < 255) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + (a / 255) + ")";
    } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  };

  window.netlogoColorToOpaqueCSS = function(netlogoColor) {
    var array, b, g, r, ref;
    ref = array = netlogoColorToRGB(netlogoColor), r = ref[0], g = ref[1], b = ref[2];
    return "rgb(" + r + ", " + g + ", " + b + ")";
  };

  window.netlogoColorToHexString = function(netlogoColor) {
    var hexes, rgb;
    rgb = netlogoColorToRGB(netlogoColor);
    hexes = rgb.map(function(x) {
      var hex;
      hex = x.toString(16);
      if (hex.length === 1) {
        return "0" + hex;
      } else {
        return hex;
      }
    });
    return "#" + (hexes.join(''));
  };

  window.hexStringToNetlogoColor = function(hex) {
    var b, g, hexPair, r, ref, rgbHexes;
    hexPair = "([0-9a-f]{2})";
    rgbHexes = hex.toLowerCase().match(new RegExp("#" + hexPair + hexPair + hexPair)).slice(1);
    ref = rgbHexes.map(function(x) {
      return parseInt(x, 16);
    }), r = ref[0], g = ref[1], b = ref[2];
    return ColorModel.nearestColorNumberOfRGB(r, g, b);
  };

  window.netlogoColorToRGB = function(netlogoColor) {
    switch (typeof netlogoColor) {
      case "number":
        return cachedNetlogoColors[Math.floor(netlogoColor * 10)];
      case "object":
        return netlogoColor.map(Math.round);
      case "string":
        return netlogoBaseColors[netlogoColorNamesIndices[netlogoColor]];
      default:
        return console.error("Unrecognized color: " + netlogoColor);
    }
  };

  netlogoColorNamesIndices = {};

  ref = ['gray', 'red', 'orange', 'brown', 'yellow', 'green', 'lime', 'turqoise', 'cyan', 'sky', 'blue', 'violet', 'magenta', 'pink', 'black', 'white'];
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    color = ref[i];
    netlogoColorNamesIndices[color] = i;
  }

  netlogoBaseColors = [[140, 140, 140], [215, 48, 39], [241, 105, 19], [156, 109, 70], [237, 237, 47], [87, 176, 58], [42, 209, 57], [27, 158, 119], [82, 196, 196], [43, 140, 190], [50, 92, 168], [123, 78, 163], [166, 25, 105], [224, 126, 149], [0, 0, 0], [255, 255, 255]];

  cachedNetlogoColors = (function() {
    var k, ref1, results;
    results = [];
    for (colorTimesTen = k = 0; k <= 1400; colorTimesTen = ++k) {
      baseIndex = Math.floor(colorTimesTen / 100);
      ref1 = netlogoBaseColors[baseIndex], r = ref1[0], g = ref1[1], b = ref1[2];
      step = (colorTimesTen % 100 - 50) / 50.48 + 0.012;
      if (step < 0) {
        r += Math.floor(r * step);
        g += Math.floor(g * step);
        b += Math.floor(b * step);
      } else {
        r += Math.floor((0xFF - r) * step);
        g += Math.floor((0xFF - g) * step);
        b += Math.floor((0xFF - b) * step);
      }
      results.push([r, g, b]);
    }
    return results;
  })();

}).call(this);

//# sourceMappingURL=colors.js.map
