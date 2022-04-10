/**
 * @module hot
 */

// Last update hash.
let hash: string = __webpack_hash__;

// Update hash.
export function updateHash(value: string): void {
  hash = value;
}

// Is there a newer version of this code available?
export function isUpdateAvailable(): boolean {
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by webpack.
  return hash !== __webpack_hash__;
}

// Attempt to update code on the fly, fall back to a hard reload.
export function attemptUpdates(hmr: boolean, fallback: (error?: Error) => void): void {
  // Update available.
  if (isUpdateAvailable()) {
    // HMR enabled.
    if (hmr && import.meta.webpackHot) {
      switch (import.meta.webpackHot.status()) {
        case 'idle':
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
          break;
        case 'fail':
        case 'abort':
          fallback();
          break;
      }
    } else {
      // HMR disabled.
      fallback();
    }
  }
}
