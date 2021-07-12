'use strict';

var webpackDevMiddleware = require('webpack-dev-middleware');
var WebSocket = require('ws');
var memoize = require('memoize-one');
var compose = require('koa-compose');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var webpackDevMiddleware__default = /*#__PURE__*/_interopDefaultLegacy(webpackDevMiddleware);
var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);
var memoize__default = /*#__PURE__*/_interopDefaultLegacy(memoize);
var compose__default = /*#__PURE__*/_interopDefaultLegacy(compose);

/**
 * @module dev
 * @license MIT
 * @author nuintun
 * @description Webpack dev middleware for koa2
 */

function dev(compiler, options) {
  const middleware = webpackDevMiddleware__default['default'](compiler, options);

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
 * @license MIT
 * @author nuintun
 * @description Webpack hmr middleware for koa2
 */

const DEFAULT_STATS = {
  all: false,
  hash: true,
  assets: true,
  errors: true,
  warnings: true,
  errorDetails: false
};

const DEFAULT_OPTIONS = {
  hmr: true,
  path: '/hmr',
  errors: true,
  overlay: true,
  warnings: true
};

const WEBSOCKET_RE = /^websocket$/i;

const jsonStats = memoize__default['default'](stats => {
  return stats.toJson(DEFAULT_STATS);
});

function isUpgradable(context, detector) {
  const { upgrade } = context.headers;

  return upgrade && detector.test(upgrade.trim());
}

class HotServer {
  name = 'webpack-hot-middleware';

  constructor(compiler, options) {
    this.compiler = compiler;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.logger = compiler.getInfrastructureLogger(this.name);
    this.server = new WebSocket__default['default'].Server({ path: this.options.path, noServer: true });

    this.setup();
  }

  setup() {
    this.setupWss();
    this.setupHooks();
  }

  setupWss() {
    const { server, logger } = this;

    server.on('connection', client => {
      const { hmr, overlay, errors, warnings } = this.options;

      this.broadcast([client], 'init', { hmr, overlay, errors, warnings });

      if (this.stats) {
        this.broadcastStats([client], this.stats);
      }
    });

    server.on('error', error => {
      logger.error(error.message);
    });

    server.on('close', () => {
      for (const client of server.clients) {
        if (client.readyState === WebSocket__default['default'].OPEN) {
          client.close(1000);
        }
      }
    });
  }

  setupHooks() {
    const { compiler } = this;
    const compilers = compiler.compilers ?? [compiler];

    const onInvalid = (_main, timestamp) => {
      this.broadcast(this.server.clients, 'rebuild', new Date(timestamp));
    };

    const onDone = stats => {
      this.stats = stats;

      this.broadcastStats(this.server.clients, stats);
    };

    for (const { hooks } of compilers) {
      hooks.done.tap(this.name, onDone);
      hooks.invalid.tap(this.name, onInvalid);
    }
  }

  upgrade(context) {
    if (isUpgradable(context, WEBSOCKET_RE)) {
      context.respond = false;

      const { server } = this;
      const { req: request, socket } = context;

      server.handleUpgrade(request, socket, Buffer.alloc(0), client => {
        server.emit('connection', client, request);
      });

      return true;
    }

    return false;
  }

  broadcast(clients, action, payload) {
    for (const client of clients) {
      if (client.readyState === WebSocket__default['default'].OPEN) {
        client.send(JSON.stringify({ action, payload }));
      }
    }
  }

  broadcastStats(clients, stats) {
    if (clients.size || clients.length) {
      const output = jsonStats(stats);
      const { name, errors } = output;

      if (errors.length > 0) {
        this.broadcast(clients, 'errors', { name, errors });
      } else {
        const { name, hash, warnings } = output;

        if (warnings.length > 0) {
          this.broadcast(clients, 'warnings', { name, hash, warnings });
        } else {
          this.broadcast(clients, 'ok', { name, hash });
        }
      }
    }
  }
}

function hmr(compiler, options = {}) {
  const server = new HotServer(compiler, options);

  const hotMiddleware = async (context, next) => {
    if (!server.upgrade(context)) {
      await next();
    }
  };

  hotMiddleware.broadcast = (action, payload) => {
    server.broadcast(server.clients, action, payload);
  };

  return hotMiddleware;
}

/**
 * @module index
 * @license MIT
 * @author nuintun
 * @description Webpack dev and hot middleware for koa2
 */

function assign(dest, ...sources) {
  for (const source of sources) {
    for (const [prop, value] of Object.entries(source)) {
      dest[prop] = value;
    }
  }

  return dest;
}

function server(compiler, options = {}) {
  const devMiddleware = dev(compiler, options);

  if (options.hot === false) return devMiddleware;

  const hotMiddleware = hmr(compiler, options.hot);

  return assign(compose__default['default']([devMiddleware, hotMiddleware]), devMiddleware, hotMiddleware);
}

module.exports = server;
