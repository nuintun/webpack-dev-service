/**
 * @module reload
 */

function isUpToDate(hash) {
  return hash === __webpack_hash__;
}

function update(hash) {
  module.hot
    .check(true)
    .then(updated => {
      if (!updated) {
        window.location.reload();
      } else if (!isUpToDate(hash)) {
        update(hash);
      }
    })
    .catch(() => {
      const status = module.hot.status();

      if (status === 'abort' || status === 'fail') {
        window.location.reload();
      }
    });
}

export default function reload(hash, hmr) {
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
