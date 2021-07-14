/**
 * @module reload
 */

function isUpToDate(hash) {
  return hash === __webpack_hash__;
}

function update(hash, onUpdated) {
  module.hot
    .check(true)
    .then(updated => {
      if (!updated) {
        window.location.reload();
      } else if (!isUpToDate(hash)) {
        update(hash, onUpdated);
      } else if (onUpdated) {
        onUpdated();
      }
    })
    .catch(() => {
      const status = module.hot.status();

      if (status === 'abort' || status === 'fail') {
        window.location.reload();
      }
    });
}

export default function reload(hash, { hmr, onUpdated }) {
  if (!isUpToDate(hash)) {
    if (hmr && module.hot) {
      if (module.hot.status() === 'idle') {
        update(hash, onUpdated);
      }
    } else {
      window.location.reload();
    }
  } else if (onUpdated) {
    onUpdated();
  }
}
