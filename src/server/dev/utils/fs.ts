/**
 * @module fs
 */

import { Compiler } from 'webpack';
import { ReadStream, Stats } from 'fs';

type PathLike = string | Buffer | URL;

type FileStats = Stats | null | undefined;

type IFileSystem = NonNullable<Compiler['outputFileSystem']>;

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

export interface FileSystem extends IFileSystem {
  createReadStream(path: PathLike, options?: { start?: number; end?: number }): ReadStream;
}
