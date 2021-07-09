/**
 * @module hot
 * @license MIT
 * @author nuintun
 * @description Webpack hmr middleware for koa2
 */

import { Server } from 'ws';

function isUpgradable(context, detector) {
  const { upgrade } = context.headers;

  return upgrade ? detector.test(upgrade.trim()) : false;
}

function isShouldEmit(stats) {
  return (
    stats &&
    stats.assets &&
    stats.assets.every(asset => !asset.emitted) &&
    (!stats.errors || stats.errors.length === 0) &&
    (!stats.warnings || stats.warnings.length === 0)
  );
}

class HMRServer {
  constructor(compiler, options) {
    this.options = options;
    this.wss = new Server({ ...options, noServer: true });
    this.logger = compiler.getInfrastructureLogger('webpack-dev-middleware');

    this.setup();
  }

  setup() {
    const { wss, compiler, logger } = this;
    const { invalid, done } = compiler.hooks;

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

    invalid.tap('webpack-dev-server', () => {
      // invalid
    });

    done.tap('webpack-dev-server', stats => {
      const shouldEmit = isShouldEmit(stats);

      if (shouldEmit) {
        // shouldEmit
      }
    });
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
}

export default function hmr(compiler, options) {
  const wss = new HMRServer(compiler, options);

  return async (context, next) => {
    if (!wss.upgrade(context)) {
      await next();
    }
  };
}
