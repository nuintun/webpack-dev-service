/**
 * @module setupWatching
 */

import { IWatching } from '/server/interface';
import { isMultiCompiler } from '/server/utils';
import { ErrorCallback, InitialContext } from '/server/dev/interface';

function getWatching({ compiler, logger }: InitialContext): IWatching {
  const isMulti = isMultiCompiler(compiler);

  if (!isMulti && compiler.watching) {
    return compiler.watching;
  }

  const errorHandler: ErrorCallback = error => {
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
