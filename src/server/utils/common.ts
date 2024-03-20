/**
 * @module common
 */

import { Compiler, MultiCompiler } from 'webpack';

export const MIDDLEWARE_NAME = 'webpack-dev-service';

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function getCompilers(compiler: Compiler | MultiCompiler): Compiler[] {
  if (compiler instanceof Compiler) {
    return [compiler];
  }

  return compiler.compilers;
}
