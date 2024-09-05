/**
 * @module interface
 */

import webpack from 'webpack';
import { FileSystem } from './utils/fs';
import { Options as ServiceOptions, Service } from './Service';
import { Optional, UnionCompiler, UnionLogger, UnionStats, UnionStatsOptions, UnionWatching } from '/server/interface';

export interface Callback {
  (stats: UnionStats): void;
}

export interface ErrorCallback {
  (error?: Error | null): void;
}

export interface Expose {
  readonly state: boolean;
  readonly logger: UnionLogger;
  readonly ready: (callback: Callback) => void;
  readonly close: (callback: ErrorCallback) => void;
  readonly invalidate: (callback: ErrorCallback) => void;
}

export interface Options extends Omit<ServiceOptions, 'fs'> {
  fs?: FileSystem;
  stats?: UnionStatsOptions;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  onCompilationDone?(stats: UnionStats, statsOptions: Readonly<webpack.StatsOptions>): void;
}

export type FileService = [publicPath: string, service: Service];

export interface Context {
  fs: FileSystem;
  options: Options;
  logger: UnionLogger;
  callbacks: Callback[];
  compiler: UnionCompiler;
  watching: UnionWatching;
  services?: FileService[];
  stats: UnionStats | null;
}

export type InitialContext = Optional<Context, 'fs' | 'watching'>;
