/**
 * @module client
 */

import createClient, { Options } from './client';

if (!window.__WDS_HOT_CLIENT_INITIALLED__) {
  window.__WDS_HOT_CLIENT_INITIALLED__ = true;

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
  };

  const resolveOptions = (): Options => {
    const params = new URLSearchParams(__resourceQuery);

    const host = resolveHost(params);
    const live = params.get('live') !== 'false';
    const overlay = params.get('overlay') !== 'false';

    try {
      return { ...__WDS_HOT_OPTIONS__, host, live, overlay };
    } catch {
      throw new Error('Imported the hot client but the hot server is not enabled.');
    }
  };

  createClient(resolveOptions());
}

export { off, on } from './events';
