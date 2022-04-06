/**
 * @module hot
 */

// Last update hash.
let hash = __webpack_hash__;

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

// Attempt update fallback on failed.
export function fallback(reloadable) {
  if (reloadable) {
    setTimeout(() => {
      window.location.reload();
    }, 256);
  }
}

// Attempt to update code on the fly, fall back to a hard reload.
export function attemptUpdates(hmr, reloadable) {
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
                attemptUpdates(hmr, reloadable);
              }
            } else {
              // When updated modules is unavailable,
              // it indicates a critical failure in hot-reloading,
              // e.g. server is not ready to serve new bundle,
              // and hence we need to do a forced reload.
              fallback(reloadable);
            }
          })
          .catch(() => {
            fallback(reloadable);
          });
      }
    }
  } else {
    // HMR disabled.
    fallback(reloadable);
  }
}
