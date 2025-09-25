/**
 * @module index
 */

import { Middleware } from 'koa';
import { Socket } from './Socket';
import { Options } from './interface';
import { UnionCompiler } from '/server/interface';

export { Options };

export function hot(compiler: UnionCompiler, options?: Options): Middleware {
  const socket = new Socket(compiler, options);

  // Middleware.
  return async (context, next) => {
    if (!socket.upgrade(context)) {
      await next();
    }
  };
}
