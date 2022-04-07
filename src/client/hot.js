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

// Attempt to update code on the fly, fall back to a hard reload.
export function attemptUpdates(hmr, fallback) {
  // Update available.
  if (isUpdateAvailable()) {
    // HMR enabled.
    if (hmr && import.meta.webpackHot) {
      if (isUpdateIdle()) {
        import.meta.webpackHot
          .check(true)
          .then(updated => {
            // When updated modules is available,
            // it indicates server is ready to serve new bundle.
            if (updated) {
              // While update completed, do it again until no update available.
              attemptUpdates(hmr, fallback);
            }
          })
          .catch(fallback);
      }
    } else {
      // HMR disabled.
      fallback();
    }
  }
}
