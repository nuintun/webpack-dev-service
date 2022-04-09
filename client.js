/**
 * @package webpack-dev-server-middleware
 * @license MIT
 * @version 0.9.0
 * @author nuintun <nuintun@qq.com>
 * @description A development and hot reload middleware for Koa2.
 * @see https://github.com/nuintun/webpack-dev-server-middleware#readme
 */

import 'core-js/modules/web.dom-collections.iterator.js';
import 'core-js/modules/web.url.js';
import 'core-js/modules/web.url-search-params.js';
import 'core-js/modules/es.string.replace.js';
import ansiRegex from 'ansi-regex';

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

const ANSI_RE = ansiRegex();
const DEFAULT_COLORS = {
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
const STYLES = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'lightgrey'
};
const OPEN_TAGS = {
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
const CLOSE_TAGS = {
  // Reset italic
  23: '</i>',
  // Reset underscore
  24: '</u>',
  // Reset delete
  29: '</del>'
};

for (const code of [0, 21, 22, 27, 28, 39, 49]) {
  CLOSE_TAGS[code] = '</span>';
}

function encodeHTML(text) {
  return String(text).replace(/[<>]/g, match => {
    return `&#6${match === '<' ? 0 : 2};`;
  });
}

function resolveTags(colors) {
  const colours = { ...DEFAULT_COLORS, ...colors };
  const open = { ...OPEN_TAGS };
  const close = { ...CLOSE_TAGS };
  const [foregroud, background] = colours.reset; // Reset all

  open[0] = `font-weight: normal; opacity: 1; color: ${foregroud} ; background: ${background}`; // Inverse

  open[7] = `color: ${background}; background: ${foregroud}`; // Dark grey

  open[90] = `color: ${colours.darkgrey}`;

  for (const code of Object.keys(STYLES)) {
    const style = STYLES[code];
    const color = colors[style] || foregroud;
    open[code] = `color: ${color};`;
    open[~~code + 10] = `background: ${color};`;
  }

  return {
    open,
    close
  };
}

class Ansi {
  constructor(colors) {
    const { open, close } = resolveTags(colors);
    this.open = open;
    this.close = close;
  }

  convert(text) {
    text = encodeHTML(text); // Returns the text if the string has no ANSI escape code

    if (!ANSI_RE.test(text)) return text; // Cache opened sequence

    const codes = [];
    const { open, close } = this; // Replace with markup

    let html = text.replace(/\033\[(\d+)*m/g, (_match, code) => {
      const openTag = open[code];

      if (openTag) {
        // If current sequence has been opened, close it.
        if (!!~codes.indexOf(code)) {
          // eslint-disable-line no-extra-boolean-cast
          codes.pop();
          return '</span>';
        } // Open tag.

        codes.push(code);
        return openTag[0] === '<' ? openTag : `<span style="${openTag}">`;
      }

      const closeTag = close[code];

      if (closeTag) {
        // Pop sequence
        codes.pop();
        return closeTag;
      }

      return '';
    }); // Make sure tags are closed.

    const { length } = codes;

    if (length > 0) {
      html += '</span>'.repeat(length);
    }

    return html;
  }
}

/**
 * @module utils
 */
const defaultStyleElement = document.createElement('style');
function injectCSS(css, styleElement = defaultStyleElement) {
  const { head } = document;
  styleElement.appendChild(document.createTextNode(css.trim()));

  if (!head.contains(styleElement)) {
    head.appendChild(styleElement);
  }

  return styleElement;
}
function appendHTML(html, parent) {
  const nodes = [];
  const parser = new DOMParser();
  const stage = parent || document.body;
  const fragment = document.createDocumentFragment();
  const { body } = parser.parseFromString(html.trim(), 'text/html');

  while (body.firstChild) {
    nodes.push(fragment.appendChild(body.firstChild));
  }

  stage.appendChild(fragment);
  return nodes;
}

const OVERLAY = 'wds-overlay';
const CSS$1 = `
 .${OVERLAY} {
   top:0;
   left: 0;
   right: 0;
   bottom: 0;
   width: 100vw;
   height: 100vh;
   display: flex;
   position: fixed;
   font-size: 16px;
   overflow: hidden;
   font-style: normal;
   font-weight: normal;
   z-index: 2147483646;
   flex-direction: column;
   box-sizing: border-box;
   transform-origin: center;
   background: rgba(0, 0, 0, .85);
   transform: scale(0) translateZ(0);
   transition: transform .25s ease-out;
   font-family: Menlo, "Lucida Console", monospace;
 }
 .${OVERLAY}-show {
   transform: scale(1) translateZ(0);
 }
 .${OVERLAY}-close {
   top: 16px;
   right: 16px;
   width: 16px;
   height: 16px;
   cursor: pointer;
   position: absolute;
   border-radius: 16px;
   background: #ff5f58;
   display: inline-block;
   transform-origin: center;
   box-shadow: #ff5f58 0 0 6px;
   transform: rotate(0) translateZ(0);
   transition: transform .25s ease-in-out;
 }
 .${OVERLAY}-close:before,
 .${OVERLAY}-close:after {
   top: 7px;
   left: 3px;
   content: "";
   width: 10px;
   height: 2px;
   position: absolute;
   background-color: white;
   transform-origin: center;
 }
 .${OVERLAY}-close:before {
   transform: rotate(45deg);
 }
 .${OVERLAY}-close:after {
   transform: rotate(-45deg);
 }
 .${OVERLAY}-close:hover {
   transform: rotate(180deg) translateZ(0);
 }
 .${OVERLAY}-title {
   margin: 0;
   color: #fff;
   line-height: 16px;
   text-align: center;
   background: #282d35;
   overflow-wrap: break-word;
   border-radius: 0 0 4px 4px;
   padding: 16px 48px 16px 16px;
 }
 .${OVERLAY}-name {
   font-weight: bold;
   font-style: normal;
   text-transform: uppercase;
 }
 .${OVERLAY}-errors-title,
 .${OVERLAY}-warnings-title {
   color: #ff5f58;
   padding-left: 8px;
   font-style: normal;
 }
 .${OVERLAY}-warnings-title {
   color: #ffbd2e;
 }
 .${OVERLAY}-problems {
   padding: 0 16px;
   overflow-y: auto;
   scrollbar-width: none;
   -ms-overflow-style: none;
   -webkit-overflow-scrolling: touch;
 }
 .${OVERLAY}-problems::-webkit-scrollbar {
   display: none;
 }
 .${OVERLAY}-errors,
 .${OVERLAY}-warnings {
   color: #ddd;
   padding: 16px;
   margin: 16px 0;
   display: block;
   line-height: 1.2;
   border-radius: 4px;
   background: #282d35;
   white-space: pre-wrap;
   font-family: Menlo, "Lucida Console", monospace;
 }
 .${OVERLAY}-errors > div,
 .${OVERLAY}-warnings > div {
   overflow-wrap: break-word;
 }
 .${OVERLAY}-errors > div + div,
 .${OVERLAY}-warnings > div + div {
   margin: 16px 0 0;
 }
 .${OVERLAY}-errors > div > em,
 .${OVERLAY}-warnings > div > em {
   line-height: 1;
   color: #641e16;
   padding: 4px 8px;
   font-style: normal;
   border-radius: 4px;
   font-weight: normal;
   background: #ff5f58;
   display: inline-block;
   text-transform: uppercase;
 }
 .${OVERLAY}-warnings > div > em {
   color: #3e2723;
   background: #ffbd2e;
 }
 .${OVERLAY}-errors > div > div,
 .${OVERLAY}-warnings > div > div {
   font-size: 14px;
   padding: 8px 0 0 16px;
   overflow-wrap: break-word;
 }
 .${OVERLAY}-hidden {
   display: none;
 }
 `;
const DEFAULT_NAME = 'webpack';
const HTML$1 = `
 <aside class="${OVERLAY}">
   <i class="${OVERLAY}-close"></i>
   <div class="${OVERLAY}-title">
     <em class="${OVERLAY}-name"></em>
     <em class="${OVERLAY}-errors-title"></em>
     <em class="${OVERLAY}-warnings-title"></em>
   </div>
   <article class="${OVERLAY}-problems">
     <pre class="${OVERLAY}-errors ${OVERLAY}-hidden"></pre>
     <pre class="${OVERLAY}-warnings ${OVERLAY}-hidden"></pre>
   </article>
 </aside>
 `;
const ANSI = new Ansi({
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

class Overlay {
  constructor(name) {
    _defineProperty(this, 'hidden', true);

    injectCSS(CSS$1);
    [this.aside] = appendHTML(HTML$1);
    this.name = this.aside.querySelector(`.${OVERLAY}-name`);
    this.close = this.aside.querySelector(`.${OVERLAY}-close`);
    this.errorsList = this.aside.querySelector(`.${OVERLAY}-errors`);
    this.warningsList = this.aside.querySelector(`.${OVERLAY}-warnings`);
    this.errorsTitle = this.aside.querySelector(`.${OVERLAY}-errors-title`);
    this.warningsTitle = this.aside.querySelector(`.${OVERLAY}-warnings-title`);
    this.name.innerHTML = `⭕ ${name || DEFAULT_NAME}`;
    this.close.addEventListener('click', () => {
      this.hide();
    });
  }

  setProblems(type, problems) {
    const count = problems.length;
    const hidden = `${OVERLAY}-hidden`;
    const problemMaps = {
      errors: ['Error', this.errorsTitle, this.errorsList],
      warnings: ['Warning', this.warningsTitle, this.warningsList]
    };
    const [name, problemTitle, problemList] = problemMaps[type];

    if (count > 0) {
      let html = '';
      problemTitle.innerText = `${count} ${name}(s)`;

      for (const { moduleName = 'unknown', message } of problems) {
        const src = ansiHTML(moduleName);
        const details = ansiHTML(message);
        html += `<div><em>${name}</em> in ${src}<div>${details}</div></div>`;
      }

      problemList.innerHTML = html;
      problemList.classList.remove(hidden);
      problemTitle.classList.remove(hidden);
    } else {
      problemList.classList.add(hidden);
      problemTitle.classList.add(hidden);
    }
  }

  show() {
    if (this.hidden) {
      this.hidden = false;
      this.aside.classList.add(`${OVERLAY}-show`);
    }
  }

  hide() {
    if (!this.hidden) {
      this.hidden = true;
      this.aside.classList.remove(`${OVERLAY}-show`);
    }
  }
}

const PROGRESS = 'wds-progress';
const PERIMETER = 2 * Math.PI * 44;
const CSS = `
 .${PROGRESS} {
   width: 48px;
   right: 16px;
   height: 48px;
   bottom: 16px;
   display: block;
   font-size: 16px;
   position: fixed;
   cursor: default;
   user-select: none;
   font-style: normal;
   font-weight: normal;
   z-index: 2147483647;
   transform-origin: center;
   transform: scale(0) translateZ(0);
   transition: transform .25s ease-out;
 }
 .${PROGRESS}-show {
   transform: scale(1) translateZ(0);
 }
 .${PROGRESS}-track {
   stroke: #badfac;
   stroke-width: 8;
   stroke-linecap: round;
   fill: rgba(0, 0, 0, 0);
   stroke-dasharray: ${PERIMETER};
   stroke-dashoffset: ${PERIMETER};
   transition: stroke-dashoffset .25s linear;
   transform: matrix(0, -1, 1, 0, 0, 96) translateZ(0);
 }
 `;
const HTML = `
 <svg class="${PROGRESS}" x="0" y="0" viewBox="0 0 96 96">
   <circle fill="#282d35" cx="50%" cy="50%" r="44" />
   <circle class="${PROGRESS}-track" cx="50%" cy="50%" r="44" />
   <path fill="#fff" d="m48,83.213561l-31.122918,-17.60678l0,-35.21356l31.122918,-17.60678l31.122918,17.60678l0,35.21356l-31.122918,17.60678z" />
   <path fill="#8ed6fb" d="m22.434956,31.608089l24.537982,-13.880011l0,10.810563l-15.288554,8.410172l-9.249428,-5.340723zm-1.678513,1.520052l0,29.027711l8.979458,-5.182262l0,-18.657318l-8.979458,-5.188131zm52.908373,-1.520052l-24.537982,-13.880011l0,10.810563l15.288554,8.410172l9.249428,-5.340723zm1.678513,1.520052l0,29.027711l-8.979458,-5.182262l0,-18.657318l8.979458,-5.188131zm-1.050538,30.905767l-25.165957,14.238016l0,-10.452558l16.121941,-8.867948l0.123247,-0.070427l8.920768,5.152918zm-52.485811,0l25.165957,14.238016l0,-10.452558l-16.121941,-8.867948l-0.123247,-0.070427l-8.920768,5.152918z" />
   <path fill="#1c78c0" d="m49.126834,30.997721l15.083141,8.292793l0,16.432994l-15.083141,-8.709487l0,-16.016301zm-2.153896,0l-15.083141,8.292793l0,16.432994l15.083141,-8.709487l0,-16.016301zm16.215844,26.62732l-15.141831,8.328007l-15.141831,-8.328007l15.141831,-8.744701l15.141831,8.744701z" />
 </svg>
 `;
class Progress {
  constructor() {
    _defineProperty(this, 'hidden', true);

    injectCSS(CSS);
    [this.svg] = appendHTML(HTML);
    this.track = this.svg.querySelector(`.${PROGRESS}-track`);
  }

  update(value) {
    value = Math.max(0, Math.min(100, value));
    this.track.style.strokeDashoffset = (((100 - value) / 100) * PERIMETER).toString();
  }

  show() {
    if (this.hidden) {
      this.hidden = false;
      clearTimeout(this.timer);
      this.svg.classList.add(`${PROGRESS}-show`);
    }
  }

  hide() {
    if (!this.hidden) {
      this.hidden = true;
      this.timer = self.setTimeout(() => {
        this.svg.classList.remove(`${PROGRESS}-show`);
      }, 300);
    }
  }
}

/**
 * @module events
 */
const events = {
  ok: [],
  hash: [],
  invalid: [],
  progress: [],
  problems: []
};
function emit(event, message, options) {
  const callbacks = events[event];

  if (callbacks && callbacks.length > 0) {
    for (const callback of callbacks) {
      callback(message, options);
    }
  }
}
function on(event, callback) {
  const callbacks = events[event];

  if (callbacks) {
    callbacks.push(callback);
  }
}
function off(event, callback) {
  const callbacks = events[event];

  if (callbacks) {
    if (callback) {
      const index = callbacks.indexOf(callback);

      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    } else {
      events[event] = [];
    }
  }
}

/**
 * @module hot
 */
// Last update hash.
let hash = __webpack_hash__; // Update hash.

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
          .then(updated => {
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

let retryTimes = 0;
let reloadTimer;
const RELOAD_DELAY = 300;
const MAX_RETRY_TIMES = 10;
const RETRY_INTERVAL = 3000;
const options = resolveOptions();
const progress = new Progress();
const overlay = new Overlay(options.name);

function isTLS(protocol) {
  return protocol === 'https:';
}

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch {
    return null;
  }
}

function getCurrentScript() {
  const { currentScript } = document;

  if (currentScript) {
    return currentScript;
  }

  const scripts = document.scripts;

  for (let i = scripts.length - 1; i >= 0; i--) {
    const script = scripts[i]; // @ts-ignore

    if (script.readyState === 'interactive') {
      return script;
    }
  }
}

function resolveHost(params) {
  let host = params.get('host');
  let tls = params.get('tls') || isTLS(window.location.protocol);

  if (!host) {
    const script = getCurrentScript();

    if (script) {
      const { src } = script;
      const url = new URL(src);
      host = url.host;
      tls = isTLS(url.protocol) || tls;
    } else {
      host = window.location.host;
    }
  }

  return `${tls ? 'wss' : 'ws'}://${host}`;
}

function resolveOptions() {
  const params = new URLSearchParams(__resourceQuery);
  const host = resolveHost(params);
  const live = params.get('live') !== 'false';
  const overlay = params.get('overlay') !== 'false';

  try {
    return { ...__WDS_HOT_OPTIONS__, host, live, overlay };
  } catch {
    throw new Error('Imported the hot client but the hot server is not enabled.');
  }
}

function fallback(error) {
  if (options.live) {
    reloadTimer = self.setTimeout(() => {
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

function onProgress({ value }) {
  if (options.progress) {
    progress.update(value);
  }
}

function onHash({ hash }) {
  updateHash(hash);
}

function setProblems(type, problems) {
  const nameMaps = {
    errors: ['Error', 'error'],
    warnings: ['Warning', 'warn']
  };
  const [name, method] = nameMaps[type];

  if (options.overlay) {
    overlay.setProblems(type, problems);
  }

  for (const { moduleName, message } of problems) {
    console[method](`${name} in ${moduleName}\r\n${message}`);
  }
}

function onProblems({ errors, warnings }) {
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
  const ws = new WebSocket(url);

  ws.onopen = () => {
    retryTimes = 0;
  };

  ws.onmessage = message => {
    const parsed = parseMessage(message);

    if (parsed) {
      const { action, payload } = parsed;

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

      emit(action, payload, options);
    }
  };

  ws.onclose = () => {
    overlay.hide();
    progress.hide();

    if (retryTimes++ < MAX_RETRY_TIMES) {
      setTimeout(() => {
        createWebSocket(url);
      }, RETRY_INTERVAL);
    }
  };
}

createWebSocket(options.host + options.path);

export { off, on };
