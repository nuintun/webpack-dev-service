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

  ws.onclose = event => {
    console.log(event);
  };
}

createWebSocket('ws://127.0.0.1:8000/hmr');
