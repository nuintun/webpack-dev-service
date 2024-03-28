/**
 * @module webpackHot
 */

/***
 * @function webpackHot
 * @param {boolean} [exnext]
 * @description Fixed webpack hot
 * @return {import('rollup').Plugin}
 */
export default function webpackHot(exnext) {
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
