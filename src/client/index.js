/**
 * @module index
 */

import reload from './reload';
import Overlay from './ui/overlay';
import Progress from './ui/progress';

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch {
    return {};
  }
}

function createWebSocket(url, protocols) {
  const overlay = new Overlay();
  const progressBar = new Progress();
  const ws = new WebSocket(url, protocols);

  const progress = value => {
    value === 0 && progressBar.show();

    progressBar.update(value);

    value === 100 && progressBar.hide();
  };

  ws.onmessage = message => {
    const { action, payload } = parseMessage(message);

    switch (action) {
      case 'init':
        break;
      case 'rebuild':
        overlay.hide();
        break;
      case 'ok':
        reload(payload.hash, { hmr: true });
        break;
      case 'problems':
        reload(payload.hash, {
          hmr: true,
          onUpdated() {
            overlay.show({ ...payload, warnings: payload.errors });
          }
        });
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
