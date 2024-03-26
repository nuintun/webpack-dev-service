/**
 * @module interface
 */

import { createReadStream, Stats as FileStats } from 'fs';
import { Compiler, MultiCompiler, StatsOptions, Watching } from 'webpack';
import { ICompiler, ILogger, IStats, IStatsOptions } from '/server/interface';

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
  (stats: IStats): void;
}

export interface ErrorCallback {
  (error?: Error | null): void;
}

export interface Context {
  stats: IStats;
  state: boolean;
  logger: ILogger;
  options: Options;
  compiler: ICompiler;
  fs: OutputFileSystem;
  callbacks: Callback[];
  watching: Watching | ReturnType<MultiCompiler['watch']>;
}

export interface Options extends Omit<FilesOptions, 'fs'> {
  fs?: OutputFileSystem;
  stats?: IStatsOptions;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  onDone?(stats: IStats, statsOptions: Readonly<StatsOptions>): void;
}

export interface Expose {
  readonly state: boolean;
  readonly logger: ILogger;
  readonly ready: (callback: Callback) => void;
  readonly close: (callback: ErrorCallback) => void;
  readonly invalidate: (callback: ErrorCallback) => void;
}

export type InitialContext = Optional<Context, 'fs' | 'stats' | 'watching'>;
