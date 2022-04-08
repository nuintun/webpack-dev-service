/**
 * @package webpack-dev-server-middleware
 * @license MIT
 * @version 0.9.0
 * @author nuintun <nuintun@qq.com>
 * @description A development and hot reload middleware for Koa2.
 * @see https://github.com/nuintun/webpack-dev-server-middleware#readme
 */

import 'core-js/modules/es.function.name.js';
import 'core-js/modules/es.array.iterator.js';
import 'core-js/modules/es.object.to-string.js';
import 'core-js/modules/es.string.iterator.js';
import 'core-js/modules/web.dom-collections.iterator.js';
import 'core-js/modules/web.url.js';
import 'core-js/modules/web.url-search-params.js';
import 'core-js/modules/es.array.concat.js';
import 'core-js/modules/es.regexp.exec.js';
import 'core-js/modules/es.string.replace.js';
import 'core-js/modules/es.object.keys.js';
import 'core-js/modules/es.string.repeat.js';
import ansiRegex from 'ansi-regex';
import 'core-js/modules/es.string.trim.js';
import 'core-js/modules/es.regexp.to-string.js';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly &&
      (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })),
      keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2
      ? ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))
      : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
  }

  return target;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, 'prototype', {
    writable: false
  });
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
  var _i = arr == null ? null : (typeof Symbol !== 'undefined' && arr[Symbol.iterator]) || arr['@@iterator'];

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
      if (!_n && _i['return'] != null) _i['return']();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError(
    'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
  );
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = (typeof Symbol !== 'undefined' && o[Symbol.iterator]) || o['@@iterator'];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === 'number')) {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length)
            return {
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

    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
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
    return '&#6'.concat(match === '<' ? 0 : 2, ';');
  });
}

function resolveTags(colors) {
  var colours = _objectSpread2(_objectSpread2({}, DEFAULT_COLORS), colors);

  var open = _objectSpread2({}, OPEN_TAGS);

  var close = _objectSpread2({}, CLOSE_TAGS);

  var _colours$reset = _slicedToArray(colours.reset, 2),
    foregroud = _colours$reset[0],
    background = _colours$reset[1]; // Reset all

  open[0] = 'font-weight: normal; opacity: 1; color: '.concat(foregroud, ' ; background: ').concat(background); // Inverse

  open[7] = 'color: '.concat(background, '; background: ').concat(foregroud); // Dark grey

  open[90] = 'color: '.concat(colours.darkgrey);

  for (var _i2 = 0, _Object$keys = Object.keys(STYLES); _i2 < _Object$keys.length; _i2++) {
    var _code = _Object$keys[_i2];
    var style = STYLES[_code];
    var color = colors[style] || foregroud;
    open[_code] = 'color: '.concat(color, ';');
    open[~~_code + 10] = 'background: '.concat(color, ';');
  }

  return {
    open: open,
    close: close
  };
}

var Ansi = /*#__PURE__*/ (function () {
  function Ansi(colors) {
    _classCallCheck(this, Ansi);

    var _resolveTags = resolveTags(colors),
      open = _resolveTags.open,
      close = _resolveTags.close;

    this.open = open;
    this.close = close;
  }

  _createClass(Ansi, [
    {
      key: 'convert',
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
            return openTag[0] === '<' ? openTag : '<span style="'.concat(openTag, '">');
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

        if (length > 0) {
          html += '</span>'.repeat(length);
        }

        return html;
      }
    }
  ]);

  return Ansi;
})();

/**
 * @module utils
 */
var defaultStyleElement = document.createElement('style');
function injectCSS(css) {
  var styleElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultStyleElement;
  styleElement.appendChild(document.createTextNode(css.trim()));
  document.head.appendChild(styleElement);
  return styleElement;
}
function appendHTML(html, parent) {
  var nodes = [];
  var parser = new DOMParser();
  var stage = parent || document.body;
  var fragment = document.createDocumentFragment();

  var _parser$parseFromStri = parser.parseFromString(html.trim(), 'text/html'),
    body = _parser$parseFromStri.body;

  while (body.firstChild) {
    nodes.push(fragment.appendChild(body.firstChild));
  }

  stage.appendChild(fragment);
  return nodes;
}

var OVERLAY = 'wds-overlay';
var CSS$1 = '\n .'
  .concat(
    OVERLAY,
    ' {\n   top:0;\n   left: 0;\n   right: 0;\n   bottom: 0;\n   width: 100vw;\n   height: 100vh;\n   display: flex;\n   position: fixed;\n   font-size: 16px;\n   overflow: hidden;\n   font-style: normal;\n   font-weight: normal;\n   z-index: 2147483646;\n   flex-direction: column;\n   box-sizing: border-box;\n   transform-origin: center;\n   background: rgba(0, 0, 0, .85);\n   transform: scale(0) translateZ(0);\n   transition: transform .25s ease-out;\n   font-family: Menlo, "Lucida Console", monospace;\n }\n .'
  )
  .concat(OVERLAY, '-show {\n   transform: scale(1) translateZ(0);\n }\n .')
  .concat(
    OVERLAY,
    '-close {\n   top: 16px;\n   right: 16px;\n   width: 16px;\n   height: 16px;\n   cursor: pointer;\n   position: absolute;\n   border-radius: 16px;\n   background: #ff5f58;\n   display: inline-block;\n   transform-origin: center;\n   box-shadow: #ff5f58 0 0 6px;\n   transform: rotate(0) translateZ(0);\n   transition: transform .25s ease-in-out;\n }\n .'
  )
  .concat(OVERLAY, '-close:before,\n .')
  .concat(
    OVERLAY,
    '-close:after {\n   top: 7px;\n   left: 3px;\n   content: "";\n   width: 10px;\n   height: 2px;\n   position: absolute;\n   background-color: white;\n   transform-origin: center;\n }\n .'
  )
  .concat(OVERLAY, '-close:before {\n   transform: rotate(45deg);\n }\n .')
  .concat(OVERLAY, '-close:after {\n   transform: rotate(-45deg);\n }\n .')
  .concat(OVERLAY, '-close:hover {\n   transform: rotate(180deg) translateZ(0);\n }\n .')
  .concat(
    OVERLAY,
    '-title {\n   margin: 0;\n   color: #fff;\n   line-height: 16px;\n   text-align: center;\n   background: #282d35;\n   overflow-wrap: break-word;\n   border-radius: 0 0 4px 4px;\n   padding: 16px 48px 16px 16px;\n }\n .'
  )
  .concat(OVERLAY, '-name {\n   font-weight: bold;\n   font-style: normal;\n   text-transform: uppercase;\n }\n .')
  .concat(OVERLAY, '-errors-title,\n .')
  .concat(OVERLAY, '-warnings-title {\n   color: #ff5f58;\n   padding-left: 8px;\n   font-style: normal;\n }\n .')
  .concat(OVERLAY, '-warnings-title {\n   color: #ffbd2e;\n }\n .')
  .concat(
    OVERLAY,
    '-problems {\n   padding: 0 16px;\n   overflow-y: auto;\n   scrollbar-width: none;\n   -ms-overflow-style: none;\n   -webkit-overflow-scrolling: touch;\n }\n .'
  )
  .concat(OVERLAY, '-problems::-webkit-scrollbar {\n   display: none;\n }\n .')
  .concat(OVERLAY, '-errors,\n .')
  .concat(
    OVERLAY,
    '-warnings {\n   color: #ddd;\n   padding: 16px;\n   margin: 16px 0;\n   display: block;\n   line-height: 1.2;\n   border-radius: 4px;\n   background: #282d35;\n   white-space: pre-wrap;\n   font-family: Menlo, "Lucida Console", monospace;\n }\n .'
  )
  .concat(OVERLAY, '-errors > div,\n .')
  .concat(OVERLAY, '-warnings > div {\n   overflow-wrap: break-word;\n }\n .')
  .concat(OVERLAY, '-errors > div + div,\n .')
  .concat(OVERLAY, '-warnings > div + div {\n   margin: 16px 0 0;\n }\n .')
  .concat(OVERLAY, '-errors > div > em,\n .')
  .concat(
    OVERLAY,
    '-warnings > div > em {\n   line-height: 1;\n   color: #641e16;\n   padding: 4px 8px;\n   font-style: normal;\n   border-radius: 4px;\n   font-weight: normal;\n   background: #ff5f58;\n   display: inline-block;\n   text-transform: uppercase;\n }\n .'
  )
  .concat(OVERLAY, '-warnings > div > em {\n   color: #3e2723;\n   background: #ffbd2e;\n }\n .')
  .concat(OVERLAY, '-errors > div > div,\n .')
  .concat(
    OVERLAY,
    '-warnings > div > div {\n   font-size: 14px;\n   padding: 8px 0 0 16px;\n   overflow-wrap: break-word;\n }\n .'
  )
  .concat(OVERLAY, '-hidden {\n   display: none;\n }\n ');
var DEFAULT_NAME = 'webpack';
var HTML$1 = '\n <aside class="'
  .concat(OVERLAY, '">\n   <i class="')
  .concat(OVERLAY, '-close"></i>\n   <div class="')
  .concat(OVERLAY, '-title">\n     <em class="')
  .concat(OVERLAY, '-name"></em>\n     <em class="')
  .concat(OVERLAY, '-errors-title"></em>\n     <em class="')
  .concat(OVERLAY, '-warnings-title"></em>\n   </div>\n   <article class="')
  .concat(OVERLAY, '-problems">\n     <pre class="')
  .concat(OVERLAY, '-errors ')
  .concat(OVERLAY, '-hidden"></pre>\n     <pre class="')
  .concat(OVERLAY, '-warnings ')
  .concat(OVERLAY, '-hidden"></pre>\n   </article>\n </aside>\n ');
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

var Overlay = /*#__PURE__*/ (function () {
  function Overlay(name) {
    var _this = this;

    _classCallCheck(this, Overlay);

    _defineProperty(this, 'hidden', true);

    injectCSS(CSS$1);

    var _ref = appendHTML(HTML$1);

    var _ref2 = _slicedToArray(_ref, 1);

    this.aside = _ref2[0];
    this.name = this.aside.querySelector('.'.concat(OVERLAY, '-name'));
    this.close = this.aside.querySelector('.'.concat(OVERLAY, '-close'));
    this.errorsList = this.aside.querySelector('.'.concat(OVERLAY, '-errors'));
    this.warningsList = this.aside.querySelector('.'.concat(OVERLAY, '-warnings'));
    this.errorsTitle = this.aside.querySelector('.'.concat(OVERLAY, '-errors-title'));
    this.warningsTitle = this.aside.querySelector('.'.concat(OVERLAY, '-warnings-title'));
    this.name.innerHTML = '\u2B55 '.concat(name || DEFAULT_NAME);
    this.close.addEventListener('click', function () {
      _this.hide();
    });
  }

  _createClass(Overlay, [
    {
      key: 'setProblems',
      value: function setProblems(type, problems) {
        var count = problems.length;
        var hidden = ''.concat(OVERLAY, '-hidden');
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
          problemTitle.innerText = ''.concat(count, ' ').concat(name, '(s)');

          var _iterator = _createForOfIteratorHelper(problems),
            _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done; ) {
              var _step$value = _step.value,
                _step$value$moduleNam = _step$value.moduleName,
                moduleName = _step$value$moduleNam === void 0 ? 'unknown' : _step$value$moduleNam,
                message = _step$value.message;
              var src = ansiHTML(moduleName);
              var details = ansiHTML(message);
              html += '<div><em>'.concat(name, '</em> in ').concat(src, '<div>').concat(details, '</div></div>');
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
    },
    {
      key: 'show',
      value: function show() {
        if (this.hidden) {
          this.hidden = false;
          this.aside.classList.add(''.concat(OVERLAY, '-show'));
        }
      }
    },
    {
      key: 'hide',
      value: function hide() {
        if (!this.hidden) {
          this.hidden = true;
          this.aside.classList.remove(''.concat(OVERLAY, '-show'));
        }
      }
    }
  ]);

  return Overlay;
})();

var PROGRESS = 'wds-progress';
var PERIMETER = 2 * Math.PI * 44;
var CSS = '\n .'
  .concat(
    PROGRESS,
    ' {\n   width: 48px;\n   right: 16px;\n   height: 48px;\n   bottom: 16px;\n   display: block;\n   font-size: 16px;\n   position: fixed;\n   cursor: default;\n   user-select: none;\n   font-style: normal;\n   font-weight: normal;\n   z-index: 2147483647;\n   transform-origin: center;\n   transform: scale(0) translateZ(0);\n   transition: transform .25s ease-out;\n }\n .'
  )
  .concat(PROGRESS, '-show {\n   transform: scale(1) translateZ(0);\n }\n .')
  .concat(
    PROGRESS,
    '-track {\n   stroke: #badfac;\n   stroke-width: 8;\n   stroke-linecap: round;\n   fill: rgba(0, 0, 0, 0);\n   stroke-dasharray: '
  )
  .concat(PERIMETER, ';\n   stroke-dashoffset: ')
  .concat(
    PERIMETER,
    ';\n   transition: stroke-dashoffset .25s linear;\n   transform: matrix(0, -1, 1, 0, 0, 96) translateZ(0);\n }\n '
  );
var HTML = '\n <svg class="'
  .concat(
    PROGRESS,
    '" x="0" y="0" viewBox="0 0 96 96">\n   <circle fill="#282d35" cx="50%" cy="50%" r="44" />\n   <circle class="'
  )
  .concat(
    PROGRESS,
    '-track" cx="50%" cy="50%" r="44" />\n   <path fill="#fff" d="m48,83.213561l-31.122918,-17.60678l0,-35.21356l31.122918,-17.60678l31.122918,17.60678l0,35.21356l-31.122918,17.60678z" />\n   <path fill="#8ed6fb" d="m22.434956,31.608089l24.537982,-13.880011l0,10.810563l-15.288554,8.410172l-9.249428,-5.340723zm-1.678513,1.520052l0,29.027711l8.979458,-5.182262l0,-18.657318l-8.979458,-5.188131zm52.908373,-1.520052l-24.537982,-13.880011l0,10.810563l15.288554,8.410172l9.249428,-5.340723zm1.678513,1.520052l0,29.027711l-8.979458,-5.182262l0,-18.657318l8.979458,-5.188131zm-1.050538,30.905767l-25.165957,14.238016l0,-10.452558l16.121941,-8.867948l0.123247,-0.070427l8.920768,5.152918zm-52.485811,0l25.165957,14.238016l0,-10.452558l-16.121941,-8.867948l-0.123247,-0.070427l-8.920768,5.152918z" />\n   <path fill="#1c78c0" d="m49.126834,30.997721l15.083141,8.292793l0,16.432994l-15.083141,-8.709487l0,-16.016301zm-2.153896,0l-15.083141,8.292793l0,16.432994l15.083141,-8.709487l0,-16.016301zm16.215844,26.62732l-15.141831,8.328007l-15.141831,-8.328007l15.141831,-8.744701l15.141831,8.744701z" />\n </svg>\n '
  );

var Progress = /*#__PURE__*/ (function () {
  function Progress() {
    _classCallCheck(this, Progress);

    _defineProperty(this, 'hidden', true);

    injectCSS(CSS);

    var _ref = appendHTML(HTML);

    var _ref2 = _slicedToArray(_ref, 1);

    this.svg = _ref2[0];
    this.track = this.svg.querySelector('.'.concat(PROGRESS, '-track'));
  }

  _createClass(Progress, [
    {
      key: 'update',
      value: function update(value) {
        value = Math.max(0, Math.min(100, value));
        this.track.style.strokeDashoffset = (((100 - value) / 100) * PERIMETER).toString();
      }
    },
    {
      key: 'show',
      value: function show() {
        if (this.hidden) {
          this.hidden = false;
          clearTimeout(this.timer);
          this.svg.classList.add(''.concat(PROGRESS, '-show'));
        }
      }
    },
    {
      key: 'hide',
      value: function hide() {
        var _this = this;

        if (!this.hidden) {
          this.hidden = true;
          this.timer = self.setTimeout(function () {
            _this.svg.classList.remove(''.concat(PROGRESS, '-show'));
          }, 300);
        }
      }
    }
  ]);

  return Progress;
})();

/**
 * @module hot
 */
// Last update hash.
var hash = __webpack_hash__; // Update hash.

function updateHash(value) {
  hash = value;
} // Webpack disallows updates in other states.

function isUpdateIdle() {
  return import.meta.webpackHot.status() === 'idle';
} // Is there a newer version of this code available?

function isUpdateAvailable() {
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by webpack.
  return hash !== __webpack_hash__;
} // Attempt to update code on the fly, fall back to a hard reload.

function attemptUpdates(hmr, fallback) {
  // Update available.
  if (isUpdateAvailable()) {
    // HMR enabled.
    if (hmr && import.meta.webpackHot) {
      if (isUpdateIdle()) {
        import.meta.webpackHot
          .check(true)
          .then(function (updated) {
            // When updated modules is available,
            // it indicates server is ready to serve new bundle.
            if (updated) {
              // While update completed, do it again until no update available.
              attemptUpdates(hmr, fallback);
            }
          })
          .catch(fallback);
      }
    } else {
      // HMR disabled.
      fallback();
    }
  }
}

var retryTimes = 0;
var reloadTimer;
var RELOAD_DELAY = 300;
var MAX_RETRY_TIMES = 10;
var RETRY_INTERVAL = 3000;
var options = resolveOptions();
var progress = new Progress();
var overlay = new Overlay(options.name);

function isTLS(protocol) {
  return protocol === 'https:';
}

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch (_unused) {
    return null;
  }
}

function getCurrentScript() {
  var _document = document,
    currentScript = _document.currentScript;

  if (currentScript) {
    return currentScript;
  }

  var scripts = document.scripts;

  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i]; // @ts-ignore

    if (script.readyState === 'interactive') {
      return script;
    }
  }
}

function resolveHost(params) {
  var host = params.get('host');
  var tls = params.get('tls') || isTLS(window.location.protocol);

  if (!host) {
    var script = getCurrentScript();

    if (script) {
      var src = script.src;
      var url = new URL(src);
      host = url.host;
      tls = isTLS(url.protocol) || tls;
    } else {
      host = window.location.host;
    }
  }

  return ''.concat(tls ? 'wss' : 'ws', '://').concat(host);
}

function resolveOptions() {
  var params = new URLSearchParams(__resourceQuery);
  var host = resolveHost(params);
  var live = params.get('live') !== 'false';
  var overlay = params.get('overlay') !== 'false';

  try {
    return _objectSpread2(
      _objectSpread2({}, __WDS_HOT_OPTIONS__),
      {},
      {
        host: host,
        live: live,
        overlay: overlay
      }
    );
  } catch (_unused2) {
    throw new Error('Imported the hot client but the hot server is not enabled.');
  }
}

function fallback(error) {
  if (options.live) {
    reloadTimer = self.setTimeout(function () {
      window.location.reload();
    }, RELOAD_DELAY);
  } else if (error) {
    console.error(error);
    console.warn('Use fallback update but you turn off live reload, please reload by yourself.');
  }
}

function onInvalid() {
  clearTimeout(reloadTimer);

  if (options.progress) {
    progress.update(0);
    progress.show();
  }
}

function onProgress(_ref) {
  var value = _ref.value;

  if (options.progress) {
    progress.update(value);
  }
}

function onHash(_ref2) {
  var hash = _ref2.hash;
  updateHash(hash);
}

function setProblems(type, problems) {
  var nameMaps = {
    errors: ['Error', 'error'],
    warnings: ['Warning', 'warn']
  };

  var _nameMaps$type = _slicedToArray(nameMaps[type], 2),
    name = _nameMaps$type[0],
    method = _nameMaps$type[1];

  if (options.overlay) {
    overlay.setProblems(type, problems);
  }

  var _iterator = _createForOfIteratorHelper(problems),
    _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var _step$value = _step.value,
        moduleName = _step$value.moduleName,
        message = _step$value.message;
      console[method](''.concat(name, ' in ').concat(moduleName, '\r\n').concat(message));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function onProblems(_ref3) {
  var errors = _ref3.errors,
    warnings = _ref3.warnings;
  progress.hide();
  setProblems('errors', errors);
  setProblems('warnings', warnings);

  if (options.overlay) {
    overlay.show();
  }

  if (errors.length <= 0) {
    attemptUpdates(options.hmr, fallback);
  }
}

function onSuccess() {
  overlay.hide();
  progress.hide();
  attemptUpdates(options.hmr, fallback);
}

function createWebSocket(url) {
  var ws = new WebSocket(url);

  ws.onopen = function () {
    retryTimes = 0;
  };

  ws.onmessage = function (message) {
    var parsed = parseMessage(message);

    if (parsed) {
      var action = parsed.action,
        payload = parsed.payload;

      switch (action) {
        case 'invalid':
          onInvalid();
          break;

        case 'progress':
          onProgress(payload);
          break;

        case 'hash':
          onHash(payload);
          break;

        case 'problems':
          onProblems(payload);
          break;

        case 'ok':
          onSuccess();
          break;
      }

      window.postMessage(
        {
          action: 'webpack-hot-'.concat(action),
          payload: payload
        },
        '*'
      );
    }
  };

  ws.onclose = function () {
    overlay.hide();
    progress.hide();

    if (retryTimes++ < MAX_RETRY_TIMES) {
      setTimeout(function () {
        createWebSocket(url);
      }, RETRY_INTERVAL);
    }
  };
}

createWebSocket(options.host + options.path);
