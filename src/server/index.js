/**
 * @module index
 * @license MIT
 * @author nuintun
 * @description Webpack dev and hot middleware for koa2
 */

import dev from './dev';
import hmr from './hmr';
import compose from 'koa-compose';

export default function server(compiler, options) {
  const { hmr: hmrOptions, ...devOptions } = options;

  return compose([dev(compiler, devOptions), hmr(compiler, hmrOptions)]);
}
