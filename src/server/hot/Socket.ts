/**
 * @module Socket
 */

import { Context } from 'koa';
import WebSocket, { WebSocketServer } from 'ws';
import webpack, { StatsCompilation } from 'webpack';
import { Options, PluginFactory } from './interface';
import { getCompilers, PLUGIN_NAME } from '/server/utils';
import { ICompiler, ILogger, IStats } from '/server/interface';
import { getOptions, getStatsOptions, getTimestamp, hasIssues, isUpgradable, WEBSOCKET_RE } from './utils';

export class Socket {
  private state: boolean = false;
  private stats?: StatsCompilation;

  private readonly logger: ILogger;
  private readonly compiler: ICompiler;
  private readonly server: WebSocketServer;
  private readonly options: Required<Options>;

  constructor(compiler: ICompiler, options: Options) {
    this.compiler = compiler;
    this.options = getOptions(options);
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
      // Set state to true.
      this.state = true;

      // Get json stats.
      const jsonStats = stats.toJson(statsOptions);

      // Hack builtAt.
      if (jsonStats.builtAt == null) {
        jsonStats.builtAt = getTimestamp(jsonStats);
      }

      // Cache stats.
      this.stats = jsonStats;

      // Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling.
      process.nextTick(() => {
        // Broadcast stats.
        if (this.state) {
          this.broadcastStats(this.clients(), jsonStats);
        }
      });
    });

    hooks.invalid.tap(PLUGIN_NAME, (path, timestamp) => {
      // Set state to false.
      this.state = false;

      // Broadcast invalid.
      this.broadcast(this.clients(), 'invalid', { path, timestamp });
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

        params.set('name', name || 'webpack');
        params.set('path', options.path || '/hot');
        params.set('wss', options.wss === true ? 'true' : 'false');
        params.set('hmr', options.hmr !== false ? 'true' : 'false');
        params.set('reload', options.reload !== false ? 'true' : 'false');
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
      const { hash, errors, warnings, builtAt: timestamp } = stats;

      this.broadcast(clients, 'hash', { hash, timestamp });

      if (hasIssues(errors) || hasIssues(warnings)) {
        this.broadcast(clients, 'issues', { errors, warnings, timestamp });
      } else {
        this.broadcast(clients, 'ok', { timestamp });
      }
    }
  }
}
