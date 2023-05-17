/**
 * @module main
 */

import createClient, { Options } from './client';

type WebSocketProtocol = 'ws:' | 'wss:';

const isTLS = (protocol: string): boolean => {
  return protocol === 'https:';
};

const getCurrentScript = (): HTMLScriptElement | undefined => {
  const { currentScript } = document;

  if (currentScript) {
    return currentScript as HTMLScriptElement;
  }
};

const resolveProtocol = (params: URLSearchParams, protocol: string): WebSocketProtocol => {
  switch (params.get('tls')) {
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

  let host = params.get('host');
  let protocol: WebSocketProtocol;

  if (host) {
    protocol = resolveProtocol(params, location.protocol);
  } else {
    const script = getCurrentScript();

    if (script) {
      const { src } = script;
      const url = new URL(src, location.href);

      host = url.host;
      protocol = resolveProtocol(params, url.protocol);
    } else {
      host = location.host;
      protocol = resolveProtocol(params, location.protocol);
    }
  }

  return `${protocol}//${host}`;
};

const resolveOptions = (): Options => {
  const params = new URLSearchParams(__resourceQuery);

  const origin = resolveOrigin(params);
  const hmr = params.get('hmr') !== 'false';
  const live = params.get('live') !== 'false';
  const overlay = params.get('overlay') !== 'false';
  const progress = params.get('progress') !== 'false';

  try {
    const options = __WDS_HOT_OPTIONS__;

    return {
      live,
      origin,
      overlay,
      name: options.name,
      path: options.path,
      hmr: options.hmr === false ? false : hmr,
      progress: options.progress === false ? false : progress
    };
  } catch {
    throw new Error('Imported the hot client but the hot server is not enabled.');
  }
};

createClient(resolveOptions());
