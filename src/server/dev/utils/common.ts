/**
 * @module common
 */

import { Compiler, MultiCompiler } from 'webpack';

export const PLUGIN_NAME = 'webpack-dev-service';

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function getCompilers(compiler: Compiler | MultiCompiler): Compiler[] {
  if (isSingleCompilerMode(compiler)) {
    return [compiler];
  }

  return compiler.compilers;
}

export function isSingleCompilerMode(compiler: Compiler | MultiCompiler): compiler is Compiler {
  return compiler instanceof Compiler;
}
