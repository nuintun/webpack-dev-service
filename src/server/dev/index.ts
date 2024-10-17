/**
 * @module index
 */

import { Middleware } from 'koa';
import { ready } from './utils/ready';
import { createMemfs } from './utils/fs';
import { middleware } from './middleware';
import { PLUGIN_NAME } from '/server/utils';
import { setupHooks } from './utils/setupHooks';
import { UnionCompiler } from '/server/interface';
import { setupWatching } from './utils/setupWatching';
import { setupWriteToDisk } from './utils/setupWriteToDisk';
import { setupOutputFileSystem } from './utils/setupOutputFileSystem';
import { Context, Expose, InitialContext, Options } from './interface';

export { Expose, Options };

function setup(compiler: UnionCompiler, options: Options): Context {
  const context: InitialContext = {
    compiler,
    stats: null,
    callbacks: [],
    logger: compiler.getInfrastructureLogger(PLUGIN_NAME),
    options: { fs: createMemfs(), highWaterMark: 65536, ...options }
  };

  setupHooks(context);

  if (options.writeToDisk) {
    setupWriteToDisk(context);
  }

  setupOutputFileSystem(context);

  setupWatching(context);

  return context as Context;
}

export function dev(compiler: UnionCompiler, options: Options): Middleware & Expose {
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
