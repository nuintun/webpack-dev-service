/**
 * @module index
 */

import { Middleware } from 'koa';
import { compose } from './compose';
import { ICompiler } from './interface';
import { Expose as HotExpose, hot, Options as HotOptions } from './hot';
import { dev, Expose as DevExpose, Options as DevOptions } from './dev';

type DisableHotOptions = DevOptions & { hot: false };
type EnableHotOptions = DevOptions & { hot?: HotOptions };

export type DisableHotMiddleware = Middleware & DevExpose;
export type Options = EnableHotOptions | DisableHotOptions;
export type EnableHotMiddleware = DisableHotMiddleware & HotExpose;

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
export default function server(compiler: ICompiler, options: EnableHotOptions): EnableHotMiddleware;
/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 * @param options Options.
 */
export default function server(compiler: ICompiler, options: DisableHotOptions): DisableHotMiddleware;
export default function server(compiler: ICompiler, options: Options = {}): EnableHotMiddleware | DisableHotMiddleware {
  const { hot: hotOptions } = options;

  if (hotOptions === false) {
    return dev(compiler, options);
  }

  // Because dev overwrite compiler,
  // So hot must be called before dev.
  const hotMiddleware = hot(compiler, hotOptions);
  const devMiddleware = dev(compiler, options);
  const middleware = compose(devMiddleware, hotMiddleware);

  return Object.assign(middleware, devMiddleware, hotMiddleware);
}
