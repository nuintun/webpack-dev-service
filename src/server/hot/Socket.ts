/**
 * @module Socket
 */

import { Context } from 'koa';
import WebSocket, { WebSocketServer } from 'ws';
import webpack, { StatsCompilation } from 'webpack';
import { Options, PluginFactory } from './interface';
import { getCompilers, PLUGIN_NAME } from '/server/utils';
import { ICompiler, ILogger, IStats } from '/server/interface';
import { getStatsOptions, hasProblems, isUpgradable, resolveOptions, WEBSOCKET_RE } from './utils';

export class Socket {
  private stats!: StatsCompilation;

  private readonly logger: ILogger;
  private readonly compiler: ICompiler;
  private readonly server: WebSocketServer;
  private readonly options: Required<Options>;

  constructor(compiler: ICompiler, options: Options) {
    this.compiler = compiler;
    this.options = resolveOptions(options);
    this.logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
    this.server = new WebSocketServer({ path: this.options.path, noServer: true });

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
    const statsOptions = getStatsOptions(compiler);

    hooks.done.tap(PLUGIN_NAME, (stats: IStats) => {
      this.stats = stats.toJson(statsOptions);

      this.broadcastStats(this.clients(), this.stats);
    });

    hooks.invalid.tap(PLUGIN_NAME, (path, builtAt) => {
      this.broadcast(this.clients(), 'invalid', { path, builtAt });
    });
  }

  setupPlugins(): void {
    const { options, compiler } = this;
    const compilers = getCompilers(compiler);
    const plugins: PluginFactory[] = [
      () => {
        return new webpack.NoEmitOnErrorsPlugin();
      },
      () => {
        return new webpack.HotModuleReplacementPlugin();
      },
      ({ name, context }) => {
        const params = new URLSearchParams();

        params.set('name', name ?? 'webpack');
        params.set('path', options.path ?? '/hot');
        params.set('wss', options.wss === true ? 'true' : 'false');
        params.set('hmr', options.hmr !== false ? 'true' : 'false');
        params.set('live', options.live !== false ? 'true' : 'false');
        params.set('overlay', options.overlay !== false ? 'true' : 'false');
        params.set('progress', options.progress !== false ? 'true' : 'false');

        return new webpack.EntryPlugin(context, `webpack-dev-service/client?${params}`, {
          runtime: `${PLUGIN_NAME}/client`
        });
      }
    ];

    for (const compiler of compilers) {
      for (const plugin of plugins) {
        plugin(compiler).apply(compiler);
      }
    }

    if (options.progress) {
      let value = 0;

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
      }).apply(compiler);
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
