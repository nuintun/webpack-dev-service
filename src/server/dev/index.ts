/**
 * @module index
 */

import { Middleware } from 'koa';
import { ready } from './utils/ready';
import { middleware } from './middleware';
import { PLUGIN_NAME } from './utils/common';
import { setupHooks } from './utils/setupHooks';
import { Compiler, MultiCompiler } from 'webpack';
import { setupWatching } from './utils/setupWatching';
import { setupWriteToDisk } from './utils/setupWriteToDisk';
import { setupOutputFileSystem } from './utils/setupOutputFileSystem';
import { AdditionalMethods, Context, InitialContext, Options } from './interface';

export { AdditionalMethods, Options };

function setup(compiler: Compiler | MultiCompiler, options: Options): Context {
  const context: InitialContext = {
    options,
    compiler,
    stats: null,
    state: false,
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

export function dev(compiler: Compiler, options: Options = {}): Middleware & AdditionalMethods {
  const context = setup(compiler, options);

  return Object.assign<Middleware, AdditionalMethods>(middleware(context), {
    get logger() {
      return context.logger;
    },
    ready(callback) {
      ready(context, callback);
    },
    invalidate(callback) {
      ready(context, callback);

      context.watching.invalidate();
    },
    close(callback) {
      context.watching.close(callback);
    }
  });
}
