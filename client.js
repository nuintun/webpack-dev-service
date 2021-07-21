import 'core-js/modules/es.array.iterator.js';
import 'core-js/modules/es.object.to-string.js';
import 'core-js/modules/es.string.iterator.js';
import 'core-js/modules/web.dom-collections.iterator.js';
import 'core-js/modules/web.url.js';
import 'core-js/modules/es.array.concat.js';
import 'core-js/modules/es.function.name.js';
import 'core-js/modules/es.regexp.exec.js';
import 'core-js/modules/es.string.replace.js';
import 'core-js/modules/es.object.keys.js';
import 'core-js/modules/es.string.repeat.js';
import ansiRegex from 'ansi-regex';
import 'core-js/modules/es.string.trim.js';
import 'core-js/modules/es.number.constructor.js';
import 'core-js/modules/es.array.slice.js';
import 'core-js/modules/es.array.map.js';
import 'core-js/modules/es.string.split.js';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
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

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
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

var ANSI_RE = ansiRegex();
var DEFAULT_COLORS = {
  black: '#000',
  red: '#ff0000',
  green: '#209805',
  yellow: '#e8bf03',
  blue: '#0000ff',
  magenta: '#ff00ff',
  cyan: '#00ffee',
  lightgrey: '#f0f0f0',
  darkgrey: '#888',
  // [Foregroud, Background]
  reset: ['#fff', '#000']
};
var STYLES = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'lightgrey'
};
var OPEN_TAGS = {
  // Bold
  1: 'font-weight: bold;',
  // Dim
  2: 'opacity: 0.5;',
  // Italic
  3: '<i>',
  // Underscore
  4: '<u>',
  // Hidden
  8: 'display: none;',
  // Delete
  9: '<del>'
};
var CLOSE_TAGS = {
  // Reset italic
  23: '</i>',
  // Reset underscore
  24: '</u>',
  // Reset delete
  29: '</del>'
};

for (var _i = 0, _arr = [0, 21, 22, 27, 28, 39, 49]; _i < _arr.length; _i++) {
  var code = _arr[_i];
  CLOSE_TAGS[code] = '</span>';
}

function encodeHTML(text) {
  return String(text).replace(/[<>]/g, function (match) {
    return "&#6".concat(match === '<' ? 0 : 2, ";");
  });
}

function resolveTags(colors) {
  colors = _objectSpread2(_objectSpread2({}, DEFAULT_COLORS), colors);

  var open = _objectSpread2({}, OPEN_TAGS);

  var close = _objectSpread2({}, CLOSE_TAGS);

  var _colors$reset = _slicedToArray(colors.reset, 2),
      foregroud = _colors$reset[0],
      background = _colors$reset[1]; // Reset all


  open[0] = "font-weight: normal; opacity: 1; color: ".concat(foregroud, " ; background: ").concat(background); // Inverse

  open[7] = "color: ".concat(background, "; background: ").concat(foregroud); // Dark grey

  open[90] = "color: ".concat(colors.darkgrey);

  for (var _i2 = 0, _Object$keys = Object.keys(STYLES); _i2 < _Object$keys.length; _i2++) {
    var _code = _Object$keys[_i2];
    var style = STYLES[_code];
    var color = colors[style] || foregroud;
    open[_code] = "color: ".concat(color, ";");
    open[~~_code + 10] = "background: ".concat(color, ";");
  }

  return {
    open: open,
    close: close
  };
}

var Ansi = /*#__PURE__*/function () {
  function Ansi(colors) {
    _classCallCheck(this, Ansi);

    var _resolveTags = resolveTags(colors),
        open = _resolveTags.open,
        close = _resolveTags.close;

    this.open = open;
    this.close = close;
  }

  _createClass(Ansi, [{
    key: "convert",
    value: function convert(text) {
      text = encodeHTML(text); // Returns the text if the string has no ANSI escape code

      if (!ANSI_RE.test(text)) return text; // Cache opened sequence

      var codes = [];
      var open = this.open,
          close = this.close; // Replace with markup

      var html = text.replace(/\033\[(\d+)*m/g, function (_match, code) {
        var openTag = open[code];

        if (openTag) {
          // If current sequence has been opened, close it.
          if (!!~codes.indexOf(code)) {
            // eslint-disable-line no-extra-boolean-cast
            codes.pop();
            return '</span>';
          } // Open tag.


          codes.push(code);
          return openTag[0] === '<' ? openTag : "<span style=\"".concat(openTag, "\">");
        }

        var closeTag = close[code];

        if (closeTag) {
          // Pop sequence
          codes.pop();
          return closeTag;
        }

        return '';
      }); // Make sure tags are closed.

      var length = codes.length;

      if (length) {
        html += '</span>'.repeat(length);
      }

      return html;
    }
  }]);

  return Ansi;
}();
function strip(text) {
  return text ? text.replace(ANSI_RE, '') : '';
}

/**
 * @module utils
 */
function injectCSS(css) {
  var style = document.createElement('style');

  if (style.styleSheet) {
    style.styleSheet.cssText = css.trim();
  } else {
    style.appendChild(document.createTextNode(css.trim()));
  }

  document.head.appendChild(style);
}
function appendHTML(html, parent) {
  var nodes = [];
  var parser = new DOMParser();
  var stage = parent || document.body;

  var _parser$parseFromStri = parser.parseFromString(html.trim(), 'text/html'),
      body = _parser$parseFromStri.body;

  while (body.firstChild) {
    nodes.push(stage.appendChild(body.firstChild));
  }

  return nodes;
}

var OVERLAY = 'wds-overlay';
var CSS$1 = "\n.".concat(OVERLAY, " {\n  top:0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  width: 100vw;\n  height: 100vh;\n  display: flex;\n  position: fixed;\n  font-size: 16px;\n  overflow: hidden;\n  font-style: normal;\n  font-weight: normal;\n  z-index: 2147483644;\n  flex-direction: column;\n  box-sizing: border-box;\n  transform-origin: center;\n  background: rgba(0, 0, 0, .85);\n  transform: scale(0) translateZ(0);\n  transition: transform .25s ease-out;\n  font-family: Menlo, \"Lucida Console\", monospace;\n}\n.").concat(OVERLAY, "-show {\n  transform: scale(1) translateZ(0);\n}\n.").concat(OVERLAY, "-close {\n  top: 16px;\n  right: 16px;\n  width: 16px;\n  height: 16px;\n  cursor: pointer;\n  position: absolute;\n  border-radius: 16px;\n  background: #ff5f58;\n  display: inline-block;\n  transform-origin: center;\n  box-shadow: #ff5f58 0 0 6px;\n  transform: rotate(0) translateZ(0);\n  transition: transform .25s ease-in-out;\n}\n.").concat(OVERLAY, "-close:before,\n.").concat(OVERLAY, "-close:after {\n  top: 7px;\n  left: 3px;\n  content: \"\";\n  width: 10px;\n  height: 2px;\n  position: absolute;\n  background-color: white;\n  transform-origin: center;\n}\n.").concat(OVERLAY, "-close:before {\n  transform: rotate(45deg);\n}\n.").concat(OVERLAY, "-close:after {\n  transform: rotate(-45deg);\n}\n.").concat(OVERLAY, "-close:hover {\n  transform: rotate(180deg) translateZ(0);\n}\n.").concat(OVERLAY, "-title {\n  margin: 0;\n  color: #fff;\n  line-height: 16px;\n  text-align: center;\n  background: #282d35;\n  overflow-wrap: break-word;\n  border-radius: 0 0 4px 4px;\n  padding: 16px 48px 16px 16px;\n}\n.").concat(OVERLAY, "-name {\n  font-weight: bold;\n  font-style: normal;\n  text-transform: uppercase;\n}\n.").concat(OVERLAY, "-errors-title,\n.").concat(OVERLAY, "-warnings-title {\n  color: #ff5f58;\n  padding-left: 8px;\n  font-style: normal;\n}\n.").concat(OVERLAY, "-warnings-title {\n  color: #ffbd2e;\n}\n.").concat(OVERLAY, "-problems {\n  padding: 0 16px;\n  overflow-y: auto;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n  -webkit-overflow-scrolling: touch;\n}\n.").concat(OVERLAY, "-problems::-webkit-scrollbar {\n  display: none;\n}\n.").concat(OVERLAY, "-errors,\n.").concat(OVERLAY, "-warnings {\n  color: #ddd;\n  margin: 16px 0;\n  display: block;\n  border-radius: 4px;\n  background: #282d35;\n  white-space: pre-wrap;\n  font-family: Menlo, \"Lucida Console\", monospace;\n}\n.").concat(OVERLAY, "-errors > div,\n.").concat(OVERLAY, "-warnings > div {\n  padding: 16px 16px 0;\n  overflow-wrap: break-word;\n}\n.").concat(OVERLAY, "-errors > div > em,\n.").concat(OVERLAY, "-warnings > div > em {\n  line-height: 1;\n  color: #641e16;\n  padding: 4px 8px;\n  font-style: normal;\n  border-radius: 4px;\n  font-weight: normal;\n  background: #ff5f58;\n  display: inline-block;\n  text-transform: uppercase;\n}\n.").concat(OVERLAY, "-warnings > div > em {\n  color: #3e2723;\n  background: #ffbd2e;\n}\n.").concat(OVERLAY, "-errors > div > div,\n.").concat(OVERLAY, "-warnings > div > div {\n  font-size: 14px;\n  padding: 8px 0 16px 16px;\n  overflow-wrap: break-word;\n}\n.").concat(OVERLAY, "-hidden {\n  display: none;\n}\n");
var DEFAULT_NAME = 'webpack';
var HTML$1 = "\n<aside class=\"".concat(OVERLAY, "\">\n  <i class=\"").concat(OVERLAY, "-close\"></i>\n  <div class=\"").concat(OVERLAY, "-title\">\n    <em class=\"").concat(OVERLAY, "-name\">").concat(DEFAULT_NAME, "</em>\n    <em class=\"").concat(OVERLAY, "-errors-title\"></em>\n    <em class=\"").concat(OVERLAY, "-warnings-title\"></em>\n  </div>\n  <article class=\"").concat(OVERLAY, "-problems\">\n    <pre class=\"").concat(OVERLAY, "-errors\"></pre>\n    <pre class=\"").concat(OVERLAY, "-warnings\"></pre>\n  </article>\n</aside>\n");
var ANSI = new Ansi({
  black: '#181818',
  red: '#ff3348',
  green: '#3fff4f',
  yellow: '#ffd30e',
  blue: '#169be0',
  magenta: '#f840b7',
  cyan: '#0ad8e9',
  lightgrey: '#ebe7e3',
  darkgrey: '#6d7891',
  reset: ['#fff', '#282d35']
});

function ansiHTML(text) {
  return ANSI.convert(text);
}

var Overlay = /*#__PURE__*/function () {
  function Overlay() {
    var _this = this;

    _classCallCheck(this, Overlay);

    _defineProperty(this, "hidden", true);

    injectCSS(CSS$1);

    var _appendHTML = appendHTML(HTML$1);

    var _appendHTML2 = _slicedToArray(_appendHTML, 1);

    this.aside = _appendHTML2[0];
    this.name = this.aside.querySelector(".".concat(OVERLAY, "-name"));
    this.close = this.aside.querySelector(".".concat(OVERLAY, "-close"));
    this.errorsList = this.aside.querySelector(".".concat(OVERLAY, "-errors"));
    this.warningsList = this.aside.querySelector(".".concat(OVERLAY, "-warnings"));
    this.errorsTitle = this.aside.querySelector(".".concat(OVERLAY, "-errors-title"));
    this.warningsTitle = this.aside.querySelector(".".concat(OVERLAY, "-warnings-title"));
    this.close.addEventListener('click', function () {
      _this.hide();
    });
  }

  _createClass(Overlay, [{
    key: "setName",
    value: function setName(name) {
      this.name.innerHTML = name || DEFAULT_NAME;
    }
  }, {
    key: "setProblems",
    value: function setProblems(type, problems) {
      var count = problems.length;
      var hidden = "".concat(OVERLAY, "-hidden");
      var problemMaps = {
        errors: ['Error', this.errorsTitle, this.errorsList],
        warnings: ['Warning', this.warningsTitle, this.warningsList]
      };

      var _problemMaps$type = _slicedToArray(problemMaps[type], 3),
          name = _problemMaps$type[0],
          problemTitle = _problemMaps$type[1],
          problemList = _problemMaps$type[2];

      if (count > 0) {
        var html = '';
        problemTitle.innerText = "".concat(count, " ").concat(name, "(s)");

        var _iterator = _createForOfIteratorHelper(problems),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _step.value,
                moduleName = _step$value.moduleName,
                message = _step$value.message;
            var src = ansiHTML(moduleName);
            var details = ansiHTML(message);
            html += "<div><em>".concat(name, "</em> in ").concat(src, "<div>").concat(details, "</div></div>");
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        problemList.innerHTML = html;
        problemList.classList.remove(hidden);
        problemTitle.classList.remove(hidden);
      } else {
        problemList.classList.add(hidden);
        problemTitle.classList.add(hidden);
      }
    }
  }, {
    key: "show",
    value: function show() {
      if (this.hidden) {
        this.hidden = false;
        this.aside.classList.add("".concat(OVERLAY, "-show"));
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      if (!this.hidden) {
        this.hidden = true;
        this.aside.classList.remove("".concat(OVERLAY, "-show"));
      }
    }
  }]);

  return Overlay;
}();

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

var PROGRESS = 'wds-progress';
var PERIMETER = 2 * Math.PI * 44;
var CSS = "\n.".concat(PROGRESS, " {\n  width: 48px;\n  right: 16px;\n  height: 48px;\n  bottom: 16px;\n  display: block;\n  font-size: 16px;\n  position: fixed;\n  cursor: default;\n  user-select: none;\n  font-style: normal;\n  font-weight: normal;\n  z-index: 2147483645;\n  transform-origin: center;\n  transform: scale(0) translateZ(0);\n  transition: transform .25s ease-out;\n}\n.").concat(PROGRESS, "-show {\n  transform: scale(1) translateZ(0);\n}\n.").concat(PROGRESS, "-track {\n  stroke: #badfac;\n  stroke-width: 8;\n  stroke-linecap: round;\n  fill: rgba(0, 0, 0, 0);\n  stroke-dasharray: ").concat(PERIMETER, ";\n  stroke-dashoffset: ").concat(PERIMETER, ";\n  transition: stroke-dashoffset .25s linear;\n  transform: matrix(0, -1, 1, 0, 0, 96) translateZ(0);\n}\n");
var HTML = "\n<svg class=\"".concat(PROGRESS, "\" x=\"0\" y=\"0\" viewBox=\"0 0 96 96\">\n  <circle fill=\"#282d35\" cx=\"50%\" cy=\"50%\" r=\"44\" />\n  <circle class=\"").concat(PROGRESS, "-track\" cx=\"50%\" cy=\"50%\" r=\"44\" />\n  <path fill=\"#fff\" d=\"m48,83.213561l-31.122918,-17.60678l0,-35.21356l31.122918,-17.60678l31.122918,17.60678l0,35.21356l-31.122918,17.60678z\" />\n  <path fill=\"#8ed6fb\" d=\"m22.434956,31.608089l24.537982,-13.880011l0,10.810563l-15.288554,8.410172l-9.249428,-5.340723zm-1.678513,1.520052l0,29.027711l8.979458,-5.182262l0,-18.657318l-8.979458,-5.188131zm52.908373,-1.520052l-24.537982,-13.880011l0,10.810563l15.288554,8.410172l9.249428,-5.340723zm1.678513,1.520052l0,29.027711l-8.979458,-5.182262l0,-18.657318l8.979458,-5.188131zm-1.050538,30.905767l-25.165957,14.238016l0,-10.452558l16.121941,-8.867948l0.123247,-0.070427l8.920768,5.152918zm-52.485811,0l25.165957,14.238016l0,-10.452558l-16.121941,-8.867948l-0.123247,-0.070427l-8.920768,5.152918z\" />\n  <path fill=\"#1c78c0\" d=\"m49.126834,30.997721l15.083141,8.292793l0,16.432994l-15.083141,-8.709487l0,-16.016301zm-2.153896,0l-15.083141,8.292793l0,16.432994l15.083141,-8.709487l0,-16.016301zm16.215844,26.62732l-15.141831,8.328007l-15.141831,-8.328007l15.141831,-8.744701l15.141831,8.744701z\" />\n</svg>\n");

var Progress = /*#__PURE__*/function () {
  function Progress() {
    _classCallCheck(this, Progress);

    _defineProperty(this, "hidden", true);

    injectCSS(CSS);

    var _appendHTML = appendHTML(HTML);

    var _appendHTML2 = _slicedToArray(_appendHTML, 1);

    this.svg = _appendHTML2[0];
    this.track = this.svg.querySelector(".".concat(PROGRESS, "-track"));
  }

  _createClass(Progress, [{
    key: "update",
    value: function update(value) {
      value = Math.max(0, Math.min(100, value));
      this.track.style.strokeDashoffset = (100 - value) / 100 * PERIMETER;
    }
  }, {
    key: "show",
    value: function show() {
      if (this.hidden) {
        this.hidden = false;
        this.svg.classList.add("".concat(PROGRESS, "-show"));
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      var _this = this;

      if (!this.hidden) {
        this.hidden = true;
        onEffectsEnd(this.track, function () {
          if (_this.hidden) {
            _this.svg.classList.remove("".concat(PROGRESS, "-show"));
          }
        });
      }
    }
  }]);

  return Progress;
}();

/**
 * @module update
 */
var timer;
var status = 'idle';
var aborted = false;
var RELOAD_INTERVAL = 250;

function reload() {
  clearTimeout(timer);
  timer = setTimeout(function () {
    if (!aborted) {
      window.location.reload();
    }
  }, RELOAD_INTERVAL);
}

function isUpToDate(hash) {
  return hash === __webpack_hash__;
}

function replace(hash, onUpdated) {
  module.hot.check().then(function () {
    return module.hot.apply().then(function (updated) {
      status = module.hot.status();

      if (!updated || updated.length === 0) {
        reload();
      } else if (isUpToDate(hash)) {
        onUpdated();
      } else {
        replace(hash, onUpdated);
      }
    });
  }).catch(function () {
    status = 'fail';
    reload();
  });
}

function abort() {
  aborted = true;
  clearTimeout(timer);
}
function update(hash, hmr, forceReload) {
  var onUpdated = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};
  aborted = false;
  clearTimeout(timer);

  if (forceReload) {
    reload();
  } else if (isUpToDate(hash)) {
    onUpdated();
  } else if (hmr && module.hot) {
    if (status === 'idle') {
      replace(hash, onUpdated);
    } else if (status === 'fail') {
      reload();
    }
  } else {
    reload();
  }
}

var retryTimes = 0;
var forceReload = false;
var overlay = new Overlay();
var progress = new Progress();
var MAX_RETRY_TIMES = 10;
var RETRY_INTERVAL = 3000;

function isTLS(protocol) {
  return protocol === 'https:';
}

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch (_unused) {
    return {};
  }
}

function getCurrentScript() {
  var _document = document,
      currentScript = _document.currentScript;
  if (currentScript) return currentScript;
  var scripts = document.scripts;

  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i];

    if (script.readyState === 'interactive') {
      return script;
    }
  }
}

function resolveHost(params) {
  var host = params.get('host');
  var tls = params.has('tls') || isTLS(window.location.protocol);

  if (!host) {
    var _getCurrentScript = getCurrentScript(),
        src = _getCurrentScript.src;

    if (src) {
      var url = new URL(src);
      host = url.host;
      tls = isTLS(url.protocol) || tls;
    } else {
      host = window.location.host;
    }
  }

  return "".concat(tls ? 'wss' : 'ws', "://").concat(host);
}

function resolvePath() {
  try {
    return __WDS_HOT_SOCKET_PATH__;
  } catch (_unused2) {
    throw new Error('imported the hot client but the hot server is not enabled');
  }
}

function resolveSocketURL() {
  var params = new URLSearchParams(__resourceQuery);
  return "".concat(resolveHost(params)).concat(resolvePath());
}

function progressActions(_ref, options) {
  var value = _ref.value;

  if (options.progress) {
    if (value === 0) {
      progress.show();
    }

    progress.update(value);

    if (value === 100) {
      progress.hide();
    }
  }
}

function printProblems(type, problems) {
  var nameMaps = {
    errors: ['Error', 'error'],
    warnings: ['Warning', 'warn']
  };

  var _nameMaps$type = _slicedToArray(nameMaps[type], 2),
      name = _nameMaps$type[0],
      method = _nameMaps$type[1];

  var _iterator = _createForOfIteratorHelper(problems),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _step.value,
          moduleName = _step$value.moduleName,
          message = _step$value.message;
      console[method]("".concat(name, " in ").concat(moduleName, "\r\n").concat(strip(message)));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function problemsActions(_ref2, options) {
  var errors = _ref2.errors,
      warnings = _ref2.warnings;
  var configure = options.overlay;

  if (configure.errors) {
    overlay.setProblems('errors', errors);
  } else {
    printProblems('errors', errors);
  }

  if (configure.warnings) {
    overlay.setProblems('warnings', warnings);
  } else {
    printProblems('warnings', warnings);
  }

  if (errors.length > 0 || warnings.length > 0) {
    overlay.show();
  }
}

function createWebSocket(url) {
  var options = {};
  var ws = new WebSocket(url);

  ws.onopen = function () {
    retryTimes = 0;
  };

  ws.onmessage = function (message) {
    var _parseMessage = parseMessage(message),
        action = _parseMessage.action,
        payload = _parseMessage.payload;

    switch (action) {
      case 'init':
        options = payload.options;
        overlay.setName(payload.name);
        break;

      case 'invalid':
        abort();

        if (options.progress) {
          progress.update(0);
        }

        break;

      case 'progress':
        progressActions(payload, options);
        break;

      case 'problems':
        if (payload.errors.length > 0) {
          forceReload = true;
          problemsActions(payload, options);
        } else {
          update(payload.hash, options.hmr, forceReload, function () {
            problemsActions(payload, options);
          });
        }

        break;

      case 'ok':
        overlay.hide();
        update(payload.hash, options.hmr, forceReload);
        break;
    }

    window.postMessage({
      action: "webpack-hot-".concat(action),
      payload: payload
    }, '*');
  };

  ws.onclose = function () {
    progress.hide();

    if (retryTimes++ < MAX_RETRY_TIMES) {
      setTimeout(function () {
        createWebSocket(url);
      }, RETRY_INTERVAL);
    }
  };
}

createWebSocket(resolveSocketURL());
