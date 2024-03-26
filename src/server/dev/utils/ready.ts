/**
 * @module ready
 */

import { Callback, Context } from '/server/dev/interface';

export function ready(context: Context, callback: Callback, name?: string): void {
  if (context.state) {
    callback(context.stats);
  } else {
    context.callbacks.push(callback);

    if (name) {
      context.logger.info(`wait until bundle finished: ${name}`);
    }
  }
}
