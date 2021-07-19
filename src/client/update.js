/**
 * @module update
 */

let timer;

const RELOAD_DELAY = 300;

function deferReload() {
  abortReload(timer);

  timer = setTimeout(() => {
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
      if (!updated || updated.length === 0) {
        deferReload();
      } else if (isUpToDate(hash)) {
        onUpdated();
      } else {
        hotUpdate(hash, onUpdated);
      }
    })
    .catch(deferReload);
}

export function abortReload() {
  clearTimeout(timer);
}

export default function update(hash, hmr, forceReload, onUpdated = () => {}) {
  if (forceReload) {
    deferReload();
  } else if (isUpToDate(hash)) {
    onUpdated();
  } else if (hmr && module.hot) {
    switch (module.hot.status()) {
      case 'idle':
        hotUpdate(hash, onUpdated);
        break;
      case 'abort':
      case 'fail':
        deferReload();
        break;
    }
  } else {
    deferReload();
  }
}
