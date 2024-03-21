/**
 * @module common
 */

import { Stats } from 'fs';
import { isAbsolute, relative } from 'path';
import { Compiler, MultiCompiler } from 'webpack';
import { OutputFileSystem } from '/server/dev/interface';

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
  return !('compilers' in compiler);
}

const CHARS = Array.from('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

/**
 * @function isOutRoot
 * @description Check if path is out of root
 * @param path The path to check
 * @param root The root path
 */
export function isOutRoot(path: string, root: string): boolean {
  path = relative(root, path);

  return /\.\.(?:[\\/]|$)/.test(path) || isAbsolute(path);
}

/**
 * @function unixify
 * @description Convert path to unix style
 * @param path The path to convert
 */
export function unixify(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * @function decodeURI
 * @description Decode URI component
 * @param URI The URI to decode
 */
export function decodeURI(URI: string): string | -1 {
  try {
    return decodeURIComponent(URI);
  } catch (error) {
    return -1;
  }
}

/**
 * @function generateRangeBoundary
 * @description Generate a boundary
 */
export function generateRangeBoundary(): string {
  let boundary = '';

  // Create boundary
  for (let i = 0; i < 38; i++) {
    boundary += CHARS[Math.floor(Math.random() * 62)];
  }

  // Return boundary
  return boundary;
}

/**
 * @function fstat
 * @description Get file stats
 * @param path The file path
 */
export function fstat(fs: OutputFileSystem, path: string): Promise<Stats | undefined> {
  return new Promise((resolve, reject): void => {
    fs.stat(path, (error, stats): void => {
      error ? reject(error) : resolve(stats);
    });
  });
}

/**
 * @function hasTrailingSlash
 * @description Check if path has trailing slash
 * @param path The path to check
 */
export function hasTrailingSlash(path: string): boolean {
  return /\/$/.test(path);
}

/**
 * @function parseTokens
 * @description Parse HTTP tokens
 * @param value The tokens value string
 */
export function parseTokens(value: string): string[] {
  let end = 0;
  let start = 0;
  let tokens: string[] = [];

  // gather tokens
  for (let i = 0, length = value.length; i < length; i++) {
    switch (value.charCodeAt(i)) {
      case 0x20:
        // ' '
        if (start === end) {
          start = end = i + 1;
        }
        break;
      case 0x2c:
        // ','
        tokens.push(value.substring(start, end));
        start = end = i + 1;
        break;
      default:
        end = i + 1;
        break;
    }
  }

  // final token
  tokens.push(value.substring(start, end));

  return tokens;
}

/**
 * @function isETag
 * @description Check if etag is valid
 * @param value The value to check
 */
export function isETag(value: string): boolean {
  return /^(?:W\/)?"[\s\S]+"$/.test(value);
}

/**
 * @function isETagFresh
 * @description Check if etag is fresh
 * @param match The match value
 * @param etag The etag value
 */
export function isETagFresh(match: string, etag: string): boolean {
  return parseTokens(match).some(match => {
    return match === etag || match === 'W/' + etag || 'W/' + match === etag;
  });
}
