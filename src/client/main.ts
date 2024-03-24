/**
 * @module main
 */

import createClient, { Options } from './client';

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

const resolveProtocol = (params: URLSearchParams, protocol: string): WebSocketProtocol => {
  switch (params.get('wss')) {
    case 'true':
      return 'wss:';
    case 'false':
      return 'ws:';
    default:
      return isTLS(protocol) ? 'wss:' : 'ws:';
  }
};

const resolveOrigin = (params: URLSearchParams): string => {
  const { location } = self;
  const script = getCurrentScript();

  if (script) {
    const url = new URL(script.src, location.href);
    const protocol = resolveProtocol(params, url.protocol);

    return `${protocol}//${url.host}`;
  }

  const protocol = resolveProtocol(params, location.protocol);

  return `${protocol}//${location.host}`;
};

const resolveOptions = (): Options => {
  const params = new URLSearchParams(__resourceQuery);

  return {
    origin: resolveOrigin(params),
    hmr: params.get('hmr') !== 'false',
    path: params.get('path') || '/hot',
    name: params.get('name') || 'webpack',
    reload: params.get('reload') !== 'false',
    overlay: params.get('overlay') !== 'false',
    progress: params.get('progress') !== 'false'
  };
};

createClient(resolveOptions());
