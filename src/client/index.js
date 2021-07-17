/**
 * @module index
 */

import update from './update';
import Overlay from './ui/overlay';
import Progress from './ui/progress';
import { strip } from './ui/utils/ansi';

let retryTimes = 0;
let forceReload = false;

const overlay = new Overlay();
const progress = new Progress();

const MAX_RETRY_TIMES = 10;
const RETRY_INTERVAL = 3000;

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

function resolveHost(host) {
  if (host) return host;

  const { src } = getCurrentScript();

  if (src) return new URL(src).host;

  return window.location.host;
}

function resolveSocketURL() {
  const query = __resourceQuery || '';
  const params = new URLSearchParams(query);

  const host = resolveHost(params.get('host'));
  const tls = params.has('tls') || location.protocol === 'https:';

  return `${tls ? 'wss' : 'ws'}://${host}${__WDS_HOT_SOCKET_PATH__}`;
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
  const problems = { errors: [], warnings: [] };
  const { errors: errorsOverlay, warnings: warningsOverlay } = options.overlay;

  if (errorsOverlay) {
    problems.errors = errors;
  } else {
    printProblems('errors', errors);
  }

  if (warningsOverlay) {
    problems.warnings = warnings;
  } else {
    printProblems('warnings', warnings);
  }

  overlay.show(problems);
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
      case 'rebuild':
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
