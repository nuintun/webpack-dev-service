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
  readonly close: (callback: ErrorCallback) => void;
  readonly invalidate: (callback: ErrorCallback) => void;
}

export type FileService = [publicPath: string, service: Service];

export interface Options extends Optional<ServiceOptions, 'fs'> {
  stats?: StatsOptions;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  onCompilationDone?: (stats: UnionStats, statsOptions: Readonly<webpack.StatsOptions>) => void;
}

export interface Context {
  logger: Logger;
  callbacks: Callback[];
  compiler: UnionCompiler;
  watching: UnionWatching;
  stats: UnionStats | null;
  options: Options & { fs: FileSystem };
}

export type InitialContext = Optional<Context, 'watching'>;
