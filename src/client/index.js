/**
 * @module index
 */

import update from './update';
import Overlay from './ui/overlay';
import Progress from './ui/progress';

const overlay = new Overlay();
const progress = new Progress();

const RECONNECT_INTERVAL = 3000;

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch {
    return {};
  }
}

function parseHost(host) {
  return host ? host.replace(/\/+$/, '') : location.host;
}

function parseSocketURL() {
  const query = __resourceQuery || '';
  const params = new URLSearchParams(query);

  const host = parseHost(params.get('host'));
  const tls = params.has('tls') || location.protocol === 'https:';

  return `${tls ? 'wss' : 'ws'}://${host}${__WDS_HOT_SOCKET_PATH__}`;
}

function createWebSocket(url, protocols) {
  let options = {};

  const ws = new WebSocket(url, protocols);

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
        if (options.progress) {
          const percent = payload.value;

          if (percent === 0) {
            progress.show();
          }

          progress.update(payload.value);

          if (percent === 100) {
            progress.hide();
          }
        }
        break;
      case 'problems':
        update(payload.hash, options.hmr).then(() => {
          const problems = {};

          if (options.errors) {
            problems.errors = payload.errors;
          }

          if (options.warnings) {
            problems.warnings = payload.warnings;
          }

          overlay.show(problems);
        });
        break;
      case 'ok':
        overlay.hide();

        update(payload.hash, options.hmr);
        break;
    }

    window.postMessage({ action: `webpack-hot-${action}`, payload }, '*');
  };

  ws.onclose = () => {
    progress.hide();

    setTimeout(() => {
      createWebSocket(url, protocols);
    }, RECONNECT_INTERVAL);
  };
}

createWebSocket(parseSocketURL());
