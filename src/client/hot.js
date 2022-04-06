/**
 * @module hot
 */

// Last update hash.
let hash = __webpack_hash__;

// Reload location.
export function reload() {
  setTimeout(() => {
    window.location.reload();
  }, 128);
}

// Update hash.
export function updateHash(value) {
  hash = value;
}

// Webpack disallows updates in other states.
export function isUpdateIdle() {
  return import.meta.webpackHot.status() === 'idle';
}

// Is there a newer version of this code available?
export function isUpdateAvailable() {
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by webpack.
  return hash !== __webpack_hash__;
}

// Attempt to update code on the fly, fall back to a hard reload.
export function attemptUpdates(hmr) {
  // HMR enabled.
  if (hmr && import.meta.webpackHot) {
    // Update available and can apply updates.
    if (isUpdateAvailable()) {
      if (isUpdateIdle()) {
        import.meta.webpackHot
          .check(true)
          .then(updated => {
            // When updated modules is available,
            if (updated) {
              // While we were updating, there was a new update! Do it again.
              if (isUpdateAvailable()) {
                attemptUpdates(hmr);
              }
            } else {
              // When updated modules is unavailable,
              // it indicates a critical failure in hot-reloading,
              // e.g. server is not ready to serve new bundle,
              // and hence we need to do a forced reload.
              reload();
            }
          })
          .catch(reload);
      }
    }
  } else {
    // HMR disabled.
    reload();
  }
}
