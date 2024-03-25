/**
 * @module interface
 */

import { Compiler, WebpackPluginInstance } from 'webpack';

export interface Options {
  hmr?: boolean;
  path?: string;
  wss?: boolean;
  reload?: boolean;
  overlay?: boolean;
  progress?: boolean;
}

export interface PluginFactory {
  (compiler: Compiler): WebpackPluginInstance;
}