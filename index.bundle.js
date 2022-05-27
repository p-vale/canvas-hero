/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/canvas-sketch-util/lib/rgba-to-hex.js":
/*!************************************************************!*\
  !*** ./node_modules/canvas-sketch-util/lib/rgba-to-hex.js ***!
  \************************************************************/
/***/ ((module) => {

module.exports = rgbaToHex;
function rgbaToHex (rgba) {
  if (!rgba || !Array.isArray(rgba)) {
    throw new TypeError('Must specify an array to convert into a hex code');
  }

  var r = Math.max(0, Math.min(255, Math.round(rgba[0] || 0)));
  var g = Math.max(0, Math.min(255, Math.round(rgba[1] || 0)));
  var b = Math.max(0, Math.min(255, Math.round(rgba[2] || 0)));

  var alpha = rgba[3];
  if (typeof alpha === 'undefined' || !isFinite(alpha)) {
    alpha = 1;
  }
  var a = Math.max(0, Math.min(255, Math.round(alpha * 255)));
  var alphaParam = a === 255 ? '' : (a | 1 << 8).toString(16).slice(1);
  var result = ((b | g << 8 | r << 16) | 1 << 24).toString(16).slice(1) + alphaParam;
  return '#' + result;
}


/***/ }),

/***/ "./node_modules/canvas-sketch-util/lib/wrap.js":
/*!*****************************************************!*\
  !*** ./node_modules/canvas-sketch-util/lib/wrap.js ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = wrap;
function wrap (value, from, to) {
  if (typeof from !== 'number' || typeof to !== 'number') {
    throw new TypeError('Must specify "to" and "from" arguments as numbers');
  }
  // algorithm from http://stackoverflow.com/a/5852628/599884
  if (from > to) {
    var t = from;
    from = to;
    to = t;
  }
  var cycle = to - from;
  if (cycle === 0) {
    return to;
  }
  return value - cycle * Math.floor((value - from) / cycle);
}


/***/ }),

/***/ "./node_modules/canvas-sketch-util/math.js":
/*!*************************************************!*\
  !*** ./node_modules/canvas-sketch-util/math.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var defined = __webpack_require__(/*! defined */ "./node_modules/defined/index.js");
var wrap = __webpack_require__(/*! ./lib/wrap */ "./node_modules/canvas-sketch-util/lib/wrap.js");
var EPSILON = Number.EPSILON;

function clamp (value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value);
}

function clamp01 (v) {
  return clamp(v, 0, 1);
}

function lerp (min, max, t) {
  return min * (1 - t) + max * t;
}

function inverseLerp (min, max, t) {
  if (Math.abs(min - max) < EPSILON) return 0;
  else return (t - min) / (max - min);
}

function smoothstep (min, max, t) {
  var x = clamp(inverseLerp(min, max, t), 0, 1);
  return x * x * (3 - 2 * x);
}

function toFinite (n, defaultValue) {
  defaultValue = defined(defaultValue, 0);
  return typeof n === 'number' && isFinite(n) ? n : defaultValue;
}

function expandVector (dims) {
  if (typeof dims !== 'number') throw new TypeError('Expected dims argument');
  return function (p, defaultValue) {
    defaultValue = defined(defaultValue, 0);
    var scalar;
    if (p == null) {
      // No vector, create a default one
      scalar = defaultValue;
    } else if (typeof p === 'number' && isFinite(p)) {
      // Expand single channel to multiple vector
      scalar = p;
    }

    var out = [];
    var i;
    if (scalar == null) {
      for (i = 0; i < dims; i++) {
        out[i] = toFinite(p[i], defaultValue);
      }
    } else {
      for (i = 0; i < dims; i++) {
        out[i] = scalar;
      }
    }
    return out;
  };
}

function lerpArray (min, max, t, out) {
  out = out || [];
  if (min.length !== max.length) {
    throw new TypeError('min and max array are expected to have the same length');
  }
  for (var i = 0; i < min.length; i++) {
    out[i] = lerp(min[i], max[i], t);
  }
  return out;
}

function newArray (n, initialValue) {
  n = defined(n, 0);
  if (typeof n !== 'number') throw new TypeError('Expected n argument to be a number');
  var out = [];
  for (var i = 0; i < n; i++) out.push(initialValue);
  return out;
}

function linspace (n, opts) {
  n = defined(n, 0);
  if (typeof n !== 'number') throw new TypeError('Expected n argument to be a number');
  opts = opts || {};
  if (typeof opts === 'boolean') {
    opts = { endpoint: true };
  }
  var offset = defined(opts.offset, 0);
  if (opts.endpoint) {
    return newArray(n).map(function (_, i) {
      return n <= 1 ? 0 : ((i + offset) / (n - 1));
    });
  } else {
    return newArray(n).map(function (_, i) {
      return (i + offset) / n;
    });
  }
}

function lerpFrames (values, t, out) {
  t = clamp(t, 0, 1);

  var len = values.length - 1;
  var whole = t * len;
  var frame = Math.floor(whole);
  var fract = whole - frame;

  var nextFrame = Math.min(frame + 1, len);
  var a = values[frame % values.length];
  var b = values[nextFrame % values.length];
  if (typeof a === 'number' && typeof b === 'number') {
    return lerp(a, b, fract);
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return lerpArray(a, b, fract, out);
  } else {
    throw new TypeError('Mismatch in value type of two array elements: ' + frame + ' and ' + nextFrame);
  }
}

function mod (a, b) {
  return ((a % b) + b) % b;
}

function degToRad (n) {
  return n * Math.PI / 180;
}

function radToDeg (n) {
  return n * 180 / Math.PI;
}

function fract (n) {
  return n - Math.floor(n);
}

function sign (n) {
  if (n > 0) return 1;
  else if (n < 0) return -1;
  else return 0;
}

// Specific function from Unity / ofMath, not sure its needed?
// function lerpWrap (a, b, t, min, max) {
//   return wrap(a + wrap(b - a, min, max) * t, min, max)
// }

function pingPong (t, length) {
  t = mod(t, length * 2);
  return length - Math.abs(t - length);
}

function damp (a, b, lambda, dt) {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

function dampArray (a, b, lambda, dt, out) {
  out = out || [];
  for (var i = 0; i < a.length; i++) {
    out[i] = damp(a[i], b[i], lambda, dt);
  }
  return out;
}

function mapRange (value, inputMin, inputMax, outputMin, outputMax, clamp) {
  // Reference:
  // https://openframeworks.cc/documentation/math/ofMath/
  if (Math.abs(inputMin - inputMax) < EPSILON) {
    return outputMin;
  } else {
    var outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
    if (clamp) {
      if (outputMax < outputMin) {
        if (outVal < outputMax) outVal = outputMax;
        else if (outVal > outputMin) outVal = outputMin;
      } else {
        if (outVal > outputMax) outVal = outputMax;
        else if (outVal < outputMin) outVal = outputMin;
      }
    }
    return outVal;
  }
}

module.exports = {
  mod: mod,
  fract: fract,
  sign: sign,
  degToRad: degToRad,
  radToDeg: radToDeg,
  wrap: wrap,
  pingPong: pingPong,
  linspace: linspace,
  lerp: lerp,
  lerpArray: lerpArray,
  inverseLerp: inverseLerp,
  lerpFrames: lerpFrames,
  clamp: clamp,
  clamp01: clamp01,
  smoothstep: smoothstep,
  damp: damp,
  dampArray: dampArray,
  mapRange: mapRange,
  expand2D: expandVector(2),
  expand3D: expandVector(3),
  expand4D: expandVector(4)
};


/***/ }),

/***/ "./node_modules/canvas-sketch-util/random.js":
/*!***************************************************!*\
  !*** ./node_modules/canvas-sketch-util/random.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var seedRandom = __webpack_require__(/*! seed-random */ "./node_modules/seed-random/index.js");
var SimplexNoise = __webpack_require__(/*! simplex-noise */ "./node_modules/simplex-noise/simplex-noise.js");
var defined = __webpack_require__(/*! defined */ "./node_modules/defined/index.js");

function createRandom (defaultSeed) {
  defaultSeed = defined(defaultSeed, null);
  var defaultRandom = Math.random;
  var currentSeed;
  var currentRandom;
  var noiseGenerator;
  var _nextGaussian = null;
  var _hasNextGaussian = false;

  setSeed(defaultSeed);

  return {
    value: value,
    createRandom: function (defaultSeed) {
      return createRandom(defaultSeed);
    },
    setSeed: setSeed,
    getSeed: getSeed,
    getRandomSeed: getRandomSeed,
    valueNonZero: valueNonZero,
    permuteNoise: permuteNoise,
    noise1D: noise1D,
    noise2D: noise2D,
    noise3D: noise3D,
    noise4D: noise4D,
    sign: sign,
    boolean: boolean,
    chance: chance,
    range: range,
    rangeFloor: rangeFloor,
    pick: pick,
    shuffle: shuffle,
    onCircle: onCircle,
    insideCircle: insideCircle,
    onSphere: onSphere,
    insideSphere: insideSphere,
    quaternion: quaternion,
    weighted: weighted,
    weightedSet: weightedSet,
    weightedSetIndex: weightedSetIndex,
    gaussian: gaussian
  };

  function setSeed (seed, opt) {
    if (typeof seed === 'number' || typeof seed === 'string') {
      currentSeed = seed;
      currentRandom = seedRandom(currentSeed, opt);
    } else {
      currentSeed = undefined;
      currentRandom = defaultRandom;
    }
    noiseGenerator = createNoise();
    _nextGaussian = null;
    _hasNextGaussian = false;
  }

  function value () {
    return currentRandom();
  }

  function valueNonZero () {
    var u = 0;
    while (u === 0) u = value();
    return u;
  }

  function getSeed () {
    return currentSeed;
  }

  function getRandomSeed () {
    var seed = String(Math.floor(Math.random() * 1000000));
    return seed;
  }

  function createNoise () {
    return new SimplexNoise(currentRandom);
  }

  function permuteNoise () {
    noiseGenerator = createNoise();
  }

  function noise1D (x, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise2D(x * frequency, 0);
  }

  function noise2D (x, y, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise2D(x * frequency, y * frequency);
  }

  function noise3D (x, y, z, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    if (!isFinite(z)) throw new TypeError('z component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise3D(
      x * frequency,
      y * frequency,
      z * frequency
    );
  }

  function noise4D (x, y, z, w, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    if (!isFinite(z)) throw new TypeError('z component for noise() must be finite');
    if (!isFinite(w)) throw new TypeError('w component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise4D(
      x * frequency,
      y * frequency,
      z * frequency,
      w * frequency
    );
  }

  function sign () {
    return boolean() ? 1 : -1;
  }

  function boolean () {
    return value() > 0.5;
  }

  function chance (n) {
    n = defined(n, 0.5);
    if (typeof n !== 'number') throw new TypeError('expected n to be a number');
    return value() < n;
  }

  function range (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Expected all arguments to be numbers');
    }

    return value() * (max - min) + min;
  }

  function rangeFloor (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Expected all arguments to be numbers');
    }

    return Math.floor(range(min, max));
  }

  function pick (array) {
    if (array.length === 0) return undefined;
    return array[rangeFloor(0, array.length)];
  }

  function shuffle (arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('Expected Array, got ' + typeof arr);
    }

    var rand;
    var tmp;
    var len = arr.length;
    var ret = arr.slice();
    while (len) {
      rand = Math.floor(value() * len--);
      tmp = ret[len];
      ret[len] = ret[rand];
      ret[rand] = tmp;
    }
    return ret;
  }

  function onCircle (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var theta = value() * 2.0 * Math.PI;
    out[0] = radius * Math.cos(theta);
    out[1] = radius * Math.sin(theta);
    return out;
  }

  function insideCircle (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    onCircle(1, out);
    var r = radius * Math.sqrt(value());
    out[0] *= r;
    out[1] *= r;
    return out;
  }

  function onSphere (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var u = value() * Math.PI * 2;
    var v = value() * 2 - 1;
    var phi = u;
    var theta = Math.acos(v);
    out[0] = radius * Math.sin(theta) * Math.cos(phi);
    out[1] = radius * Math.sin(theta) * Math.sin(phi);
    out[2] = radius * Math.cos(theta);
    return out;
  }

  function insideSphere (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var u = value() * Math.PI * 2;
    var v = value() * 2 - 1;
    var k = value();

    var phi = u;
    var theta = Math.acos(v);
    var r = radius * Math.cbrt(k);
    out[0] = r * Math.sin(theta) * Math.cos(phi);
    out[1] = r * Math.sin(theta) * Math.sin(phi);
    out[2] = r * Math.cos(theta);
    return out;
  }

  function quaternion (out) {
    out = out || [];
    var u1 = value();
    var u2 = value();
    var u3 = value();

    var sq1 = Math.sqrt(1 - u1);
    var sq2 = Math.sqrt(u1);

    var theta1 = Math.PI * 2 * u2;
    var theta2 = Math.PI * 2 * u3;

    var x = Math.sin(theta1) * sq1;
    var y = Math.cos(theta1) * sq1;
    var z = Math.sin(theta2) * sq2;
    var w = Math.cos(theta2) * sq2;
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }

  function weightedSet (set) {
    set = set || [];
    if (set.length === 0) return null;
    return set[weightedSetIndex(set)].value;
  }

  function weightedSetIndex (set) {
    set = set || [];
    if (set.length === 0) return -1;
    return weighted(set.map(function (s) {
      return s.weight;
    }));
  }

  function weighted (weights) {
    weights = weights || [];
    if (weights.length === 0) return -1;
    var totalWeight = 0;
    var i;

    for (i = 0; i < weights.length; i++) {
      totalWeight += weights[i];
    }

    if (totalWeight <= 0) throw new Error('Weights must sum to > 0');

    var random = value() * totalWeight;
    for (i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        return i;
      }
      random -= weights[i];
    }
    return 0;
  }

  function gaussian (mean, standardDerivation) {
    mean = defined(mean, 0);
    standardDerivation = defined(standardDerivation, 1);

    // https://github.com/openjdk-mirror/jdk7u-jdk/blob/f4d80957e89a19a29bb9f9807d2a28351ed7f7df/src/share/classes/java/util/Random.java#L496
    if (_hasNextGaussian) {
      _hasNextGaussian = false;
      var result = _nextGaussian;
      _nextGaussian = null;
      return mean + standardDerivation * result;
    } else {
      var v1 = 0;
      var v2 = 0;
      var s = 0;
      do {
        v1 = value() * 2 - 1; // between -1 and 1
        v2 = value() * 2 - 1; // between -1 and 1
        s = v1 * v1 + v2 * v2;
      } while (s >= 1 || s === 0);
      var multiplier = Math.sqrt(-2 * Math.log(s) / s);
      _nextGaussian = (v2 * multiplier);
      _hasNextGaussian = true;
      return mean + standardDerivation * (v1 * multiplier);
    }
  }
}

module.exports = createRandom();


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "* {\n  margin: 0;\n  padding: 0;\n  -ms-overflow-style: none;\n  scrollbar-width: none;\n}\n\n::-webkit-scrollbar {\n  display: none;\n}\n\n#container {\n  height: 100%;\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  /* align-items: center;\n  justify-content: center; */\n}\n\n.hero-box {\n  height: 100vh;\n  width: 100vw;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\nh1 {\n  text-transform: uppercase;\n  letter-spacing: 0.2em;\n  font-size: 6vh;\n}\n\n.centered {\n  position: absolute;\n  left: 40vw;\n  top: 40vw;\n}\n\n#science-title {\n  color: #FF9D00;\n  font-family: Verdana, Geneva, Tahoma, sans-serif;\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;EACE,SAAS;EACT,UAAU;EACV,wBAAwB;EACxB,qBAAqB;AACvB;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,YAAY;EACZ,WAAW;EACX,aAAa;EACb,sBAAsB;EACtB;4BAC0B;AAC5B;;AAEA;EACE,aAAa;EACb,YAAY;EACZ,aAAa;EACb,uBAAuB;EACvB,mBAAmB;AACrB;;AAEA;EACE,yBAAyB;EACzB,qBAAqB;EACrB,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,SAAS;AACX;;AAEA;EACE,cAAc;EACd,gDAAgD;AAClD","sourcesContent":["* {\n  margin: 0;\n  padding: 0;\n  -ms-overflow-style: none;\n  scrollbar-width: none;\n}\n\n::-webkit-scrollbar {\n  display: none;\n}\n\n#container {\n  height: 100%;\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  /* align-items: center;\n  justify-content: center; */\n}\n\n.hero-box {\n  height: 100vh;\n  width: 100vw;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\nh1 {\n  text-transform: uppercase;\n  letter-spacing: 0.2em;\n  font-size: 6vh;\n}\n\n.centered {\n  position: absolute;\n  left: 40vw;\n  top: 40vw;\n}\n\n#science-title {\n  color: #FF9D00;\n  font-family: Verdana, Geneva, Tahoma, sans-serif;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/defined/index.js":
/*!***************************************!*\
  !*** ./node_modules/defined/index.js ***!
  \***************************************/
/***/ ((module) => {

module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};


/***/ }),

/***/ "./node_modules/seed-random/index.js":
/*!*******************************************!*\
  !*** ./node_modules/seed-random/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var width = 256;// each RC4 output is 0 <= x < 256
var chunks = 6;// at least six RC4 outputs for each double
var digits = 52;// there are 52 significant digits in a double
var pool = [];// pool: entropy pool starts empty
var GLOBAL = typeof __webpack_require__.g === 'undefined' ? window : __webpack_require__.g;

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;


var oldRandom = Math.random;

//
// seedrandom()
// This is the seedrandom function described above.
//
module.exports = function(seed, options) {
  if (options && options.global === true) {
    options.global = false;
    Math.random = module.exports(seed, options);
    options.global = true;
    return Math.random;
  }
  var use_entropy = (options && options.entropy) || false;
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    0 in arguments ? seed : autoseed(), 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  return function() {         // Closure to return a random double:
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer Math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };
};

module.exports.resetGlobal = function () {
  Math.random = oldRandom;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj)[0], prop;
  if (depth && typ == 'o') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
  try {
    GLOBAL.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, GLOBAL, GLOBAL.navigator && GLOBAL.navigator.plugins,
            GLOBAL.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call Math.random on its own again after
// initialization.
//
mixkey(Math.random(), pool);


/***/ }),

/***/ "./node_modules/simplex-noise/simplex-noise.js":
/*!*****************************************************!*\
  !*** ./node_modules/simplex-noise/simplex-noise.js ***!
  \*****************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * A fast javascript implementation of simplex noise by Jonas Wagner

Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.


 Copyright (c) 2018 Jonas Wagner

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
(function() {
  'use strict';

  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  var F3 = 1.0 / 3.0;
  var G3 = 1.0 / 6.0;
  var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
  var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

  function SimplexNoise(randomOrSeed) {
    var random;
    if (typeof randomOrSeed == 'function') {
      random = randomOrSeed;
    }
    else if (randomOrSeed) {
      random = alea(randomOrSeed);
    } else {
      random = Math.random;
    }
    this.p = buildPermutationTable(random);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }

  }
  SimplexNoise.prototype = {
    grad3: new Float32Array([1, 1, 0,
      -1, 1, 0,
      1, -1, 0,

      -1, -1, 0,
      1, 0, 1,
      -1, 0, 1,

      1, 0, -1,
      -1, 0, -1,
      0, 1, 1,

      0, -1, 1,
      0, 1, -1,
      0, -1, -1]),
    grad4: new Float32Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
      0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
      1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1,
      -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
      1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1,
      -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
      1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0,
      -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]),
    noise2D: function(xin, yin) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var grad3 = this.grad3;
      var n0 = 0; // Noise contributions from the three corners
      var n1 = 0;
      var n2 = 0;
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = xin - X0; // The x,y distances from the cell origin
      var y0 = yin - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        var gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    },
    // 3D simplex noise
    noise3D: function(xin, yin, zin) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var grad3 = this.grad3;
      var n0, n1, n2, n3; // Noise contributions from the four corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var k = Math.floor(zin + s);
      var t = (i + j + k) * G3;
      var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
      var Y0 = j - t;
      var Z0 = k - t;
      var x0 = xin - X0; // The x,y,z distances from the cell origin
      var y0 = yin - Y0;
      var z0 = zin - Z0;
      // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
      // Determine which simplex we are in.
      var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
      var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // X Y Z order
        else if (x0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // X Z Y order
        else {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // Z X Y order
      }
      else { // x0<y0
        if (y0 < z0) {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Z Y X order
        else if (x0 < z0) {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Y Z X order
        else {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // Y X Z order
      }
      // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
      // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
      // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
      // c = 1/6.
      var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
      var y2 = y0 - j2 + 2.0 * G3;
      var z2 = z0 - k2 + 2.0 * G3;
      var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
      var y3 = y0 - 1.0 + 3.0 * G3;
      var z3 = z0 - 1.0 + 3.0 * G3;
      // Work out the hashed gradient indices of the four simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      // Calculate the contribution from the four corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0.0;
      else {
        var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0.0;
      else {
        var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0.0;
      else {
        var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0.0;
      else {
        var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
        t3 *= t3;
        n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to stay just inside [-1,1]
      return 32.0 * (n0 + n1 + n2 + n3);
    },
    // 4D simplex noise, better simplex rank ordering method 2012-03-09
    noise4D: function(x, y, z, w) {
      var perm = this.perm;
      var grad4 = this.grad4;

      var n0, n1, n2, n3, n4; // Noise contributions from the five corners
      // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
      var s = (x + y + z + w) * F4; // Factor for 4D skewing
      var i = Math.floor(x + s);
      var j = Math.floor(y + s);
      var k = Math.floor(z + s);
      var l = Math.floor(w + s);
      var t = (i + j + k + l) * G4; // Factor for 4D unskewing
      var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
      var Y0 = j - t;
      var Z0 = k - t;
      var W0 = l - t;
      var x0 = x - X0; // The x,y,z,w distances from the cell origin
      var y0 = y - Y0;
      var z0 = z - Z0;
      var w0 = w - W0;
      // For the 4D case, the simplex is a 4D shape I won't even try to describe.
      // To find out which of the 24 possible simplices we're in, we need to
      // determine the magnitude ordering of x0, y0, z0 and w0.
      // Six pair-wise comparisons are performed between each possible pair
      // of the four coordinates, and the results are used to rank the numbers.
      var rankx = 0;
      var ranky = 0;
      var rankz = 0;
      var rankw = 0;
      if (x0 > y0) rankx++;
      else ranky++;
      if (x0 > z0) rankx++;
      else rankz++;
      if (x0 > w0) rankx++;
      else rankw++;
      if (y0 > z0) ranky++;
      else rankz++;
      if (y0 > w0) ranky++;
      else rankw++;
      if (z0 > w0) rankz++;
      else rankw++;
      var i1, j1, k1, l1; // The integer offsets for the second simplex corner
      var i2, j2, k2, l2; // The integer offsets for the third simplex corner
      var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
      // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
      // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
      // impossible. Only the 24 indices which have non-zero entries make any sense.
      // We use a thresholding to set the coordinates in turn from the largest magnitude.
      // Rank 3 denotes the largest coordinate.
      i1 = rankx >= 3 ? 1 : 0;
      j1 = ranky >= 3 ? 1 : 0;
      k1 = rankz >= 3 ? 1 : 0;
      l1 = rankw >= 3 ? 1 : 0;
      // Rank 2 denotes the second largest coordinate.
      i2 = rankx >= 2 ? 1 : 0;
      j2 = ranky >= 2 ? 1 : 0;
      k2 = rankz >= 2 ? 1 : 0;
      l2 = rankw >= 2 ? 1 : 0;
      // Rank 1 denotes the second smallest coordinate.
      i3 = rankx >= 1 ? 1 : 0;
      j3 = ranky >= 1 ? 1 : 0;
      k3 = rankz >= 1 ? 1 : 0;
      l3 = rankw >= 1 ? 1 : 0;
      // The fifth corner has all coordinate offsets = 1, so no need to compute that.
      var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
      var y1 = y0 - j1 + G4;
      var z1 = z0 - k1 + G4;
      var w1 = w0 - l1 + G4;
      var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
      var y2 = y0 - j2 + 2.0 * G4;
      var z2 = z0 - k2 + 2.0 * G4;
      var w2 = w0 - l2 + 2.0 * G4;
      var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
      var y3 = y0 - j3 + 3.0 * G4;
      var z3 = z0 - k3 + 3.0 * G4;
      var w3 = w0 - l3 + 3.0 * G4;
      var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
      var y4 = y0 - 1.0 + 4.0 * G4;
      var z4 = z0 - 1.0 + 4.0 * G4;
      var w4 = w0 - 1.0 + 4.0 * G4;
      // Work out the hashed gradient indices of the five simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      var ll = l & 255;
      // Calculate the contribution from the five corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
      if (t0 < 0) n0 = 0.0;
      else {
        var gi0 = (perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32) * 4;
        t0 *= t0;
        n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
      if (t1 < 0) n1 = 0.0;
      else {
        var gi1 = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32) * 4;
        t1 *= t1;
        n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
      if (t2 < 0) n2 = 0.0;
      else {
        var gi2 = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32) * 4;
        t2 *= t2;
        n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
      if (t3 < 0) n3 = 0.0;
      else {
        var gi3 = (perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32) * 4;
        t3 *= t3;
        n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
      }
      var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
      if (t4 < 0) n4 = 0.0;
      else {
        var gi4 = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32) * 4;
        t4 *= t4;
        n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
      }
      // Sum up and scale the result to cover the range [-1,1]
      return 27.0 * (n0 + n1 + n2 + n3 + n4);
    }
  };

  function buildPermutationTable(random) {
    var i;
    var p = new Uint8Array(256);
    for (i = 0; i < 256; i++) {
      p[i] = i;
    }
    for (i = 0; i < 255; i++) {
      var r = i + ~~(random() * (256 - i));
      var aux = p[i];
      p[i] = p[r];
      p[r] = aux;
    }
    return p;
  }
  SimplexNoise._buildPermutationTable = buildPermutationTable;

  function alea() {
    // Johannes Baagøe <baagoe@baagoe.com>, 2010
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;

    var mash = masher();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < arguments.length; i++) {
      s0 -= mash(arguments[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(arguments[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(arguments[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;
    return function() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
  }
  function masher() {
    var n = 0xefc8249d;
    return function(data) {
      data = data.toString();
      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
  }

  // amd
  if (true) !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {return SimplexNoise;}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  // common js
  if (true) exports.SimplexNoise = SimplexNoise;
  // browser
  else {}
  // nodejs
  if (true) {
    module.exports = SimplexNoise;
  }

})();


/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./src/designs/science.js":
/*!********************************!*\
  !*** ./src/designs/science.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");
const c_math = __webpack_require__(/*! canvas-sketch-util/math */ "./node_modules/canvas-sketch-util/math.js")
const c_random = __webpack_require__(/*! canvas-sketch-util/random */ "./node_modules/canvas-sketch-util/random.js")
;

let [canvas, ctx, canvasW, canvasH, hero] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
}

const bg = '#000B94'
const lightBlue = '#9DC9FF'
const redish = '#FF7A00'
const orange = '#FF9D00'
const yellow = '#FFD300'
let a = 0

const circles = [
  {
    'radius' : canvasH / 2,
    'points' : 7,
    'colors' : [yellow, orange, redish, orange, yellow, redish, orange]
  },
  {
    'radius' : canvasH / 3,
    'points' : 5,
    'colors' : [redish, yellow, redish, orange, redish]
  },
  {
    'radius' : canvasH / 5,
    'points' : 4,
    'colors' : [redish, orange, yellow, orange]
  }
]

function science() {
  resize()
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvasW, canvasH)

  circles.map( (item) => {
    ctx.save()
    ctx.strokeStyle = lightBlue
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(canvasW, canvasH, item.radius, 0 , 2 * Math.PI)
    ctx.stroke()
    ctx.restore()

    for (let i = 0; i < item.points; i++) {
      ctx.strokeStyle = bg
      ctx.lineWidth = 5
      const slice = c_math.degToRad(360 / item.points)
      let angle
      if (circles.indexOf(item) % 2) {
        angle = slice * i - a
      } else {
        angle = slice * i + a
      }

      const x = canvasW + item.radius * Math.sin(angle)
      const y = canvasH + item.radius * Math.cos(angle)

      ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-angle)

        ctx.fillStyle = item.colors[i]
        ctx.beginPath()
        ctx.arc(0, 0, 10, 0, 2 *Math.PI)
        ctx.fill()
        ctx.stroke()
      ctx.restore()
    }
  })
  a = a + 0.001

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = '48px sans-serif'
  ctx.fillStyle = orange
  ctx.fillText('SCIENCE', canvasW / 2, canvasH / 3)
  ctx.restore()

  window.requestAnimationFrame(science)

  hero.appendChild(canvas)
  return hero
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (science);

/***/ }),

/***/ "./src/designs/waves.js":
/*!******************************!*\
  !*** ./src/designs/waves.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var canvas_sketch_util_lib_rgba_to_hex__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! canvas-sketch-util/lib/rgba-to-hex */ "./node_modules/canvas-sketch-util/lib/rgba-to-hex.js");
/* harmony import */ var canvas_sketch_util_lib_rgba_to_hex__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(canvas_sketch_util_lib_rgba_to_hex__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");


const c_random = __webpack_require__(/*! canvas-sketch-util/random */ "./node_modules/canvas-sketch-util/random.js")

let [canvas, ctx, canvasW, canvasH, hero] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_1__["default"])()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
}

function getLonger() {
  let a;
  (canvasW > canvasH) ? a = canvasW : a = canvasH
  return a
}

function getGrd(rad) {
  let circleGdr = ctx.createRadialGradient(0, 0, 0, 0, 0, rad)
  circleGdr.addColorStop(0, 'rgb(210, 163, 93)')
  circleGdr.addColorStop(0.30, 'rgb(217, 177, 118')
  circleGdr.addColorStop(0.56, 'rgb(236, 213, 179')
  circleGdr.addColorStop(0.90, 'rgb(201, 232, 249)')
  circleGdr.addColorStop(1, 'rgb(220, 220, 220)')
  return circleGdr
}

// SHAPE
let topPath = [
  {
    'x' : 0,
    'y' : 0.5 / 4 * canvasH
  },
  {
    'x' : 0.5 / 2 * canvasW,
    'y' : 0.5 / 8 * canvasH
  },
  {
    'x' : 1 / 2 * canvasW,
    'y' : 0.5 / 4 * canvasH
  },
  {
    'x' : 1.5 / 2 * canvasW,
    'y' : 1.5 / 8 * canvasH
  },
  {
    'x' : canvasW,
    'y' : 0.5 / 4 * canvasH
  }
]

let bottomPath = [
  { 
    'x' : 0,
    'y' : 3.5 / 4 * canvasH
  },
  { 
    'x' : 0.5 / 2 * canvasW,
    'y' : 7.5/8 * canvasH
  },
  { 
    'x' : 1 / 2 * canvasW,
    'y' : 3.5/4 * canvasH
  },
  { 
    'x' : 1.5 / 2 * canvasW,
    'y' : 6.5/8 * canvasH
  },
  { 
    'x' : canvasW,
    'y' : 3.5 / 4 * canvasH
  }
]

// CIRCLES
class Origin {
  constructor() {
    this.x = c_random.range(0, canvasW)
    this.y = c_random.range(0, canvasH)
    this.velX = c_random.range(0.5, 3)
    this.velY = c_random.range(0.5, 3)
  }
}

let topOrigin = new Origin()
let bottomOrigin = new Origin()

// TITLE
const titleRad = 200
let grdWhite = ctx.createRadialGradient(
  canvasW / 2, 
  canvasH / 2 + titleRad, 
  1, 
  canvasW / 2, 
  canvasH / 2 + titleRad,
  titleRad * 2.5
  )
grdWhite.addColorStop(0, 'rgb(255, 255, 255, 0)')
grdWhite.addColorStop(1, 'rgb(255, 255, 255, 1)')

function waves () {
  resize()
  ctx.clearRect(0, 0, canvasW, canvasH)
  let circleRad = getLonger() / 1.75

  ctx.fillStyle = getGrd(circleRad)
  // BACKGROUND
  ctx.save()
  ctx.translate(canvasW / 2, canvasH / 2)
  
  ctx.arc(0, 0, circleRad, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  // TOP
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(topPath[0].x, topPath[0].y)
  ctx.bezierCurveTo(topPath[1].x, topPath[1].y, topPath[1].x, topPath[1].y, topPath[2].x, topPath[2].y)
  ctx.bezierCurveTo(topPath[3].x, topPath[3].y, topPath[3].x, topPath[3].y, topPath[4].x, topPath[4].y)
  ctx.lineTo(canvasW, 0)
  ctx.lineTo(0, 0)
  ctx.lineTo(topPath[0].x, topPath[0].y)
  ctx.closePath()
  ctx.clip()
  ctx.translate(topOrigin.x, topOrigin.y)
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.fill()
  ctx.restore()
  // move
  if (topOrigin.x <= 0 || topOrigin.x >= canvasW) topOrigin.velX *= -1 //bounce
  if (topOrigin.y <= 0 || topOrigin.y >= canvasH) topOrigin.velY *= -1
  topOrigin.x += topOrigin.velX
  topOrigin.y += topOrigin.velY;  
  // if (topPath[1].y >= 0.5 / 8 * canvasH & topPath[1].y <= 1.5 / 8 * canvasH) {
  //   topPath[1].y = topPath[1].y + 0.5
  // } else {
  //   topPath[1].y = topPath[1].y - 0.5
  // }

  // BOTTOM
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(bottomPath[0].x, bottomPath[0].y)
  ctx.bezierCurveTo(bottomPath[1].x, bottomPath[1].y, bottomPath[1].x, bottomPath[1].y, bottomPath[2].x, bottomPath[2].y)
  ctx.bezierCurveTo(bottomPath[3].x, bottomPath[3].y, bottomPath[3].x, bottomPath[3].y, bottomPath[4].x, bottomPath[4].y)
  ctx.lineTo(canvasW, canvasH)
  ctx.lineTo(0, canvasH)
  ctx.lineTo(bottomPath[0].x, bottomPath[0].y)
  ctx.closePath()
  ctx.clip()
  // move ctx start
  ctx.translate(bottomOrigin.x, bottomOrigin.y)
  if (bottomOrigin.x <= 0 || bottomOrigin.x >= canvasW) bottomOrigin.velX *= -1 //bounce
  if (bottomOrigin.y <= 0 || bottomOrigin.y >= canvasH) bottomOrigin.velY *= -1
  bottomOrigin.x += bottomOrigin.velX
  bottomOrigin.y += bottomOrigin.velY
  // fill clip
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.fill()
  ctx.restore()

  // CIRCLE
  // ctx.globalCompositeOperation = 'source-atop'
  ctx.save()
  ctx.fillStyle = grdWhite
  ctx.beginPath()
  ctx.arc(canvasW / 2, canvasH / 2, titleRad, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  //TXT

  window.requestAnimationFrame(waves)
  hero.appendChild(canvas)
  return hero
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (waves);

/***/ }),

/***/ "./src/designs/wine.js":
/*!*****************************!*\
  !*** ./src/designs/wine.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setCanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../setCanvas */ "./src/setCanvas.js");

const c_random = __webpack_require__(/*! canvas-sketch-util/random */ "./node_modules/canvas-sketch-util/random.js")

let [canvas, ctx, canvasW, canvasH, hero] = (0,_setCanvas__WEBPACK_IMPORTED_MODULE_0__["default"])()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
  cw = canvasW / 2
  ch = canvasH / 2
  radius = setRadius()
}

function setRadius () {
  let a;
  (canvasW > canvasH) ? a = canvasW : a = canvasH 
  return a
}

function setVel() {
  let v = c_random.range(0.5, 3)
  return v
}

let cw = canvasW / 2
let ch = canvasH / 2
let radius = setRadius()
const fontSize = 50

const color = '#912853'
const grd = ctx.createRadialGradient(cw, ch, 1, cw, ch, radius);
grd.addColorStop(0, color);
grd.addColorStop(0.6, 'rgb(255, 255, 255, 0)')

class Circle{
  constructor(num) {
    this.rad = radius / num,
    this.x = c_random.range(0, canvasW)
    this.y = c_random.range(0, canvasH)
    this.velX = setVel()
    this.velY = setVel()
  }
}

const rads = [1, 1, 2, 2, 2, 3]
let points = []
rads.map(item => { 
  let p = new Circle(item)
  points.push(p)
})

function wine () {
  resize()
  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.globalCompositeOperation = 'multiply'

  // MOVING POIS
  points.map( (item) => {
    if (item.x < -50 || item.x > canvasW +50) { //resize smaller
      item.x = setX()
      item.y = setY()
    }
    ctx.save()
    ctx.translate(item.x, item.y)
    let itemGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, item.rad)
    itemGrd.addColorStop(0, color);
    itemGrd.addColorStop(1, 'rgb(255, 255, 255, 0)')
    ctx.fillStyle = itemGrd
    ctx.beginPath()
    ctx.arc(0, 0, item.rad, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    if (item.x <= 0 || item.x >= canvasW) item.velX *= -1 //bounce
    if (item.y <= 0 || item.y >= canvasH) item.velY *= -1
    item.x += item.velX
    item.y += item.velY
  })

  // TITLE
  ctx.fillStyle = grd
  ctx.save()
  ctx.beginPath()
  ctx.arc(cw, ch, radius, 0 , 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  ctx.globalCompositeOperation = 'source-atop'
  let whiteRadius
  (radius > 150) ? whiteRadius = 150 : whiteRadius = radius / 5
  ctx.save()
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(cw, ch, whiteRadius, 0 , 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = color
  ctx.fillText('WINE', canvasW / 2, canvasH / 2 + fontSize / 2)
  ctx.restore()

  // SETUP
  window.requestAnimationFrame(wine)
  hero.appendChild(canvas)
  return hero
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (wine);

/***/ }),

/***/ "./src/setCanvas.js":
/*!**************************!*\
  !*** ./src/setCanvas.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function setCanvas () {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const canvasW = window.innerWidth - 20
  const canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH

  const hero = document.createElement('div')
  hero.classList.add('hero-box')

  return [canvas, ctx, canvasW, canvasH, hero]
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (setCanvas);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var _designs_science__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./designs/science */ "./src/designs/science.js");
/* harmony import */ var _designs_wine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./designs/wine */ "./src/designs/wine.js");
/* harmony import */ var _designs_waves__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./designs/waves */ "./src/designs/waves.js");





const container = document.createElement('div')
container.id = 'container'

// container.appendChild(science())
// container.appendChild(wine())
container.appendChild((0,_designs_waves__WEBPACK_IMPORTED_MODULE_3__["default"])())
document.body.appendChild(container)
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FB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O0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZTs7Ozs7Ozs7Ozs7Ozs7OztBQ3BMcUI7QUFDcEMsaUJBQWlCLG1CQUFPLENBQUMsOEVBQTJCOztBQUVwRCw0Q0FBNEMsc0RBQVM7O0FBRXJEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLFNBQVM7QUFDekI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUVBQWU7Ozs7Ozs7Ozs7Ozs7OztBQy9HZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsaUVBQWU7Ozs7OztVQ2RmO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOzs7Ozs7Ozs7Ozs7Ozs7O0FDQW9CO0FBQ21CO0FBQ047QUFDRTs7QUFFbkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0JBQXNCLDBEQUFLO0FBQzNCLG9DIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL2xpYi9yZ2JhLXRvLWhleC5qcyIsIndlYnBhY2s6Ly9jYW52YXMtaGVyby8uL25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoLXV0aWwvbGliL3dyYXAuanMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL21hdGguanMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbS5qcyIsIndlYnBhY2s6Ly9jYW52YXMtaGVyby8uL3NyYy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2NhbnZhcy1oZXJvLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9ub2RlX21vZHVsZXMvZGVmaW5lZC9pbmRleC5qcyIsIndlYnBhY2s6Ly9jYW52YXMtaGVyby8uL25vZGVfbW9kdWxlcy9zZWVkLXJhbmRvbS9pbmRleC5qcyIsIndlYnBhY2s6Ly9jYW52YXMtaGVyby8uL25vZGVfbW9kdWxlcy9zaW1wbGV4LW5vaXNlL3NpbXBsZXgtbm9pc2UuanMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9zcmMvc3R5bGUuY3NzPzcxNjMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2NhbnZhcy1oZXJvLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2NhbnZhcy1oZXJvLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2NhbnZhcy1oZXJvLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9jYW52YXMtaGVyby8uL3NyYy9kZXNpZ25zL3NjaWVuY2UuanMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9zcmMvZGVzaWducy93YXZlcy5qcyIsIndlYnBhY2s6Ly9jYW52YXMtaGVyby8uL3NyYy9kZXNpZ25zL3dpbmUuanMiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9zcmMvc2V0Q2FudmFzLmpzIiwid2VicGFjazovL2NhbnZhcy1oZXJvL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NhbnZhcy1oZXJvL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2NhbnZhcy1oZXJvL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9jYW52YXMtaGVyby93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2NhbnZhcy1oZXJvL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jYW52YXMtaGVyby93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vY2FudmFzLWhlcm8vLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZ2JhVG9IZXg7XG5mdW5jdGlvbiByZ2JhVG9IZXggKHJnYmEpIHtcbiAgaWYgKCFyZ2JhIHx8ICFBcnJheS5pc0FycmF5KHJnYmEpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBzcGVjaWZ5IGFuIGFycmF5IHRvIGNvbnZlcnQgaW50byBhIGhleCBjb2RlJyk7XG4gIH1cblxuICB2YXIgciA9IE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZChyZ2JhWzBdIHx8IDApKSk7XG4gIHZhciBnID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHJnYmFbMV0gfHwgMCkpKTtcbiAgdmFyIGIgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQocmdiYVsyXSB8fCAwKSkpO1xuXG4gIHZhciBhbHBoYSA9IHJnYmFbM107XG4gIGlmICh0eXBlb2YgYWxwaGEgPT09ICd1bmRlZmluZWQnIHx8ICFpc0Zpbml0ZShhbHBoYSkpIHtcbiAgICBhbHBoYSA9IDE7XG4gIH1cbiAgdmFyIGEgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQoYWxwaGEgKiAyNTUpKSk7XG4gIHZhciBhbHBoYVBhcmFtID0gYSA9PT0gMjU1ID8gJycgOiAoYSB8IDEgPDwgOCkudG9TdHJpbmcoMTYpLnNsaWNlKDEpO1xuICB2YXIgcmVzdWx0ID0gKChiIHwgZyA8PCA4IHwgciA8PCAxNikgfCAxIDw8IDI0KS50b1N0cmluZygxNikuc2xpY2UoMSkgKyBhbHBoYVBhcmFtO1xuICByZXR1cm4gJyMnICsgcmVzdWx0O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB3cmFwO1xuZnVuY3Rpb24gd3JhcCAodmFsdWUsIGZyb20sIHRvKSB7XG4gIGlmICh0eXBlb2YgZnJvbSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHRvICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3Qgc3BlY2lmeSBcInRvXCIgYW5kIFwiZnJvbVwiIGFyZ3VtZW50cyBhcyBudW1iZXJzJyk7XG4gIH1cbiAgLy8gYWxnb3JpdGhtIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTg1MjYyOC81OTk4ODRcbiAgaWYgKGZyb20gPiB0bykge1xuICAgIHZhciB0ID0gZnJvbTtcbiAgICBmcm9tID0gdG87XG4gICAgdG8gPSB0O1xuICB9XG4gIHZhciBjeWNsZSA9IHRvIC0gZnJvbTtcbiAgaWYgKGN5Y2xlID09PSAwKSB7XG4gICAgcmV0dXJuIHRvO1xuICB9XG4gIHJldHVybiB2YWx1ZSAtIGN5Y2xlICogTWF0aC5mbG9vcigodmFsdWUgLSBmcm9tKSAvIGN5Y2xlKTtcbn1cbiIsInZhciBkZWZpbmVkID0gcmVxdWlyZSgnZGVmaW5lZCcpO1xudmFyIHdyYXAgPSByZXF1aXJlKCcuL2xpYi93cmFwJyk7XG52YXIgRVBTSUxPTiA9IE51bWJlci5FUFNJTE9OO1xuXG5mdW5jdGlvbiBjbGFtcCAodmFsdWUsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBtaW4gPCBtYXhcbiAgICA/ICh2YWx1ZSA8IG1pbiA/IG1pbiA6IHZhbHVlID4gbWF4ID8gbWF4IDogdmFsdWUpXG4gICAgOiAodmFsdWUgPCBtYXggPyBtYXggOiB2YWx1ZSA+IG1pbiA/IG1pbiA6IHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gY2xhbXAwMSAodikge1xuICByZXR1cm4gY2xhbXAodiwgMCwgMSk7XG59XG5cbmZ1bmN0aW9uIGxlcnAgKG1pbiwgbWF4LCB0KSB7XG4gIHJldHVybiBtaW4gKiAoMSAtIHQpICsgbWF4ICogdDtcbn1cblxuZnVuY3Rpb24gaW52ZXJzZUxlcnAgKG1pbiwgbWF4LCB0KSB7XG4gIGlmIChNYXRoLmFicyhtaW4gLSBtYXgpIDwgRVBTSUxPTikgcmV0dXJuIDA7XG4gIGVsc2UgcmV0dXJuICh0IC0gbWluKSAvIChtYXggLSBtaW4pO1xufVxuXG5mdW5jdGlvbiBzbW9vdGhzdGVwIChtaW4sIG1heCwgdCkge1xuICB2YXIgeCA9IGNsYW1wKGludmVyc2VMZXJwKG1pbiwgbWF4LCB0KSwgMCwgMSk7XG4gIHJldHVybiB4ICogeCAqICgzIC0gMiAqIHgpO1xufVxuXG5mdW5jdGlvbiB0b0Zpbml0ZSAobiwgZGVmYXVsdFZhbHVlKSB7XG4gIGRlZmF1bHRWYWx1ZSA9IGRlZmluZWQoZGVmYXVsdFZhbHVlLCAwKTtcbiAgcmV0dXJuIHR5cGVvZiBuID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShuKSA/IG4gOiBkZWZhdWx0VmFsdWU7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZFZlY3RvciAoZGltcykge1xuICBpZiAodHlwZW9mIGRpbXMgIT09ICdudW1iZXInKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBkaW1zIGFyZ3VtZW50Jyk7XG4gIHJldHVybiBmdW5jdGlvbiAocCwgZGVmYXVsdFZhbHVlKSB7XG4gICAgZGVmYXVsdFZhbHVlID0gZGVmaW5lZChkZWZhdWx0VmFsdWUsIDApO1xuICAgIHZhciBzY2FsYXI7XG4gICAgaWYgKHAgPT0gbnVsbCkge1xuICAgICAgLy8gTm8gdmVjdG9yLCBjcmVhdGUgYSBkZWZhdWx0IG9uZVxuICAgICAgc2NhbGFyID0gZGVmYXVsdFZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHAgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHApKSB7XG4gICAgICAvLyBFeHBhbmQgc2luZ2xlIGNoYW5uZWwgdG8gbXVsdGlwbGUgdmVjdG9yXG4gICAgICBzY2FsYXIgPSBwO1xuICAgIH1cblxuICAgIHZhciBvdXQgPSBbXTtcbiAgICB2YXIgaTtcbiAgICBpZiAoc2NhbGFyID09IG51bGwpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBkaW1zOyBpKyspIHtcbiAgICAgICAgb3V0W2ldID0gdG9GaW5pdGUocFtpXSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGRpbXM7IGkrKykge1xuICAgICAgICBvdXRbaV0gPSBzY2FsYXI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGxlcnBBcnJheSAobWluLCBtYXgsIHQsIG91dCkge1xuICBvdXQgPSBvdXQgfHwgW107XG4gIGlmIChtaW4ubGVuZ3RoICE9PSBtYXgubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWluIGFuZCBtYXggYXJyYXkgYXJlIGV4cGVjdGVkIHRvIGhhdmUgdGhlIHNhbWUgbGVuZ3RoJyk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtaW4ubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRbaV0gPSBsZXJwKG1pbltpXSwgbWF4W2ldLCB0KTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBuZXdBcnJheSAobiwgaW5pdGlhbFZhbHVlKSB7XG4gIG4gPSBkZWZpbmVkKG4sIDApO1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBuIGFyZ3VtZW50IHRvIGJlIGEgbnVtYmVyJyk7XG4gIHZhciBvdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIG91dC5wdXNoKGluaXRpYWxWYWx1ZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIGxpbnNwYWNlIChuLCBvcHRzKSB7XG4gIG4gPSBkZWZpbmVkKG4sIDApO1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBuIGFyZ3VtZW50IHRvIGJlIGEgbnVtYmVyJyk7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICBpZiAodHlwZW9mIG9wdHMgPT09ICdib29sZWFuJykge1xuICAgIG9wdHMgPSB7IGVuZHBvaW50OiB0cnVlIH07XG4gIH1cbiAgdmFyIG9mZnNldCA9IGRlZmluZWQob3B0cy5vZmZzZXQsIDApO1xuICBpZiAob3B0cy5lbmRwb2ludCkge1xuICAgIHJldHVybiBuZXdBcnJheShuKS5tYXAoZnVuY3Rpb24gKF8sIGkpIHtcbiAgICAgIHJldHVybiBuIDw9IDEgPyAwIDogKChpICsgb2Zmc2V0KSAvIChuIC0gMSkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXdBcnJheShuKS5tYXAoZnVuY3Rpb24gKF8sIGkpIHtcbiAgICAgIHJldHVybiAoaSArIG9mZnNldCkgLyBuO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxlcnBGcmFtZXMgKHZhbHVlcywgdCwgb3V0KSB7XG4gIHQgPSBjbGFtcCh0LCAwLCAxKTtcblxuICB2YXIgbGVuID0gdmFsdWVzLmxlbmd0aCAtIDE7XG4gIHZhciB3aG9sZSA9IHQgKiBsZW47XG4gIHZhciBmcmFtZSA9IE1hdGguZmxvb3Iod2hvbGUpO1xuICB2YXIgZnJhY3QgPSB3aG9sZSAtIGZyYW1lO1xuXG4gIHZhciBuZXh0RnJhbWUgPSBNYXRoLm1pbihmcmFtZSArIDEsIGxlbik7XG4gIHZhciBhID0gdmFsdWVzW2ZyYW1lICUgdmFsdWVzLmxlbmd0aF07XG4gIHZhciBiID0gdmFsdWVzW25leHRGcmFtZSAlIHZhbHVlcy5sZW5ndGhdO1xuICBpZiAodHlwZW9mIGEgPT09ICdudW1iZXInICYmIHR5cGVvZiBiID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBsZXJwKGEsIGIsIGZyYWN0KTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGEpICYmIEFycmF5LmlzQXJyYXkoYikpIHtcbiAgICByZXR1cm4gbGVycEFycmF5KGEsIGIsIGZyYWN0LCBvdXQpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc21hdGNoIGluIHZhbHVlIHR5cGUgb2YgdHdvIGFycmF5IGVsZW1lbnRzOiAnICsgZnJhbWUgKyAnIGFuZCAnICsgbmV4dEZyYW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtb2QgKGEsIGIpIHtcbiAgcmV0dXJuICgoYSAlIGIpICsgYikgJSBiO1xufVxuXG5mdW5jdGlvbiBkZWdUb1JhZCAobikge1xuICByZXR1cm4gbiAqIE1hdGguUEkgLyAxODA7XG59XG5cbmZ1bmN0aW9uIHJhZFRvRGVnIChuKSB7XG4gIHJldHVybiBuICogMTgwIC8gTWF0aC5QSTtcbn1cblxuZnVuY3Rpb24gZnJhY3QgKG4pIHtcbiAgcmV0dXJuIG4gLSBNYXRoLmZsb29yKG4pO1xufVxuXG5mdW5jdGlvbiBzaWduIChuKSB7XG4gIGlmIChuID4gMCkgcmV0dXJuIDE7XG4gIGVsc2UgaWYgKG4gPCAwKSByZXR1cm4gLTE7XG4gIGVsc2UgcmV0dXJuIDA7XG59XG5cbi8vIFNwZWNpZmljIGZ1bmN0aW9uIGZyb20gVW5pdHkgLyBvZk1hdGgsIG5vdCBzdXJlIGl0cyBuZWVkZWQ/XG4vLyBmdW5jdGlvbiBsZXJwV3JhcCAoYSwgYiwgdCwgbWluLCBtYXgpIHtcbi8vICAgcmV0dXJuIHdyYXAoYSArIHdyYXAoYiAtIGEsIG1pbiwgbWF4KSAqIHQsIG1pbiwgbWF4KVxuLy8gfVxuXG5mdW5jdGlvbiBwaW5nUG9uZyAodCwgbGVuZ3RoKSB7XG4gIHQgPSBtb2QodCwgbGVuZ3RoICogMik7XG4gIHJldHVybiBsZW5ndGggLSBNYXRoLmFicyh0IC0gbGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gZGFtcCAoYSwgYiwgbGFtYmRhLCBkdCkge1xuICByZXR1cm4gbGVycChhLCBiLCAxIC0gTWF0aC5leHAoLWxhbWJkYSAqIGR0KSk7XG59XG5cbmZ1bmN0aW9uIGRhbXBBcnJheSAoYSwgYiwgbGFtYmRhLCBkdCwgb3V0KSB7XG4gIG91dCA9IG91dCB8fCBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0W2ldID0gZGFtcChhW2ldLCBiW2ldLCBsYW1iZGEsIGR0KTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBtYXBSYW5nZSAodmFsdWUsIGlucHV0TWluLCBpbnB1dE1heCwgb3V0cHV0TWluLCBvdXRwdXRNYXgsIGNsYW1wKSB7XG4gIC8vIFJlZmVyZW5jZTpcbiAgLy8gaHR0cHM6Ly9vcGVuZnJhbWV3b3Jrcy5jYy9kb2N1bWVudGF0aW9uL21hdGgvb2ZNYXRoL1xuICBpZiAoTWF0aC5hYnMoaW5wdXRNaW4gLSBpbnB1dE1heCkgPCBFUFNJTE9OKSB7XG4gICAgcmV0dXJuIG91dHB1dE1pbjtcbiAgfSBlbHNlIHtcbiAgICB2YXIgb3V0VmFsID0gKCh2YWx1ZSAtIGlucHV0TWluKSAvIChpbnB1dE1heCAtIGlucHV0TWluKSAqIChvdXRwdXRNYXggLSBvdXRwdXRNaW4pICsgb3V0cHV0TWluKTtcbiAgICBpZiAoY2xhbXApIHtcbiAgICAgIGlmIChvdXRwdXRNYXggPCBvdXRwdXRNaW4pIHtcbiAgICAgICAgaWYgKG91dFZhbCA8IG91dHB1dE1heCkgb3V0VmFsID0gb3V0cHV0TWF4O1xuICAgICAgICBlbHNlIGlmIChvdXRWYWwgPiBvdXRwdXRNaW4pIG91dFZhbCA9IG91dHB1dE1pbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvdXRWYWwgPiBvdXRwdXRNYXgpIG91dFZhbCA9IG91dHB1dE1heDtcbiAgICAgICAgZWxzZSBpZiAob3V0VmFsIDwgb3V0cHV0TWluKSBvdXRWYWwgPSBvdXRwdXRNaW47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRWYWw7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vZDogbW9kLFxuICBmcmFjdDogZnJhY3QsXG4gIHNpZ246IHNpZ24sXG4gIGRlZ1RvUmFkOiBkZWdUb1JhZCxcbiAgcmFkVG9EZWc6IHJhZFRvRGVnLFxuICB3cmFwOiB3cmFwLFxuICBwaW5nUG9uZzogcGluZ1BvbmcsXG4gIGxpbnNwYWNlOiBsaW5zcGFjZSxcbiAgbGVycDogbGVycCxcbiAgbGVycEFycmF5OiBsZXJwQXJyYXksXG4gIGludmVyc2VMZXJwOiBpbnZlcnNlTGVycCxcbiAgbGVycEZyYW1lczogbGVycEZyYW1lcyxcbiAgY2xhbXA6IGNsYW1wLFxuICBjbGFtcDAxOiBjbGFtcDAxLFxuICBzbW9vdGhzdGVwOiBzbW9vdGhzdGVwLFxuICBkYW1wOiBkYW1wLFxuICBkYW1wQXJyYXk6IGRhbXBBcnJheSxcbiAgbWFwUmFuZ2U6IG1hcFJhbmdlLFxuICBleHBhbmQyRDogZXhwYW5kVmVjdG9yKDIpLFxuICBleHBhbmQzRDogZXhwYW5kVmVjdG9yKDMpLFxuICBleHBhbmQ0RDogZXhwYW5kVmVjdG9yKDQpXG59O1xuIiwidmFyIHNlZWRSYW5kb20gPSByZXF1aXJlKCdzZWVkLXJhbmRvbScpO1xudmFyIFNpbXBsZXhOb2lzZSA9IHJlcXVpcmUoJ3NpbXBsZXgtbm9pc2UnKTtcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnZGVmaW5lZCcpO1xuXG5mdW5jdGlvbiBjcmVhdGVSYW5kb20gKGRlZmF1bHRTZWVkKSB7XG4gIGRlZmF1bHRTZWVkID0gZGVmaW5lZChkZWZhdWx0U2VlZCwgbnVsbCk7XG4gIHZhciBkZWZhdWx0UmFuZG9tID0gTWF0aC5yYW5kb207XG4gIHZhciBjdXJyZW50U2VlZDtcbiAgdmFyIGN1cnJlbnRSYW5kb207XG4gIHZhciBub2lzZUdlbmVyYXRvcjtcbiAgdmFyIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICB2YXIgX2hhc05leHRHYXVzc2lhbiA9IGZhbHNlO1xuXG4gIHNldFNlZWQoZGVmYXVsdFNlZWQpO1xuXG4gIHJldHVybiB7XG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGNyZWF0ZVJhbmRvbTogZnVuY3Rpb24gKGRlZmF1bHRTZWVkKSB7XG4gICAgICByZXR1cm4gY3JlYXRlUmFuZG9tKGRlZmF1bHRTZWVkKTtcbiAgICB9LFxuICAgIHNldFNlZWQ6IHNldFNlZWQsXG4gICAgZ2V0U2VlZDogZ2V0U2VlZCxcbiAgICBnZXRSYW5kb21TZWVkOiBnZXRSYW5kb21TZWVkLFxuICAgIHZhbHVlTm9uWmVybzogdmFsdWVOb25aZXJvLFxuICAgIHBlcm11dGVOb2lzZTogcGVybXV0ZU5vaXNlLFxuICAgIG5vaXNlMUQ6IG5vaXNlMUQsXG4gICAgbm9pc2UyRDogbm9pc2UyRCxcbiAgICBub2lzZTNEOiBub2lzZTNELFxuICAgIG5vaXNlNEQ6IG5vaXNlNEQsXG4gICAgc2lnbjogc2lnbixcbiAgICBib29sZWFuOiBib29sZWFuLFxuICAgIGNoYW5jZTogY2hhbmNlLFxuICAgIHJhbmdlOiByYW5nZSxcbiAgICByYW5nZUZsb29yOiByYW5nZUZsb29yLFxuICAgIHBpY2s6IHBpY2ssXG4gICAgc2h1ZmZsZTogc2h1ZmZsZSxcbiAgICBvbkNpcmNsZTogb25DaXJjbGUsXG4gICAgaW5zaWRlQ2lyY2xlOiBpbnNpZGVDaXJjbGUsXG4gICAgb25TcGhlcmU6IG9uU3BoZXJlLFxuICAgIGluc2lkZVNwaGVyZTogaW5zaWRlU3BoZXJlLFxuICAgIHF1YXRlcm5pb246IHF1YXRlcm5pb24sXG4gICAgd2VpZ2h0ZWQ6IHdlaWdodGVkLFxuICAgIHdlaWdodGVkU2V0OiB3ZWlnaHRlZFNldCxcbiAgICB3ZWlnaHRlZFNldEluZGV4OiB3ZWlnaHRlZFNldEluZGV4LFxuICAgIGdhdXNzaWFuOiBnYXVzc2lhblxuICB9O1xuXG4gIGZ1bmN0aW9uIHNldFNlZWQgKHNlZWQsIG9wdCkge1xuICAgIGlmICh0eXBlb2Ygc2VlZCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHNlZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjdXJyZW50U2VlZCA9IHNlZWQ7XG4gICAgICBjdXJyZW50UmFuZG9tID0gc2VlZFJhbmRvbShjdXJyZW50U2VlZCwgb3B0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudFNlZWQgPSB1bmRlZmluZWQ7XG4gICAgICBjdXJyZW50UmFuZG9tID0gZGVmYXVsdFJhbmRvbTtcbiAgICB9XG4gICAgbm9pc2VHZW5lcmF0b3IgPSBjcmVhdGVOb2lzZSgpO1xuICAgIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICAgIF9oYXNOZXh0R2F1c3NpYW4gPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbHVlICgpIHtcbiAgICByZXR1cm4gY3VycmVudFJhbmRvbSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsdWVOb25aZXJvICgpIHtcbiAgICB2YXIgdSA9IDA7XG4gICAgd2hpbGUgKHUgPT09IDApIHUgPSB2YWx1ZSgpO1xuICAgIHJldHVybiB1O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2VlZCAoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRTZWVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmFuZG9tU2VlZCAoKSB7XG4gICAgdmFyIHNlZWQgPSBTdHJpbmcoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMCkpO1xuICAgIHJldHVybiBzZWVkO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlTm9pc2UgKCkge1xuICAgIHJldHVybiBuZXcgU2ltcGxleE5vaXNlKGN1cnJlbnRSYW5kb20pO1xuICB9XG5cbiAgZnVuY3Rpb24gcGVybXV0ZU5vaXNlICgpIHtcbiAgICBub2lzZUdlbmVyYXRvciA9IGNyZWF0ZU5vaXNlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTFEICh4LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgZnJlcXVlbmN5ID0gZGVmaW5lZChmcmVxdWVuY3ksIDEpO1xuICAgIGFtcGxpdHVkZSA9IGRlZmluZWQoYW1wbGl0dWRlLCAxKTtcbiAgICByZXR1cm4gYW1wbGl0dWRlICogbm9pc2VHZW5lcmF0b3Iubm9pc2UyRCh4ICogZnJlcXVlbmN5LCAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vaXNlMkQgKHgsIHksIGZyZXF1ZW5jeSwgYW1wbGl0dWRlKSB7XG4gICAgaWYgKCFpc0Zpbml0ZSh4KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneCBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHkpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd5IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlMkQoeCAqIGZyZXF1ZW5jeSwgeSAqIGZyZXF1ZW5jeSk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTNEICh4LCB5LCB6LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneSBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHopKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd6IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlM0QoXG4gICAgICB4ICogZnJlcXVlbmN5LFxuICAgICAgeSAqIGZyZXF1ZW5jeSxcbiAgICAgIHogKiBmcmVxdWVuY3lcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9pc2U0RCAoeCwgeSwgeiwgdywgZnJlcXVlbmN5LCBhbXBsaXR1ZGUpIHtcbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd4IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeSkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3kgY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh6KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneiBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHcpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd3IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlNEQoXG4gICAgICB4ICogZnJlcXVlbmN5LFxuICAgICAgeSAqIGZyZXF1ZW5jeSxcbiAgICAgIHogKiBmcmVxdWVuY3ksXG4gICAgICB3ICogZnJlcXVlbmN5XG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNpZ24gKCkge1xuICAgIHJldHVybiBib29sZWFuKCkgPyAxIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBib29sZWFuICgpIHtcbiAgICByZXR1cm4gdmFsdWUoKSA+IDAuNTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5jZSAobikge1xuICAgIG4gPSBkZWZpbmVkKG4sIDAuNSk7XG4gICAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhwZWN0ZWQgbiB0byBiZSBhIG51bWJlcicpO1xuICAgIHJldHVybiB2YWx1ZSgpIDwgbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJhbmdlIChtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgdHlwZW9mIG1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBhcmd1bWVudHMgdG8gYmUgbnVtYmVycycpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gIH1cblxuICBmdW5jdGlvbiByYW5nZUZsb29yIChtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgdHlwZW9mIG1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBhcmd1bWVudHMgdG8gYmUgbnVtYmVycycpO1xuICAgIH1cblxuICAgIHJldHVybiBNYXRoLmZsb29yKHJhbmdlKG1pbiwgbWF4KSk7XG4gIH1cblxuICBmdW5jdGlvbiBwaWNrIChhcnJheSkge1xuICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGFycmF5W3JhbmdlRmxvb3IoMCwgYXJyYXkubGVuZ3RoKV07XG4gIH1cblxuICBmdW5jdGlvbiBzaHVmZmxlIChhcnIpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgQXJyYXksIGdvdCAnICsgdHlwZW9mIGFycik7XG4gICAgfVxuXG4gICAgdmFyIHJhbmQ7XG4gICAgdmFyIHRtcDtcbiAgICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgICB2YXIgcmV0ID0gYXJyLnNsaWNlKCk7XG4gICAgd2hpbGUgKGxlbikge1xuICAgICAgcmFuZCA9IE1hdGguZmxvb3IodmFsdWUoKSAqIGxlbi0tKTtcbiAgICAgIHRtcCA9IHJldFtsZW5dO1xuICAgICAgcmV0W2xlbl0gPSByZXRbcmFuZF07XG4gICAgICByZXRbcmFuZF0gPSB0bXA7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBmdW5jdGlvbiBvbkNpcmNsZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB0aGV0YSA9IHZhbHVlKCkgKiAyLjAgKiBNYXRoLlBJO1xuICAgIG91dFswXSA9IHJhZGl1cyAqIE1hdGguY29zKHRoZXRhKTtcbiAgICBvdXRbMV0gPSByYWRpdXMgKiBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2lkZUNpcmNsZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIG9uQ2lyY2xlKDEsIG91dCk7XG4gICAgdmFyIHIgPSByYWRpdXMgKiBNYXRoLnNxcnQodmFsdWUoKSk7XG4gICAgb3V0WzBdICo9IHI7XG4gICAgb3V0WzFdICo9IHI7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3BoZXJlIChyYWRpdXMsIG91dCkge1xuICAgIHJhZGl1cyA9IGRlZmluZWQocmFkaXVzLCAxKTtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgdmFyIHUgPSB2YWx1ZSgpICogTWF0aC5QSSAqIDI7XG4gICAgdmFyIHYgPSB2YWx1ZSgpICogMiAtIDE7XG4gICAgdmFyIHBoaSA9IHU7XG4gICAgdmFyIHRoZXRhID0gTWF0aC5hY29zKHYpO1xuICAgIG91dFswXSA9IHJhZGl1cyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSk7XG4gICAgb3V0WzFdID0gcmFkaXVzICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKTtcbiAgICBvdXRbMl0gPSByYWRpdXMgKiBNYXRoLmNvcyh0aGV0YSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2lkZVNwaGVyZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB1ID0gdmFsdWUoKSAqIE1hdGguUEkgKiAyO1xuICAgIHZhciB2ID0gdmFsdWUoKSAqIDIgLSAxO1xuICAgIHZhciBrID0gdmFsdWUoKTtcblxuICAgIHZhciBwaGkgPSB1O1xuICAgIHZhciB0aGV0YSA9IE1hdGguYWNvcyh2KTtcbiAgICB2YXIgciA9IHJhZGl1cyAqIE1hdGguY2JydChrKTtcbiAgICBvdXRbMF0gPSByICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKTtcbiAgICBvdXRbMV0gPSByICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKTtcbiAgICBvdXRbMl0gPSByICogTWF0aC5jb3ModGhldGEpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBxdWF0ZXJuaW9uIChvdXQpIHtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgdmFyIHUxID0gdmFsdWUoKTtcbiAgICB2YXIgdTIgPSB2YWx1ZSgpO1xuICAgIHZhciB1MyA9IHZhbHVlKCk7XG5cbiAgICB2YXIgc3ExID0gTWF0aC5zcXJ0KDEgLSB1MSk7XG4gICAgdmFyIHNxMiA9IE1hdGguc3FydCh1MSk7XG5cbiAgICB2YXIgdGhldGExID0gTWF0aC5QSSAqIDIgKiB1MjtcbiAgICB2YXIgdGhldGEyID0gTWF0aC5QSSAqIDIgKiB1MztcblxuICAgIHZhciB4ID0gTWF0aC5zaW4odGhldGExKSAqIHNxMTtcbiAgICB2YXIgeSA9IE1hdGguY29zKHRoZXRhMSkgKiBzcTE7XG4gICAgdmFyIHogPSBNYXRoLnNpbih0aGV0YTIpICogc3EyO1xuICAgIHZhciB3ID0gTWF0aC5jb3ModGhldGEyKSAqIHNxMjtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiB3ZWlnaHRlZFNldCAoc2V0KSB7XG4gICAgc2V0ID0gc2V0IHx8IFtdO1xuICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gc2V0W3dlaWdodGVkU2V0SW5kZXgoc2V0KV0udmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiB3ZWlnaHRlZFNldEluZGV4IChzZXQpIHtcbiAgICBzZXQgPSBzZXQgfHwgW107XG4gICAgaWYgKHNldC5sZW5ndGggPT09IDApIHJldHVybiAtMTtcbiAgICByZXR1cm4gd2VpZ2h0ZWQoc2V0Lm1hcChmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIHMud2VpZ2h0O1xuICAgIH0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdlaWdodGVkICh3ZWlnaHRzKSB7XG4gICAgd2VpZ2h0cyA9IHdlaWdodHMgfHwgW107XG4gICAgaWYgKHdlaWdodHMubGVuZ3RoID09PSAwKSByZXR1cm4gLTE7XG4gICAgdmFyIHRvdGFsV2VpZ2h0ID0gMDtcbiAgICB2YXIgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB3ZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbFdlaWdodCArPSB3ZWlnaHRzW2ldO1xuICAgIH1cblxuICAgIGlmICh0b3RhbFdlaWdodCA8PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ1dlaWdodHMgbXVzdCBzdW0gdG8gPiAwJyk7XG5cbiAgICB2YXIgcmFuZG9tID0gdmFsdWUoKSAqIHRvdGFsV2VpZ2h0O1xuICAgIGZvciAoaSA9IDA7IGkgPCB3ZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmFuZG9tIDwgd2VpZ2h0c1tpXSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICAgIHJhbmRvbSAtPSB3ZWlnaHRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdhdXNzaWFuIChtZWFuLCBzdGFuZGFyZERlcml2YXRpb24pIHtcbiAgICBtZWFuID0gZGVmaW5lZChtZWFuLCAwKTtcbiAgICBzdGFuZGFyZERlcml2YXRpb24gPSBkZWZpbmVkKHN0YW5kYXJkRGVyaXZhdGlvbiwgMSk7XG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vb3Blbmpkay1taXJyb3IvamRrN3UtamRrL2Jsb2IvZjRkODA5NTdlODlhMTlhMjliYjlmOTgwN2QyYTI4MzUxZWQ3ZjdkZi9zcmMvc2hhcmUvY2xhc3Nlcy9qYXZhL3V0aWwvUmFuZG9tLmphdmEjTDQ5NlxuICAgIGlmIChfaGFzTmV4dEdhdXNzaWFuKSB7XG4gICAgICBfaGFzTmV4dEdhdXNzaWFuID0gZmFsc2U7XG4gICAgICB2YXIgcmVzdWx0ID0gX25leHRHYXVzc2lhbjtcbiAgICAgIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICAgICAgcmV0dXJuIG1lYW4gKyBzdGFuZGFyZERlcml2YXRpb24gKiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2MSA9IDA7XG4gICAgICB2YXIgdjIgPSAwO1xuICAgICAgdmFyIHMgPSAwO1xuICAgICAgZG8ge1xuICAgICAgICB2MSA9IHZhbHVlKCkgKiAyIC0gMTsgLy8gYmV0d2VlbiAtMSBhbmQgMVxuICAgICAgICB2MiA9IHZhbHVlKCkgKiAyIC0gMTsgLy8gYmV0d2VlbiAtMSBhbmQgMVxuICAgICAgICBzID0gdjEgKiB2MSArIHYyICogdjI7XG4gICAgICB9IHdoaWxlIChzID49IDEgfHwgcyA9PT0gMCk7XG4gICAgICB2YXIgbXVsdGlwbGllciA9IE1hdGguc3FydCgtMiAqIE1hdGgubG9nKHMpIC8gcyk7XG4gICAgICBfbmV4dEdhdXNzaWFuID0gKHYyICogbXVsdGlwbGllcik7XG4gICAgICBfaGFzTmV4dEdhdXNzaWFuID0gdHJ1ZTtcbiAgICAgIHJldHVybiBtZWFuICsgc3RhbmRhcmREZXJpdmF0aW9uICogKHYxICogbXVsdGlwbGllcik7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUmFuZG9tKCk7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIioge1xcbiAgbWFyZ2luOiAwO1xcbiAgcGFkZGluZzogMDtcXG4gIC1tcy1vdmVyZmxvdy1zdHlsZTogbm9uZTtcXG4gIHNjcm9sbGJhci13aWR0aDogbm9uZTtcXG59XFxuXFxuOjotd2Via2l0LXNjcm9sbGJhciB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4jY29udGFpbmVyIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAvKiBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7ICovXFxufVxcblxcbi5oZXJvLWJveCB7XFxuICBoZWlnaHQ6IDEwMHZoO1xcbiAgd2lkdGg6IDEwMHZ3O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuaDEge1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gIGxldHRlci1zcGFjaW5nOiAwLjJlbTtcXG4gIGZvbnQtc2l6ZTogNnZoO1xcbn1cXG5cXG4uY2VudGVyZWQge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgbGVmdDogNDB2dztcXG4gIHRvcDogNDB2dztcXG59XFxuXFxuI3NjaWVuY2UtdGl0bGUge1xcbiAgY29sb3I6ICNGRjlEMDA7XFxuICBmb250LWZhbWlseTogVmVyZGFuYSwgR2VuZXZhLCBUYWhvbWEsIHNhbnMtc2VyaWY7XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7RUFDRSxTQUFTO0VBQ1QsVUFBVTtFQUNWLHdCQUF3QjtFQUN4QixxQkFBcUI7QUFDdkI7O0FBRUE7RUFDRSxhQUFhO0FBQ2Y7O0FBRUE7RUFDRSxZQUFZO0VBQ1osV0FBVztFQUNYLGFBQWE7RUFDYixzQkFBc0I7RUFDdEI7NEJBQzBCO0FBQzVCOztBQUVBO0VBQ0UsYUFBYTtFQUNiLFlBQVk7RUFDWixhQUFhO0VBQ2IsdUJBQXVCO0VBQ3ZCLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsY0FBYztBQUNoQjs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixVQUFVO0VBQ1YsU0FBUztBQUNYOztBQUVBO0VBQ0UsY0FBYztFQUNkLGdEQUFnRDtBQUNsRFwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIqIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICAtbXMtb3ZlcmZsb3ctc3R5bGU6IG5vbmU7XFxuICBzY3JvbGxiYXItd2lkdGg6IG5vbmU7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuXFxuI2NvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgLyogYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyAqL1xcbn1cXG5cXG4uaGVyby1ib3gge1xcbiAgaGVpZ2h0OiAxMDB2aDtcXG4gIHdpZHRoOiAxMDB2dztcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbmgxIHtcXG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICBsZXR0ZXItc3BhY2luZzogMC4yZW07XFxuICBmb250LXNpemU6IDZ2aDtcXG59XFxuXFxuLmNlbnRlcmVkIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGxlZnQ6IDQwdnc7XFxuICB0b3A6IDQwdnc7XFxufVxcblxcbiNzY2llbmNlLXRpdGxlIHtcXG4gIGNvbG9yOiAjRkY5RDAwO1xcbiAgZm9udC1mYW1pbHk6IFZlcmRhbmEsIEdlbmV2YSwgVGFob21hLCBzYW5zLXNlcmlmO1xcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gYXJndW1lbnRzW2ldO1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgd2lkdGggPSAyNTY7Ly8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxyXG52YXIgY2h1bmtzID0gNjsvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXHJcbnZhciBkaWdpdHMgPSA1MjsvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXHJcbnZhciBwb29sID0gW107Ly8gcG9vbDogZW50cm9weSBwb29sIHN0YXJ0cyBlbXB0eVxyXG52YXIgR0xPQkFMID0gdHlwZW9mIGdsb2JhbCA9PT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWw7XHJcblxyXG4vL1xyXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXHJcbi8vXHJcbnZhciBzdGFydGRlbm9tID0gTWF0aC5wb3cod2lkdGgsIGNodW5rcyksXHJcbiAgICBzaWduaWZpY2FuY2UgPSBNYXRoLnBvdygyLCBkaWdpdHMpLFxyXG4gICAgb3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyLFxyXG4gICAgbWFzayA9IHdpZHRoIC0gMTtcclxuXHJcblxyXG52YXIgb2xkUmFuZG9tID0gTWF0aC5yYW5kb207XHJcblxyXG4vL1xyXG4vLyBzZWVkcmFuZG9tKClcclxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXHJcbi8vXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VlZCwgb3B0aW9ucykge1xyXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZ2xvYmFsID09PSB0cnVlKSB7XHJcbiAgICBvcHRpb25zLmdsb2JhbCA9IGZhbHNlO1xyXG4gICAgTWF0aC5yYW5kb20gPSBtb2R1bGUuZXhwb3J0cyhzZWVkLCBvcHRpb25zKTtcclxuICAgIG9wdGlvbnMuZ2xvYmFsID0gdHJ1ZTtcclxuICAgIHJldHVybiBNYXRoLnJhbmRvbTtcclxuICB9XHJcbiAgdmFyIHVzZV9lbnRyb3B5ID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5lbnRyb3B5KSB8fCBmYWxzZTtcclxuICB2YXIga2V5ID0gW107XHJcblxyXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxyXG4gIHZhciBzaG9ydHNlZWQgPSBtaXhrZXkoZmxhdHRlbihcclxuICAgIHVzZV9lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XHJcbiAgICAwIGluIGFyZ3VtZW50cyA/IHNlZWQgOiBhdXRvc2VlZCgpLCAzKSwga2V5KTtcclxuXHJcbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXHJcbiAgdmFyIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xyXG5cclxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxyXG4gIG1peGtleSh0b3N0cmluZyhhcmM0LlMpLCBwb29sKTtcclxuXHJcbiAgLy8gT3ZlcnJpZGUgTWF0aC5yYW5kb21cclxuXHJcbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xyXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXHJcblxyXG4gIHJldHVybiBmdW5jdGlvbigpIHsgICAgICAgICAvLyBDbG9zdXJlIHRvIHJldHVybiBhIHJhbmRvbSBkb3VibGU6XHJcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpLCAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcclxuICAgICAgICBkID0gc3RhcnRkZW5vbSwgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXHJcbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cclxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxyXG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXHJcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcclxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXHJcbiAgICB9XHJcbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xyXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcclxuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBNYXRoIHVudGlsXHJcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXHJcbiAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLnJlc2V0R2xvYmFsID0gZnVuY3Rpb24gKCkge1xyXG4gIE1hdGgucmFuZG9tID0gb2xkUmFuZG9tO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQVJDNFxyXG4vL1xyXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXHJcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxyXG4vL1xyXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xyXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XHJcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cclxuLy9cclxuLyoqIEBjb25zdHJ1Y3RvciAqL1xyXG5mdW5jdGlvbiBBUkM0KGtleSkge1xyXG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxyXG4gICAgICBtZSA9IHRoaXMsIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSAwLCBzID0gbWUuUyA9IFtdO1xyXG5cclxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxyXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cclxuXHJcbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cclxuICB3aGlsZSAoaSA8IHdpZHRoKSB7XHJcbiAgICBzW2ldID0gaSsrO1xyXG4gIH1cclxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xyXG4gICAgc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIGtleVtpICUga2V5bGVuXSArICh0ID0gc1tpXSkpXTtcclxuICAgIHNbal0gPSB0O1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxyXG4gIChtZS5nID0gZnVuY3Rpb24oY291bnQpIHtcclxuICAgIC8vIFVzaW5nIGluc3RhbmNlIG1lbWJlcnMgaW5zdGVhZCBvZiBjbG9zdXJlIHN0YXRlIG5lYXJseSBkb3VibGVzIHNwZWVkLlxyXG4gICAgdmFyIHQsIHIgPSAwLFxyXG4gICAgICAgIGkgPSBtZS5pLCBqID0gbWUuaiwgcyA9IG1lLlM7XHJcbiAgICB3aGlsZSAoY291bnQtLSkge1xyXG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xyXG4gICAgICByID0gciAqIHdpZHRoICsgc1ttYXNrICYgKChzW2ldID0gc1tqID0gbWFzayAmIChqICsgdCldKSArIChzW2pdID0gdCkpXTtcclxuICAgIH1cclxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcclxuICAgIHJldHVybiByO1xyXG4gICAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5IGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuXHJcbiAgICAvLyBTZWUgaHR0cDovL3d3dy5yc2EuY29tL3JzYWxhYnMvbm9kZS5hc3A/aWQ9MjAwOVxyXG4gIH0pKHdpZHRoKTtcclxufVxyXG5cclxuLy9cclxuLy8gZmxhdHRlbigpXHJcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cclxuLy9cclxuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoKSB7XHJcbiAgdmFyIHJlc3VsdCA9IFtdLCB0eXAgPSAodHlwZW9mIG9iailbMF0sIHByb3A7XHJcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnbycpIHtcclxuICAgIGZvciAocHJvcCBpbiBvYmopIHtcclxuICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiB0eXAgPT0gJ3MnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBtaXhrZXkoKVxyXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXHJcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxyXG4vL1xyXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5KSB7XHJcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcclxuICB3aGlsZSAoaiA8IHN0cmluZ3NlZWQubGVuZ3RoKSB7XHJcbiAgICBrZXlbbWFzayAmIGpdID1cclxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcclxuICB9XHJcbiAgcmV0dXJuIHRvc3RyaW5nKGtleSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGF1dG9zZWVkKClcclxuLy8gUmV0dXJucyBhbiBvYmplY3QgZm9yIGF1dG9zZWVkaW5nLCB1c2luZyB3aW5kb3cuY3J5cHRvIGlmIGF2YWlsYWJsZS5cclxuLy9cclxuLyoqIEBwYXJhbSB7VWludDhBcnJheT19IHNlZWQgKi9cclxuZnVuY3Rpb24gYXV0b3NlZWQoc2VlZCkge1xyXG4gIHRyeSB7XHJcbiAgICBHTE9CQUwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhzZWVkID0gbmV3IFVpbnQ4QXJyYXkod2lkdGgpKTtcclxuICAgIHJldHVybiB0b3N0cmluZyhzZWVkKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gWytuZXcgRGF0ZSwgR0xPQkFMLCBHTE9CQUwubmF2aWdhdG9yICYmIEdMT0JBTC5uYXZpZ2F0b3IucGx1Z2lucyxcclxuICAgICAgICAgICAgR0xPQkFMLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xyXG4gIH1cclxufVxyXG5cclxuLy9cclxuLy8gdG9zdHJpbmcoKVxyXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcclxuLy9cclxuZnVuY3Rpb24gdG9zdHJpbmcoYSkge1xyXG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBXaGVuIHNlZWRyYW5kb20uanMgaXMgbG9hZGVkLCB3ZSBpbW1lZGlhdGVseSBtaXggYSBmZXcgYml0c1xyXG4vLyBmcm9tIHRoZSBidWlsdC1pbiBSTkcgaW50byB0aGUgZW50cm9weSBwb29sLiAgQmVjYXVzZSB3ZSBkb1xyXG4vLyBub3Qgd2FudCB0byBpbnRlZmVyZSB3aXRoIGRldGVybWluc3RpYyBQUk5HIHN0YXRlIGxhdGVyLFxyXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgTWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxyXG4vLyBpbml0aWFsaXphdGlvbi5cclxuLy9cclxubWl4a2V5KE1hdGgucmFuZG9tKCksIHBvb2wpO1xyXG4iLCIvKlxuICogQSBmYXN0IGphdmFzY3JpcHQgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxleCBub2lzZSBieSBKb25hcyBXYWduZXJcblxuQmFzZWQgb24gYSBzcGVlZC1pbXByb3ZlZCBzaW1wbGV4IG5vaXNlIGFsZ29yaXRobSBmb3IgMkQsIDNEIGFuZCA0RCBpbiBKYXZhLlxuV2hpY2ggaXMgYmFzZWQgb24gZXhhbXBsZSBjb2RlIGJ5IFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWd1QGl0bi5saXUuc2UpLlxuV2l0aCBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbkJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG5cblxuIENvcHlyaWdodCAoYykgMjAxOCBKb25hcyBXYWduZXJcblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuIFNPRlRXQVJFLlxuICovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgRjIgPSAwLjUgKiAoTWF0aC5zcXJ0KDMuMCkgLSAxLjApO1xuICB2YXIgRzIgPSAoMy4wIC0gTWF0aC5zcXJ0KDMuMCkpIC8gNi4wO1xuICB2YXIgRjMgPSAxLjAgLyAzLjA7XG4gIHZhciBHMyA9IDEuMCAvIDYuMDtcbiAgdmFyIEY0ID0gKE1hdGguc3FydCg1LjApIC0gMS4wKSAvIDQuMDtcbiAgdmFyIEc0ID0gKDUuMCAtIE1hdGguc3FydCg1LjApKSAvIDIwLjA7XG5cbiAgZnVuY3Rpb24gU2ltcGxleE5vaXNlKHJhbmRvbU9yU2VlZCkge1xuICAgIHZhciByYW5kb207XG4gICAgaWYgKHR5cGVvZiByYW5kb21PclNlZWQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmFuZG9tID0gcmFuZG9tT3JTZWVkO1xuICAgIH1cbiAgICBlbHNlIGlmIChyYW5kb21PclNlZWQpIHtcbiAgICAgIHJhbmRvbSA9IGFsZWEocmFuZG9tT3JTZWVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmFuZG9tID0gTWF0aC5yYW5kb207XG4gICAgfVxuICAgIHRoaXMucCA9IGJ1aWxkUGVybXV0YXRpb25UYWJsZShyYW5kb20pO1xuICAgIHRoaXMucGVybSA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgdGhpcy5wZXJtTW9kMTIgPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTEyOyBpKyspIHtcbiAgICAgIHRoaXMucGVybVtpXSA9IHRoaXMucFtpICYgMjU1XTtcbiAgICAgIHRoaXMucGVybU1vZDEyW2ldID0gdGhpcy5wZXJtW2ldICUgMTI7XG4gICAgfVxuXG4gIH1cbiAgU2ltcGxleE5vaXNlLnByb3RvdHlwZSA9IHtcbiAgICBncmFkMzogbmV3IEZsb2F0MzJBcnJheShbMSwgMSwgMCxcbiAgICAgIC0xLCAxLCAwLFxuICAgICAgMSwgLTEsIDAsXG5cbiAgICAgIC0xLCAtMSwgMCxcbiAgICAgIDEsIDAsIDEsXG4gICAgICAtMSwgMCwgMSxcblxuICAgICAgMSwgMCwgLTEsXG4gICAgICAtMSwgMCwgLTEsXG4gICAgICAwLCAxLCAxLFxuXG4gICAgICAwLCAtMSwgMSxcbiAgICAgIDAsIDEsIC0xLFxuICAgICAgMCwgLTEsIC0xXSksXG4gICAgZ3JhZDQ6IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDEsIDEsIDEsIDAsIDEsIDEsIC0xLCAwLCAxLCAtMSwgMSwgMCwgMSwgLTEsIC0xLFxuICAgICAgMCwgLTEsIDEsIDEsIDAsIC0xLCAxLCAtMSwgMCwgLTEsIC0xLCAxLCAwLCAtMSwgLTEsIC0xLFxuICAgICAgMSwgMCwgMSwgMSwgMSwgMCwgMSwgLTEsIDEsIDAsIC0xLCAxLCAxLCAwLCAtMSwgLTEsXG4gICAgICAtMSwgMCwgMSwgMSwgLTEsIDAsIDEsIC0xLCAtMSwgMCwgLTEsIDEsIC0xLCAwLCAtMSwgLTEsXG4gICAgICAxLCAxLCAwLCAxLCAxLCAxLCAwLCAtMSwgMSwgLTEsIDAsIDEsIDEsIC0xLCAwLCAtMSxcbiAgICAgIC0xLCAxLCAwLCAxLCAtMSwgMSwgMCwgLTEsIC0xLCAtMSwgMCwgMSwgLTEsIC0xLCAwLCAtMSxcbiAgICAgIDEsIDEsIDEsIDAsIDEsIDEsIC0xLCAwLCAxLCAtMSwgMSwgMCwgMSwgLTEsIC0xLCAwLFxuICAgICAgLTEsIDEsIDEsIDAsIC0xLCAxLCAtMSwgMCwgLTEsIC0xLCAxLCAwLCAtMSwgLTEsIC0xLCAwXSksXG4gICAgbm9pc2UyRDogZnVuY3Rpb24oeGluLCB5aW4pIHtcbiAgICAgIHZhciBwZXJtTW9kMTIgPSB0aGlzLnBlcm1Nb2QxMjtcbiAgICAgIHZhciBwZXJtID0gdGhpcy5wZXJtO1xuICAgICAgdmFyIGdyYWQzID0gdGhpcy5ncmFkMztcbiAgICAgIHZhciBuMCA9IDA7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuICAgICAgdmFyIG4xID0gMDtcbiAgICAgIHZhciBuMiA9IDA7XG4gICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICB2YXIgcyA9ICh4aW4gKyB5aW4pICogRjI7IC8vIEhhaXJ5IGZhY3RvciBmb3IgMkRcbiAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4aW4gKyBzKTtcbiAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5aW4gKyBzKTtcbiAgICAgIHZhciB0ID0gKGkgKyBqKSAqIEcyO1xuICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5KSBzcGFjZVxuICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICB2YXIgeDAgPSB4aW4gLSBYMDsgLy8gVGhlIHgseSBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgIHZhciB5MCA9IHlpbiAtIFkwO1xuICAgICAgLy8gRm9yIHRoZSAyRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhbiBlcXVpbGF0ZXJhbCB0cmlhbmdsZS5cbiAgICAgIC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi5cbiAgICAgIHZhciBpMSwgajE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCAobWlkZGxlKSBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqKSBjb29yZHNcbiAgICAgIGlmICh4MCA+IHkwKSB7XG4gICAgICAgIGkxID0gMTtcbiAgICAgICAgajEgPSAwO1xuICAgICAgfSAvLyBsb3dlciB0cmlhbmdsZSwgWFkgb3JkZXI6ICgwLDApLT4oMSwwKS0+KDEsMSlcbiAgICAgIGVsc2Uge1xuICAgICAgICBpMSA9IDA7XG4gICAgICAgIGoxID0gMTtcbiAgICAgIH0gLy8gdXBwZXIgdHJpYW5nbGUsIFlYIG9yZGVyOiAoMCwwKS0+KDAsMSktPigxLDEpXG4gICAgICAvLyBBIHN0ZXAgb2YgKDEsMCkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMpIGluICh4LHkpLCBhbmRcbiAgICAgIC8vIGEgc3RlcCBvZiAoMCwxKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYykgaW4gKHgseSksIHdoZXJlXG4gICAgICAvLyBjID0gKDMtc3FydCgzKSkvNlxuICAgICAgdmFyIHgxID0geDAgLSBpMSArIEcyOyAvLyBPZmZzZXRzIGZvciBtaWRkbGUgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3Jkc1xuICAgICAgdmFyIHkxID0geTAgLSBqMSArIEcyO1xuICAgICAgdmFyIHgyID0geDAgLSAxLjAgKyAyLjAgKiBHMjsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzXG4gICAgICB2YXIgeTIgPSB5MCAtIDEuMCArIDIuMCAqIEcyO1xuICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuICAgICAgdmFyIHQwID0gMC41IC0geDAgKiB4MCAtIHkwICogeTA7XG4gICAgICBpZiAodDAgPj0gMCkge1xuICAgICAgICB2YXIgZ2kwID0gcGVybU1vZDEyW2lpICsgcGVybVtqal1dICogMztcbiAgICAgICAgdDAgKj0gdDA7XG4gICAgICAgIG4wID0gdDAgKiB0MCAqIChncmFkM1tnaTBdICogeDAgKyBncmFkM1tnaTAgKyAxXSAqIHkwKTsgLy8gKHgseSkgb2YgZ3JhZDMgdXNlZCBmb3IgMkQgZ3JhZGllbnRcbiAgICAgIH1cbiAgICAgIHZhciB0MSA9IDAuNSAtIHgxICogeDEgLSB5MSAqIHkxO1xuICAgICAgaWYgKHQxID49IDApIHtcbiAgICAgICAgdmFyIGdpMSA9IHBlcm1Nb2QxMltpaSArIGkxICsgcGVybVtqaiArIGoxXV0gKiAzO1xuICAgICAgICB0MSAqPSB0MTtcbiAgICAgICAgbjEgPSB0MSAqIHQxICogKGdyYWQzW2dpMV0gKiB4MSArIGdyYWQzW2dpMSArIDFdICogeTEpO1xuICAgICAgfVxuICAgICAgdmFyIHQyID0gMC41IC0geDIgKiB4MiAtIHkyICogeTI7XG4gICAgICBpZiAodDIgPj0gMCkge1xuICAgICAgICB2YXIgZ2kyID0gcGVybU1vZDEyW2lpICsgMSArIHBlcm1bamogKyAxXV0gKiAzO1xuICAgICAgICB0MiAqPSB0MjtcbiAgICAgICAgbjIgPSB0MiAqIHQyICogKGdyYWQzW2dpMl0gKiB4MiArIGdyYWQzW2dpMiArIDFdICogeTIpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gcmV0dXJuIHZhbHVlcyBpbiB0aGUgaW50ZXJ2YWwgWy0xLDFdLlxuICAgICAgcmV0dXJuIDcwLjAgKiAobjAgKyBuMSArIG4yKTtcbiAgICB9LFxuICAgIC8vIDNEIHNpbXBsZXggbm9pc2VcbiAgICBub2lzZTNEOiBmdW5jdGlvbih4aW4sIHlpbiwgemluKSB7XG4gICAgICB2YXIgcGVybU1vZDEyID0gdGhpcy5wZXJtTW9kMTI7XG4gICAgICB2YXIgcGVybSA9IHRoaXMucGVybTtcbiAgICAgIHZhciBncmFkMyA9IHRoaXMuZ3JhZDM7XG4gICAgICB2YXIgbjAsIG4xLCBuMiwgbjM7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgZm91ciBjb3JuZXJzXG4gICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICB2YXIgcyA9ICh4aW4gKyB5aW4gKyB6aW4pICogRjM7IC8vIFZlcnkgbmljZSBhbmQgc2ltcGxlIHNrZXcgZmFjdG9yIGZvciAzRFxuICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHhpbiArIHMpO1xuICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHlpbiArIHMpO1xuICAgICAgdmFyIGsgPSBNYXRoLmZsb29yKHppbiArIHMpO1xuICAgICAgdmFyIHQgPSAoaSArIGogKyBrKSAqIEczO1xuICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHopIHNwYWNlXG4gICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgIHZhciBaMCA9IGsgLSB0O1xuICAgICAgdmFyIHgwID0geGluIC0gWDA7IC8vIFRoZSB4LHkseiBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgIHZhciB5MCA9IHlpbiAtIFkwO1xuICAgICAgdmFyIHowID0gemluIC0gWjA7XG4gICAgICAvLyBGb3IgdGhlIDNEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGEgc2xpZ2h0bHkgaXJyZWd1bGFyIHRldHJhaGVkcm9uLlxuICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuICAgICAgdmFyIGkxLCBqMSwgazE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3Jkc1xuICAgICAgdmFyIGkyLCBqMiwgazI7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzXG4gICAgICBpZiAoeDAgPj0geTApIHtcbiAgICAgICAgaWYgKHkwID49IHowKSB7XG4gICAgICAgICAgaTEgPSAxO1xuICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgICBrMSA9IDA7XG4gICAgICAgICAgaTIgPSAxO1xuICAgICAgICAgIGoyID0gMTtcbiAgICAgICAgICBrMiA9IDA7XG4gICAgICAgIH0gLy8gWCBZIFogb3JkZXJcbiAgICAgICAgZWxzZSBpZiAoeDAgPj0gejApIHtcbiAgICAgICAgICBpMSA9IDE7XG4gICAgICAgICAgajEgPSAwO1xuICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgajIgPSAwO1xuICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgfSAvLyBYIFogWSBvcmRlclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgajEgPSAwO1xuICAgICAgICAgIGsxID0gMTtcbiAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgajIgPSAwO1xuICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgfSAvLyBaIFggWSBvcmRlclxuICAgICAgfVxuICAgICAgZWxzZSB7IC8vIHgwPHkwXG4gICAgICAgIGlmICh5MCA8IHowKSB7XG4gICAgICAgICAgaTEgPSAwO1xuICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgICBrMSA9IDE7XG4gICAgICAgICAgaTIgPSAwO1xuICAgICAgICAgIGoyID0gMTtcbiAgICAgICAgICBrMiA9IDE7XG4gICAgICAgIH0gLy8gWiBZIFggb3JkZXJcbiAgICAgICAgZWxzZSBpZiAoeDAgPCB6MCkge1xuICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICBqMSA9IDE7XG4gICAgICAgICAgazEgPSAwO1xuICAgICAgICAgIGkyID0gMDtcbiAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgazIgPSAxO1xuICAgICAgICB9IC8vIFkgWiBYIG9yZGVyXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICBqMSA9IDE7XG4gICAgICAgICAgazEgPSAwO1xuICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgazIgPSAwO1xuICAgICAgICB9IC8vIFkgWCBaIG9yZGVyXG4gICAgICB9XG4gICAgICAvLyBBIHN0ZXAgb2YgKDEsMCwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jLC1jKSBpbiAoeCx5LHopLFxuICAgICAgLy8gYSBzdGVwIG9mICgwLDEsMCkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYywtYykgaW4gKHgseSx6KSwgYW5kXG4gICAgICAvLyBhIHN0ZXAgb2YgKDAsMCwxKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsLWMsMS1jKSBpbiAoeCx5LHopLCB3aGVyZVxuICAgICAgLy8gYyA9IDEvNi5cbiAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHMzsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgdmFyIHkxID0geTAgLSBqMSArIEczO1xuICAgICAgdmFyIHoxID0gejAgLSBrMSArIEczO1xuICAgICAgdmFyIHgyID0geDAgLSBpMiArIDIuMCAqIEczOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgIHZhciB5MiA9IHkwIC0gajIgKyAyLjAgKiBHMztcbiAgICAgIHZhciB6MiA9IHowIC0gazIgKyAyLjAgKiBHMztcbiAgICAgIHZhciB4MyA9IHgwIC0gMS4wICsgMy4wICogRzM7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICB2YXIgeTMgPSB5MCAtIDEuMCArIDMuMCAqIEczO1xuICAgICAgdmFyIHozID0gejAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZm91ciBzaW1wbGV4IGNvcm5lcnNcbiAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgdmFyIGtrID0gayAmIDI1NTtcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZvdXIgY29ybmVyc1xuICAgICAgdmFyIHQwID0gMC42IC0geDAgKiB4MCAtIHkwICogeTAgLSB6MCAqIHowO1xuICAgICAgaWYgKHQwIDwgMCkgbjAgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMCA9IHBlcm1Nb2QxMltpaSArIHBlcm1bamogKyBwZXJtW2trXV1dICogMztcbiAgICAgICAgdDAgKj0gdDA7XG4gICAgICAgIG4wID0gdDAgKiB0MCAqIChncmFkM1tnaTBdICogeDAgKyBncmFkM1tnaTAgKyAxXSAqIHkwICsgZ3JhZDNbZ2kwICsgMl0gKiB6MCk7XG4gICAgICB9XG4gICAgICB2YXIgdDEgPSAwLjYgLSB4MSAqIHgxIC0geTEgKiB5MSAtIHoxICogejE7XG4gICAgICBpZiAodDEgPCAwKSBuMSA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kxID0gcGVybU1vZDEyW2lpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazFdXV0gKiAzO1xuICAgICAgICB0MSAqPSB0MTtcbiAgICAgICAgbjEgPSB0MSAqIHQxICogKGdyYWQzW2dpMV0gKiB4MSArIGdyYWQzW2dpMSArIDFdICogeTEgKyBncmFkM1tnaTEgKyAyXSAqIHoxKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MiA9IDAuNiAtIHgyICogeDIgLSB5MiAqIHkyIC0gejIgKiB6MjtcbiAgICAgIGlmICh0MiA8IDApIG4yID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTIgPSBwZXJtTW9kMTJbaWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMl1dXSAqIDM7XG4gICAgICAgIHQyICo9IHQyO1xuICAgICAgICBuMiA9IHQyICogdDIgKiAoZ3JhZDNbZ2kyXSAqIHgyICsgZ3JhZDNbZ2kyICsgMV0gKiB5MiArIGdyYWQzW2dpMiArIDJdICogejIpO1xuICAgICAgfVxuICAgICAgdmFyIHQzID0gMC42IC0geDMgKiB4MyAtIHkzICogeTMgLSB6MyAqIHozO1xuICAgICAgaWYgKHQzIDwgMCkgbjMgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMyA9IHBlcm1Nb2QxMltpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxXV1dICogMztcbiAgICAgICAgdDMgKj0gdDM7XG4gICAgICAgIG4zID0gdDMgKiB0MyAqIChncmFkM1tnaTNdICogeDMgKyBncmFkM1tnaTMgKyAxXSAqIHkzICsgZ3JhZDNbZ2kzICsgMl0gKiB6Myk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG4gICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byBzdGF5IGp1c3QgaW5zaWRlIFstMSwxXVxuICAgICAgcmV0dXJuIDMyLjAgKiAobjAgKyBuMSArIG4yICsgbjMpO1xuICAgIH0sXG4gICAgLy8gNEQgc2ltcGxleCBub2lzZSwgYmV0dGVyIHNpbXBsZXggcmFuayBvcmRlcmluZyBtZXRob2QgMjAxMi0wMy0wOVxuICAgIG5vaXNlNEQ6IGZ1bmN0aW9uKHgsIHksIHosIHcpIHtcbiAgICAgIHZhciBwZXJtID0gdGhpcy5wZXJtO1xuICAgICAgdmFyIGdyYWQ0ID0gdGhpcy5ncmFkNDtcblxuICAgICAgdmFyIG4wLCBuMSwgbjIsIG4zLCBuNDsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSBmaXZlIGNvcm5lcnNcbiAgICAgIC8vIFNrZXcgdGhlICh4LHkseix3KSBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggY2VsbCBvZiAyNCBzaW1wbGljZXMgd2UncmUgaW5cbiAgICAgIHZhciBzID0gKHggKyB5ICsgeiArIHcpICogRjQ7IC8vIEZhY3RvciBmb3IgNEQgc2tld2luZ1xuICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHggKyBzKTtcbiAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5ICsgcyk7XG4gICAgICB2YXIgayA9IE1hdGguZmxvb3IoeiArIHMpO1xuICAgICAgdmFyIGwgPSBNYXRoLmZsb29yKHcgKyBzKTtcbiAgICAgIHZhciB0ID0gKGkgKyBqICsgayArIGwpICogRzQ7IC8vIEZhY3RvciBmb3IgNEQgdW5za2V3aW5nXG4gICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseix3KSBzcGFjZVxuICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICB2YXIgWjAgPSBrIC0gdDtcbiAgICAgIHZhciBXMCA9IGwgLSB0O1xuICAgICAgdmFyIHgwID0geCAtIFgwOyAvLyBUaGUgeCx5LHosdyBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgIHZhciB5MCA9IHkgLSBZMDtcbiAgICAgIHZhciB6MCA9IHogLSBaMDtcbiAgICAgIHZhciB3MCA9IHcgLSBXMDtcbiAgICAgIC8vIEZvciB0aGUgNEQgY2FzZSwgdGhlIHNpbXBsZXggaXMgYSA0RCBzaGFwZSBJIHdvbid0IGV2ZW4gdHJ5IHRvIGRlc2NyaWJlLlxuICAgICAgLy8gVG8gZmluZCBvdXQgd2hpY2ggb2YgdGhlIDI0IHBvc3NpYmxlIHNpbXBsaWNlcyB3ZSdyZSBpbiwgd2UgbmVlZCB0b1xuICAgICAgLy8gZGV0ZXJtaW5lIHRoZSBtYWduaXR1ZGUgb3JkZXJpbmcgb2YgeDAsIHkwLCB6MCBhbmQgdzAuXG4gICAgICAvLyBTaXggcGFpci13aXNlIGNvbXBhcmlzb25zIGFyZSBwZXJmb3JtZWQgYmV0d2VlbiBlYWNoIHBvc3NpYmxlIHBhaXJcbiAgICAgIC8vIG9mIHRoZSBmb3VyIGNvb3JkaW5hdGVzLCBhbmQgdGhlIHJlc3VsdHMgYXJlIHVzZWQgdG8gcmFuayB0aGUgbnVtYmVycy5cbiAgICAgIHZhciByYW5reCA9IDA7XG4gICAgICB2YXIgcmFua3kgPSAwO1xuICAgICAgdmFyIHJhbmt6ID0gMDtcbiAgICAgIHZhciByYW5rdyA9IDA7XG4gICAgICBpZiAoeDAgPiB5MCkgcmFua3grKztcbiAgICAgIGVsc2UgcmFua3krKztcbiAgICAgIGlmICh4MCA+IHowKSByYW5reCsrO1xuICAgICAgZWxzZSByYW5reisrO1xuICAgICAgaWYgKHgwID4gdzApIHJhbmt4Kys7XG4gICAgICBlbHNlIHJhbmt3Kys7XG4gICAgICBpZiAoeTAgPiB6MCkgcmFua3krKztcbiAgICAgIGVsc2UgcmFua3orKztcbiAgICAgIGlmICh5MCA+IHcwKSByYW5reSsrO1xuICAgICAgZWxzZSByYW5rdysrO1xuICAgICAgaWYgKHowID4gdzApIHJhbmt6Kys7XG4gICAgICBlbHNlIHJhbmt3Kys7XG4gICAgICB2YXIgaTEsIGoxLCBrMSwgbDE7IC8vIFRoZSBpbnRlZ2VyIG9mZnNldHMgZm9yIHRoZSBzZWNvbmQgc2ltcGxleCBjb3JuZXJcbiAgICAgIHZhciBpMiwgajIsIGsyLCBsMjsgLy8gVGhlIGludGVnZXIgb2Zmc2V0cyBmb3IgdGhlIHRoaXJkIHNpbXBsZXggY29ybmVyXG4gICAgICB2YXIgaTMsIGozLCBrMywgbDM7IC8vIFRoZSBpbnRlZ2VyIG9mZnNldHMgZm9yIHRoZSBmb3VydGggc2ltcGxleCBjb3JuZXJcbiAgICAgIC8vIHNpbXBsZXhbY10gaXMgYSA0LXZlY3RvciB3aXRoIHRoZSBudW1iZXJzIDAsIDEsIDIgYW5kIDMgaW4gc29tZSBvcmRlci5cbiAgICAgIC8vIE1hbnkgdmFsdWVzIG9mIGMgd2lsbCBuZXZlciBvY2N1ciwgc2luY2UgZS5nLiB4Pnk+ej53IG1ha2VzIHg8eiwgeTx3IGFuZCB4PHdcbiAgICAgIC8vIGltcG9zc2libGUuIE9ubHkgdGhlIDI0IGluZGljZXMgd2hpY2ggaGF2ZSBub24temVybyBlbnRyaWVzIG1ha2UgYW55IHNlbnNlLlxuICAgICAgLy8gV2UgdXNlIGEgdGhyZXNob2xkaW5nIHRvIHNldCB0aGUgY29vcmRpbmF0ZXMgaW4gdHVybiBmcm9tIHRoZSBsYXJnZXN0IG1hZ25pdHVkZS5cbiAgICAgIC8vIFJhbmsgMyBkZW5vdGVzIHRoZSBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICBpMSA9IHJhbmt4ID49IDMgPyAxIDogMDtcbiAgICAgIGoxID0gcmFua3kgPj0gMyA/IDEgOiAwO1xuICAgICAgazEgPSByYW5reiA+PSAzID8gMSA6IDA7XG4gICAgICBsMSA9IHJhbmt3ID49IDMgPyAxIDogMDtcbiAgICAgIC8vIFJhbmsgMiBkZW5vdGVzIHRoZSBzZWNvbmQgbGFyZ2VzdCBjb29yZGluYXRlLlxuICAgICAgaTIgPSByYW5reCA+PSAyID8gMSA6IDA7XG4gICAgICBqMiA9IHJhbmt5ID49IDIgPyAxIDogMDtcbiAgICAgIGsyID0gcmFua3ogPj0gMiA/IDEgOiAwO1xuICAgICAgbDIgPSByYW5rdyA+PSAyID8gMSA6IDA7XG4gICAgICAvLyBSYW5rIDEgZGVub3RlcyB0aGUgc2Vjb25kIHNtYWxsZXN0IGNvb3JkaW5hdGUuXG4gICAgICBpMyA9IHJhbmt4ID49IDEgPyAxIDogMDtcbiAgICAgIGozID0gcmFua3kgPj0gMSA/IDEgOiAwO1xuICAgICAgazMgPSByYW5reiA+PSAxID8gMSA6IDA7XG4gICAgICBsMyA9IHJhbmt3ID49IDEgPyAxIDogMDtcbiAgICAgIC8vIFRoZSBmaWZ0aCBjb3JuZXIgaGFzIGFsbCBjb29yZGluYXRlIG9mZnNldHMgPSAxLCBzbyBubyBuZWVkIHRvIGNvbXB1dGUgdGhhdC5cbiAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHNDsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzQ7XG4gICAgICB2YXIgejEgPSB6MCAtIGsxICsgRzQ7XG4gICAgICB2YXIgdzEgPSB3MCAtIGwxICsgRzQ7XG4gICAgICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wICogRzQ7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wICogRzQ7XG4gICAgICB2YXIgejIgPSB6MCAtIGsyICsgMi4wICogRzQ7XG4gICAgICB2YXIgdzIgPSB3MCAtIGwyICsgMi4wICogRzQ7XG4gICAgICB2YXIgeDMgPSB4MCAtIGkzICsgMy4wICogRzQ7IC8vIE9mZnNldHMgZm9yIGZvdXJ0aCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgdmFyIHkzID0geTAgLSBqMyArIDMuMCAqIEc0O1xuICAgICAgdmFyIHozID0gejAgLSBrMyArIDMuMCAqIEc0O1xuICAgICAgdmFyIHczID0gdzAgLSBsMyArIDMuMCAqIEc0O1xuICAgICAgdmFyIHg0ID0geDAgLSAxLjAgKyA0LjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgdmFyIHk0ID0geTAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgIHZhciB6NCA9IHowIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICB2YXIgdzQgPSB3MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmaXZlIHNpbXBsZXggY29ybmVyc1xuICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICB2YXIga2sgPSBrICYgMjU1O1xuICAgICAgdmFyIGxsID0gbCAmIDI1NTtcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZpdmUgY29ybmVyc1xuICAgICAgdmFyIHQwID0gMC42IC0geDAgKiB4MCAtIHkwICogeTAgLSB6MCAqIHowIC0gdzAgKiB3MDtcbiAgICAgIGlmICh0MCA8IDApIG4wID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTAgPSAocGVybVtpaSArIHBlcm1bamogKyBwZXJtW2trICsgcGVybVtsbF1dXV0gJSAzMikgKiA0O1xuICAgICAgICB0MCAqPSB0MDtcbiAgICAgICAgbjAgPSB0MCAqIHQwICogKGdyYWQ0W2dpMF0gKiB4MCArIGdyYWQ0W2dpMCArIDFdICogeTAgKyBncmFkNFtnaTAgKyAyXSAqIHowICsgZ3JhZDRbZ2kwICsgM10gKiB3MCk7XG4gICAgICB9XG4gICAgICB2YXIgdDEgPSAwLjYgLSB4MSAqIHgxIC0geTEgKiB5MSAtIHoxICogejEgLSB3MSAqIHcxO1xuICAgICAgaWYgKHQxIDwgMCkgbjEgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMSA9IChwZXJtW2lpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazEgKyBwZXJtW2xsICsgbDFdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDEgKj0gdDE7XG4gICAgICAgIG4xID0gdDEgKiB0MSAqIChncmFkNFtnaTFdICogeDEgKyBncmFkNFtnaTEgKyAxXSAqIHkxICsgZ3JhZDRbZ2kxICsgMl0gKiB6MSArIGdyYWQ0W2dpMSArIDNdICogdzEpO1xuICAgICAgfVxuICAgICAgdmFyIHQyID0gMC42IC0geDIgKiB4MiAtIHkyICogeTIgLSB6MiAqIHoyIC0gdzIgKiB3MjtcbiAgICAgIGlmICh0MiA8IDApIG4yID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTIgPSAocGVybVtpaSArIGkyICsgcGVybVtqaiArIGoyICsgcGVybVtrayArIGsyICsgcGVybVtsbCArIGwyXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQyICo9IHQyO1xuICAgICAgICBuMiA9IHQyICogdDIgKiAoZ3JhZDRbZ2kyXSAqIHgyICsgZ3JhZDRbZ2kyICsgMV0gKiB5MiArIGdyYWQ0W2dpMiArIDJdICogejIgKyBncmFkNFtnaTIgKyAzXSAqIHcyKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MyA9IDAuNiAtIHgzICogeDMgLSB5MyAqIHkzIC0gejMgKiB6MyAtIHczICogdzM7XG4gICAgICBpZiAodDMgPCAwKSBuMyA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kzID0gKHBlcm1baWkgKyBpMyArIHBlcm1bamogKyBqMyArIHBlcm1ba2sgKyBrMyArIHBlcm1bbGwgKyBsM11dXV0gJSAzMikgKiA0O1xuICAgICAgICB0MyAqPSB0MztcbiAgICAgICAgbjMgPSB0MyAqIHQzICogKGdyYWQ0W2dpM10gKiB4MyArIGdyYWQ0W2dpMyArIDFdICogeTMgKyBncmFkNFtnaTMgKyAyXSAqIHozICsgZ3JhZDRbZ2kzICsgM10gKiB3Myk7XG4gICAgICB9XG4gICAgICB2YXIgdDQgPSAwLjYgLSB4NCAqIHg0IC0geTQgKiB5NCAtIHo0ICogejQgLSB3NCAqIHc0O1xuICAgICAgaWYgKHQ0IDwgMCkgbjQgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpNCA9IChwZXJtW2lpICsgMSArIHBlcm1bamogKyAxICsgcGVybVtrayArIDEgKyBwZXJtW2xsICsgMV1dXV0gJSAzMikgKiA0O1xuICAgICAgICB0NCAqPSB0NDtcbiAgICAgICAgbjQgPSB0NCAqIHQ0ICogKGdyYWQ0W2dpNF0gKiB4NCArIGdyYWQ0W2dpNCArIDFdICogeTQgKyBncmFkNFtnaTQgKyAyXSAqIHo0ICsgZ3JhZDRbZ2k0ICsgM10gKiB3NCk7XG4gICAgICB9XG4gICAgICAvLyBTdW0gdXAgYW5kIHNjYWxlIHRoZSByZXN1bHQgdG8gY292ZXIgdGhlIHJhbmdlIFstMSwxXVxuICAgICAgcmV0dXJuIDI3LjAgKiAobjAgKyBuMSArIG4yICsgbjMgKyBuNCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGJ1aWxkUGVybXV0YXRpb25UYWJsZShyYW5kb20pIHtcbiAgICB2YXIgaTtcbiAgICB2YXIgcCA9IG5ldyBVaW50OEFycmF5KDI1Nik7XG4gICAgZm9yIChpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgICBwW2ldID0gaTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IDI1NTsgaSsrKSB7XG4gICAgICB2YXIgciA9IGkgKyB+fihyYW5kb20oKSAqICgyNTYgLSBpKSk7XG4gICAgICB2YXIgYXV4ID0gcFtpXTtcbiAgICAgIHBbaV0gPSBwW3JdO1xuICAgICAgcFtyXSA9IGF1eDtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgU2ltcGxleE5vaXNlLl9idWlsZFBlcm11dGF0aW9uVGFibGUgPSBidWlsZFBlcm11dGF0aW9uVGFibGU7XG5cbiAgZnVuY3Rpb24gYWxlYSgpIHtcbiAgICAvLyBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbiAgICB2YXIgczAgPSAwO1xuICAgIHZhciBzMSA9IDA7XG4gICAgdmFyIHMyID0gMDtcbiAgICB2YXIgYyA9IDE7XG5cbiAgICB2YXIgbWFzaCA9IG1hc2hlcigpO1xuICAgIHMwID0gbWFzaCgnICcpO1xuICAgIHMxID0gbWFzaCgnICcpO1xuICAgIHMyID0gbWFzaCgnICcpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHMwIC09IG1hc2goYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmIChzMCA8IDApIHtcbiAgICAgICAgczAgKz0gMTtcbiAgICAgIH1cbiAgICAgIHMxIC09IG1hc2goYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmIChzMSA8IDApIHtcbiAgICAgICAgczEgKz0gMTtcbiAgICAgIH1cbiAgICAgIHMyIC09IG1hc2goYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmIChzMiA8IDApIHtcbiAgICAgICAgczIgKz0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgbWFzaCA9IG51bGw7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHQgPSAyMDkxNjM5ICogczAgKyBjICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICAgIHMwID0gczE7XG4gICAgICBzMSA9IHMyO1xuICAgICAgcmV0dXJuIHMyID0gdCAtIChjID0gdCB8IDApO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gbWFzaGVyKCkge1xuICAgIHZhciBuID0gMHhlZmM4MjQ5ZDtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBuICs9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgICAgdmFyIGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgICAgbiA9IGggPj4+IDA7XG4gICAgICAgIGggLT0gbjtcbiAgICAgICAgaCAqPSBuO1xuICAgICAgICBuID0gaCA+Pj4gMDtcbiAgICAgICAgaCAtPSBuO1xuICAgICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgICAgfVxuICAgICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgfTtcbiAgfVxuXG4gIC8vIGFtZFxuICBpZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiBTaW1wbGV4Tm9pc2U7fSk7XG4gIC8vIGNvbW1vbiBqc1xuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSBleHBvcnRzLlNpbXBsZXhOb2lzZSA9IFNpbXBsZXhOb2lzZTtcbiAgLy8gYnJvd3NlclxuICBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgd2luZG93LlNpbXBsZXhOb2lzZSA9IFNpbXBsZXhOb2lzZTtcbiAgLy8gbm9kZWpzXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gU2ltcGxleE5vaXNlO1xuICB9XG5cbn0pKCk7XG4iLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiY29uc3QgY19tYXRoID0gcmVxdWlyZSgnY2FudmFzLXNrZXRjaC11dGlsL21hdGgnKVxuY29uc3QgY19yYW5kb20gPSByZXF1aXJlKCdjYW52YXMtc2tldGNoLXV0aWwvcmFuZG9tJylcbmltcG9ydCBzZXRDYW52YXMgZnJvbSAnLi4vc2V0Q2FudmFzJ1xuXG5sZXQgW2NhbnZhcywgY3R4LCBjYW52YXNXLCBjYW52YXNILCBoZXJvXSA9IHNldENhbnZhcygpXG5cbmZ1bmN0aW9uIHJlc2l6ZSAoKSB7XG4gIGNhbnZhc1cgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDIwXG4gIGNhbnZhc0ggPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSAyMFxuICBjYW52YXMud2lkdGggPSBjYW52YXNXXG4gIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIXG59XG5cbmNvbnN0IGJnID0gJyMwMDBCOTQnXG5jb25zdCBsaWdodEJsdWUgPSAnIzlEQzlGRidcbmNvbnN0IHJlZGlzaCA9ICcjRkY3QTAwJ1xuY29uc3Qgb3JhbmdlID0gJyNGRjlEMDAnXG5jb25zdCB5ZWxsb3cgPSAnI0ZGRDMwMCdcbmxldCBhID0gMFxuXG5jb25zdCBjaXJjbGVzID0gW1xuICB7XG4gICAgJ3JhZGl1cycgOiBjYW52YXNIIC8gMixcbiAgICAncG9pbnRzJyA6IDcsXG4gICAgJ2NvbG9ycycgOiBbeWVsbG93LCBvcmFuZ2UsIHJlZGlzaCwgb3JhbmdlLCB5ZWxsb3csIHJlZGlzaCwgb3JhbmdlXVxuICB9LFxuICB7XG4gICAgJ3JhZGl1cycgOiBjYW52YXNIIC8gMyxcbiAgICAncG9pbnRzJyA6IDUsXG4gICAgJ2NvbG9ycycgOiBbcmVkaXNoLCB5ZWxsb3csIHJlZGlzaCwgb3JhbmdlLCByZWRpc2hdXG4gIH0sXG4gIHtcbiAgICAncmFkaXVzJyA6IGNhbnZhc0ggLyA1LFxuICAgICdwb2ludHMnIDogNCxcbiAgICAnY29sb3JzJyA6IFtyZWRpc2gsIG9yYW5nZSwgeWVsbG93LCBvcmFuZ2VdXG4gIH1cbl1cblxuZnVuY3Rpb24gc2NpZW5jZSgpIHtcbiAgcmVzaXplKClcbiAgY3R4LmZpbGxTdHlsZSA9IGJnXG4gIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXNXLCBjYW52YXNIKVxuXG4gIGNpcmNsZXMubWFwKCAoaXRlbSkgPT4ge1xuICAgIGN0eC5zYXZlKClcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBsaWdodEJsdWVcbiAgICBjdHgubGluZVdpZHRoID0gM1xuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5hcmMoY2FudmFzVywgY2FudmFzSCwgaXRlbS5yYWRpdXMsIDAgLCAyICogTWF0aC5QSSlcbiAgICBjdHguc3Ryb2tlKClcbiAgICBjdHgucmVzdG9yZSgpXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW0ucG9pbnRzOyBpKyspIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGJnXG4gICAgICBjdHgubGluZVdpZHRoID0gNVxuICAgICAgY29uc3Qgc2xpY2UgPSBjX21hdGguZGVnVG9SYWQoMzYwIC8gaXRlbS5wb2ludHMpXG4gICAgICBsZXQgYW5nbGVcbiAgICAgIGlmIChjaXJjbGVzLmluZGV4T2YoaXRlbSkgJSAyKSB7XG4gICAgICAgIGFuZ2xlID0gc2xpY2UgKiBpIC0gYVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW5nbGUgPSBzbGljZSAqIGkgKyBhXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHggPSBjYW52YXNXICsgaXRlbS5yYWRpdXMgKiBNYXRoLnNpbihhbmdsZSlcbiAgICAgIGNvbnN0IHkgPSBjYW52YXNIICsgaXRlbS5yYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSlcblxuICAgICAgY3R4LnNhdmUoKVxuICAgICAgICBjdHgudHJhbnNsYXRlKHgsIHkpXG4gICAgICAgIGN0eC5yb3RhdGUoLWFuZ2xlKVxuXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBpdGVtLmNvbG9yc1tpXVxuICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgY3R4LmFyYygwLCAwLCAxMCwgMCwgMiAqTWF0aC5QSSlcbiAgICAgICAgY3R4LmZpbGwoKVxuICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgIGN0eC5yZXN0b3JlKClcbiAgICB9XG4gIH0pXG4gIGEgPSBhICsgMC4wMDFcblxuICBjdHguc2F2ZSgpXG4gIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJ1xuICBjdHguZm9udCA9ICc0OHB4IHNhbnMtc2VyaWYnXG4gIGN0eC5maWxsU3R5bGUgPSBvcmFuZ2VcbiAgY3R4LmZpbGxUZXh0KCdTQ0lFTkNFJywgY2FudmFzVyAvIDIsIGNhbnZhc0ggLyAzKVxuICBjdHgucmVzdG9yZSgpXG5cbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShzY2llbmNlKVxuXG4gIGhlcm8uYXBwZW5kQ2hpbGQoY2FudmFzKVxuICByZXR1cm4gaGVyb1xufVxuXG5leHBvcnQgZGVmYXVsdCBzY2llbmNlIiwiaW1wb3J0IHJnYmFUb0hleCBmcm9tICdjYW52YXMtc2tldGNoLXV0aWwvbGliL3JnYmEtdG8taGV4JztcbmltcG9ydCBzZXRDYW52YXMgZnJvbSAnLi4vc2V0Q2FudmFzJ1xuY29uc3QgY19yYW5kb20gPSByZXF1aXJlKCdjYW52YXMtc2tldGNoLXV0aWwvcmFuZG9tJylcblxubGV0IFtjYW52YXMsIGN0eCwgY2FudmFzVywgY2FudmFzSCwgaGVyb10gPSBzZXRDYW52YXMoKVxuXG5mdW5jdGlvbiByZXNpemUgKCkge1xuICBjYW52YXNXID0gd2luZG93LmlubmVyV2lkdGggLSAyMFxuICBjYW52YXNIID0gd2luZG93LmlubmVySGVpZ2h0IC0gMjBcbiAgY2FudmFzLndpZHRoID0gY2FudmFzV1xuICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSFxufVxuXG5mdW5jdGlvbiBnZXRMb25nZXIoKSB7XG4gIGxldCBhO1xuICAoY2FudmFzVyA+IGNhbnZhc0gpID8gYSA9IGNhbnZhc1cgOiBhID0gY2FudmFzSFxuICByZXR1cm4gYVxufVxuXG5mdW5jdGlvbiBnZXRHcmQocmFkKSB7XG4gIGxldCBjaXJjbGVHZHIgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMCwgMCwgMCwgMCwgMCwgcmFkKVxuICBjaXJjbGVHZHIuYWRkQ29sb3JTdG9wKDAsICdyZ2IoMjEwLCAxNjMsIDkzKScpXG4gIGNpcmNsZUdkci5hZGRDb2xvclN0b3AoMC4zMCwgJ3JnYigyMTcsIDE3NywgMTE4JylcbiAgY2lyY2xlR2RyLmFkZENvbG9yU3RvcCgwLjU2LCAncmdiKDIzNiwgMjEzLCAxNzknKVxuICBjaXJjbGVHZHIuYWRkQ29sb3JTdG9wKDAuOTAsICdyZ2IoMjAxLCAyMzIsIDI0OSknKVxuICBjaXJjbGVHZHIuYWRkQ29sb3JTdG9wKDEsICdyZ2IoMjIwLCAyMjAsIDIyMCknKVxuICByZXR1cm4gY2lyY2xlR2RyXG59XG5cbi8vIFNIQVBFXG5sZXQgdG9wUGF0aCA9IFtcbiAge1xuICAgICd4JyA6IDAsXG4gICAgJ3knIDogMC41IC8gNCAqIGNhbnZhc0hcbiAgfSxcbiAge1xuICAgICd4JyA6IDAuNSAvIDIgKiBjYW52YXNXLFxuICAgICd5JyA6IDAuNSAvIDggKiBjYW52YXNIXG4gIH0sXG4gIHtcbiAgICAneCcgOiAxIC8gMiAqIGNhbnZhc1csXG4gICAgJ3knIDogMC41IC8gNCAqIGNhbnZhc0hcbiAgfSxcbiAge1xuICAgICd4JyA6IDEuNSAvIDIgKiBjYW52YXNXLFxuICAgICd5JyA6IDEuNSAvIDggKiBjYW52YXNIXG4gIH0sXG4gIHtcbiAgICAneCcgOiBjYW52YXNXLFxuICAgICd5JyA6IDAuNSAvIDQgKiBjYW52YXNIXG4gIH1cbl1cblxubGV0IGJvdHRvbVBhdGggPSBbXG4gIHsgXG4gICAgJ3gnIDogMCxcbiAgICAneScgOiAzLjUgLyA0ICogY2FudmFzSFxuICB9LFxuICB7IFxuICAgICd4JyA6IDAuNSAvIDIgKiBjYW52YXNXLFxuICAgICd5JyA6IDcuNS84ICogY2FudmFzSFxuICB9LFxuICB7IFxuICAgICd4JyA6IDEgLyAyICogY2FudmFzVyxcbiAgICAneScgOiAzLjUvNCAqIGNhbnZhc0hcbiAgfSxcbiAgeyBcbiAgICAneCcgOiAxLjUgLyAyICogY2FudmFzVyxcbiAgICAneScgOiA2LjUvOCAqIGNhbnZhc0hcbiAgfSxcbiAgeyBcbiAgICAneCcgOiBjYW52YXNXLFxuICAgICd5JyA6IDMuNSAvIDQgKiBjYW52YXNIXG4gIH1cbl1cblxuLy8gQ0lSQ0xFU1xuY2xhc3MgT3JpZ2luIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy54ID0gY19yYW5kb20ucmFuZ2UoMCwgY2FudmFzVylcbiAgICB0aGlzLnkgPSBjX3JhbmRvbS5yYW5nZSgwLCBjYW52YXNIKVxuICAgIHRoaXMudmVsWCA9IGNfcmFuZG9tLnJhbmdlKDAuNSwgMylcbiAgICB0aGlzLnZlbFkgPSBjX3JhbmRvbS5yYW5nZSgwLjUsIDMpXG4gIH1cbn1cblxubGV0IHRvcE9yaWdpbiA9IG5ldyBPcmlnaW4oKVxubGV0IGJvdHRvbU9yaWdpbiA9IG5ldyBPcmlnaW4oKVxuXG4vLyBUSVRMRVxuY29uc3QgdGl0bGVSYWQgPSAyMDBcbmxldCBncmRXaGl0ZSA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudChcbiAgY2FudmFzVyAvIDIsIFxuICBjYW52YXNIIC8gMiArIHRpdGxlUmFkLCBcbiAgMSwgXG4gIGNhbnZhc1cgLyAyLCBcbiAgY2FudmFzSCAvIDIgKyB0aXRsZVJhZCxcbiAgdGl0bGVSYWQgKiAyLjVcbiAgKVxuZ3JkV2hpdGUuYWRkQ29sb3JTdG9wKDAsICdyZ2IoMjU1LCAyNTUsIDI1NSwgMCknKVxuZ3JkV2hpdGUuYWRkQ29sb3JTdG9wKDEsICdyZ2IoMjU1LCAyNTUsIDI1NSwgMSknKVxuXG5mdW5jdGlvbiB3YXZlcyAoKSB7XG4gIHJlc2l6ZSgpXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzVywgY2FudmFzSClcbiAgbGV0IGNpcmNsZVJhZCA9IGdldExvbmdlcigpIC8gMS43NVxuXG4gIGN0eC5maWxsU3R5bGUgPSBnZXRHcmQoY2lyY2xlUmFkKVxuICAvLyBCQUNLR1JPVU5EXG4gIGN0eC5zYXZlKClcbiAgY3R4LnRyYW5zbGF0ZShjYW52YXNXIC8gMiwgY2FudmFzSCAvIDIpXG4gIFxuICBjdHguYXJjKDAsIDAsIGNpcmNsZVJhZCwgMCwgMiAqIE1hdGguUEkpXG4gIGN0eC5maWxsKClcbiAgY3R4LnJlc3RvcmUoKVxuXG4gIC8vIFRPUFxuICBjdHguc2F2ZSgpXG4gIGN0eC5iZWdpblBhdGgoKVxuICBjdHgubW92ZVRvKHRvcFBhdGhbMF0ueCwgdG9wUGF0aFswXS55KVxuICBjdHguYmV6aWVyQ3VydmVUbyh0b3BQYXRoWzFdLngsIHRvcFBhdGhbMV0ueSwgdG9wUGF0aFsxXS54LCB0b3BQYXRoWzFdLnksIHRvcFBhdGhbMl0ueCwgdG9wUGF0aFsyXS55KVxuICBjdHguYmV6aWVyQ3VydmVUbyh0b3BQYXRoWzNdLngsIHRvcFBhdGhbM10ueSwgdG9wUGF0aFszXS54LCB0b3BQYXRoWzNdLnksIHRvcFBhdGhbNF0ueCwgdG9wUGF0aFs0XS55KVxuICBjdHgubGluZVRvKGNhbnZhc1csIDApXG4gIGN0eC5saW5lVG8oMCwgMClcbiAgY3R4LmxpbmVUbyh0b3BQYXRoWzBdLngsIHRvcFBhdGhbMF0ueSlcbiAgY3R4LmNsb3NlUGF0aCgpXG4gIGN0eC5jbGlwKClcbiAgY3R4LnRyYW5zbGF0ZSh0b3BPcmlnaW4ueCwgdG9wT3JpZ2luLnkpXG4gIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXNXLCBjYW52YXNIKVxuICBjdHguZmlsbCgpXG4gIGN0eC5yZXN0b3JlKClcbiAgLy8gbW92ZVxuICBpZiAodG9wT3JpZ2luLnggPD0gMCB8fCB0b3BPcmlnaW4ueCA+PSBjYW52YXNXKSB0b3BPcmlnaW4udmVsWCAqPSAtMSAvL2JvdW5jZVxuICBpZiAodG9wT3JpZ2luLnkgPD0gMCB8fCB0b3BPcmlnaW4ueSA+PSBjYW52YXNIKSB0b3BPcmlnaW4udmVsWSAqPSAtMVxuICB0b3BPcmlnaW4ueCArPSB0b3BPcmlnaW4udmVsWFxuICB0b3BPcmlnaW4ueSArPSB0b3BPcmlnaW4udmVsWTsgIFxuICAvLyBpZiAodG9wUGF0aFsxXS55ID49IDAuNSAvIDggKiBjYW52YXNIICYgdG9wUGF0aFsxXS55IDw9IDEuNSAvIDggKiBjYW52YXNIKSB7XG4gIC8vICAgdG9wUGF0aFsxXS55ID0gdG9wUGF0aFsxXS55ICsgMC41XG4gIC8vIH0gZWxzZSB7XG4gIC8vICAgdG9wUGF0aFsxXS55ID0gdG9wUGF0aFsxXS55IC0gMC41XG4gIC8vIH1cblxuICAvLyBCT1RUT01cbiAgY3R4LnNhdmUoKVxuICBjdHguYmVnaW5QYXRoKClcbiAgY3R4Lm1vdmVUbyhib3R0b21QYXRoWzBdLngsIGJvdHRvbVBhdGhbMF0ueSlcbiAgY3R4LmJlemllckN1cnZlVG8oYm90dG9tUGF0aFsxXS54LCBib3R0b21QYXRoWzFdLnksIGJvdHRvbVBhdGhbMV0ueCwgYm90dG9tUGF0aFsxXS55LCBib3R0b21QYXRoWzJdLngsIGJvdHRvbVBhdGhbMl0ueSlcbiAgY3R4LmJlemllckN1cnZlVG8oYm90dG9tUGF0aFszXS54LCBib3R0b21QYXRoWzNdLnksIGJvdHRvbVBhdGhbM10ueCwgYm90dG9tUGF0aFszXS55LCBib3R0b21QYXRoWzRdLngsIGJvdHRvbVBhdGhbNF0ueSlcbiAgY3R4LmxpbmVUbyhjYW52YXNXLCBjYW52YXNIKVxuICBjdHgubGluZVRvKDAsIGNhbnZhc0gpXG4gIGN0eC5saW5lVG8oYm90dG9tUGF0aFswXS54LCBib3R0b21QYXRoWzBdLnkpXG4gIGN0eC5jbG9zZVBhdGgoKVxuICBjdHguY2xpcCgpXG4gIC8vIG1vdmUgY3R4IHN0YXJ0XG4gIGN0eC50cmFuc2xhdGUoYm90dG9tT3JpZ2luLngsIGJvdHRvbU9yaWdpbi55KVxuICBpZiAoYm90dG9tT3JpZ2luLnggPD0gMCB8fCBib3R0b21PcmlnaW4ueCA+PSBjYW52YXNXKSBib3R0b21PcmlnaW4udmVsWCAqPSAtMSAvL2JvdW5jZVxuICBpZiAoYm90dG9tT3JpZ2luLnkgPD0gMCB8fCBib3R0b21PcmlnaW4ueSA+PSBjYW52YXNIKSBib3R0b21PcmlnaW4udmVsWSAqPSAtMVxuICBib3R0b21PcmlnaW4ueCArPSBib3R0b21PcmlnaW4udmVsWFxuICBib3R0b21PcmlnaW4ueSArPSBib3R0b21PcmlnaW4udmVsWVxuICAvLyBmaWxsIGNsaXBcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhc1csIGNhbnZhc0gpXG4gIGN0eC5maWxsKClcbiAgY3R4LnJlc3RvcmUoKVxuXG4gIC8vIENJUkNMRVxuICAvLyBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1hdG9wJ1xuICBjdHguc2F2ZSgpXG4gIGN0eC5maWxsU3R5bGUgPSBncmRXaGl0ZVxuICBjdHguYmVnaW5QYXRoKClcbiAgY3R4LmFyYyhjYW52YXNXIC8gMiwgY2FudmFzSCAvIDIsIHRpdGxlUmFkLCAwLCAyICogTWF0aC5QSSlcbiAgY3R4LmZpbGwoKVxuICBjdHgucmVzdG9yZSgpXG5cbiAgLy9UWFRcblxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdhdmVzKVxuICBoZXJvLmFwcGVuZENoaWxkKGNhbnZhcylcbiAgcmV0dXJuIGhlcm9cbn1cblxuZXhwb3J0IGRlZmF1bHQgd2F2ZXMiLCJpbXBvcnQgc2V0Q2FudmFzIGZyb20gJy4uL3NldENhbnZhcydcbmNvbnN0IGNfcmFuZG9tID0gcmVxdWlyZSgnY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbScpXG5cbmxldCBbY2FudmFzLCBjdHgsIGNhbnZhc1csIGNhbnZhc0gsIGhlcm9dID0gc2V0Q2FudmFzKClcblxuZnVuY3Rpb24gcmVzaXplICgpIHtcbiAgY2FudmFzVyA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMjBcbiAgY2FudmFzSCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIDIwXG4gIGNhbnZhcy53aWR0aCA9IGNhbnZhc1dcbiAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hcbiAgY3cgPSBjYW52YXNXIC8gMlxuICBjaCA9IGNhbnZhc0ggLyAyXG4gIHJhZGl1cyA9IHNldFJhZGl1cygpXG59XG5cbmZ1bmN0aW9uIHNldFJhZGl1cyAoKSB7XG4gIGxldCBhO1xuICAoY2FudmFzVyA+IGNhbnZhc0gpID8gYSA9IGNhbnZhc1cgOiBhID0gY2FudmFzSCBcbiAgcmV0dXJuIGFcbn1cblxuZnVuY3Rpb24gc2V0VmVsKCkge1xuICBsZXQgdiA9IGNfcmFuZG9tLnJhbmdlKDAuNSwgMylcbiAgcmV0dXJuIHZcbn1cblxubGV0IGN3ID0gY2FudmFzVyAvIDJcbmxldCBjaCA9IGNhbnZhc0ggLyAyXG5sZXQgcmFkaXVzID0gc2V0UmFkaXVzKClcbmNvbnN0IGZvbnRTaXplID0gNTBcblxuY29uc3QgY29sb3IgPSAnIzkxMjg1MydcbmNvbnN0IGdyZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudChjdywgY2gsIDEsIGN3LCBjaCwgcmFkaXVzKTtcbmdyZC5hZGRDb2xvclN0b3AoMCwgY29sb3IpO1xuZ3JkLmFkZENvbG9yU3RvcCgwLjYsICdyZ2IoMjU1LCAyNTUsIDI1NSwgMCknKVxuXG5jbGFzcyBDaXJjbGV7XG4gIGNvbnN0cnVjdG9yKG51bSkge1xuICAgIHRoaXMucmFkID0gcmFkaXVzIC8gbnVtLFxuICAgIHRoaXMueCA9IGNfcmFuZG9tLnJhbmdlKDAsIGNhbnZhc1cpXG4gICAgdGhpcy55ID0gY19yYW5kb20ucmFuZ2UoMCwgY2FudmFzSClcbiAgICB0aGlzLnZlbFggPSBzZXRWZWwoKVxuICAgIHRoaXMudmVsWSA9IHNldFZlbCgpXG4gIH1cbn1cblxuY29uc3QgcmFkcyA9IFsxLCAxLCAyLCAyLCAyLCAzXVxubGV0IHBvaW50cyA9IFtdXG5yYWRzLm1hcChpdGVtID0+IHsgXG4gIGxldCBwID0gbmV3IENpcmNsZShpdGVtKVxuICBwb2ludHMucHVzaChwKVxufSlcblxuZnVuY3Rpb24gd2luZSAoKSB7XG4gIHJlc2l6ZSgpXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzVywgY2FudmFzSClcbiAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSdcblxuICAvLyBNT1ZJTkcgUE9JU1xuICBwb2ludHMubWFwKCAoaXRlbSkgPT4ge1xuICAgIGlmIChpdGVtLnggPCAtNTAgfHwgaXRlbS54ID4gY2FudmFzVyArNTApIHsgLy9yZXNpemUgc21hbGxlclxuICAgICAgaXRlbS54ID0gc2V0WCgpXG4gICAgICBpdGVtLnkgPSBzZXRZKClcbiAgICB9XG4gICAgY3R4LnNhdmUoKVxuICAgIGN0eC50cmFuc2xhdGUoaXRlbS54LCBpdGVtLnkpXG4gICAgbGV0IGl0ZW1HcmQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMCwgMCwgMCwgMCwgMCwgaXRlbS5yYWQpXG4gICAgaXRlbUdyZC5hZGRDb2xvclN0b3AoMCwgY29sb3IpO1xuICAgIGl0ZW1HcmQuYWRkQ29sb3JTdG9wKDEsICdyZ2IoMjU1LCAyNTUsIDI1NSwgMCknKVxuICAgIGN0eC5maWxsU3R5bGUgPSBpdGVtR3JkXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4LmFyYygwLCAwLCBpdGVtLnJhZCwgMCwgTWF0aC5QSSAqIDIpXG4gICAgY3R4LmZpbGwoKVxuICAgIGN0eC5yZXN0b3JlKClcbiAgICBpZiAoaXRlbS54IDw9IDAgfHwgaXRlbS54ID49IGNhbnZhc1cpIGl0ZW0udmVsWCAqPSAtMSAvL2JvdW5jZVxuICAgIGlmIChpdGVtLnkgPD0gMCB8fCBpdGVtLnkgPj0gY2FudmFzSCkgaXRlbS52ZWxZICo9IC0xXG4gICAgaXRlbS54ICs9IGl0ZW0udmVsWFxuICAgIGl0ZW0ueSArPSBpdGVtLnZlbFlcbiAgfSlcblxuICAvLyBUSVRMRVxuICBjdHguZmlsbFN0eWxlID0gZ3JkXG4gIGN0eC5zYXZlKClcbiAgY3R4LmJlZ2luUGF0aCgpXG4gIGN0eC5hcmMoY3csIGNoLCByYWRpdXMsIDAgLCAyICogTWF0aC5QSSlcbiAgY3R4LmZpbGwoKVxuICBjdHgucmVzdG9yZSgpXG5cbiAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2UtYXRvcCdcbiAgbGV0IHdoaXRlUmFkaXVzXG4gIChyYWRpdXMgPiAxNTApID8gd2hpdGVSYWRpdXMgPSAxNTAgOiB3aGl0ZVJhZGl1cyA9IHJhZGl1cyAvIDVcbiAgY3R4LnNhdmUoKVxuICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJ1xuICBjdHguYmVnaW5QYXRoKClcbiAgY3R4LmFyYyhjdywgY2gsIHdoaXRlUmFkaXVzLCAwICwgMiAqIE1hdGguUEkpXG4gIGN0eC5maWxsKClcbiAgY3R4LnJlc3RvcmUoKVxuXG4gIGN0eC5zYXZlKClcbiAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInXG4gIGN0eC5mb250ID0gYCR7Zm9udFNpemV9cHggc2Fucy1zZXJpZmBcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yXG4gIGN0eC5maWxsVGV4dCgnV0lORScsIGNhbnZhc1cgLyAyLCBjYW52YXNIIC8gMiArIGZvbnRTaXplIC8gMilcbiAgY3R4LnJlc3RvcmUoKVxuXG4gIC8vIFNFVFVQXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUod2luZSlcbiAgaGVyby5hcHBlbmRDaGlsZChjYW52YXMpXG4gIHJldHVybiBoZXJvXG59XG5cbmV4cG9ydCBkZWZhdWx0IHdpbmUiLCJmdW5jdGlvbiBzZXRDYW52YXMgKCkge1xuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICBjb25zdCBjYW52YXNXID0gd2luZG93LmlubmVyV2lkdGggLSAyMFxuICBjb25zdCBjYW52YXNIID0gd2luZG93LmlubmVySGVpZ2h0IC0gMjBcbiAgY2FudmFzLndpZHRoID0gY2FudmFzV1xuICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSFxuXG4gIGNvbnN0IGhlcm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBoZXJvLmNsYXNzTGlzdC5hZGQoJ2hlcm8tYm94JylcblxuICByZXR1cm4gW2NhbnZhcywgY3R4LCBjYW52YXNXLCBjYW52YXNILCBoZXJvXVxufVxuXG5leHBvcnQgZGVmYXVsdCBzZXRDYW52YXMiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsImltcG9ydCAnLi9zdHlsZS5jc3MnXG5pbXBvcnQgc2NpZW5jZSBmcm9tICcuL2Rlc2lnbnMvc2NpZW5jZSdcbmltcG9ydCB3aW5lIGZyb20gJy4vZGVzaWducy93aW5lJ1xuaW1wb3J0IHdhdmVzIGZyb20gJy4vZGVzaWducy93YXZlcydcblxuY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbmNvbnRhaW5lci5pZCA9ICdjb250YWluZXInXG5cbi8vIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzY2llbmNlKCkpXG4vLyBjb250YWluZXIuYXBwZW5kQ2hpbGQod2luZSgpKVxuY29udGFpbmVyLmFwcGVuZENoaWxkKHdhdmVzKCkpXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcikiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=