'use strict';

const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const WebSocket = require('ws');
const compose = require('koa-compose');

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

  for (const [prop, value] of Object.entries(middleware)) {
    devMiddleware[prop] = value;
  }

  return devMiddleware;
}

/**
 * @module hot
 */

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
  overlay: true,
  progress: true
};

const WEBSOCKET_RE = /^websocket$/i;

function isUpgradable(context, detector) {
  const { upgrade } = context.headers;

  return upgrade && detector.test(upgrade.trim());
}

function resolveOptions(options) {
  return { ...DEFAULT_OPTIONS, ...options };
}

class HotServer {
  name = 'webpack-hot-middleware';

  constructor(compiler, options) {
    this.compiler = compiler;
    this.options = resolveOptions(options);
    this.logger = compiler.getInfrastructureLogger(this.name);
    this.server = new WebSocket.WebSocketServer({ path: this.options.path, noServer: true });

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

    hooks.done.tap(this.name, stats => {
      this.stats = stats.toJson(DEFAULT_STATS);

      this.broadcastStats(this.clients(), this.stats);
    });

    hooks.invalid.tap(this.name, (path, builtAt) => {
      this.broadcast(this.clients(), 'invalid', { path, builtAt });
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

            this.broadcast(this.clients(), 'progress', { status, message, value });
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
        client.send(JSON.stringify({ action, payload }));
      }
    }
  }

  broadcastStats(clients, stats) {
    if (clients.size > 0 || clients.length > 0) {
      process.nextTick(() => {
        const { hash, builtAt, errors, warnings } = stats;

        this.broadcast(clients, 'hash', { hash });

        if (errors.length > 0 || warnings.length > 0) {
          this.broadcast(clients, 'problems', { builtAt, errors, warnings });
        } else {
          this.broadcast(clients, 'ok', { builtAt });
        }
      });
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

function assign(dest, ...sources) {
  for (const source of sources) {
    for (const [prop, value] of Object.entries(source)) {
      dest[prop] = value;
    }
  }

  return dest;
}

function server(compiler, { hot: hotOptions, ...devOptions } = {}) {
  const devMiddleware = dev(compiler, devOptions);

  if (hotOptions === false) return devMiddleware;

  const hotMiddleware = hot(compiler, hotOptions);

  return assign(compose([devMiddleware, hotMiddleware]), devMiddleware, hotMiddleware);
}

module.exports = server;
