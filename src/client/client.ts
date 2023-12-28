/**
 * @module client
 */

import { emit } from './events';
import Overlay from './ui/overlay';
import * as Message from './message';
import Progress from './ui/progress';
import { StatsError } from 'webpack';
import { applyUpdate, setHash } from './hot';

export interface Options {
  readonly hmr: boolean;
  readonly name: string;
  readonly path: string;
  readonly live: boolean;
  readonly origin: string;
  readonly overlay: boolean;
  readonly progress: boolean;
}

export default function createClient(options: Options): void {
  let updateTimer: number;

  const UPDATE_DELAY = 128;
  const RETRY_INTERVAL = 3000;

  const progress = new Progress();
  const overlay = new Overlay(options.name);

  const fallback = (error?: Error): void => {
    if (options.live) {
      self.location.reload();
    } else if (error) {
      console.error(error);
      console.warn('Use fallback update but you turn off live reload, please reload by yourself.');
    }
  };

  const applyUpdateAsync = () => {
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

  const onProgress = ({ value }: Message.Progress['payload']): void => {
    if (options.progress) {
      progress.update(value);
    }
  };

  const onHash = ({ hash }: Message.Hash['payload']): void => {
    setHash(hash);
  };

  const setProblems = (type: 'errors' | 'warnings', problems: StatsError[]): void => {
    const maps: Record<string, [string, 'error' | 'warn']> = {
      errors: ['Error', 'error'],
      warnings: ['Warning', 'warn']
    };

    if (options.overlay) {
      overlay.setProblems(type, problems);
    }

    const [name, method] = maps[type];
    const debug = console[method];

    for (const { moduleName, chunkName, message } of problems) {
      const filename = moduleName || chunkName || 'unknown';

      debug(`${name} in ${filename}\r\n${message}`);
    }
  };

  const onProblems = ({ errors, warnings }: Message.Problems['payload']): void => {
    progress.hide();

    setProblems('errors', errors);
    setProblems('warnings', warnings);

    if (options.overlay) {
      overlay.show();
    }

    if (errors.length <= 0) {
      applyUpdateAsync();
    }
  };

  const onSuccess = (): void => {
    overlay.hide();
    progress.hide();

    applyUpdateAsync();
  };

  const parseMessage = (
    message: MessageEvent<string>
  ): Message.Invalid | Message.Progress | Message.Hash | Message.Problems | Message.OK | null => {
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
          case 'problems':
            onProblems(payload);
            break;
          case 'ok':
            onSuccess();
            break;
        }

        emit(action, payload, options);
      }
    };

    ws.onclose = (): void => {
      overlay.hide();
      progress.hide();

      setTimeout((): void => {
        createWebSocket(url);
      }, RETRY_INTERVAL);
    };
  };

  createWebSocket(`${options.origin}${options.path}`);
}
