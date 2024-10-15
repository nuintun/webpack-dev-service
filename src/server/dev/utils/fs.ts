/**
 * @module fs
 */

import webpack from 'webpack';
import fs, { Stats } from 'node:fs';
import { GetProp } from '/server/interface';

type Compiler = webpack.Compiler;

type FileStats = Stats | null | undefined;

export interface FileSystem extends GetProp<Compiler, 'outputFileSystem'> {
  open: typeof fs.open;
  read: typeof fs.read;
  close: typeof fs.close;
}

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
