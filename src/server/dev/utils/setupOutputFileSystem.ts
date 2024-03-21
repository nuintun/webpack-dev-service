/**
 * @module setupOutputFileSystem
 */

import { createFsFromVolume, Volume } from 'memfs';
import { getCompilers, isSingleCompilerMode } from './common';
import { InitialContext, OutputFileSystem } from '/server/dev/interface';

const { hasOwnProperty } = Object.prototype;

type IOutputFileSystem = Optional<OutputFileSystem, 'createReadStream'>;

function createMemfs(): OutputFileSystem {
  const volume = new Volume();

  return createFsFromVolume(volume) as OutputFileSystem;
}

function getOutputFileSystem({ options, compiler }: InitialContext): IOutputFileSystem {
  if (options.outputFileSystem) {
    return options.outputFileSystem;
  }

  if (options.writeToDisk !== true) {
    return createMemfs();
  }

  if (isSingleCompilerMode(compiler)) {
    return compiler.outputFileSystem || createMemfs();
  }

  const { compilers } = compiler;

  for (const compiler of compilers) {
    if (hasOwnProperty.call(compiler, 'devServer')) {
      return compiler.outputFileSystem || createMemfs();
    }
  }

  return compiler.outputFileSystem || compilers[0].outputFileSystem || createMemfs();
}

function supportReadStream(outputFileSystem: IOutputFileSystem): outputFileSystem is OutputFileSystem {
  return typeof outputFileSystem.createReadStream === 'function';
}

export function setupOutputFileSystem(context: InitialContext): void {
  const compilers = getCompilers(context.compiler);
  const outputFileSystem = getOutputFileSystem(context);

  if (!supportReadStream(outputFileSystem)) {
    throw new Error('Compiler outputFileSystem must support createReadStream');
  }

  for (const compiler of compilers) {
    compiler.outputFileSystem = outputFileSystem;
  }

  context.outputFileSystem = outputFileSystem;
}
