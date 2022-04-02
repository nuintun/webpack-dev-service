/**
 * @module hot
 */

// Reload location.
export function reload() {
  return window.location.reload();
}

// Is there a newer version of this code available?
export function isUpdateAvailable(hash) {
  /* globals __webpack_hash__ */
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by webpack.
  return hash !== __webpack_hash__;
}

// Is last update failed.
export function isLastUpdateFailed() {
  const status = module.hot.status();

  return status === 'fail' || status === 'abort';
}

// Attempt to update code on the fly, fall back to a hard reload.
export function attemptUpdates(hash, hmr, onHotUpdateSuccess) {
  // HMR not enabled.
  if (!hmr || !module.hot) return reload();

  // Update available and can apply updates.
  if (isUpdateAvailable(hash)) {
    switch (module.hot.status()) {
      case 'idle':
        return module.hot
          .check(false)
          .then(updatedModules => {
            // When updatedModules is unavailable,
            // it indicates a critical failure in hot-reloading,
            // e.g. server is not ready to serve new bundle,
            // and hence we need to do a forced reload.
            if (!updatedModules) return reload();

            // Apply updates.
            return module.hot.apply({ ignoreErrored: true }).then(() => {
              // While we were updating, there was a new update! Do it again.
              if (isUpdateAvailable(hash)) {
                return attemptUpdates(hash, hmr, onHotUpdateSuccess);
              }

              // Hot update success.
              if (typeof onHotUpdateSuccess === 'function') {
                // Maybe we want to do something.
                return onHotUpdateSuccess();
              }
            });
          })
          .catch(() => {
            attemptUpdates(hash, hmr, onHotUpdateSuccess);
          });
      case 'fail':
      case 'abort':
        return reload();
    }
  }
}
