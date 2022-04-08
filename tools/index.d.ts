/// <reference types="node" />
/// <reference types="koa" />
/// <reference types="ws" />
declare module 'dev' {
  /**
   * @module dev
   */
  import { AdditionalMethods, ExtendedServerResponse, IncomingMessage, Options as DevOptions } from 'webpack-dev-middleware';
  import { Middleware } from 'koa';
  import { Compiler } from 'webpack';
  import { ServerResponse } from 'http';
  export interface OutgoingMessage extends ServerResponse, ExtendedServerResponse {
    send(body: any): void;
    get(field: string): string;
    status(statusCode: number): void;
    set(field: string, value: string): void;
  }
  export type Options = DevOptions<IncomingMessage, OutgoingMessage>;
  export type Extensions = AdditionalMethods<IncomingMessage, OutgoingMessage>;
  export default function dev(compiler: Compiler, options: Options): Middleware & Extensions;
}
declare module 'hot' {
  import { Middleware } from 'koa';
  import WebSocket from 'ws';
  import { Compiler } from 'webpack';
  export interface Options {
    hmr?: boolean;
    path?: string;
    progress?: boolean;
  }
  export type Extensions = {
    clients(): Set<WebSocket>;
    broadcast<T>(clients: Set<WebSocket> | WebSocket[], action: string, payload: T): void;
  };
  export default function hot(compiler: Compiler, options?: Options): Middleware & Extensions;
}
declare module 'index' {
  /**
   * @module index
   */
  import { Middleware } from 'koa';
  import { Compiler } from 'webpack';
  import { Extensions as DevExtensions, Options as DevOptions } from 'dev';
  import { Extensions as HotExtensions, Options as HotOptions } from 'hot';
  export type Options = DevOptions & {
    hot?: false | HotOptions;
  };
  export type BaseMiddleware = Middleware & DevExtensions;
  export type ExtendMiddleware = BaseMiddleware & HotExtensions;
  export default function server(compiler: Compiler): ExtendMiddleware;
  export default function server(compiler: Compiler, options?: Options): ExtendMiddleware;
  export default function server(
    compiler: Compiler,
    options?: Options & {
      hot: false;
    }
  ): BaseMiddleware;
}
