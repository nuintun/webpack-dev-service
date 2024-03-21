/**
 * @module index
 */

import WebSocket from 'ws';
import { Middleware } from 'koa';
import { Compiler } from 'webpack';
import { Options, Socket } from './Socket';

export { Options };

export interface AdditionalMethods {
  clients(): Set<WebSocket>;
  broadcast<T>(clients: Set<WebSocket> | WebSocket[], action: string, payload: T): void;
}

export function hot(compiler: Compiler, options: Options = {}): Middleware & AdditionalMethods {
  const socket = new Socket(compiler, options);

  return Object.assign<Middleware, AdditionalMethods>(
    async (context, next) => {
      if (!socket.upgrade(context)) {
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
