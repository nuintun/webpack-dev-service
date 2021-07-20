/**
 * @module index
 */

import Overlay from './ui/overlay';
import Progress from './ui/progress';
import { strip } from './ui/utils/ansi';
import { update, abort } from './update';

let retryTimes = 0;
let forceReload = false;

const overlay = new Overlay();
const progress = new Progress();

const MAX_RETRY_TIMES = 10;
const RETRY_INTERVAL = 3000;

function isTLS(protocol) {
  return protocol === 'https:';
}

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch {
    return {};
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

function resolvePath() {
  try {
    return __WDS_HOT_SOCKET_PATH__;
  } catch {
    throw new Error('imported the hot client but the hot server is not enabled');
  }
}

function resolveSocketURL() {
  const params = new URLSearchParams(__resourceQuery);

  return `${resolveHost(params)}${resolvePath()}`;
}

function progressActions({ value }, options) {
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
  const nameMaps = {
    errors: ['Error', 'error'],
    warnings: ['Warning', 'warn']
  };
  const [name, method] = nameMaps[type];

  for (const { moduleName, message } of problems) {
    console[method](`${name} in ${moduleName}\r\n${strip(message)}`);
  }
}

function problemsActions({ errors, warnings }, options) {
  const { overlay: configure } = options;

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
  let options = {};

  const ws = new WebSocket(url);

  ws.onopen = () => {
    retryTimes = 0;
  };

  ws.onmessage = message => {
    const { action, payload } = parseMessage(message);

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
          update(payload.hash, options.hmr, forceReload, () => {
            problemsActions(payload, options);
          });
        }
        break;
      case 'ok':
        overlay.hide();

        update(payload.hash, options.hmr, forceReload);
        break;
    }

    window.postMessage({ action: `webpack-hot-${action}`, payload }, '*');
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
