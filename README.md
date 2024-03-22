# webpack-dev-service

<!-- prettier-ignore -->
> A koa 2 middleware for webpack development and hot reloading.
>
> [![NPM Version][npm-image]][npm-url]
> [![Download Status][download-image]][npm-url]
> [![Languages Status][languages-image]][github-url]
> [![Tree Shakeable][tree-shakeable-image]][bundle-phobia-url]
> [![Side Effect][side-effect-image]][bundle-phobia-url]
> [![License][license-image]][license-url]

### Usage

```js
/**
 * @module webpack
 * @description Webpack config
 */

import Koa from 'koa';
import path from 'path';
import memfs from 'memfs';
import webpack from 'webpack';
import dev from 'webpack-dev-service';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const progress = {
  percentBy: 'entries'
};

const entryHTML = path.resolve('public/index.html');

const html = {
  xhtml: true,
  minify: false,
  title: 'React',
  filename: entryHTML,
  templateParameters: { lang: 'en' },
  template: path.resolve('index.ejs'),
  favicon: path.resolve('src/logo.svg'),
  meta: { 'theme-color': '#4285f4', viewport: 'width=device-width,initial-scale=1.0' }
};

function createMemfs() {
  const volume = new memfs.Volume();
  const fs = memfs.createFsFromVolume(volume);

  fs.join = path.join.bind(path);

  return fs;
}

function httpError(error) {
  return /^(EOF|EPIPE|ECANCELED|ECONNRESET|ECONNABORTED)$/i.test(error.code);
}

const compiler = webpack({
  name: 'react',
  mode: 'development',
  context: path.resolve('src'),
  entry: [
    // Entry file
    path.resolve('src/index.jsx'),
    // Hot client
    'webpack-dev-service/client'
  ],
  output: {
    publicPath: '/public/',
    filename: `js/[name].js`,
    hashFunction: 'xxhash64',
    path: path.resolve('public'),
    chunkFilename: `js/[name].js`,
    assetModuleFilename: `[path][name][ext]`
  },
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    fallback: { url: false },
    extensions: ['.js', '.jsx']
  },
  watchOptions: {
    aggregateTimeout: 256
  },
  stats: {
    colors: true,
    chunks: false,
    children: false,
    entrypoints: false,
    runtimeModules: false,
    dependentModules: false
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        oneOf: [
          {
            test: /\.jsx?$/i,
            exclude: /[\\/]node_modules[\\/]/,
            use: [
              {
                loader: 'swc-loader',
                options: {
                  jsc: {
                    target: 'es2015',
                    externalHelpers: true,
                    parser: {
                      tsx: true,
                      syntax: 'typescript'
                    },
                    transform: {
                      react: {
                        runtime: 'automatic'
                      }
                    },
                    experimental: {
                      cacheRoot: path.resolve('node_modules/.cache/swc')
                    }
                  },
                  env: {
                    targets: ['defaults', 'not IE >= 0']
                  }
                }
              }
            ]
          },
          {
            test: /\.css$/i,
            exclude: /[\\/]node_modules[\\/]/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader
              },
              {
                loader: 'css-loader',
                options: {
                  esModule: true,
                  modules: {
                    auto: true,
                    localIdentName: '[local]-[hash:8]',
                    exportLocalsConvention: 'camelCaseOnly'
                  }
                }
              }
            ]
          },
          {
            test: /\.svg$/i,
            type: 'asset/resource',
            exclude: /[\\/]node_modules[\\/]/
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(progress),
    new HtmlWebpackPlugin(html),
    new MiniCssExtractPlugin({
      ignoreOrder: true,
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].css'
    })
  ]
});

const port = 8000;
const app = new Koa();
const fs = createMemfs();
const server = dev(compiler, {
  index: false,
  outputFileSystem: fs,
  headers: {
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Credentials': 'true'
  }
});

app.use(server);

app.use(async ctx => {
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = fs.createReadStream(entryHTML);
});

app.on('error', error => {
  !httpError(error) && console.error(error);
});

app.listen(port, () => {
  server.ready(() => {
    server.logger.info(`server run at: \u001B[36mhttp://127.0.0.1:${port}\u001B[0m`);
  });
});
```

### Screenshot

![Screenshot](https://raw.githubusercontent.com/nuintun/webpack-dev-service/main/screenshot.png)

[npm-image]: https://img.shields.io/npm/v/webpack-dev-service?style=flat-square
[npm-url]: https://www.npmjs.org/package/webpack-dev-service
[download-image]: https://img.shields.io/npm/dm/webpack-dev-service?style=flat-square
[languages-image]: https://img.shields.io/github/languages/top/nuintun/webpack-dev-service?style=flat-square
[github-url]: https://github.com/nuintun/webpack-dev-service
[tree-shakeable-image]: https://img.shields.io/badge/tree--shakeable-true-brightred?style=flat-square
[side-effect-image]: https://img.shields.io/badge/side--effect-true-yellow?style=flat-square
[bundle-phobia-url]: https://bundlephobia.com/result?p=webpack-dev-service
[license-image]: https://img.shields.io/github/license/nuintun/webpack-dev-service?style=flat-square
[license-url]: https://github.com/nuintun/webpack-dev-service/blob/master/LICENSE
