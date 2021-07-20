/**
 * @module .babelrc
 * @description Webpack 配置
 */

'use strict';

const dev = require('../');
const Koa = require('koa');
const path = require('path');
const memfs = require('memfs');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const progress = {
  percentBy: 'entries'
};

const entryHTML = path.resolve('public/index.html');

const html = {
  xhtml: true,
  minify: false,
  title: 'React',
  filename: entryHTML,
  template: path.resolve('index.ejs')
};

function createMemfs() {
  const fs = memfs.createFsFromVolume(new memfs.Volume());

  fs.join = path.join.bind(path);

  return fs;
}

function httpError(error) {
  return /^(EOF|EPIPE|ECANCELED|ECONNRESET|ECONNABORTED)$/i.test(error.code);
}

const compiler = webpack({
  name: 'react',
  mode: 'development',
  target: ['web', 'es5'],
  context: path.resolve('src'),
  entry: [path.resolve('../client'), path.resolve('src/App.jsx')],
  output: {
    publicPath: '/public/',
    filename: `js/[name].js`,
    path: path.resolve('public'),
    chunkFilename: `js/name].js`,
    assetModuleFilename: `[path][name][ext]`
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
    rules: [
      {
        oneOf: [
          {
            test: /\.jsx?$/i,
            exclude: /[\\/]node_modules[\\/]/,
            use: [
              {
                loader: 'babel-loader',
                options: { highlightCode: true, cacheDirectory: true }
              }
            ]
          }
        ]
      }
    ]
  },
  plugins: [new webpack.ProgressPlugin(progress), new HtmlWebpackPlugin(html)]
});

const app = new Koa();
const fs = createMemfs();
const server = dev(compiler, { index: false, outputFileSystem: fs });
const logger = compiler.getInfrastructureLogger('webpack-dev-middleware');

app.use(server);

app.use(async ctx => {
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = fs.createReadStream(entryHTML);
});

app.on('error', error => {
  !httpError(error) && console.error(error);
});

app.listen(8000, () => {
  server.waitUntilValid(() => {
    logger.info(`server run at: \u001B[36mhttp://127.0.0.1:8000\u001B[0m`);
  });
});
