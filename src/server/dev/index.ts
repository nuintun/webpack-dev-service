/**
 * @module index
 */

import { Middleware } from 'koa';
import { createMemfs } from './utils/fs';
import { middleware } from './middleware';
import { setupHooks } from './utils/setupHooks';
import { UnionCompiler } from '/server/interface';
import { setupWatching } from './utils/setupWatching';
import { setupWriteToDisk } from './utils/setupWriteToDisk';
import { assertPublicPath, PLUGIN_NAME } from '/server/utils';
import { setupOutputFileSystem } from './utils/setupOutputFileSystem';
import { Context, Expose, InitialContext, Options } from './interface';

export { Expose, Options };

function setup(compiler: UnionCompiler, options: Options): Context {
  assertPublicPath(compiler);

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

export async function dev(compiler: UnionCompiler, options: Options): Promise<Middleware & Expose> {
  const context = setup(compiler, options);

  return Object.assign<Middleware, Expose>(await middleware(context), {
    get logger() {
      return context.logger;
    },
    close(callback) {
      context.watching?.close(callback);
    },
    invalidate(callback) {
      context.watching?.invalidate(callback);
    }
  });
}
