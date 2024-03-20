/**
 * @module setupOutputFileSystem
 */

import { Compiler } from 'webpack';
import { getCompilers } from './common';
import { createFsFromVolume, Volume } from 'memfs';
import { Context, OutputFileSystem } from '/server/interface';

const { hasOwnProperty } = Object.prototype;

function getOutputFileSystem({ options, compiler }: Context): OutputFileSystem {
  if (options.outputFileSystem) {
    return options.outputFileSystem;
  }

  if (options.writeToDisk !== true) {
    return createFsFromVolume(new Volume());
  }

  if (compiler instanceof Compiler) {
    return compiler.outputFileSystem;
  }

  const { compilers } = compiler;

  for (const compiler of compilers) {
    if (hasOwnProperty.call(compiler, 'devServer')) {
      return compiler.outputFileSystem;
    }
  }

  return compilers[0].outputFileSystem;
}

export function setupOutputFileSystem(context: Context): void {
  const compilers = getCompilers(context.compiler);
  const outputFileSystem = getOutputFileSystem(context);

  for (const compiler of compilers) {
    compiler.outputFileSystem = outputFileSystem;
  }

  context.outputFileSystem = outputFileSystem;
}
