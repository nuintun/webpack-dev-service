/**
 * @module HotUpdate
 */

export class HotUpdate {
  #pending = false;
  #hash = __webpack_hash__;
  #hot = import.meta.webpackHot;

  #hmr: boolean;
  #fallback: (error?: Error) => void;

  /**
   * @constructor
   * @param hmr Whether to enable HMR hot update.
   * @param fallback Fallback handler for update failures.
   */
  constructor(hmr = true, fallback: (error?: Error) => void) {
    this.#hmr = hmr;
    this.#fallback = fallback;

    // Listen to status changes
    this.#hot?.addStatusHandler(async status => {
      if (this.#pending && status === 'idle') {
        this.#pending = false;

        await this.performUpdate();
      }
    });
  }

  /**
   * @method updateHash
   * @description Update hash value.
   * @param hash New hash value.
   */
  updateHash(hash: string): void {
    this.#hash = hash;
  }

  /**
   * @method #isUpdateAvailable
   * @description Check if new updates are available.
   */
  #isUpdateAvailable(): boolean {
    return this.#hash !== __webpack_hash__;
  }

  /**
   * @method performUpdate
   * @description Execute update strategy.
   */
  async performUpdate() {
    if (this.#isUpdateAvailable()) {
      if (!this.#hmr || !this.#hot) {
        return this.#fallback();
      }

      if (this.#hot.status() === 'idle') {
        try {
          const outdated = await this.#hot.check(true);

          if (outdated == null || outdated.length <= 0) {
            if (this.#isUpdateAvailable()) {
              this.#fallback();
            }
          }
        } catch (error) {
          this.#fallback(error as Error);
        }
      } else {
        this.#pending = true;
      }
    }
  }
}
