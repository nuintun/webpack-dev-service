/**
 * @module common
 */

import { Compiler, MultiCompiler } from 'webpack';

const { toString } = Object.prototype;

export const PLUGIN_NAME = 'webpack-dev-service';

export function isString(value: unknown): value is string {
  return toString.call(value) === '[object String]';
}

export function isBoolean(value: unknown): value is boolean {
  return toString.call(value) === '[object Boolean]';
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function getCompilers(compiler: Compiler | MultiCompiler): Compiler[] {
  if (isMultiCompilerMode(compiler)) {
    return compiler.compilers;
  }

  return [compiler];
}

export function isMultiCompilerMode(compiler: Compiler | MultiCompiler): compiler is MultiCompiler {
  return 'compilers' in compiler;
}
