/**
 * @module reload
 */

function isUpToDate(hash) {
  return hash.indexOf(__webpack_hash__) >= 0;
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

      if (['abort', 'fail'].indexOf(status) >= 0) {
        window.location.reload();
      }
    });
}

export default function reload(hash, hmr) {
  if (hmr && module.hot) {
    const status = module.hot.status();

    if (status === 'idle' && !isUpToDate(hash)) {
      update(hash);
    }
  } else {
    window.location.reload();
  }
}
