import reload from './reload';
import Progress from './overlay/progress';

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
      case 'ok':
        reload(payload.hash, true);
        break;
      case 'problems':
        reload(payload.hash, true);
        break;
      case 'rebuild':
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
