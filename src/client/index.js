import reload from './reload';

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch {
    return {};
  }
}

function createWebSocket(url, protocols) {
  const ws = new WebSocket(url, protocols);

  ws.onmessage = message => {
    const { action, payload } = parseMessage(message);

    switch (action) {
      case 'ok':
        reload(payload.hash, true);
        break;
      case 'problems':
        reload(payload.hash, true);
        break;
    }

    window.postMessage({ action: `webpack-hot-${action}`, payload }, '*');
  };

  ws.onclose = event => {
    console.log(event);
  };
}

createWebSocket('ws://127.0.0.1:8000/hmr');
