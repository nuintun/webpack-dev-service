'use strict';

/**
 * @module reload
 */

function isUpToDate(hash) {
  return hash === __webpack_hash__;
}

function update(hash) {
  module.hot
    .check(true)
    .then(function (updatedModules) {
      if (!updatedModules) {
        window.location.reload();
      } else if (!isUpToDate(hash)) {
        update(hash);
      }
    })
    .catch(function () {
      const status = module.hot.status();

      if (status === 'abort' || status === 'fail') {
        window.location.reload();
      }
    });
}

function reload(hash, hmr) {
  if (!isUpToDate(hash)) {
    if (hmr && module.hot) {
      if (module.hot.status() === 'idle') {
        update(hash);
      }
    } else {
      window.location.reload();
    }
  }
}

const ws = new WebSocket('ws://127.0.0.1:8000/hmr');

function parseMessage(message) {
  try {
    return JSON.parse(message.data);
  } catch {
    return {};
  }
}

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
