/**
 * @module index
 */

import { Middleware } from 'koa';
import { Socket } from './Socket';
import { Expose, Options } from './interface';
import { UnionCompiler } from '/server/interface';

export { Expose, Options };

export function hot(compiler: UnionCompiler, options?: Options): Middleware & Expose {
  const socket = new Socket(compiler, options);
  const middleware: Middleware = async (ctx, next) => {
    if (!socket.upgrade(ctx)) {
      await next();
    }
  };

  return Object.assign<Middleware, Expose>(middleware, {
    clients() {
      return socket.clients();
    },
    broadcast(clients, action, payload) {
      socket.broadcast(clients, action, payload);
    }
  });
}
