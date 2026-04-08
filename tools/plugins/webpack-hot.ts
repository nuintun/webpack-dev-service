/**
 * @module webpackHot
 */

import type { Plugin } from 'rollup';

/***
 * @function webpackHot
 * @description fixed meta url
 * @param {boolean} [esnext] is esnext
 */
export default function webpackHot(exnext?: boolean): Plugin {
  return {
    name: 'rollup-plugin-webpack-hot',
    resolveImportMeta(property) {
      if (property === 'webpackHot') {
        if (exnext) {
          return 'import.meta.webpackHot';
        }

        return 'module.hot';
      }
    }
  };
}
