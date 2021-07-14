'use strict';

/**
 * @module reload
 */

function isUpToDate(hash) {
  return hash === __webpack_hash__;
}

function update(hash) {
  module.hot
    .check(true)
    .then(updated => {
      if (!updated) {
        window.location.reload();
      } else if (!isUpToDate(hash)) {
        update(hash);
      }
    })
    .catch(() => {
      const status = module.hot.status();

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

/**
 * @module effects
 */

// 默认样式
const styles = document.documentElement.style;

// Animation 映射表
const ANIMATION_MAPS = [
  ['animation', 'animationend'],
  ['WebkitAnimation', 'webkitAnimationEnd'],
  ['MozAnimation', 'mozAnimationEnd'],
  ['OAnimation', 'oAnimationEnd'],
  ['msAnimation', 'MSAnimationEnd'],
  ['KhtmlAnimation', 'khtmlAnimationEnd']
];

// Transition 映射表
const TRANSITION_MAPS = [
  ['transition', 'transitionend'],
  ['WebkitTransition', 'webkitTransitionEnd'],
  ['MozTransition', 'mozTransitionEnd'],
  ['OTransition', 'oTransitionEnd'],
  ['msTransition', 'MSTransitionEnd'],
  ['KhtmlTransition', 'khtmlTransitionEnd']
];

/**
 * @function detect
 * @param {object} maps
 */
function detect(maps) {
  for (const [prop, event] of maps) {
    if (prop in styles) {
      return [prop, event];
    }
  }
}

// Animation
const [ANIMATION, ANIMATION_END] = detect(ANIMATION_MAPS);
// Transition
const [TRANSITION, TRANSITION_END] = detect(TRANSITION_MAPS);

/**
 * @function toMs
 * @param {string} value
 */
function toMs(value) {
  return +value.slice(0, -1) * 1000;
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

  const times = durations.map((duration, index) => toMs(duration) + toMs(delays[index]));

  // 获取最大时长
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
  const styles = window.getComputedStyle(node);

  const transitioneDelays = toArray(styles.getPropertyValue(TRANSITION + '-delay'));
  const transitionDurations = toArray(styles.getPropertyValue(TRANSITION + '-duration'));
  const transitionTimeout = calcTimeout(transitioneDelays, transitionDurations);
  const animationDelays = toArray(styles.getPropertyValue(ANIMATION + '-delay'));
  const animationDurations = toArray(styles.getPropertyValue(ANIMATION + '-duration'));
  const animationTimeout = calcTimeout(animationDelays, animationDurations);

  const timeout = Math.max(transitionTimeout, animationTimeout);
  const effect = timeout > 0 ? (transitionTimeout > animationTimeout ? TRANSITION : ANIMATION) : null;
  const count = effect ? (effect === TRANSITION ? transitionDurations.length : animationDurations.length) : 0;

  return { effect, count, timeout };
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

  const { count, effect, timeout } = calcEffects(node);

  // 没有动画
  if (!effect) return callback();

  let ended = 0;

  // 防止有些动画没有触发结束事件
  const timer = setTimeout(function () {
    if (ended < count) {
      end();
    }
  }, timeout + 16);

  const event = effect === TRANSITION ? TRANSITION_END : ANIMATION_END;

  const end = () => {
    clearTimeout(timer);

    node.removeEventListener(event, onEnd);

    callback();
  };

  const onEnd = function (e) {
    if (e.target === node) {
      if (++ended >= count) {
        end();
      }
    }
  };

  // 监听动画完成事件
  node.addEventListener(event, onEnd);
}

/**
 * @module utils
 */

function parseHTML(html) {
  try {
    const parser = new DOMParser();
    const { body } = parser.parseFromString(html.trim(), 'text/html');

    return body.children;
  } catch {
    return [];
  }
}

function appendHTML(html, parent) {
  const nodes = [];
  const stage = parent || document.body;

  for (const node of parseHTML(html)) {
    nodes.push(stage.appendChild(node));
  }

  return nodes;
}

function injectCSS(css) {
  const style = document.createElement('style');

  if (css.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  document.head.appendChild(style);
}

/**
 * @module progress
 */

const ns = 'wds-progress';
const perimeter = 219.99078369140625;

const css = `
  .${ns} {
    opacity: 0;
    width: 50px;
    right: 16px;
    height: 50px;
    bottom: 16px;
    position: fixed;
    transform: scale(0);
    z-index: 2147483645;
  }
  .${ns}-bg {
    fill: #282d35;
  }
  .${ns}-track {
    stroke-width: 10;
    fill: rgba(0, 0, 0, 0);
    stroke: rgb(186, 223, 172);
    stroke-dasharray: ${perimeter};
    stroke-dashoffset: -${perimeter};
    transition: stroke-dashoffset .3s;
    transform: rotate(90deg) translate(0, -80px);
  }
  .${ns}-value {
    fill: #ffffff;
    font-size: 18px;
    text-anchor: middle;
    font-family: monospace;
    dominant-baseline: middle;
  }
  .${ns}-noselect {
    cursor: default;
    user-select: none;
  }
  @keyframes ${ns}-fadein {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes ${ns}-fadeout {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
  .${ns}-fadein {
    animation: ${ns}-fadein .3s;
    animation-fill-mode: forwards;
  }
  .${ns}-fadeout {
    animation: ${ns}-fadeout .3s;
    animation-fill-mode: forwards;
  }
`;

const html = `
  <svg class="${ns} ${ns}-noselect" x="0" y="0" viewBox="0 0 80 80">
    <circle class="${ns}-bg" cx="50%" cy="50%" r="35" />
    <path class="${ns}-track" d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0" />
    <text class="${ns}-value" x="50%" y="52%">0%</text>
  </svg>
`;

class Progress {
  constructor() {
    this.init();
  }

  init() {
    injectCSS(css);

    [this.svg] = appendHTML(html);

    this.track = this.svg.querySelector(`.${ns}-track`);
    this.value = this.svg.querySelector(`.${ns}-value`);
  }

  update(value) {
    this.value.innerHTML = `${value}%`;

    const offset = ((100 - value) / 100) * -perimeter;

    this.track.setAttribute('style', `stroke-dashoffset: ${offset}`);
  }

  show() {
    const fadein = `${ns}-fadein`;
    const { classList } = this.svg;

    if (!classList.contains(fadein)) {
      classList.remove(`${ns}-fadeout`);
      classList.add(fadein);
    }
  }

  hide() {
    onEffectsEnd(this.track, () => {
      const fadein = `${ns}-fadein`;
      const { classList } = this.svg;

      if (classList.contains(fadein)) {
        classList.remove(fadein);
        classList.add(`${ns}-fadeout`);
      }

      onEffectsEnd(this.svg, () => {
        this.update(0);
      });
    });
  }
}

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch {
    return {};
  }
}

function createWebSocket(url, protocols) {
  const bar = new Progress();
  const ws = new WebSocket(url, protocols);

  const progress = value => {
    value === 0 && bar.show();

    bar.update(value);

    value === 100 && bar.hide();
  };

  ws.onmessage = message => {
    const { action, payload } = parseMessage(message);

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

    window.postMessage({ action: `webpack-hot-${action}`, payload }, '*');
  };

  ws.onclose = event => {
    console.log(event);
  };
}

createWebSocket('ws://127.0.0.1:8000/hmr');
