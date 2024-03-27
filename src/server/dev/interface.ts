/**
 * @module interface
 */

import { StatsOptions } from 'webpack';
import { Options as ServiceOptions, Service } from './Service';
import { FileSystem, ICompiler, ILogger, IStats, IStatsOptions, IWatching } from '/server/interface';

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

export interface Options extends Omit<ServiceOptions, 'fs'> {
  fs?: FileSystem;
  stats?: IStatsOptions;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  onCompilerDone?(stats: IStats, statsOptions: Readonly<StatsOptions>): void;
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
