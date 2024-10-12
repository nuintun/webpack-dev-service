/**
 * @module fs
 */

import webpack from 'webpack';
import { GetProp } from '/server/interface';
import { ReadStream, Stats } from 'node:fs';

type PathLike = string | Buffer | URL;

type FileStats = Stats | null | undefined;

type OutputFileSystem = GetProp<webpack.Compiler, 'outputFileSystem'>;

/**
 * @function stat
 * @description Get file stats.
 * @param fs The file system to used.
 * @param path The file path.
 */
export function stat(fs: FileSystem, path: string): Promise<FileStats> {
  return new Promise(resolve => {
    fs.stat(path, (error, stats) => {
      resolve(error ? null : stats);
    });
  });
}

export interface FileSystem extends OutputFileSystem {
  createReadStream(path: PathLike, options?: { start?: number; end?: number }): ReadStream;
}
