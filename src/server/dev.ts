/**
 * @module dev
 */

import webpackDevMiddleware, {
  AdditionalMethods,
  ExtendedServerResponse,
  IncomingMessage,
  Options as DevOptions
} from 'webpack-dev-middleware';
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

export type Instance = AdditionalMethods<IncomingMessage, OutgoingMessage>;

export default function dev(compiler: Compiler, options: Options): Middleware & Instance {
  const middleware = webpackDevMiddleware<IncomingMessage, OutgoingMessage>(compiler, options);

  const devMiddleware: Middleware = async (context, next) => {
    context.remove('Content-Type');

    await middleware(
      context.req,
      {
        locals: context.state,
        send(body) {
          context.body = body;
        },
        status(statusCode) {
          context.status = statusCode;
        },
        set(field, value) {
          context.response.set(field, value);
        },
        get(field) {
          return context.response.get(field);
        }
      } as OutgoingMessage,
      next
    );
  };

  return Object.assign(devMiddleware, middleware);
}
