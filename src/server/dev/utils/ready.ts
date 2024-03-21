/**
 * @method ready
 */

import { ParameterizedContext } from 'koa';
import { Callback, Context } from '/server/dev/interface';

export function ready(context: Context, callback: Callback, request?: ParameterizedContext['request']): void {
  if (context.state) {
    callback(context.stats);
  } else {
    context.callbacks.push(callback);

    const name = (request && request.url) || callback.name;

    context.logger.info(`wait until bundle finished${name ? `: ${name}` : ''}`);
  }
}
