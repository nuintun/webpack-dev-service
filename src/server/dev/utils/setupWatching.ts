/**
 * @module setupWatching
 */

import { isMultiCompilerMode } from './common';
import { Context, InitialContext } from '/server/dev/interface';

function getWatching({ compiler, logger }: InitialContext): Context['watching'] {
  const isMulti = isMultiCompilerMode(compiler);

  if (!isMulti && compiler.watching) {
    return compiler.watching;
  }

  const errorHandler = (error: Error | null) => {
    if (error) {
      // For example - `writeToDisk` can throw an error and right now it is ends watching.
      // We can improve that and keep watching active, but it is require API on webpack side.
      // Let's implement that in webpack@5 because it is rare case.
      logger.error(error);
    }
  };

  if (!isMulti) {
    const { watchOptions } = compiler.options;

    return compiler.watch(watchOptions, errorHandler);
  }

  const watchOptions = compiler.compilers.map(({ options }) => {
    return options.watchOptions;
  });

  return compiler.watch(watchOptions, errorHandler);
}

export function setupWatching(context: InitialContext): void {
  context.watching = getWatching(context);
}
