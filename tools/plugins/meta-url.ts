/**
 * @module metaURL
 */

import type { Plugin } from 'rollup';

/***
 * @function metaURL
 * @description fixed meta url
 * @param {boolean} [esnext] is esnext
 */
export default function metaURL(exnext?: boolean): Plugin {
  return {
    name: 'rollup-plugin-meta-url',
    resolveImportMeta(property) {
      if (property === 'url') {
        if (exnext) {
          return 'import.meta.url';
        }

        return `require.main.filename`;
      }
    }
  };
}
