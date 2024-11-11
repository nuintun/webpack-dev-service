/**
 * @module index
 */

import { Middleware } from 'koa';
import { schema } from './schema';
import { compose } from './compose';
import { PLUGIN_NAME } from './utils';
import { validate } from 'schema-utils';
import { UnionCompiler } from './interface';
import { hot, Options as HotOptions } from './hot';
import { dev, Expose, Options as DevOptions } from './dev';

export type Options = DevOptions & { hot?: HotOptions | false };
/**
 * @function server
 * @description Create koa dev server middleware.
 * @param compiler The rspack compiler instance.
 * @param options Options.
 */
export default function server(compiler: UnionCompiler, options: Options = {}): Middleware & Expose {
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
