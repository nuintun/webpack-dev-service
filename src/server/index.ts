/**
 * @module index
 */

import { Middleware } from 'koa';
import compose from 'koa-compose';
import { Compiler } from 'webpack';
import dev, { Instance as DevInstance, Options as DevOptions } from './dev';
import hot, { Instance as HotInstance, Options as HotOptions } from './hot';

type DisableHotOptions = DevOptions & { hot: false };
type EnableHotOptions = DevOptions & { hot?: HotOptions };

export type Options = EnableHotOptions | DisableHotOptions;
export type DisableHotMiddleware = Middleware & DevInstance;
export type EnableHotMiddleware = DisableHotMiddleware & HotInstance;

/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 */
export default function server(compiler: Compiler): EnableHotMiddleware;
/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 * @param options Options.
 */
export default function server(compiler: Compiler, options: DisableHotOptions): DisableHotMiddleware;
/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 * @param options Options.
 */
export default function server(compiler: Compiler, options: EnableHotOptions): EnableHotMiddleware;
export default function server(compiler: Compiler, options: Options = {}): EnableHotMiddleware | DisableHotMiddleware {
  const { hot: hotOptions, ...devOptions } = options;

  const devMiddleware = dev(compiler, devOptions);

  if (hotOptions === false) return devMiddleware;

  const hotMiddleware = hot(compiler, hotOptions);

  return Object.assign(compose([devMiddleware, hotMiddleware]), devMiddleware, hotMiddleware);
}
