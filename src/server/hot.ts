/**
 * @module hot
 */

import { normalize } from 'path/posix';
import { Context, Middleware } from 'koa';
import WebSocket, { WebSocketServer } from 'ws';
import webpack, { Compiler, StatsCompilation, StatsOptions } from 'webpack';

export interface Options {
  hmr?: boolean;
  path?: string;
  progress?: boolean;
}

const WEBSOCKET_RE = /^websocket$/i;

function resolveStatsOptions(compiler: Compiler): StatsOptions {
  const options: StatsOptions = {
    all: false,
    hash: true,
    colors: true,
    errors: true,
    assets: false,
    builtAt: true,
    warnings: true,
    errorDetails: false
  };
  const { stats } = compiler.options;

  if (typeof stats === 'object') {
    const { warningsFilter } = stats;

    if (warningsFilter) {
      options.warningsFilter = warningsFilter;
    }
  }

  return options;
}

function resolveOptions(options: Options): Required<Options> {
  const settings = {
    hmr: true,
    path: '/hot',
    progress: true,
    ...options
  };

  if (!normalize(settings.path).startsWith('/')) {
    throw new SyntaxError('hot serve path must start with /');
  }

  return settings;
}

function isUpgradable(context: Context, detector: RegExp): boolean {
  const { upgrade } = context.headers;

  return !!upgrade && detector.test(upgrade.trim());
}

function hasProblems<T>(problems: ArrayLike<T> | undefined): boolean {
  return !!problems && problems.length > 0;
}

class HotServer {
  private stats!: StatsCompilation;

  private readonly compiler: Compiler;
  private readonly server: WebSocketServer;
  private readonly options: Required<Options>;
  private readonly name: string = 'webpack-hot-middleware';
  private readonly logger: ReturnType<Compiler['getInfrastructureLogger']>;

  constructor(compiler: Compiler, options: Options) {
    this.compiler = compiler;
    this.options = resolveOptions(options);
    this.logger = compiler.getInfrastructureLogger(this.name);
    this.server = new WebSocketServer({ path: this.options.path, noServer: true });

    this.setup();
  }

  setup(): void {
    this.setupWss();
    this.setupHooks();
    this.setupPlugins();
  }

  setupWss(): void {
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

  setupHooks(): void {
    const { compiler } = this;
    const { hooks } = compiler;
    const statsOptions = resolveStatsOptions(compiler);

    hooks.done.tapAsync(this.name, (stats, next) => {
      next();

      this.stats = stats.toJson(statsOptions);

      this.broadcastStats(this.clients(), this.stats);
    });

    hooks.invalid.tap(this.name, (path, builtAt) => {
      this.broadcast(this.clients(), 'invalid', { path, builtAt });
    });
  }

  setupPlugins(): void {
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

  clients(): Set<WebSocket> {
    return this.server.clients;
  }

  upgrade(context: Context): boolean {
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

  broadcast<T>(clients: Set<WebSocket> | WebSocket[], action: string, payload: T) {
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ action, payload }));
      }
    }
  }

  broadcastStats(clients: Set<WebSocket> | WebSocket[], stats: StatsCompilation) {
    if ((clients as Set<WebSocket>).size > 0 || (clients as WebSocket[]).length > 0) {
      const { hash, builtAt, errors, warnings } = stats;

      this.broadcast(clients, 'hash', { hash });

      if (hasProblems(errors) || hasProblems(warnings)) {
        this.broadcast(clients, 'problems', { errors, warnings, builtAt });
      } else {
        this.broadcast(clients, 'ok', { builtAt });
      }
    }
  }
}

export type Extensions = {
  clients(): Set<WebSocket>;
  broadcast<T>(clients: Set<WebSocket> | WebSocket[], action: string, payload: T): void;
};

export default function hot(compiler: Compiler, options: Options = {}): Middleware & Extensions {
  const server = new HotServer(compiler, options);

  const hotMiddleware: Middleware & Extensions = async (context, next) => {
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
