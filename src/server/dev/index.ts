/**
 * @module index
 */

import { Middleware } from 'koa';
import { ready } from './utils/ready';
import { middleware } from './middleware';
import { PLUGIN_NAME } from '/server/utils';
import { ICompiler } from '/server/interface';
import { setupHooks } from './utils/setupHooks';
import { setupWatching } from './utils/setupWatching';
import { setupWriteToDisk } from './utils/setupWriteToDisk';
import { setupOutputFileSystem } from './utils/setupOutputFileSystem';
import { Context, Expose, InitialContext, Options } from './interface';

export { Expose, Options };

function setup(compiler: ICompiler, options: Options): Context {
  const context: InitialContext = {
    options,
    compiler,
    stats: null,
    callbacks: [],
    logger: compiler.getInfrastructureLogger(PLUGIN_NAME)
  };

  setupHooks(context);

  if (options.writeToDisk) {
    setupWriteToDisk(context);
  }

  setupOutputFileSystem(context);

  setupWatching(context);

  return context as Context;
}

export function dev(compiler: ICompiler, options: Options = {}): Middleware & Expose {
  const context = setup(compiler, options);

  return Object.assign<Middleware, Expose>(middleware(context), {
    get state() {
      return !!context.stats;
    },
    get logger() {
      return context.logger;
    },
    ready(callback) {
      ready(context, callback);
    },
    close(callback) {
      context.watching.close(callback);
    },
    invalidate(callback) {
      context.watching.invalidate(callback);
    }
  });
}
