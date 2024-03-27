/**
 * @module ready
 */

import { Callback, Context } from '/server/dev/interface';

export function ready({ stats, callbacks }: Context, callback: Callback): void {
  if (stats) {
    callback(stats);
  } else {
    callbacks.push(callback);
  }
}
