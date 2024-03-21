/**
 * @module interface
 */

import { createReadStream } from 'fs';
import { Compiler, Configuration, MultiCompiler, MultiStats, Stats, Watching } from 'webpack';

type IOutputFileSystem = NonNullable<Compiler['outputFileSystem']>;

export type Callback = (stats: Stats | MultiStats | null) => void;

export interface OutputFileSystem extends IOutputFileSystem {
  createReadStream: typeof createReadStream;
}

export interface FilesOptions {
  etag?: boolean;
  fs: OutputFileSystem;
  cacheControl?: string;
  acceptRanges?: boolean;
  lastModified?: boolean;
}

export interface Options extends Omit<FilesOptions, 'fs'> {
  index?: string | boolean;
  serverSideRender?: boolean;
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
  logger: Context['logger'];
  ready(callback: Callback): void;
  invalidate(callback: Callback): void;
  close(callback: (error?: Error | null) => void): void;
}

export type InitialContext = Optional<Context, 'watching' | 'outputFileSystem'>;
