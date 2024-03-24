/**
 * @module setupOutputFileSystem
 */

import { getCompilers } from '/server/utils';
import { createFsFromVolume, Volume } from 'memfs';
import { InitialContext, OutputFileSystem } from '/server/dev/interface';

function createMemfs(): OutputFileSystem {
  const volume = new Volume();

  return createFsFromVolume(volume) as unknown as OutputFileSystem;
}

export function setupOutputFileSystem(context: InitialContext): void {
  const compilers = getCompilers(context.compiler);
  const { outputFileSystem = createMemfs() } = context.options;

  for (const compiler of compilers) {
    compiler.outputFileSystem = outputFileSystem;
  }

  context.outputFileSystem = outputFileSystem;
}
