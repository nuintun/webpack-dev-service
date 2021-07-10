/**
 * @module index
 * @license MIT
 * @author nuintun
 * @description Webpack dev and hot middleware for koa2
 */

import dev from './dev';
import hmr from './hmr';
import compose from 'koa-compose';

function miscAssign(from, to) {
  for (const [prop, value] of Object.entries(from)) {
    to[prop] = value;
  }
}

export default function server(compiler, options = {}) {
  const devMiddleware = dev(compiler, options);

  if (options.hot === false) return devMiddleware;

  const hmrMiddleware = hmr(compiler, options.hot);
  const composeMiddleware = compose([devMiddleware, hmrMiddleware]);

  miscAssign(devMiddleware, composeMiddleware);
  miscAssign(hmrMiddleware, composeMiddleware);

  return composeMiddleware;
}
