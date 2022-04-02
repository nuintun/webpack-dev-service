/**
 * @module index
 */

import Overlay from './ui/overlay';
import Progress from './ui/progress';
import { attemptUpdates, isLastUpdateFailed, isUpdateAvailable } from './hot';

let retryTimes = 0;

const MAX_RETRY_TIMES = 10;
const RETRY_INTERVAL = 3000;

const progress = new Progress();
const options = resolveOptions();
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
  let tls = params.has('tls') || isTLS(window.location.protocol);

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
  try {
    return __WDS_HOT_OPTIONS__;
  } catch {
    throw new Error('imported the hot client but the hot server is not enabled');
  }
}

function resolveSocketURL() {
  const params = new URLSearchParams(__resourceQuery);

  return `${resolveHost(params)}${options.path}`;
}

function onProgress({ value }) {
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

function showOverlay() {
  progress.hide();

  if (options.overlay) {
    overlay.show();
  }
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

function onProblems({ hash, errors, warnings }) {
  setProblems('errors', errors);
  setProblems('warnings', warnings);

  if (isUpdateAvailable(hash)) {
    // if (isLastUpdateFailed()) {
    //   overlay.hide();
    //   progress.hide();
    // }

    attemptUpdates(hash, options.hmr, showOverlay);
  } else {
    showOverlay();
  }
}

function onSuccess({ hash }) {
  attemptUpdates(hash, options.hmr, () => {
    overlay.hide();
    progress.hide();
  });
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
          onProgress({ value: 0 });
          break;
        case 'progress':
          onProgress(payload);
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
    progress.hide();

    if (retryTimes++ < MAX_RETRY_TIMES) {
      setTimeout(() => {
        createWebSocket(url);
      }, RETRY_INTERVAL);
    }
  };
}

createWebSocket(resolveSocketURL());
