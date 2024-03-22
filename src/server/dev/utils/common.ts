/**
 * @module common
 */

import { Stats } from 'fs';
import { isAbsolute, relative } from 'path';
import { Compiler, MultiCompiler } from 'webpack';
import { OutputFileSystem } from '/server/dev/interface';

const { toString } = Object.prototype;

export const PLUGIN_NAME = 'webpack-dev-service';

/**
 * @function unixify
 * @description Convert path to unix style.
 * @param path The path to convert.
 */
export function unixify(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * @function decodeURI
 * @description Decode URI component.
 * @param URI The URI to decode.
 */
export function decodeURI(URI: string): string | -1 {
  try {
    return decodeURIComponent(URI);
  } catch {
    return -1;
  }
}

/**
 * @function hasTrailingSlash
 * @description Check if path has trailing slash.
 * @param path The path to check.
 */
export function hasTrailingSlash(path: string): boolean {
  return /\/$/.test(path);
}

export function isString(value: unknown): value is string {
  return toString.call(value) === '[object String]';
}

export function isBoolean(value: unknown): value is boolean {
  return toString.call(value) === '[object Boolean]';
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * @function isOutRoot
 * @description Check if path is out of root.
 * @param path The path to check.
 * @param root The root path.
 */
export function isOutRoot(path: string, root: string): boolean {
  path = relative(root, path);

  return /\.\.(?:[\\/]|$)/.test(path) || isAbsolute(path);
}

export function getCompilers(compiler: Compiler | MultiCompiler): Compiler[] {
  if (isMultiCompilerMode(compiler)) {
    return compiler.compilers;
  }

  return [compiler];
}

/**
 * @function fstat
 * @description Get file stats.
 * @param path The file path.
 */
export function fstat(fs: OutputFileSystem, path: string): Promise<Stats | undefined> {
  return new Promise((resolve, reject): void => {
    fs.stat(path, (error, stats): void => {
      error ? reject(error) : resolve(stats);
    });
  });
}

export function isMultiCompilerMode(compiler: Compiler | MultiCompiler): compiler is MultiCompiler {
  return 'compilers' in compiler;
}
