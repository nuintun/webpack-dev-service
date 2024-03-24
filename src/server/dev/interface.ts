/**
 * @module interface
 */

import { createReadStream, Stats as FileStats } from 'fs';
import { Compiler, Configuration, MultiCompiler, MultiStats, Stats, Watching } from 'webpack';

interface Headers {
  [key: string]: string | string[];
}

interface HeaderFunction {
  (path: string, stats: FileStats): Headers | void;
}

type IOutputFileSystem = NonNullable<Compiler['outputFileSystem']>;

export interface OutputFileSystem extends IOutputFileSystem {
  createReadStream: typeof createReadStream;
}

export interface FilesOptions {
  etag?: boolean;
  fs: OutputFileSystem;
  acceptRanges?: boolean;
  lastModified?: boolean;
  headers?: Headers | HeaderFunction;
}

export interface Callback {
  (stats: Stats | MultiStats): void;
}

export interface Context {
  state: boolean;
  options: Options;
  callbacks: Callback[];
  stats: Stats | MultiStats;
  compiler: Compiler | MultiCompiler;
  outputFileSystem: OutputFileSystem;
  logger: ReturnType<Compiler['getInfrastructureLogger']>;
  watching: Watching | ReturnType<MultiCompiler['watch']>;
}

export interface Options extends Omit<FilesOptions, 'fs'> {
  stats?: Configuration['stats'];
  outputFileSystem?: OutputFileSystem;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
}

export interface AdditionalMethods {
  isReady(): boolean;
  logger: Context['logger'];
  ready(callback: Callback): void;
  invalidate(callback: Callback): void;
  close(callback: (error?: Error | null) => void): void;
}

export type InitialContext = Optional<Context, 'stats' | 'watching' | 'outputFileSystem'>;
