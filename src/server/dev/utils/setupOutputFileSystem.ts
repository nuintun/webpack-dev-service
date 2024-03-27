/**
 * @module setupOutputFileSystem
 */

import { getCompilers } from '/server/utils';
import { FileSystem } from '/server/interface';
import { createFsFromVolume, Volume } from 'memfs';
import { InitialContext } from '/server/dev/interface';

function createMemfs(): FileSystem {
  const volume = new Volume();

  return createFsFromVolume(volume) as unknown as FileSystem;
}

export function setupOutputFileSystem(context: InitialContext): void {
  const { fs = createMemfs() } = context.options;
  const compilers = getCompilers(context.compiler);

  for (const compiler of compilers) {
    compiler.outputFileSystem = fs;
  }

  context.fs = fs;
}
