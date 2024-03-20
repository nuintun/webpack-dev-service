/**
 * @module setupWriteToDisk
 */

import { dirname } from 'path';
import { Compiler } from 'webpack';
import { mkdir, writeFile } from 'fs';
import { Context, Options } from '/server/interface';
import { getCompilers, isFunction, MIDDLEWARE_NAME } from './common';

const assetEmitted = Symbol('assetEmitted');

function getCompilerName({ options: { name } }: Compiler): string {
  return name ? `Child "${name}": ` : '';
}

function isAllowWrite(targetPath: string, filter?: Options['writeToDisk']): boolean {
  return filter && isFunction(filter) ? filter(targetPath) : true;
}

export function setupWriteToDisk(context: Context): void {
  const { logger, options } = context;
  const { writeToDisk: filter } = options;
  const compilers = getCompilers(context.compiler);

  for (const compiler of compilers) {
    compiler.hooks.emit.tap(MIDDLEWARE_NAME, () => {
      if (!compiler[assetEmitted]) {
        compiler.hooks.assetEmitted.tapAsync(MIDDLEWARE_NAME, (_file, { targetPath, content }, callback) => {
          if (!isAllowWrite(targetPath, filter)) {
            return callback();
          }

          const dir = dirname(targetPath);
          const name = getCompilerName(compiler);

          return mkdir(dir, { recursive: true }, mkdirError => {
            if (mkdirError) {
              logger.error(`${name}Unable to write "${dir}" directory to disk:\n${mkdirError}`);

              return callback(mkdirError);
            }

            writeFile(targetPath, content, writeFileError => {
              if (writeFileError) {
                logger.error(`${name}Unable to write "${targetPath}" asset to disk:\n${writeFileError}`);

                return callback(writeFileError);
              }

              logger.log(`${name}Asset written to disk: "${targetPath}"`);

              return callback();
            });
          });
        });

        // Set asset emitted to true
        compiler[assetEmitted] = true;
      }
    });
  }
}
