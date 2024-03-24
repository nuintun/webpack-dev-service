/**
 * @module index
 */

import { Middleware } from 'koa';
import { compose } from './compose';
import { ICompiler } from './interface';
import { AdditionalMethods as DevMethods, dev, Options as DevOptions } from './dev';
import { AdditionalMethods as HotMethods, hot, Options as HotOptions } from './hot';

type DisableHotOptions = DevOptions & { hot: false };
type EnableHotOptions = DevOptions & { hot?: HotOptions };

export type Options = EnableHotOptions | DisableHotOptions;
export type DisableHotMiddleware = Middleware & DevMethods;
export type EnableHotMiddleware = DisableHotMiddleware & HotMethods;

/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 */
export default function server(compiler: ICompiler): EnableHotMiddleware;
/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 * @param options Options.
 */
export default function server(compiler: ICompiler, options: DisableHotOptions): DisableHotMiddleware;
/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 * @param options Options.
 */
export default function server(compiler: ICompiler, options: EnableHotOptions): EnableHotMiddleware;
export default function server(compiler: ICompiler, options: Options = {}): EnableHotMiddleware | DisableHotMiddleware {
  const devMiddleware = dev(compiler, options);

  if (options.hot === false) {
    return devMiddleware;
  }

  const hotMiddleware = hot(compiler, options.hot);
  const middleware = compose(devMiddleware, hotMiddleware);

  return Object.assign(middleware, devMiddleware, hotMiddleware);
}
