/**
 * @module hot
 * @license MIT
 * @author nuintun
 * @description Webpack hmr middleware for koa2
 */

import { Server } from 'ws';
import memoize from 'memoize-one';

const DEFAULT_STATS = {
  all: false,
  hash: true,
  assets: true,
  errors: true,
  warnings: true,
  errorDetails: false
};

const resolveStats = memoize(stats => {
  return stats.toJson(DEFAULT_STATS);
});

function isStillOK(stats) {
  const { errors, warnings } = stats;

  return (
    stats &&
    stats.assets &&
    (!errors || !errors.length === 0) &&
    (!warnings || warnings.length === 0) &&
    stats.assets.every(asset => !asset.emitted)
  );
}

function isUpgradable(context, detector) {
  const { upgrade } = context.headers;

  return upgrade ? detector.test(upgrade.trim()) : false;
}

class HMRServer {
  name = 'webpack-dev-server';

  constructor(compiler, options) {
    this.options = options;
    this.wss = new Server({ ...options, noServer: true });
    this.logger = compiler.getInfrastructureLogger(this.name);

    this.initialize();
  }

  initialize() {
    this.setupWss();
    this.setupHooks();
  }

  setupWss() {
    const { wss, logger } = this;

    wss.on('connection', ws => {
      ws.send('hot');
    });

    wss.on('error', error => {
      logger.error(error.message);
    });

    wss.on('close', () => {
      for (const ws of wss.clients) {
        if (ws.readyState === ws.OPEN) {
          ws.close(1000);
        }
      }
    });
  }

  setupHooks() {
    const { compiler } = this;
    const compilers = compiler.compilers ?? [compiler];

    const onInvalid = () => {
      this.broadcast('invalid');
    };

    const onDone = stats => {
      this.stats = stats;

      this.broadcastStats(stats);
    };

    for (const { hooks } of compilers) {
      hooks.done.tap(this.name, onDone);
      hooks.invalid.tap(this.name, onInvalid);
    }
  }

  upgrade(context) {
    if (isUpgradable(context, /^websocket$/i)) {
      context.respond = false;

      const { req: request, socket } = context;

      wss.handleUpgrade(request, socket, Buffer.alloc(0), ws => {
        wss.emit('connection', ws, request);
      });

      return true;
    }

    return false;
  }

  broadcast(action, payload) {
    for (const ws of this.wss.clients) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ action, payload }));
      }
    }
  }

  broadcastStats(stats) {
    stats = resolveStats(stats);

    if (isStillOK(stats)) {
      return this.broadcast('still-ok');
    }

    this.broadcast('hash', stats.hash);

    const { errors, warnings } = stats;
    const hasErrors = errors.length !== 0;
    const hasWarnings = warnings.length !== 0;

    if (!hasErrors && !hasWarnings) {
      return this.broadcast('ok');
    }

    if (hasErrors) {
      this.broadcast('errors', errors);
    }

    if (hasWarnings) {
      this.broadcast('warnings', warnings);
    }
  }
}

export default function hmr(compiler, options) {
  const wss = new HMRServer(compiler, options);

  const hmrMiddleware = async (context, next) => {
    if (!wss.upgrade(context)) {
      await next();
    }
  };

  hmrMiddleware.broadcast = wss.broadcast.bind(wss);

  return hmrMiddleware;
}
