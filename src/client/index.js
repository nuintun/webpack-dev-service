/**
 * @module index
 */

import reload from './reload';
import Overlay from './ui/overlay';
import Progress from './ui/progress';

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

  const overlay = new Overlay();
  const progress = new Progress();
  const ws = new WebSocket(url, protocols);

  ws.onmessage = message => {
    const { action, payload } = parseMessage(message);

    switch (action) {
      case 'init':
        options = payload.options;

        overlay.setName(payload.name);
        break;
      case 'progress':
        if (options.progress) {
          const percent = payload.value;

          percent === 0 && progress.show();

          progress.update(percent);

          percent === 100 && progress.hide();
        }
        break;
      case 'problems':
        reload(payload.hash, {
          hmr: options.hmr,
          onUpdated() {
            const problems = {};

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
        overlay.hide(() => {
          reload(payload.hash, { hmr: options.hmr });
        });
        break;
    }

    window.postMessage({ action: `webpack-hot-${action}`, payload }, '*');
  };

  ws.onclose = () => {
    setTimeout(() => {
      createWebSocket(url, protocols);
    }, RECONNECT_INTERVAL);
  };
}

createWebSocket(parseSocketURL());
