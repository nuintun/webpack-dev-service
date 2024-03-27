/**
 * @module interface
 */

import { StatsOptions } from 'webpack';
import { createReadStream, Stats as FileStats } from 'fs';
import { ICompiler, IFileSystem, ILogger, IStats, IStatsOptions, IWatching } from '/server/interface';

interface IgnoreFunction {
  (path: string): boolean;
}

interface Headers {
  [key: string]: string | string[];
}

interface HeaderFunction {
  (path: string, stats: FileStats): Headers | void;
}

export interface FileSystem extends IFileSystem {
  createReadStream: typeof createReadStream;
}

export interface FilesOptions {
  fs: FileSystem;
  etag?: boolean;
  acceptRanges?: boolean;
  lastModified?: boolean;
  ignore?: IgnoreFunction;
  headers?: Headers | HeaderFunction;
}

export interface Callback {
  (stats: IStats): void;
}

export interface ErrorCallback {
  (error?: Error | null): void;
}

export interface Context {
  fs: FileSystem;
  logger: ILogger;
  options: Options;
  compiler: ICompiler;
  watching: IWatching;
  stats: IStats | null;
  callbacks: Callback[];
}

export type InitialContext = Optional<Context, 'fs' | 'watching'>;

export interface Options extends Omit<FilesOptions, 'fs'> {
  fs?: FileSystem;
  stats?: IStatsOptions;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  onCompilerDone?(stats: IStats, statsOptions: Readonly<StatsOptions>): void;
}

export interface Expose {
  readonly state: boolean;
  readonly logger: ILogger;
  readonly ready: (callback: Callback) => void;
  readonly close: (callback: ErrorCallback) => void;
  readonly invalidate: (callback: ErrorCallback) => void;
}
