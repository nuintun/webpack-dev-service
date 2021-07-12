/**
 * @module hot
 * @license MIT
 * @author nuintun
 * @description Webpack hmr middleware for koa2
 */

import WebSocket from 'ws';
import memoize from 'memoize-one';

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

const jsonStats = memoize(stats => {
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
        if (client.readyState === WebSocket.OPEN) {
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
      if (client.readyState === WebSocket.OPEN) {
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

export default function hmr(compiler, options = {}) {
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
