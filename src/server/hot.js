/**
 * @module hot
 */

import webpack from 'webpack';
import WebSocket, { WebSocketServer } from 'ws';

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
    this.server = new WebSocketServer({ path: this.options.path, noServer: true });

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
    if (clients.size > 0 || clients.length > 0) {
      process.nextTick(() => {
        const { hash, builtAt, errors, warnings } = stats;

        if (errors.length > 0 || warnings.length > 0) {
          this.broadcast(clients, 'problems', { hash, builtAt, errors, warnings });
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

  hotMiddleware.clients = () => {
    return server.clients();
  };

  hotMiddleware.broadcast = (clients, action, payload) => {
    server.broadcast(clients, action, payload);
  };

  return hotMiddleware;
}
