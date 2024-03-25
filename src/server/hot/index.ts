/**
 * @module index
 */

import WebSocket from 'ws';
import { Middleware } from 'koa';
import { Socket } from './Socket';
import { Options } from './interface';
import { ICompiler } from '/server/interface';

export { Options };

export interface Expose {
  clients(): Set<WebSocket>;
  broadcast<T>(clients: Set<WebSocket> | WebSocket[], action: string, payload: T): void;
}

export function hot(compiler: ICompiler, options: Options = {}): Middleware & Expose {
  const socket = new Socket(compiler, options);

  return Object.assign<Middleware, Expose>(
    async (ctx, next) => {
      if (!socket.upgrade(ctx)) {
        await next();
      }
    },
    {
      clients() {
        return socket.clients();
      },
      broadcast(clients, action, payload) {
        socket.broadcast(clients, action, payload);
      }
    }
  );
}
