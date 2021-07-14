/**
 * @module hot
 * @license MIT
 * @author nuintun
 * @description Webpack hmr middleware for koa2
 */

import WebSocket from 'ws';
import webpack from 'webpack';
import memoize from 'memoize-one';

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
  path: '/hmr',
  errors: true,
  warnings: true,
  progress: true
};

const WEBSOCKET_RE = /^websocket$/i;

const parseStats = memoize(stats => {
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
      const { hmr, progress, errors, warnings } = this.options;

      this.broadcast([client], 'init', {
        name: this.compiler.name,
        options: { hmr, progress, errors, warnings }
      });

      if (this.stats) {
        this.broadcastStats([client], this.stats);
      }
    });
  }

  setupHooks() {
    const { hooks } = this.compiler;

    hooks.done.tap(this.name, stats => {
      this.stats = stats;

      this.broadcastStats(this.server.clients, stats);
    });

    hooks.invalid.tap(this.name, (file, builtAt) => {
      this.broadcast(this.server.clients, 'rebuild', { file, builtAt });
    });
  }

  setupPlugins() {
    const plugins = [];
    const { options } = this;

    if (options.hmr) {
      plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    if (options.progress) {
      let value = 0;

      plugins.push(
        new webpack.ProgressPlugin({
          percentBy: 'entries',
          handler: percentage => {
            const nextValue = Math.floor(percentage * 100);

            if (nextValue > value || nextValue === 0) {
              value = nextValue;

              this.broadcast(this.server.clients, 'progress', { value });
            }
          }
        })
      );
    }

    this.applyPlugins(plugins);
  }

  applyPlugins(plugins) {
    const { compiler } = this;

    for (const plugin of plugins) {
      plugin.apply(compiler);
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
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ action, payload }));
      }
    }
  }

  broadcastStats(clients, stats) {
    if (clients.size || clients.length) {
      process.nextTick(() => {
        const { hash, builtAt, errors, warnings } = parseStats(stats);

        if (stats.hasErrors() || stats.hasWarnings()) {
          const { options } = this;
          const payload = { hash, builtAt, errors: [], warnings: [] };

          if (options.errors) {
            payload.errors = errors;
          }

          if (options.warnings) {
            payload.warnings = warnings;
          }

          this.broadcast(clients, 'problems', payload);
        } else {
          this.broadcast(clients, 'ok', { hash, builtAt });
        }
      });
    }
  }
}

export default function hot(compiler, options = {}) {
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
