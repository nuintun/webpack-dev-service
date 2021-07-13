import reload from './reload';
import * as overlay from './overlay';

const ws = new WebSocket('ws://127.0.0.1:8000/hmr');

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch {
    return {};
  }
}

ws.onmessage = message => {
  overlay.hide();

  const { action, payload } = parseMessage(message);

  switch (action) {
    case 'ok':
      reload(payload.hash, true);
      break;
    case 'errors':
      reload(payload.hash, true);

      overlay.show('error', payload.errors);
      break;
    case 'warnings':
      reload(payload.hash, true);

      overlay.show('warning', payload.warnings);
      break;
  }

  window.postMessage({ action: `webpack-hot-${action}`, payload }, '*');
};
