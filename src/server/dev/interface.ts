/**
 * @module interface
 */

import { Service } from './Service';
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

export interface ServiceOptions {
  fs: FileSystem;
  etag?: boolean;
  acceptRanges?: boolean;
  lastModified?: boolean;
  ignore?: IgnoreFunction;
  headers?: Headers | HeaderFunction;
}

export interface Options extends Omit<ServiceOptions, 'fs'> {
  fs?: FileSystem;
  stats?: IStatsOptions;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  onCompilerDone?(stats: IStats, statsOptions: Readonly<StatsOptions>): void;
}

export interface Callback {
  (stats: IStats): void;
}

export interface ErrorCallback {
  (error?: Error | null): void;
}

export interface Expose {
  readonly state: boolean;
  readonly logger: ILogger;
  readonly ready: (callback: Callback) => void;
  readonly close: (callback: ErrorCallback) => void;
  readonly invalidate: (callback: ErrorCallback) => void;
}

export type FileService = [publicPath: string, service: Service];

export interface Context {
  fs: FileSystem;
  logger: ILogger;
  options: Options;
  compiler: ICompiler;
  watching: IWatching;
  stats: IStats | null;
  callbacks: Callback[];
  services?: FileService[];
}

export type InitialContext = Optional<Context, 'fs' | 'watching'>;
