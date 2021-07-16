/**
 * @module update
 */

const RELOAD_DELAY = 300;

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
      if (updated?.length === 0) {
        deferReload();
      } else if (isUpToDate(hash)) {
        onUpdated();
      } else {
        hotUpdate(hash, onUpdated);
      }
    })
    .catch(deferReload);
}

export default function update(hash, hmr, forceReload, onUpdated = () => {}) {
  if (forceReload) {
    deferReload();
  } else if (isUpToDate(hash)) {
    onUpdated();
  } else if (hmr && module.hot) {
    hotUpdate(hash, onUpdated);
  } else {
    deferReload();
  }
}
