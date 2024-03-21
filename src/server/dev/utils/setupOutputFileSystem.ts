/**
 * @module setupOutputFileSystem
 */

import { createFsFromVolume, Volume } from 'memfs';
import { getCompilers, isMultiCompilerMode } from './common';
import { InitialContext, OutputFileSystem } from '/server/dev/interface';

type IOutputFileSystem = Optional<OutputFileSystem, 'createReadStream'>;

function createMemfs(): OutputFileSystem {
  const volume = new Volume();

  return createFsFromVolume(volume) as unknown as OutputFileSystem;
}

function getOutputFileSystem({ options, compiler }: InitialContext): IOutputFileSystem {
  if (options.outputFileSystem) {
    return options.outputFileSystem;
  }

  if (options.writeToDisk !== true) {
    return createMemfs();
  }

  if (isMultiCompilerMode(compiler)) {
    const { compilers } = compiler;

    for (const compiler of compilers) {
      if ('devServer' in compiler) {
        if (compiler.outputFileSystem) {
          return compiler.outputFileSystem;
        }
      }
    }

    if (compiler.outputFileSystem) {
      return compiler.outputFileSystem;
    }

    for (const compiler of compilers) {
      if (compiler.outputFileSystem) {
        return compiler.outputFileSystem;
      }
    }
  }

  return createMemfs();
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
