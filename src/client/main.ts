/**
 * @module main
 */

import { createClient, Options } from './client';

type WebSocketProtocol = 'ws:' | 'wss:';

const isTLS = (protocol: string): boolean => {
  return protocol === 'https:';
};

const getCurrentScript = (): HTMLScriptElement | void => {
  const { currentScript } = document;

  if (currentScript) {
    return currentScript as HTMLScriptElement;
  }
};

const getProtocol = (params: URLSearchParams, protocol: string): WebSocketProtocol => {
  switch (params.get('wss')) {
    case 'true':
      return 'wss:';
    case 'false':
      return 'ws:';
    default:
      return isTLS(protocol) ? 'wss:' : 'ws:';
  }
};

const getOrigin = (params: URLSearchParams): string => {
  const { location } = self;
  const script = getCurrentScript();

  if (script) {
    const url = new URL(script.src, location.href);
    const protocol = getProtocol(params, url.protocol);

    return `${protocol}//${url.host}`;
  }

  const protocol = getProtocol(params, location.protocol);

  return `${protocol}//${location.host}`;
};

const getOptions = (): Options => {
  const params = new URLSearchParams(__resourceQuery);

  return {
    uuid: params.get('uuid'),
    origin: getOrigin(params),
    hmr: params.get('hmr') !== 'false',
    path: params.get('path') || '/hot',
    name: params.get('name') || 'rspack',
    reload: params.get('reload') !== 'false',
    overlay: params.get('overlay') !== 'false',
    progress: params.get('progress') !== 'false'
  };
};

if (document.readyState !== 'loading') {
  createClient(getOptions());
} else {
  document.addEventListener('DOMContentLoaded', () => {
    createClient(getOptions());
  });
}
