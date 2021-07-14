import 'core-js/modules/es.array.concat.js';
import 'core-js/modules/es.number.constructor.js';
import 'core-js/modules/es.regexp.exec.js';
import 'core-js/modules/es.string.replace.js';
import 'core-js/modules/es.array.slice.js';
import 'core-js/modules/es.array.map.js';
import 'core-js/modules/es.string.split.js';
import 'core-js/modules/es.string.trim.js';

/**
 * @module reload
 */
function isUpToDate(hash) {
  return hash === __webpack_hash__;
}

function update(hash) {
  module.hot.check(true).then(function (updated) {
    if (!updated) {
      window.location.reload();
    } else if (!isUpToDate(hash)) {
      update(hash);
    }
  }).catch(function () {
    var status = module.hot.status();

    if (status === 'abort' || status === 'fail') {
      window.location.reload();
    }
  });
}

function reload(hash, hmr) {
  if (!isUpToDate(hash)) {
    if (hmr && module.hot) {
      if (module.hot.status() === 'idle') {
        update(hash);
      }
    } else {
      window.location.reload();
    }
  }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

/**
 * @module effects
 */
// 默认样式
var styles = document.documentElement.style; // Animation 映射表

var ANIMATION_MAPS = [['animation', 'animationend'], ['WebkitAnimation', 'webkitAnimationEnd'], ['MozAnimation', 'mozAnimationEnd'], ['OAnimation', 'oAnimationEnd'], ['msAnimation', 'MSAnimationEnd'], ['KhtmlAnimation', 'khtmlAnimationEnd']]; // Transition 映射表

var TRANSITION_MAPS = [['transition', 'transitionend'], ['WebkitTransition', 'webkitTransitionEnd'], ['MozTransition', 'mozTransitionEnd'], ['OTransition', 'oTransitionEnd'], ['msTransition', 'MSTransitionEnd'], ['KhtmlTransition', 'khtmlTransitionEnd']];
/**
 * @function detect
 * @param {object} maps
 */

function detect(maps) {
  var _iterator = _createForOfIteratorHelper(maps),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
          prop = _step$value[0],
          event = _step$value[1];

      if (prop in styles) {
        return [prop, event];
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
} // Animation


var _detect = detect(ANIMATION_MAPS),
    _detect2 = _slicedToArray(_detect, 2),
    ANIMATION = _detect2[0],
    ANIMATION_END = _detect2[1]; // Transition


var _detect3 = detect(TRANSITION_MAPS),
    _detect4 = _slicedToArray(_detect3, 2),
    TRANSITION = _detect4[0],
    TRANSITION_END = _detect4[1];
/**
 * @function toMs
 * @param {string} value
 */


function toMs(value) {
  return Number(value.slice(0, -1).replace(',', '.')) * 1000;
}
/**
 * @function calcTimeout
 * @param {Array} delays
 * @param {Array} durations
 */


function calcTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  var times = durations.map(function (duration, index) {
    return toMs(duration) + toMs(delays[index]);
  }); // 获取最大时长

  return Math.max.apply(null, times);
}
/**
 * @function toArray
 * @param {any} value
 */


function toArray(value) {
  return value ? value.split(', ') : [];
}
/**
 * @function calcEffects
 * @param {HTMLElement} node
 */


function calcEffects(node) {
  var styles = window.getComputedStyle(node);
  var transitioneDelays = toArray(styles.getPropertyValue(TRANSITION + '-delay'));
  var transitionDurations = toArray(styles.getPropertyValue(TRANSITION + '-duration'));
  var transitionTimeout = calcTimeout(transitioneDelays, transitionDurations);
  var animationDelays = toArray(styles.getPropertyValue(ANIMATION + '-delay'));
  var animationDurations = toArray(styles.getPropertyValue(ANIMATION + '-duration'));
  var animationTimeout = calcTimeout(animationDelays, animationDurations);
  var timeout = Math.max(transitionTimeout, animationTimeout);
  var effect = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
  var count = effect ? effect === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  return {
    effect: effect,
    count: count,
    timeout: timeout
  };
}
/**
 * @function onEffectsEnd
 * @param {HTMLElement} node
 * @param {Function} callback
 * @see https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/transition-util.js
 */


function onEffectsEnd(node, callback) {
  // 不支持动画
  if (!ANIMATION && !TRANSITION) return callback();

  var _calcEffects = calcEffects(node),
      count = _calcEffects.count,
      effect = _calcEffects.effect,
      timeout = _calcEffects.timeout; // 没有动画


  if (!effect) return callback();
  var ended = 0; // 防止有些动画没有触发结束事件

  var timer = setTimeout(function () {
    if (ended < count) {
      end();
    }
  }, timeout + 1);
  var event = effect === TRANSITION ? TRANSITION_END : ANIMATION_END;

  var end = function end() {
    clearTimeout(timer);
    node.removeEventListener(event, onEnd);
    callback();
  };

  var onEnd = function onEnd(e) {
    if (e.target === node) {
      if (++ended >= count) {
        end();
      }
    }
  }; // 监听动画完成事件


  node.addEventListener(event, onEnd);
}

/**
 * @module utils
 */
function parseHTML(html) {
  try {
    var parser = new DOMParser();

    var _parser$parseFromStri = parser.parseFromString(html.trim(), 'text/html'),
        body = _parser$parseFromStri.body;

    return body.children;
  } catch (_unused) {
    return [];
  }
}

function appendHTML(html, parent) {
  var nodes = [];
  var stage = parent || document.body;

  var _iterator = _createForOfIteratorHelper(parseHTML(html)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var node = _step.value;
      nodes.push(stage.appendChild(node));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return nodes;
}
function injectCSS(css) {
  var style = document.createElement('style');

  if (css.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  document.head.appendChild(style);
}

var ns = 'wds-progress';
var perimeter = 219.99078369140625;
var css = "\n  .".concat(ns, " {\n    opacity: 0;\n    width: 50px;\n    right: 16px;\n    height: 50px;\n    bottom: 16px;\n    position: fixed;\n    transform: scale(0);\n    z-index: 2147483645;\n  }\n  .").concat(ns, "-bg {\n    fill: #282d35;\n  }\n  .").concat(ns, "-track {\n    stroke-width: 10;\n    fill: rgba(0, 0, 0, 0);\n    stroke: rgb(186, 223, 172);\n    stroke-dasharray: ").concat(perimeter, ";\n    stroke-dashoffset: -").concat(perimeter, ";\n    transition: stroke-dashoffset .3s;\n    transform: rotate(90deg) translate(0, -80px);\n  }\n  .").concat(ns, "-value {\n    fill: #ffffff;\n    font-size: 18px;\n    text-anchor: middle;\n    font-family: monospace;\n    dominant-baseline: middle;\n  }\n  .").concat(ns, "-noselect {\n    cursor: default;\n    user-select: none;\n  }\n  @keyframes ").concat(ns, "-fadein {\n    0% {\n      opacity: 0;\n      transform: scale(0);\n    }\n    100% {\n      opacity: 1;\n      transform: scale(1);\n    }\n  }\n  @keyframes ").concat(ns, "-fadeout {\n    0% {\n      opacity: 1;\n      transform: scale(1);\n    }\n    100% {\n      opacity: 0;\n      transform: scale(0);\n    }\n  }\n  .").concat(ns, "-fadein {\n    animation: ").concat(ns, "-fadein .3s;\n    animation-fill-mode: forwards;\n  }\n  .").concat(ns, "-fadeout {\n    animation: ").concat(ns, "-fadeout .3s;\n    animation-fill-mode: forwards;\n  }\n");
var html = "\n  <svg class=\"".concat(ns, " ").concat(ns, "-noselect\" x=\"0\" y=\"0\" viewBox=\"0 0 80 80\">\n    <circle class=\"").concat(ns, "-bg\" cx=\"50%\" cy=\"50%\" r=\"35\" />\n    <path class=\"").concat(ns, "-track\" d=\"M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0\" />\n    <text class=\"").concat(ns, "-value\" x=\"50%\" y=\"52%\">0%</text>\n  </svg>\n");

var Progress = /*#__PURE__*/function () {
  function Progress() {
    _classCallCheck(this, Progress);

    this.init();
  }

  _createClass(Progress, [{
    key: "init",
    value: function init() {
      injectCSS(css);

      var _appendHTML = appendHTML(html);

      var _appendHTML2 = _slicedToArray(_appendHTML, 1);

      this.svg = _appendHTML2[0];
      this.track = this.svg.querySelector(".".concat(ns, "-track"));
      this.value = this.svg.querySelector(".".concat(ns, "-value"));
    }
  }, {
    key: "update",
    value: function update(value) {
      this.value.innerHTML = "".concat(value, "%");
      var offset = (100 - value) / 100 * -perimeter;
      this.track.setAttribute('style', "stroke-dashoffset: ".concat(offset));
    }
  }, {
    key: "show",
    value: function show() {
      var fadein = "".concat(ns, "-fadein");
      var classList = this.svg.classList;

      if (!classList.contains(fadein)) {
        classList.remove("".concat(ns, "-fadeout"));
        classList.add(fadein);
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      var _this = this;

      onEffectsEnd(this.track, function () {
        var fadein = "".concat(ns, "-fadein");
        var classList = _this.svg.classList;

        if (classList.contains(fadein)) {
          classList.remove(fadein);
          classList.add("".concat(ns, "-fadeout"));
        }

        onEffectsEnd(_this.svg, function () {
          _this.update(0);
        });
      });
    }
  }]);

  return Progress;
}();

/**
 * @module index
 */

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch (_unused) {
    return {};
  }
}

function createWebSocket(url, protocols) {
  var bar = new Progress();
  var ws = new WebSocket(url, protocols);

  var progress = function progress(value) {
    value === 0 && bar.show();
    bar.update(value);
    value === 100 && bar.hide();
  };

  ws.onmessage = function (message) {
    var _parseMessage = parseMessage(message),
        action = _parseMessage.action,
        payload = _parseMessage.payload;

    switch (action) {
      case 'init':
        break;

      case 'rebuild':
        break;

      case 'ok':
        reload(payload.hash, true);
        break;

      case 'problems':
        reload(payload.hash, true);
        break;

      case 'progress':
        progress(payload.value);
        break;
    }

    window.postMessage({
      action: "webpack-hot-".concat(action),
      payload: payload
    }, '*');
  };

  ws.onclose = function (event) {
    console.log(event);
  };
}

createWebSocket('ws://127.0.0.1:8000/hmr');
