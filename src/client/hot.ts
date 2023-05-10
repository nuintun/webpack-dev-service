/**
 * @module hot
 */

// Last error.
let error: Error;
// Last update hash.
let hash: string = __webpack_hash__;
// HMR status.
let status: HotUpdateStatus = 'idle';

/**
 * @function isUpdateAvailable
 * @description Is there a newer version of this code available.
 */
export function isUpdateAvailable(): boolean {
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by webpack.
  return hash !== __webpack_hash__;
}

/**
 * @function setHash
 * @description Set webpack hash.
 * @param value - The new hash value.
 */
export function setHash(value: string): void {
  hash = value;
}

/**
 * @function setStatus
 * @description Set hot status.
 * @param value The new status of the hot update.
 */
export function setStatus(value: HotUpdateStatus): void {
  status = value;
}

// Initialize status.
if (import.meta.webpackHot) {
  setStatus(import.meta.webpackHot.status());
}

/**
 * @function applyUpdate
 * @description Apply update.
 * @param hmr Whether to enable HMR.
 * @param fallback Fallback function when HMR fail.
 */
export function applyUpdate(hmr: boolean, fallback: (error?: Error) => void): void {
  // Update available.
  if (isUpdateAvailable()) {
    // HMR enabled.
    if (hmr && import.meta.webpackHot) {
      switch (status) {
        case 'idle':
          // Set status.
          setStatus('check');

          // Auto check and apply updates.
          import.meta.webpackHot
            .check(true)
            .then(updated => {
              // Update status.
              setStatus(import.meta.webpackHot.status());

              // When updated modules is available,
              // it indicates server is ready to serve new bundle.
              if (updated) {
                // While update completed, do it again until no update available.
                applyUpdate(hmr, fallback);
              }
            })
            .catch((exception: Error) => {
              // Get status.
              const status = import.meta.webpackHot.status();

              // Update status.
              switch (status) {
                case 'fail':
                case 'abort':
                  setStatus(status);
                default:
                  setStatus('fail');
              }

              // Cache error.
              error = exception;

              // Call fallback.
              fallback(error);
            });
          break;
        case 'fail':
        case 'abort':
          // Call fallback.
          fallback(error);
          break;
      }
    } else {
      // HMR disabled.
      fallback();
    }
  }
}
