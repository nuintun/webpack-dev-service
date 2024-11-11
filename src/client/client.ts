/**
 * @module client
 */

import webpack from 'webpack';
import { emit } from './events';
import { Overlay } from './ui/Overlay';
import { Progress } from './ui/Progress';
import { GetProp } from '/server/interface';
import { applyUpdate, updateHash } from './hot';
import { Message, Messages } from '/server/hot/Message';

export interface Options {
  readonly hmr: boolean;
  readonly name: string;
  readonly path: string;
  readonly origin: string;
  readonly reload: boolean;
  readonly overlay: boolean;
  readonly progress: boolean;
  readonly uuid: string | null;
}

export default function createClient(options: Options): void {
  let updateTimer: number;

  const UPDATE_DELAY = 128;
  const RETRY_INTERVAL = 3000;

  const progress = new Progress();
  const overlay = new Overlay(options.name);

  const fallback = (): void => {
    if (options.reload) {
      self.location.reload();
    } else {
      console.warn('Use fallback update but you turn off live reload, please reload by yourself.');
    }
  };

  const applyUpdateAsync = (): void => {
    updateTimer = self.setTimeout(() => {
      applyUpdate(options.hmr, fallback);
    }, UPDATE_DELAY);
  };

  const onInvalid = (): void => {
    clearTimeout(updateTimer);

    if (options.progress) {
      progress.update(0);
      progress.show();
    }
  };

  const onProgress = ({ percentage }: GetProp<Messages, 'progress'>): void => {
    if (options.progress) {
      progress.update(percentage);
    }
  };

  const onHash = ({ hash }: GetProp<Messages, 'hash'>): void => {
    updateHash(hash);
  };

  const setIssues = (type: 'errors' | 'warnings', issues: webpack.StatsError[]): void => {
    if (options.overlay) {
      overlay.setIssues(type, issues);
    }

    const maps: Record<string, [name: string, method: 'error' | 'warn']> = {
      errors: ['\x1b[38;2;100;30;22m\x1b[48;2;255;95;88m ERROR \x1b[0m', 'error'],
      warnings: ['\x1b[38;2;32;39;35m\x1b[48;2;255;189;46m WARNING \x1b[0m', 'warn']
    };
    const [name, method] = maps[type];
    const debug = console[method];

    for (const { moduleName, chunkName, message } of issues) {
      const filename = moduleName || chunkName || 'unknown';

      debug(`${name} in ${filename}\n${message}`);
    }
  };

  const onIssues = ({ errors, warnings }: GetProp<Messages, 'issues'>): void => {
    progress.update(1);
    progress.hide();

    setIssues('errors', errors);
    setIssues('warnings', warnings);

    if (options.overlay) {
      overlay.show();
    }

    if (errors.length <= 0) {
      applyUpdateAsync();
    }
  };

  const onOk = (): void => {
    progress.update(1);
    progress.hide();
    overlay.hide();

    applyUpdateAsync();
  };

  const parseMessage = (message: MessageEvent<string>): Message | null => {
    try {
      return JSON.parse(message.data);
    } catch {
      return null;
    }
  };

  const createWebSocket = (url: string): void => {
    const ws = new WebSocket(url);

    ws.onmessage = (message: MessageEvent<string>): void => {
      const parsed = parseMessage(message);

      if (parsed) {
        const { action, payload } = parsed;

        switch (action) {
          case 'invalid':
            onInvalid();
            break;
          case 'progress':
            onProgress(payload);
            break;
          case 'hash':
            onHash(payload);
            break;
          case 'issues':
            onIssues(payload);
            break;
          case 'ok':
            onOk();
            break;
        }

        emit(action, payload, options);
      }
    };

    ws.onclose = (event: CloseEvent): void => {
      overlay.hide();
      progress.hide();

      switch (event.code) {
        case 4000:
        case 4001:
          fallback();
          break;
        default:
          if (!event.wasClean) {
            setTimeout((): void => {
              createWebSocket(url);
            }, RETRY_INTERVAL);
          }
          break;
      }
    };
  };

  const { uuid } = options;
  const input = new URL(`${options.origin}${options.path}`);

  if (uuid) {
    input.searchParams.set('uuid', uuid);
  }

  createWebSocket(input.href);
}
