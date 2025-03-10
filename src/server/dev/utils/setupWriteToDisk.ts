/**
 * @module setupWriteToDisk
 */

import webpack from 'webpack';
import { dirname } from 'node:path';
import { mkdir, writeFile } from 'node:fs';
import { GetProp } from '/server/interface';
import { InitialContext, Options } from '/server/dev/interface';
import { getCompilers, isFunction, PLUGIN_NAME } from '/server/utils';

function getCompilerName({ options: { name } }: webpack.Compiler): string {
  return `compiler ${name ? `${name}: ` : ''}`;
}

function isAllowWrite(targetPath: string, filter?: GetProp<Options, 'writeToDisk'>): boolean {
  return isFunction(filter) ? filter(targetPath) : filter === true;
}

export function setupWriteToDisk(context: InitialContext): void {
  const { logger, options } = context;
  const { writeToDisk: filter } = options;
  const compilers = getCompilers(context.compiler);

  for (const compiler of compilers) {
    compiler.hooks.assetEmitted.tapAsync(PLUGIN_NAME, (_file, { targetPath, content }, callback) => {
      if (!isAllowWrite(targetPath, filter)) {
        return callback();
      }

      const dir = dirname(targetPath);
      const name = getCompilerName(compiler);

      return mkdir(dir, { recursive: true }, error => {
        if (error != null) {
          logger.error(`${name}unable to write "${dir}" directory to disk:\n${error}`);

          return callback(error);
        }

        writeFile(targetPath, content, error => {
          if (error != null) {
            logger.error(`${name}unable to write "${targetPath}" asset to disk:\n${error}`);

            return callback(error);
          }

          logger.log(`${name}asset written to disk: "${targetPath}"`);

          return callback();
        });
      });
    });
  }
}
