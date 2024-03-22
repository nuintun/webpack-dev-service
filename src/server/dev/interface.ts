/**
 * @module interface
 */

import { createReadStream, Stats as FileStats } from 'fs';
import { Compiler, Configuration, MultiCompiler, MultiStats, Stats, Watching } from 'webpack';

type IOutputFileSystem = NonNullable<Compiler['outputFileSystem']>;

interface HeaderFunction {
  (path: string, stats: FileStats): Record<string, string | string[]>;
}

export interface OutputFileSystem extends IOutputFileSystem {
  createReadStream: typeof createReadStream;
}

export type Callback = (stats: Stats | MultiStats | null) => void;

export interface FilesOptions {
  etag?: boolean;
  fs: OutputFileSystem;
  cacheControl?: string;
  acceptRanges?: boolean;
  lastModified?: boolean;
  headers?: HeaderFunction | Record<string, string | string[]>;
}

export interface Options extends Omit<FilesOptions, 'fs'> {
  stats?: Configuration['stats'];
  outputFileSystem?: OutputFileSystem;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  publicPath?: NonNullable<Configuration['output']>['publicPath'];
}

export interface Context {
  state: boolean;
  options: Options;
  callbacks: Callback[];
  stats: Stats | MultiStats | null;
  compiler: Compiler | MultiCompiler;
  outputFileSystem: OutputFileSystem;
  logger: ReturnType<Compiler['getInfrastructureLogger']>;
  watching: Watching | ReturnType<MultiCompiler['watch']>;
}

export interface AdditionalMethods {
  isReady(): boolean;
  logger: Context['logger'];
  ready(callback: Callback): void;
  invalidate(callback: Callback): void;
  close(callback: (error?: Error | null) => void): void;
}

export type InitialContext = Optional<Context, 'watching' | 'outputFileSystem'>;
