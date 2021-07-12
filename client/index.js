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
    .then(function (outdatedModules) {
      if (!outdatedModules) {
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
  if (hmr && module.hot) {
    const status = module.hot.status();

    if (status === 'idle' && !isUpToDate(hash)) {
      update(hash);
    }
  } else {
    window.location.reload();
  }
}

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
