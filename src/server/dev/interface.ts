/**
 * @module interface
 */

import webpack from 'webpack';
import { FileSystem } from './utils/fs';
import { Options as ServiceOptions, Service } from './Service';
import { Logger, Optional, StatsOptions, UnionCompiler, UnionStats, UnionWatching } from '/server/interface';

export interface Callback {
  (stats: UnionStats): void;
}

export interface ErrorCallback {
  (error?: Error | null): void;
}

export interface Expose {
  readonly logger: Logger;
  readonly state: boolean;
  readonly ready: (callback: Callback) => void;
  readonly close: (callback: ErrorCallback) => void;
  readonly invalidate: (callback: ErrorCallback) => void;
}

export interface Options extends Omit<ServiceOptions, 'fs'> {
  fs?: FileSystem;
  stats?: StatsOptions;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  onCompilationDone?(stats: UnionStats, statsOptions: Readonly<webpack.StatsOptions>): void;
}

export type FileService = [publicPath: string, service: Service];

export interface Context {
  fs: FileSystem;
  logger: Logger;
  options: Options;
  callbacks: Callback[];
  compiler: UnionCompiler;
  watching: UnionWatching;
  services?: FileService[];
  stats: UnionStats | null;
}

export type InitialContext = Optional<Context, 'fs' | 'watching'>;
