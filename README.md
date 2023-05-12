# webpack-dev-service

<!-- prettier-ignore -->
> A koa 2 middleware for webpack development and hot reloading.
>
> [![NPM Version][npm-image]][npm-url]
> [![Download Status][download-image]][npm-url]
> [![Snyk Vulnerabilities][snyk-image]][snyk-url]
> [![License][license-image]][license-url]

## Usage

```js
import Koa from 'koa';
import path from 'path';
import memfs from 'memfs';
import webpack from 'webpack';
import koaCompress from 'koa-compress';
import devMiddleware from 'webpack-dev-service';

function createMemfs() {
  const volume = new memfs.Volume();
  const fs = memfs.createFsFromVolume(volume);

  fs.join = path.join.bind(path);

  return fs;
}

function httpError(error) {
  return /^(EOF|EPIPE|ECANCELED|ECONNRESET|ECONNABORTED)$/i.test(error.code);
}

const app = new Koa();
const fs = createMemfs();
const compiler = webpack({
  // Your webpack config
});

app.use(async (ctx, next) => {
  ctx.set({
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Credentials': 'true'
  });

  await next();
});

app.use(koaCompress({ br: false }));

const devServer = devMiddleware(compiler, {
  index: false,
  outputFileSystem: fs
});

app.use(devServer);

app.use(async ctx => {
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = fs.createReadStream('index.html');
});

app.on('error', error => {
  !httpError(error) && console.error(error);
});

app.listen(8000, () => {
  devServer.waitUntilValid(() => {
    const { logger } = devServer.context;

    logger.info(`server run at: \u001B[36mhttp://127.0.0.1:8000\u001B[0m`);
  });
});
```

[npm-image]: https://img.shields.io/npm/v/webpack-dev-service?style=flat-square
[npm-url]: https://www.npmjs.org/package/webpack-dev-service
[download-image]: https://img.shields.io/npm/dm/webpack-dev-service?style=flat-square
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/nuintun/webpack-dev-service?style=flat-square
[snyk-url]: https://snyk.io/test/github/nuintun/webpack-dev-service
[license-image]: https://img.shields.io/github/license/nuintun/webpack-dev-service?style=flat-square
[license-url]: https://github.com/nuintun/webpack-dev-service/blob/master/LICENSE
