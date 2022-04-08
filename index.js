/**
 * @package webpack-dev-server-middleware
 * @license MIT
 * @version 0.9.0
 * @author nuintun <nuintun@qq.com>
 * @description A development and hot reload middleware for Koa2.
 * @see https://github.com/nuintun/webpack-dev-server-middleware#readme
 */

'use strict';

const compose = require('koa-compose');
const webpackDevMiddleware = require('webpack-dev-middleware');
const posix = require('path/posix');
const WebSocket = require('ws');
const webpack = require('webpack');

/**
 * @module dev
 */
function dev(compiler, options) {
  const middleware = webpackDevMiddleware(compiler, options);

  const devMiddleware = async (context, next) => {
    context.remove('Content-Type');
    await middleware(
      context.req,
      {
        locals: context.state,

        send(body) {
          context.body = body;
        },

        status(statusCode) {
          context.status = statusCode;
        },

        set(field, value) {
          context.response.set(field, value);
        },

        get(field) {
          return context.response.get(field);
        }
      },
      next
    );
  };

  return Object.assign(devMiddleware, middleware);
}

/**
 * @module hot
 */
const WEBSOCKET_RE = /^websocket$/i;
const DEFAULT_STATS = {
  all: false,
  hash: true,
  assets: true,
  errors: true,
  builtAt: true,
  warnings: true,
  errorDetails: false
};
const DEFAULT_OPTIONS = {
  hmr: true,
  path: '/hot',
  progress: true
};

function resolveOptions(options) {
  const settings = { ...DEFAULT_OPTIONS, ...options };

  if (!posix.normalize(settings.path).startsWith('/')) {
    throw new SyntaxError('hot serve path must start with /');
  }

  return settings;
}

function isUpgradable(context, detector) {
  const { upgrade } = context.headers;
  return !!upgrade && detector.test(upgrade.trim());
}

function hasProblems(problems) {
  return !!problems && problems.length > 0;
}

class HotServer {
  name = 'webpack-hot-middleware';

  constructor(compiler, options) {
    this.compiler = compiler;
    this.options = resolveOptions(options);
    this.logger = compiler.getInfrastructureLogger(this.name);
    this.server = new WebSocket.WebSocketServer({
      path: this.options.path,
      noServer: true
    });
    this.setup();
  }

  setup() {
    this.setupWss();
    this.setupHooks();
    this.setupPlugins();
  }

  setupWss() {
    const { server, logger } = this;
    server.on('error', error => {
      logger.error(error.message);
    });
    server.on('connection', client => {
      if (this.stats) {
        this.broadcastStats([client], this.stats);
      }
    });
  }

  setupHooks() {
    const { hooks } = this.compiler;
    hooks.done.tapAsync(this.name, (stats, next) => {
      next();
      this.stats = stats.toJson(DEFAULT_STATS);
      this.broadcastStats(this.clients(), this.stats);
    });
    hooks.invalid.tap(this.name, (path, builtAt) => {
      this.broadcast(this.clients(), 'invalid', {
        path,
        builtAt
      });
    });
  }

  setupPlugins() {
    const { options, compiler } = this;
    const plugins = [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        __WDS_HOT_OPTIONS__: JSON.stringify({ ...options, name: compiler.name })
      })
    ];

    if (options.hmr) {
      plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    if (options.progress) {
      let value = 0;
      plugins.push(
        new webpack.ProgressPlugin((percentage, status, message) => {
          const nextValue = Math.floor(percentage * 100);

          if (nextValue > value || nextValue === 0) {
            value = nextValue;

            switch (value) {
              case 0:
                status = 'start';
                message = 'end idle';
                break;

              case 100:
                status = 'finish';
                message = 'begin idle';
                break;
            }

            this.broadcast(this.clients(), 'progress', {
              status,
              message,
              value
            });
          }
        })
      );
    }

    for (const plugin of plugins) {
      plugin.apply(compiler);
    }
  }

  clients() {
    return this.server.clients;
  }

  upgrade(context) {
    const { server } = this;
    const { req: request } = context;

    if (isUpgradable(context, WEBSOCKET_RE) && server.shouldHandle(request)) {
      context.respond = false;
      const { socket } = context;
      const head = Buffer.alloc(0);
      server.handleUpgrade(request, socket, head, client => {
        server.emit('connection', client, request);
      });
      return true;
    }

    return false;
  }

  broadcast(clients, action, payload) {
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            action,
            payload
          })
        );
      }
    }
  }

  broadcastStats(clients, stats) {
    if (clients.size > 0 || clients.length > 0) {
      const { hash, builtAt, errors, warnings } = stats;
      this.broadcast(clients, 'hash', {
        hash
      });

      if (hasProblems(errors) || hasProblems(warnings)) {
        this.broadcast(clients, 'problems', {
          errors,
          warnings,
          builtAt
        });
      } else {
        this.broadcast(clients, 'ok', {
          builtAt
        });
      }
    }
  }
}

function hot(compiler, options = {}) {
  const server = new HotServer(compiler, options);

  const hotMiddleware = async (context, next) => {
    if (!server.upgrade(context)) {
      await next();
    }
  };

  hotMiddleware.clients = () => {
    return server.clients();
  };

  hotMiddleware.broadcast = (clients, action, payload) => {
    server.broadcast(clients, action, payload);
  };

  return hotMiddleware;
}

/**
 * @module index
 */
function server(compiler, options = {}) {
  const { hot: hotOptions, ...devOptions } = options;
  const devMiddleware = dev(compiler, devOptions);
  if (hotOptions === false) return devMiddleware;
  const hotMiddleware = hot(compiler, hotOptions);
  return Object.assign(compose([devMiddleware, hotMiddleware]), devMiddleware, hotMiddleware);
}

module.exports = server;
