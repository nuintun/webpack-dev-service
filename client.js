import 'core-js/modules/es.regexp.exec.js';
import 'core-js/modules/es.string.replace.js';
import 'core-js/modules/es.array.iterator.js';
import 'core-js/modules/es.object.to-string.js';
import 'core-js/modules/es.string.iterator.js';
import 'core-js/modules/web.dom-collections.iterator.js';
import 'core-js/modules/web.url.js';
import 'core-js/modules/es.array.concat.js';
import 'core-js/modules/es.function.name.js';
import 'core-js/modules/es.object.keys.js';
import 'core-js/modules/es.string.repeat.js';
import ansiRegex from 'ansi-regex';
import 'core-js/modules/es.number.constructor.js';
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

function update(hash, onUpdated) {
  module.hot.check(true).then(function (updated) {
    if (!updated) {
      window.location.reload();
    } else if (!isUpToDate(hash)) {
      update(hash, onUpdated);
    } else if (onUpdated) {
      onUpdated();
    }
  }).catch(function () {
    var status = module.hot.status();

    if (status === 'abort' || status === 'fail') {
      window.location.reload();
    }
  });
}

function reload(hash, _ref) {
  var hmr = _ref.hmr,
      onUpdated = _ref.onUpdated;

  if (!isUpToDate(hash)) {
    if (hmr && module.hot) {
      if (module.hot.status() === 'idle') {
        update(hash, onUpdated);
      }
    } else {
      window.location.reload();
    }
  } else if (onUpdated) {
    onUpdated();
  }
}

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
function injectCSS(css) {
  var style = document.createElement('style');

  if (css.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
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
var CSS$1 = "\n  .".concat(OVERLAY, " {\n    top:0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    opacity: 0;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    position: fixed;\n    font-size: 16px;\n    overflow: hidden;\n    font-style: normal;\n    font-weight: normal;\n    z-index: 2147483644;\n    flex-direction: column;\n    font-family: monospace;\n    box-sizing: border-box;\n    background: rgba(0, 0, 0, .85);\n    transform: scale(0) translateZ(0);\n  }\n  @keyframes ").concat(OVERLAY, "-show {\n    0% {\n      opacity: 0;\n      transform: scale(0) translateZ(0);\n    }\n    100% {\n      opacity: 1;\n      transform: scale(1) translateZ(0);\n    }\n  }\n  @keyframes ").concat(OVERLAY, "-hide {\n    0% {\n      opacity: 1;\n      transform: scale(1) translateZ(0);\n    }\n    100% {\n      opacity: 0;\n      transform: scale(0) translateZ(0);\n    }\n  }\n  .").concat(OVERLAY, "-show {\n    animation: ").concat(OVERLAY, "-show .3s ease-out forwards;\n  }\n  .").concat(OVERLAY, "-hide {\n    animation: ").concat(OVERLAY, "-hide .3s ease-out forwards;\n  }\n  .").concat(OVERLAY, "-nav {\n    right: 0;\n    padding: 16px;\n    line-height: 16px;\n    position: absolute;\n    transition: transform .3s ease-in-out;\n  }\n  .").concat(OVERLAY, "-nav:hover {\n    transform: rotate(180deg) translateZ(0);\n  }\n  .").concat(OVERLAY, "-close {\n    width: 16px;\n    height: 16px;\n    color: #fff;\n    cursor: pointer;\n    font-style: normal;\n    text-align: center;\n    border-radius: 16px;\n    font-weight: normal;\n    background: #ff5f58;\n    display: inline-block;\n  }\n  .").concat(OVERLAY, "-title {\n    margin: 0;\n    color: #fff;\n    width: 100%;\n    padding: 16px 0;\n    line-height: 16px;\n    text-align: center;\n    background: #282d35;\n  }\n  .").concat(OVERLAY, "-name {\n    font-weight: bold;\n    font-style: normal;\n    text-transform: uppercase;\n  }\n  .").concat(OVERLAY, "-errors-title,\n  .").concat(OVERLAY, "-warnings-title {\n    color: #ff5f58;\n    padding-left: 8px;\n  }\n  .").concat(OVERLAY, "-warnings-title {\n    color: #ffbd2e;\n  }\n  .").concat(OVERLAY, "-problems {\n    padding: 0 16px;\n    overflow-y: auto;\n    scrollbar-width: none;\n    -ms-overflow-style: none;\n    -webkit-overflow-scrolling: touch;\n  }\n  .").concat(OVERLAY, "-problems::-webkit-scrollbar {\n    display: none;\n  }\n  .").concat(OVERLAY, "-errors,\n  .").concat(OVERLAY, "-warnings {\n    color: #ddd;\n    margin: 16px 0;\n    display: block;\n    border-radius: 4px;\n    background: #282d35;\n    white-space: pre-wrap;\n    font-family: monospace;\n  }\n  .").concat(OVERLAY, "-errors > div,\n  .").concat(OVERLAY, "-warnings > div {\n    font-size: 15px;\n    padding: 16px 16px 0;\n  }\n  .").concat(OVERLAY, "-errors > div > em,\n  .").concat(OVERLAY, "-warnings > div > em {\n    color: #641e16;\n    padding: 2px 8px;\n    font-style: normal;\n    border-radius: 4px;\n    font-weight: normal;\n    background: #ff5f58;\n    display: inline-block;\n    text-transform: uppercase;\n  }\n  .").concat(OVERLAY, "-warnings > div > em {\n    color: #3e2723;\n    background: #ffbd2e;\n  }\n  .").concat(OVERLAY, "-errors > div > div,\n  .").concat(OVERLAY, "-warnings > div > div {\n    font-size: 13px;\n    padding: 8px 0 16px 16px;\n  }\n");
var DEFAULT_NAME = 'webpack';
var HTML$1 = "\n  <aside class=\"".concat(OVERLAY, "\">\n    <nav class=\"").concat(OVERLAY, "-nav\">\n      <i class=\"").concat(OVERLAY, "-close\">\xD7</i>\n    </nav>\n    <div class=\"").concat(OVERLAY, "-title\">\n      <em class=\"").concat(OVERLAY, "-name\">").concat(DEFAULT_NAME, "</em>\n      <em class=\"").concat(OVERLAY, "-errors-title\"></em>\n      <em class=\"").concat(OVERLAY, "-warnings-title\"></em>\n    </div>\n    <article class=\"").concat(OVERLAY, "-problems\">\n      <pre class=\"").concat(OVERLAY, "-errors\"></pre>\n      <pre class=\"").concat(OVERLAY, "-warnings\"></pre>\n    </article>\n  </aside>\n");
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
    _classCallCheck(this, Overlay);

    this.init();
  }

  _createClass(Overlay, [{
    key: "init",
    value: function init() {
      var _this = this;

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
  }, {
    key: "setName",
    value: function setName(name) {
      this.name.innerHTML = name || DEFAULT_NAME;
    }
  }, {
    key: "addErrors",
    value: function addErrors() {
      var errors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var count = errors.length;
      var hasErrors = count > 0;
      var errorsTitle = this.errorsTitle,
          errorsList = this.errorsList;
      errorsList.innerHTML = '';
      errorsTitle.innerText = '';

      if (hasErrors) {
        errorsTitle.innerText = "".concat(count, " Error(s)");

        var _iterator = _createForOfIteratorHelper(errors),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _step.value,
                moduleName = _step$value.moduleName,
                message = _step$value.message;
            var src = ansiHTML(moduleName);
            var details = ansiHTML(message);
            appendHTML("<div><em>Error</em> in ".concat(src, "<div>").concat(details, "</div></div>"), errorsList);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      return hasErrors;
    }
  }, {
    key: "addWarnings",
    value: function addWarnings() {
      var warnings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var count = warnings.length;
      var hasWarnings = count > 0;
      var warningsTitle = this.warningsTitle,
          warningsList = this.warningsList;
      warningsList.innerHTML = '';
      warningsTitle.innerText = '';

      if (hasWarnings) {
        warningsTitle.innerText = "".concat(count, " Warning(s)");

        var _iterator2 = _createForOfIteratorHelper(warnings),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _step2$value = _step2.value,
                moduleName = _step2$value.moduleName,
                message = _step2$value.message;
            var src = ansiHTML(moduleName);
            var details = ansiHTML(message);
            appendHTML("<div><em>Warning</em> in ".concat(src, "<div>").concat(details, "</div></div>"), warningsList);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }

      return hasWarnings;
    }
  }, {
    key: "isVisible",
    value: function isVisible() {
      return this.aside.classList.contains("".concat(OVERLAY, "-show"));
    }
  }, {
    key: "show",
    value: function show(_ref) {
      var errors = _ref.errors,
          warnings = _ref.warnings;
      var classList = this.aside.classList;
      var hasErrors = this.addErrors(errors);
      var hasWarnings = this.addWarnings(warnings);

      if ((hasErrors || hasWarnings) && !this.isVisible()) {
        classList.remove("".concat(OVERLAY, "-hide"));
        classList.add("".concat(OVERLAY, "-show"));
      }
    }
  }, {
    key: "hide",
    value: function hide(onHidden) {
      var aside = this.aside;
      var classList = aside.classList;

      if (this.isVisible()) {
        classList.remove("".concat(OVERLAY, "-show"));
        classList.add("".concat(OVERLAY, "-hide"));

        if (onHidden) {
          onEffectsEnd(aside, onHidden);
        }
      } else if (onHidden) {
        onHidden();
      }
    }
  }]);

  return Overlay;
}();

var PROGRESS = 'wds-progress';
var PERIMETER = 219.99078369140625;
var CSS = "\n  .".concat(PROGRESS, " {\n    opacity: 0;\n    width: 48px;\n    right: 16px;\n    height: 48px;\n    bottom: 16px;\n    font-size: 16px;\n    position: fixed;\n    cursor: default;\n    user-select: none;\n    font-style: normal;\n    font-weight: normal;\n    z-index: 2147483645;\n    transform: scale(0) translateZ(0);\n  }\n  @keyframes ").concat(PROGRESS, "-show {\n    0% {\n      opacity: 0;\n      transform: scale(0) translateZ(0);\n    }\n    100% {\n      opacity: 1;\n      transform: scale(1) translateZ(0);\n    }\n  }\n  @keyframes ").concat(PROGRESS, "-hide {\n    0% {\n      opacity: 1;\n      transform: scale(1) translateZ(0);\n    }\n    100% {\n      opacity: 0;\n      transform: scale(0) translateZ(0);\n    }\n  }\n  .").concat(PROGRESS, "-show {\n    animation: ").concat(PROGRESS, "-show .3s ease-out forwards;\n  }\n  .").concat(PROGRESS, "-hide {\n    animation: ").concat(PROGRESS, "-hide .3s ease-out forwards;\n  }\n  .").concat(PROGRESS, "-bg {\n    fill: #282d35;\n  }\n  .").concat(PROGRESS, "-track {\n    stroke-width: 10;\n    fill: rgba(0, 0, 0, 0);\n    stroke: rgb(186, 223, 172);\n    stroke-dasharray: ").concat(PERIMETER, ";\n    stroke-dashoffset: -").concat(PERIMETER, ";\n    transform: rotate(90deg) translate(0, -80px) translateZ(0);\n  }\n  .").concat(PROGRESS, "-track-animate {\n    transition: stroke-dashoffset .3s ease-out;\n  }\n  .").concat(PROGRESS, "-value {\n    fill: #ffffff;\n    font-size: 16px;\n    text-anchor: middle;\n    font-family: monospace;\n    dominant-baseline: middle;\n  }\n");
var HTML = "\n  <svg class=\"".concat(PROGRESS, "\" x=\"0\" y=\"0\" viewBox=\"0 0 80 80\">\n    <circle class=\"").concat(PROGRESS, "-bg\" cx=\"50%\" cy=\"50%\" r=\"35\" />\n    <path class=\"").concat(PROGRESS, "-track\" d=\"M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0\" />\n    <text class=\"").concat(PROGRESS, "-value\" x=\"50%\" y=\"52%\">0%</text>\n  </svg>\n");

var Progress = /*#__PURE__*/function () {
  function Progress() {
    _classCallCheck(this, Progress);

    this.init();
  }

  _createClass(Progress, [{
    key: "init",
    value: function init() {
      injectCSS(CSS);

      var _appendHTML = appendHTML(HTML);

      var _appendHTML2 = _slicedToArray(_appendHTML, 1);

      this.svg = _appendHTML2[0];
      this.track = this.svg.querySelector(".".concat(PROGRESS, "-track"));
      this.value = this.svg.querySelector(".".concat(PROGRESS, "-value"));
    }
  }, {
    key: "update",
    value: function update(value) {
      this.value.innerHTML = "".concat(value, "%");
      var offset = (100 - value) / 100 * -PERIMETER;
      this.track.setAttribute('style', "stroke-dashoffset: ".concat(offset));
    }
  }, {
    key: "animateTrack",
    value: function animateTrack(useAnimate) {
      var classList = this.track.classList;
      var animate = "".concat(PROGRESS, "-track-animate");

      if (useAnimate) {
        classList.add(animate);
      } else {
        classList.remove(animate);
      }
    }
  }, {
    key: "isVisible",
    value: function isVisible() {
      return this.svg.classList.contains("".concat(PROGRESS, "-show"));
    }
  }, {
    key: "show",
    value: function show() {
      var classList = this.svg.classList;

      if (!this.isVisible()) {
        this.update(0);
        this.animateTrack(true);
        classList.remove("".concat(PROGRESS, "-hide"));
        classList.add("".concat(PROGRESS, "-show"));
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      var _this = this;

      onEffectsEnd(this.track, function () {
        var classList = _this.svg.classList;

        if (_this.isVisible()) {
          classList.remove("".concat(PROGRESS, "-show"));
          classList.add("".concat(PROGRESS, "-hide"));

          _this.animateTrack(false);
        }
      });
    }
  }]);

  return Progress;
}();

var RECONNECT_INTERVAL = 3000;

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch (_unused) {
    return {};
  }
}

function parseHost(host) {
  return host ? host.replace(/\/+$/, '') : location.host;
}

function parseSocketURL() {
  var query = __resourceQuery || '';
  var params = new URLSearchParams(query);
  var host = parseHost(params.get('host'));
  var tls = params.has('tls') || location.protocol === 'https:';
  return "".concat(tls ? 'wss' : 'ws', "://").concat(host).concat(__WDS_HOT_SOCKET_PATH__);
}

function createWebSocket(url, protocols) {
  var options = {};
  var overlay = new Overlay();
  var progress = new Progress();
  var ws = new WebSocket(url, protocols);

  ws.onmessage = function (message) {
    var _parseMessage = parseMessage(message),
        action = _parseMessage.action,
        payload = _parseMessage.payload;

    switch (action) {
      case 'init':
        options = payload.options;
        overlay.setName(payload.name);
        break;

      case 'progress':
        if (options.progress) {
          var percent = payload.value;
          percent === 0 && progress.show();
          progress.update(percent);
          percent === 100 && progress.hide();
        }

        break;

      case 'problems':
        reload(payload.hash, {
          hmr: options.hmr,
          onUpdated: function onUpdated() {
            var problems = {};

            if (options.errors) {
              problems.errors = payload.errors;
            }

            if (options.warnings) {
              problems.warnings = payload.warnings;
            }

            overlay.show(problems);
          }
        });
        break;

      case 'ok':
        overlay.hide(function () {
          reload(payload.hash, {
            hmr: options.hmr
          });
        });
        break;
    }

    window.postMessage({
      action: "webpack-hot-".concat(action),
      payload: payload
    }, '*');
  };

  ws.onclose = function () {
    setTimeout(function () {
      createWebSocket(url, protocols);
    }, RECONNECT_INTERVAL);
  };
}

createWebSocket(parseSocketURL());
