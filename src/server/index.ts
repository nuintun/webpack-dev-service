/**
 * @module index
 */

import { Middleware } from 'koa';
import { schema } from './schema';
import { compose } from './compose';
import { PLUGIN_NAME } from './utils';
import { validate } from 'schema-utils';
import { UnionCompiler } from './interface';
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
export default function server(compiler: UnionCompiler): EnableHotMiddleware;
/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 * @param options Options.
 */
export default function server(compiler: UnionCompiler, options: EnableHotOptions): EnableHotMiddleware;
/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The webpack compiler instance.
 * @param options Options.
 */
export default function server(compiler: UnionCompiler, options: DisableHotOptions): DisableHotMiddleware;
export default function server(compiler: UnionCompiler, options: Options = {}): EnableHotMiddleware | DisableHotMiddleware {
  validate(schema, options, {
    name: PLUGIN_NAME,
    baseDataPath: 'options'
  });

  const { hot: hotOptions } = options;

  if (hotOptions === false) {
    return dev(compiler, options);
  }

  // All plugins must be initialized before watching.
  // Because dev will start watching, so call hot before dev.
  const hotMiddleware = hot(compiler, hotOptions);
  const devMiddleware = dev(compiler, options);
  const middleware = compose(devMiddleware, hotMiddleware);

  return Object.assign(middleware, devMiddleware, hotMiddleware);
}
