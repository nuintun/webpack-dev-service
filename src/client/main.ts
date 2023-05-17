/**
 * @module main
 */

import createClient, { Options } from './client';

const isTLS = (protocol: string): boolean => {
  return protocol === 'https:';
};

const getCurrentScript = (): HTMLScriptElement | undefined => {
  const { currentScript } = document;

  if (currentScript) {
    return currentScript as HTMLScriptElement;
  }
};

const resolveHost = (params: URLSearchParams): string => {
  let host = params.get('host');
  let tls = params.get('tls') || isTLS(self.location.protocol);

  if (!host) {
    const script = getCurrentScript();

    if (script) {
      const { src } = script;
      const url = new URL(src);

      host = url.host;
      tls = isTLS(url.protocol) || tls;
    } else {
      host = self.location.host;
    }
  }

  return `${tls ? 'wss' : 'ws'}://${host}`;
};

const resolveOptions = (): Options => {
  const params = new URLSearchParams(__resourceQuery);

  const host = resolveHost(params);
  const hmr = params.get('hmr') !== 'false';
  const live = params.get('live') !== 'false';
  const overlay = params.get('overlay') !== 'false';
  const progress = params.get('progress') !== 'false';

  try {
    const options = __WDS_HOT_OPTIONS__;

    return {
      host,
      live,
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
