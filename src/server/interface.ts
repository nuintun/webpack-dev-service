/**
 * @module interface
 */

// import { createReadStream, lstat, readFileSync, statSync } from 'fs';
import { Compiler, Configuration, MultiCompiler, MultiStats, Stats, Watching } from 'webpack';

// export interface OutputFileSystem extends NonNullable<Compiler['outputFileSystem']> {
//   lstat?: typeof lstat;
//   statSync?: typeof statSync;
//   readFileSync?: typeof readFileSync;
//   createReadStream?: typeof createReadStream;
// }

export type Callback = (stats?: Stats | MultiStats) => void;

export type OutputFileSystem = NonNullable<Compiler['outputFileSystem']>;

export interface Options {
  methods?: string[];
  index?: string | boolean;
  mimeTypeDefault?: string;
  serverSideRender?: boolean;
  stats?: Configuration['stats'];
  mimeTypes?: Record<string, string>;
  outputFileSystem?: OutputFileSystem;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  publicPath?: NonNullable<Configuration['output']>['publicPath'];
}

export interface Context {
  state: boolean;
  options: Options;
  watching: Watching;
  callbacks: Callback[];
  stats?: Stats | MultiStats;
  compiler: Compiler | MultiCompiler;
  outputFileSystem: OutputFileSystem;
  logger: ReturnType<Compiler['getInfrastructureLogger']>;
}
