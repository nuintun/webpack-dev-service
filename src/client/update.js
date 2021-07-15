/**
 * @module update
 */

const RELOAD_DELAY = 360;

function deferReload() {
  setTimeout(() => {
    window.location.reload();
  }, RELOAD_DELAY);
}

function isUpToDate(hash) {
  return hash === __webpack_hash__;
}

function hotUpdate(hash, onUpdated) {
  module.hot
    .check(true)
    .then(updated => {
      if (!updated) {
        deferReload();
      } else if (!isUpToDate(hash)) {
        hotUpdate(hash, onUpdated);
      } else {
        onUpdated();
      }
    })
    .catch(() => {
      const status = module.hot.status();

      if (status === 'abort' || status === 'fail') {
        deferReload();
      }
    });
}

export default function update(hash, hmr) {
  return new Promise(resolve => {
    if (!isUpToDate(hash)) {
      if (hmr && module.hot) {
        if (module.hot.status() === 'idle') {
          hotUpdate(hash, resolve);
        }
      } else {
        deferReload();
      }
    } else {
      resolve();
    }
  });
}
