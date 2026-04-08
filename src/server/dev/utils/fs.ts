/**
 * @module fs
 */

import webpack from 'webpack';
import { PathLike, Stats } from 'node:fs';
import { createFsFromVolume, Volume } from 'memfs';

type Position = number | bigint | null;

type OpenMode = string | number | undefined;

interface Callback<T extends unknown[] = []> {
  (error?: Error | null, ...rest: T): void;
}

export interface FileSystem extends webpack.OutputFileSystem {
  close(fd: number, callback?: Callback): void;
  read<T extends ArrayBufferView>(
    fd: number,
    buffer: T,
    offset: number,
    length: number,
    position: Position,
    callback: Callback<[bytesRead: number, buffer: T]>
  ): void;
  open(path: PathLike, flags: OpenMode, callback: Callback<[fd: number]>): void;
}

/**
 * @function createMemfs
 * @description Create memfs instance.
 */
export function createMemfs(): FileSystem {
  const volume = new Volume();

  return createFsFromVolume(volume) as FileSystem;
}

/**
 * @function stat
 * @description Get file stats.
 * @param fs The file system to used.
 * @param path The file path.
 */
export function stat(fs: FileSystem, path: string): Promise<Stats | null> {
  return new Promise(resolve => {
    fs.stat(path, (error, stats) => {
      resolve(error != null ? null : (stats ?? null));
    });
  });
}
