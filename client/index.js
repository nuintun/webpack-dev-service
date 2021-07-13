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
 * @module utils
 */

function appendHTML(html, parent) {
  const nodes = [];
  const div = document.createElement('div');

  div.innerHTML = html.trim();

  while (div.firstChild) {
    nodes.push((parent || document.body).appendChild(div.firstChild));
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
  #${ns} {
    opacity: 0;
    width: 50px;
    right: 16px;
    height: 50px;
    bottom: 16px;
    position: fixed;
    transform: scale(0);
    z-index: 2147483645;
  }
  #${ns}-bg {
    fill: #282d35;
  }
  #${ns}-track {
    stroke-width: 10;
    fill: rgba(0, 0, 0, 0);
    stroke: rgb(186, 223, 172);
    stroke-dasharray: ${perimeter};
    stroke-dashoffset: -${perimeter};
    transform: rotate(90deg) translate(0, -80px);
  }
  #${ns}-value {
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
    animation-fill-mode: both;
    animation: ${ns}-fadein .3s;
  }
  .${ns}-fadeout {
    animation-fill-mode: both;
    animation: ${ns}-fadeout .3s;
  }
`;

const html = `
  <svg id="${ns}" class="${ns}-noselect" x="0" y="0" viewBox="0 0 80 80">
    <circle id="${ns}-bg" cx="50%" cy="50%" r="35" />
    <path id="${ns}-track" d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0" />
    <text id="${ns}-value" x="50%" y="52%">0%</text>
  </svg>
`;

class Progress {
  constructor() {
    this.init();
  }

  init() {
    injectCSS(css);
    appendHTML(html);

    this.svg = document.querySelector(`#${ns}`);
    this.track = document.querySelector(`#${ns}-track`);
    this.value = document.querySelector(`#${ns}-value`);
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
    const fadein = `${ns}-fadein`;
    const { classList } = this.svg;

    if (classList.contains(fadein)) {
      classList.remove(fadein);
      classList.add(`${ns}-fadeout`);
    }
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
