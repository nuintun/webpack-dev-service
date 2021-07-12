/**
 * @module index
 * @license MIT
 * @author nuintun
 * @description Webpack dev and hot middleware for koa2
 */

import dev from './dev';
import hot from './hot';
import compose from 'koa-compose';

function assign(dest, ...sources) {
  for (const source of sources) {
    for (const [prop, value] of Object.entries(source)) {
      dest[prop] = value;
    }
  }

  return dest;
}

export default function server(compiler, { hot: hotOptions, ...devOptions } = {}) {
  const devMiddleware = dev(compiler, devOptions);

  if (hotOptions === false) return devMiddleware;

  const hotMiddleware = hot(compiler, hotOptions);

  return assign(compose([devMiddleware, hotMiddleware]), devMiddleware, hotMiddleware);
}
