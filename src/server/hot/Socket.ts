/**
 * @module Socket
 */

import webpack from 'webpack';
import { Context } from 'koa';
import { v7 as uuid7 } from 'uuid';
import { Buffer } from 'node:buffer';
import { Messages } from './Message';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import WebSocket, { WebSocketServer } from 'ws';
import { getCompilers, PLUGIN_NAME } from '/server/utils';
import { GetProp, Logger, UnionCompiler } from '/server/interface';
import { Clients, CompilerContext, NormalizedOptions, Options } from './interface';
import { BASE_URL, getOptions, getStatsOptions, getTimestamp, hasIssues, isUpgradable } from './utils';

function entrypoint(): string {
  const filename = import.meta.url;

  return dirname(__ESM__ ? fileURLToPath(filename) : filename);
}

const client = resolve(entrypoint(), __HOT_CLIENT__);

export class Socket {
  // Readonly props.
  readonly #logger: Logger;
  readonly #server: WebSocketServer;
  readonly #options: NormalizedOptions;

  constructor(compiler: UnionCompiler, options?: Options) {
    this.#options = getOptions(options);
    this.#logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
    this.#server = new WebSocketServer({ noServer: true, path: this.#options.path });

    const compilers = getCompilers(compiler);
    const contexts = new Map<string, CompilerContext>();

    for (const compiler of compilers) {
      const uuid = uuid7();
      const context: CompilerContext = {
        uuid,
        stats: null,
        percentage: -1,
        clients: new Set()
      };

      contexts.set(uuid, context);

      this.#setupOutput(compiler, uuid);
      this.#setupHooks(compiler, context);
      this.#setupPlugins(compiler, context);
    }

    this.#setupWss(contexts);
  }

  #setupOutput(compiler: webpack.Compiler, uuid: string): void {
    const { output } = compiler.options;

    // Override hot update filename.
    output.hotUpdateChunkFilename = `[id].${uuid}.hot-update.js`;
    output.hotUpdateMainFilename = `[runtime].${uuid}.hot-update.json`;
  }

  #setupHooks(compiler: webpack.Compiler, context: CompilerContext): void {
    const { hooks } = compiler;
    const statsOptions = getStatsOptions(compiler);

    hooks.invalid.tap(PLUGIN_NAME, (path, timestamp) => {
      // Set stats to null.
      context.stats = null;
      // Reset percentage.
      context.percentage = -1;

      // Broadcast invalid.
      this.#broadcast(context.clients, 'invalid', { path, timestamp });
    });

    hooks.done.tap(PLUGIN_NAME, stats => {
      // Get json stats.
      const jsonStats = stats.toJson(statsOptions);

      // Hack builtAt.
      if (jsonStats.builtAt == null) {
        jsonStats.builtAt = getTimestamp(jsonStats);
      }

      // Cache stats.
      context.stats = jsonStats as GetProp<CompilerContext, 'stats'>;

      // Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling.
      process.nextTick(() => {
        const { stats } = context;

        // Broadcast stats.
        if (stats) {
          this.#broadcastStats(context.clients, stats);
        }
      });
    });
  }

  #setupPlugins(compiler: webpack.Compiler, context: CompilerContext): void {
    const options = this.#options;
    const params = new URLSearchParams();

    params.set('uuid', context.uuid);
    params.set('path', options.path);

    const { wss } = options;

    if (wss != null) {
      params.set('wss', wss ? 'true' : 'false');
    }

    params.set('name', compiler.name || 'rspack');
    params.set('hmr', options.hmr ? 'true' : 'false');
    params.set('reload', options.reload ? 'true' : 'false');
    params.set('overlay', options.overlay ? 'true' : 'false');
    params.set('progress', options.progress ? 'true' : 'false');

    const plugins: webpack.WebpackPluginInstance[] = [
      new webpack.HotModuleReplacementPlugin(),
      // Auto add hot client to entry.
      new webpack.EntryPlugin(compiler.context, `${client}?${params}`, {
        // Don't create runtime.
        runtime: false
      })
    ];

    if (options.progress) {
      plugins.push(
        new webpack.ProgressPlugin((percentage, status, ...messages) => {
          if (percentage > context.percentage) {
            context.percentage = percentage;

            this.#broadcast(context.clients, 'progress', { status, messages, percentage });
          }
        })
      );
    }

    for (const plugin of plugins) {
      plugin.apply(compiler);
    }
  }

  #setupWss(contexts: Map<string, CompilerContext>): void {
    const logger = this.#logger;
    const server = this.#server;
    const { path } = this.#options;

    server.on('connection', (client, { url: input = path }) => {
      const url = new URL(input, BASE_URL);
      const uuid = url.searchParams.get('uuid');

      if (uuid) {
        const context = contexts.get(uuid);

        if (context) {
          const { stats } = context;

          context.clients.add(client);

          logger.log('client connected');

          client.on('close', () => {
            context.clients.delete(client);

            logger.log('client disconnected');
          });

          if (stats) {
            const clients = new Set([client]);

            this.#broadcastStats(clients, stats);
          }
        } else {
          client.close(4001, 'compiler not found');
        }
      } else {
        client.close(4000, 'uuid not found');
      }
    });

    server.on('error', error => {
      logger.error(error);
    });
  }

  #broadcast<A extends keyof Messages>(clients: Clients, action: A, payload: GetProp<Messages, A>): void {
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ action, payload }));
      }
    }
  }

  #broadcastStats(clients: Clients, stats: Required<webpack.StatsCompilation>): void {
    if (clients.size > 0) {
      const { hash, errors, warnings, builtAt: timestamp } = stats;

      this.#broadcast(clients, 'hash', { hash, timestamp });

      if (hasIssues(errors) || hasIssues(warnings)) {
        this.#broadcast(clients, 'issues', { errors, warnings, timestamp });
      } else {
        this.#broadcast(clients, 'ok', { timestamp });
      }
    }
  }

  public upgrade(context: Context): boolean {
    const server = this.#server;
    const { req: request } = context;

    if (isUpgradable(context) && server.shouldHandle(request)) {
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
}
