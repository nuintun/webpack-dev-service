/**
 * @module webpack
 * @description Webpack config
 */

import Koa from 'koa';
import path from 'path';
import memfs from 'memfs';
import webpack from 'webpack';
import compress from 'koa-compress';
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
  favicon: path.resolve('src/images/favicon.ico'),
  meta: { 'theme-color': '#4285f4', viewport: 'width=device-width,initial-scale=1.0' }
};

function createMemfs() {
  const volume = new memfs.Volume();
  const fs = memfs.createFsFromVolume(volume);

  return fs;
}

function httpError(error) {
  return /^(EOF|EPIPE|ECANCELED|ECONNRESET|ECONNABORTED)$/i.test(error.code);
}

const compiler = webpack({
  name: 'react',
  mode: 'development',
  context: path.resolve('src'),
  entry: path.resolve('src/index.tsx'),
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
    extensions: ['.ts', '.tsx', '.js', '.jsx']
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
            test: /\.[jt]sx?$/i,
            exclude: /[\\/]node_modules[\\/]/,
            use: [
              {
                loader: 'swc-loader',
                options: {
                  jsc: {
                    externalHelpers: true,
                    parser: {
                      tsx: true,
                      syntax: 'typescript'
                    },
                    transform: {
                      react: {
                        runtime: 'automatic'
                      }
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
            test: /\.(svg|mp4)$/i,
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
  fs,
  headers: {
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Credentials': 'true'
  }
});

app.use(
  compress({
    br: false
  })
);

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
