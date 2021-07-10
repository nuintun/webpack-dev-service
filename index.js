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

const resolveStats = memoize__default['default'](stats => {
  return stats.toJson(DEFAULT_STATS);
});

const isStillOK = memoize__default['default'](stats => {
  const { errors, warnings } = stats;

  return (
    stats &&
    stats.assets &&
    (!errors || errors.length === 0) &&
    (!warnings || warnings.length === 0) &&
    stats.assets.every(asset => !asset.emitted)
  );
});

function isUpgradable(context, detector) {
  const { upgrade } = context.headers;

  return upgrade && detector.test(upgrade.trim());
}

class HMRServer {
  name = 'webpack-dev-server';

  constructor(compiler, options) {
    this.compiler = compiler;
    this.logger = compiler.getInfrastructureLogger(this.name);
    this.options = { path: '/hmr', hmr: true, reload: true, overlay: true, ...options };
    this.server = new WebSocket__default['default'].Server({ path: this.options.path, noServer: true });

    this.init();
  }

  init() {
    this.setupWss();
    this.setupHooks();
  }

  setupWss() {
    const { server, logger } = this;

    server.on('connection', client => {
      const { options } = this;
      const { hmr, reload, overlay } = options;

      this.broadcast([client], 'init', { hmr, reload, overlay });

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

    const onInvalid = () => {
      this.broadcast(this.server.clients, 'rebuild');
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
    if (isUpgradable(context, /^websocket$/i)) {
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
    stats = resolveStats(stats);

    if (isStillOK(stats)) {
      return this.broadcast(clients, 'still-ok');
    }

    this.broadcast(clients, 'hash', stats.hash);

    const { errors, warnings } = stats;
    const hasErrors = errors.length !== 0;
    const hasWarnings = warnings.length !== 0;

    if (!hasErrors && !hasWarnings) {
      return this.broadcast(clients, 'ok');
    }

    if (hasErrors) {
      this.broadcast(clients, 'errors', errors);
    }

    if (hasWarnings) {
      this.broadcast(clients, 'warnings', warnings);
    }
  }
}

function hmr(compiler, options) {
  const server = new HMRServer(compiler, options);

  const hmrMiddleware = async (context, next) => {
    if (!server.upgrade(context)) {
      await next();
    }
  };

  hmrMiddleware.broadcast = (action, payload) => {
    server.broadcast(server.clients, action, payload);
  };

  return hmrMiddleware;
}

/**
 * @module index
 * @license MIT
 * @author nuintun
 * @description Webpack dev and hot middleware for koa2
 */

function miscAssign(from, to) {
  for (const [prop, value] of Object.entries(from)) {
    to[prop] = value;
  }
}

function server(compiler, options = {}) {
  const devMiddleware = dev(compiler, options);

  if (options.hot === false) return devMiddleware;

  const hmrMiddleware = hmr(compiler, options.hot);
  const composeMiddleware = compose__default['default']([devMiddleware, hmrMiddleware]);

  miscAssign(devMiddleware, composeMiddleware);
  miscAssign(hmrMiddleware, composeMiddleware);

  return composeMiddleware;
}

module.exports = server;
