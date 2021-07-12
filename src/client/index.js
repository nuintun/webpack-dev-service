import reload from './reload';

const ws = new WebSocket('ws://127.0.0.1:8000/hmr');

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch (error) {
    return {};
  }
}

ws.onmessage = message => {
  const { action, payload } = parseMessage(message);

  switch (action) {
    case 'ok':
      reload(payload.hash, true);
  }
};
