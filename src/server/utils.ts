/**
 * @module utils
 */

import webpack from 'webpack';
import { UnionCompiler } from './interface';

const { toString } = Object.prototype;

export const PLUGIN_NAME = __PLUGIN_NAME__;

export function isString(value: unknown): value is string {
  return toString.call(value) === '[object String]';
}

export function isBoolean(value: unknown): value is boolean {
  return toString.call(value) === '[object Boolean]';
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function assertPublicPath(compiler: UnionCompiler): never | void {
  const compilers = getCompilers(compiler);

  for (const { options } of compilers) {
    if (isFunction(options.output.publicPath)) {
      throw new TypeError('function type public path is not supported');
    }
  }
}

export function getCompilers(compiler: UnionCompiler): webpack.Compiler[] {
  if (isMultiCompiler(compiler)) {
    return compiler.compilers;
  }

  return [compiler];
}

export function isMultiCompiler(compiler: UnionCompiler): compiler is webpack.MultiCompiler {
  return 'compilers' in compiler;
}
