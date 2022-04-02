/**
 * @module hot
 */

let hash = __webpack_hash__;

// Reload location.
export function reload() {
  window.location.reload();
}

// Update hash.
export function updateHash(value) {
  hash = value;
}

// Is there a newer version of this code available?
export function isUpdateAvailable() {
  /* globals __webpack_hash__ */
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by webpack.
  return hash !== __webpack_hash__;
}

// Attempt to update code on the fly, fall back to a hard reload.
export function attemptUpdates(hmr, onHotUpdateSuccess = () => {}) {
  const { hot } = module;

  // HMR not enabled.
  if (!hmr || !hot) return reload();

  // Update available and can apply updates.
  if (isUpdateAvailable()) {
    switch (hot.status()) {
      case 'idle':
        return hot
          .check(true)
          .then(updated => {
            // When updated modules is unavailable,
            // it indicates a critical failure in hot-reloading,
            // e.g. server is not ready to serve new bundle,
            // and hence we need to do a forced reload.
            if (!updated) return reload();

            // While we were updating, there was a new update! Do it again.
            if (isUpdateAvailable()) {
              return attemptUpdates(hmr, onHotUpdateSuccess);
            }

            // Maybe we want to do something on hot update success.
            return onHotUpdateSuccess();
          })
          .catch(() => {
            return attemptUpdates(hmr, onHotUpdateSuccess);
          });
      case 'fail':
      case 'abort':
        return reload();
    }
  } else {
    // Maybe we want to do something on hot update success.
    return onHotUpdateSuccess();
  }
}
