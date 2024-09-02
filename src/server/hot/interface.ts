/**
 * @module interface
 */

import WebSocket from 'ws';
import webpack from 'webpack';

export interface Options {
  hmr?: boolean;
  path?: string;
  wss?: boolean;
  reload?: boolean;
  overlay?: boolean;
  progress?: boolean;
}

export interface PluginFactory {
  (compiler: webpack.Compiler): webpack.WebpackPluginInstance;
}

export interface Expose {
  readonly clients: () => Set<WebSocket>;
  readonly broadcast: <T>(clients: Set<WebSocket> | WebSocket[], action: string, payload: T) => void;
}
