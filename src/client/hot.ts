/**
 * @module hot
 */

// Last error.
let error: Error;
// HMR status.
let status: HotUpdateStatus;
// Last update hash.
let hash: string = __webpack_hash__;

// Listen HMR status change.
if (import.meta.webpackHot) {
  // Initialize status.
  status = import.meta.webpackHot.status();

  // Add status change event listener.
  import.meta.webpackHot.addStatusHandler(value => {
    status = value;
  });
}

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
      switch (status) {
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
            .catch((exception: Error) => {
              if (status !== 'fail' && status !== 'abort') {
                status = 'fail';
              }

              error = exception;

              fallback(error);
            });
          break;
        case 'fail':
        case 'abort':
          fallback(error);
          break;
      }
    } else {
      // HMR disabled.
      fallback();
    }
  }
}
