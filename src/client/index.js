/**
 * @module index
 */

import Overlay from './ui/overlay';
import Progress from './ui/progress';
import { attemptUpdates, updateHash } from './hot';

let reloadTimer;
let retryTimes = 0;

const RELOAD_DELAY = 250;
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

  if (currentScript) return currentScript;

  const scripts = document.scripts;

  for (let i = scripts.length - 1; i >= 0; i--) {
    const script = scripts[i];

    if (script.readyState === 'interactive') {
      return script;
    }
  }
}

function resolveHost(params) {
  let host = params.get('host');
  let tls = params.get(tls) || isTLS(window.location.protocol);

  if (!host) {
    const { src } = getCurrentScript();

    if (src) {
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
  const reload = !!params.get('reload') === false;
  const overlay = !!params.get('overlay') === false;

  try {
    return { ...__WDS_HOT_OPTIONS__, host, reload, overlay };
  } catch {
    throw new Error('imported the hot client but the hot server is not enabled');
  }
}

function fallback() {
  reloadTimer = setTimeout(() => {
    window.location.reload();
  }, RELOAD_DELAY);
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
          onSuccess(payload);
          break;
      }

      window.postMessage({ action: `webpack-hot-${action}`, payload }, '*');
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
