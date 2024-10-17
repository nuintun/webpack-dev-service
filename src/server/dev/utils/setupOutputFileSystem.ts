/**
 * @module setupOutputFileSystem
 */

import { getCompilers } from '/server/utils';
import { InitialContext } from '/server/dev/interface';

export function setupOutputFileSystem(context: InitialContext): void {
  const { fs } = context.options;
  const compilers = getCompilers(context.compiler);

  for (const compiler of compilers) {
    compiler.outputFileSystem = fs;
  }
}
