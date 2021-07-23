'use strict';

const webpackDevMiddleware = require('webpack-dev-middleware');
const WebSocket = require('ws');
const webpack = require('webpack');
const memoize = require('memoize-one');
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
  progress: true,
  overlay: {
    errors: true,
    warnings: true
  }
};

const WEBSOCKET_RE = /^websocket$/i;

const resolveStats = memoize(stats => {
  return stats.toJson(DEFAULT_STATS);
});

function isUpgradable(context, detector) {
  const { upgrade } = context.headers;

  return upgrade && detector.test(upgrade.trim());
}

function resolveOptions(options) {
  const { overlay } = options;
  const configure = { ...DEFAULT_OPTIONS, ...options };

  if (overlay === false) {
    configure.overlay = { errors: false, warnings: false };
  } else {
    configure.overlay = { ...DEFAULT_OPTIONS.overlay, ...overlay };
  }

  return configure;
}

class HotServer {
  name = 'webpack-hot-middleware';

  constructor(compiler, options) {
    this.compiler = compiler;
    this.options = resolveOptions(options);
    this.logger = compiler.getInfrastructureLogger(this.name);
    this.server = new WebSocket.Server({ path: this.options.path, noServer: true });

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
      this.stats = stats;

      this.broadcastStats(this.clients(), stats);
    });

    hooks.invalid.tap(this.name, (file, builtAt) => {
      this.broadcast(this.clients(), 'invalid', { file, builtAt });
    });
  }

  setupPlugins() {
    const { options, compiler } = this;

    const plugins = [
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
        new webpack.ProgressPlugin(percentage => {
          const nextValue = Math.floor(percentage * 100);

          if (nextValue > value || nextValue === 0) {
            value = nextValue;

            this.broadcast(this.clients(), 'progress', { value });
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
    if (clients.size || clients.length) {
      process.nextTick(() => {
        const { hash, builtAt, errors, warnings } = resolveStats(stats);

        if (stats.hasErrors() || stats.hasWarnings()) {
          this.broadcast(clients, 'problems', { hash, builtAt, errors, warnings });
        } else {
          this.broadcast(clients, 'ok', { hash, builtAt });
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
