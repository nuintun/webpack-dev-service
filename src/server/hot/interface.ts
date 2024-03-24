/**
 * @module interface
 */

import { Compiler, WebpackPluginInstance } from 'webpack';

export interface Options {
  wss?: boolean;
  hmr?: boolean;
  path?: string;
  live?: boolean;
  overlay?: boolean;
  progress?: boolean;
}

export interface PluginFactory {
  (compiler: Compiler): WebpackPluginInstance;
}
