/**
 * @module index
 */

import Overlay from './ui/overlay';
import Progress from './ui/progress';
import { StatsError } from 'webpack';
import { attemptUpdates, updateHash } from './hot';
import { HashMessage, InvalidMessage, OkMessage, ProblemsMessage, ProgressMessage } from './message';

let retryTimes = 0;
let reloadTimer: number;

const RELOAD_DELAY = 300;
const MAX_RETRY_TIMES = 10;
const RETRY_INTERVAL = 3000;

const options = resolveOptions();

const progress = new Progress();
const overlay = new Overlay(options.name);

function isTLS(protocol: string): boolean {
  return protocol === 'https:';
}

function parseMessage(
  message: MessageEvent<string>
): InvalidMessage | ProgressMessage | HashMessage | ProblemsMessage | OkMessage | null {
  try {
    return JSON.parse(message.data);
  } catch {
    return null;
  }
}

function getCurrentScript(): HTMLScriptElement | undefined {
  const { currentScript } = document;

  if (currentScript) {
    return currentScript as HTMLScriptElement;
  }

  const scripts = document.scripts;

  for (let i = scripts.length - 1; i >= 0; i--) {
    const script = scripts[i];

    // @ts-ignore
    if (script.readyState === 'interactive') {
      return script;
    }
  }
}

function resolveHost(params: URLSearchParams): string {
  let host = params.get('host');
  let tls = params.get('tls') || isTLS(window.location.protocol);

  if (!host) {
    const script = getCurrentScript();

    if (script) {
      const { src } = script;
      const url = new URL(src);

      host = url.host;
      tls = isTLS(url.protocol) || tls;
    } else {
      host = window.location.host;
    }
  }

  return `${tls ? 'wss' : 'ws'}://${host}`;
}

function resolveOptions(): {
  hmr: boolean;
  name: string;
  host: string;
  path: string;
  live: boolean;
  overlay: boolean;
  progress: boolean;
} {
  const params = new URLSearchParams(__resourceQuery);

  const host = resolveHost(params);
  const live = params.get('live') !== 'false';
  const overlay = params.get('overlay') !== 'false';

  try {
    return { ...__WDS_HOT_OPTIONS__, host, live, overlay };
  } catch {
    throw new Error('Imported the hot client but the hot server is not enabled.');
  }
}

function fallback(error?: Error): void {
  if (options.live) {
    reloadTimer = self.setTimeout(() => {
      window.location.reload();
    }, RELOAD_DELAY);
  } else if (error) {
    console.error(error);
    console.warn('Use fallback update but you turn off live reload, please reload by yourself.');
  }
}

function onInvalid() {
  clearTimeout(reloadTimer);

  if (options.progress) {
    progress.update(0);
    progress.show();
  }
}

function onProgress({ value }: ProgressMessage['payload']) {
  if (options.progress) {
    progress.update(value);
  }
}

function onHash({ hash }: HashMessage['payload']) {
  updateHash(hash);
}

function setProblems(type: 'errors' | 'warnings', problems: StatsError[]) {
  const nameMaps: Record<string, [string, 'error' | 'warn']> = {
    errors: ['Error', 'error'],
    warnings: ['Warning', 'warn']
  };
  const [name, method] = nameMaps[type];

  if (options.overlay) {
    overlay.setProblems(type, problems);
  }

  for (const { moduleName, message } of problems) {
    console[method](`${name} in ${moduleName}\r\n${message}`);
  }
}

function onProblems({ errors, warnings }: ProblemsMessage['payload']) {
  progress.hide();

  setProblems('errors', errors);
  setProblems('warnings', warnings);

  if (options.overlay) {
    overlay.show();
  }

  if (errors.length <= 0) {
    attemptUpdates(options.hmr, fallback);
  }
}

function onSuccess() {
  overlay.hide();
  progress.hide();

  attemptUpdates(options.hmr, fallback);
}

function createWebSocket(url: string): void {
  const ws = new WebSocket(url);

  ws.onopen = () => {
    retryTimes = 0;
  };

  ws.onmessage = (message: MessageEvent<string>) => {
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

      window.postMessage({ action: `webpack-hot-${action}`, payload }, '*');
    }
  };

  ws.onclose = () => {
    overlay.hide();
    progress.hide();

    if (retryTimes++ < MAX_RETRY_TIMES) {
      setTimeout(() => {
        createWebSocket(url);
      }, RETRY_INTERVAL);
    }
  };
}

createWebSocket(options.host + options.path);
