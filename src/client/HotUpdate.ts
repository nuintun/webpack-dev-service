/**
 * @module HotUpdate
 */

export interface Fallback {
  (error?: Error): Promise<void> | void;
}

export class HotUpdate {
  #hmr: boolean;
  #fallback: Fallback;

  #pending = false;
  #hash = __webpack_hash__;
  #hot = import.meta.webpackHot;

  /**
   * @constructor
   * @param hmr Whether to enable HMR hot update.
   * @param fallback Fallback handler for update failures.
   */
  constructor(hmr = true, fallback: Fallback) {
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
  async performUpdate(): Promise<void> {
    if (this.#isUpdateAvailable()) {
      if (!this.#hmr || !this.#hot) {
        await this.#fallback();
      } else if (this.#hot.status() === 'idle') {
        try {
          const outdated = await this.#hot.check(true);

          if (this.#isUpdateAvailable()) {
            if (outdated == null || outdated.length <= 0) {
              await this.#fallback();
            }
          }
        } catch (error) {
          await this.#fallback(error as Error);
        }
      } else {
        this.#pending = true;
      }
    }
  }
}
