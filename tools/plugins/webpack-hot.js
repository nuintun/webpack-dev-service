/**
 * @module webpackHot
 */

/***
 * @function webpackHot
 * @param {boolean} [exnext]
 * @description Fixed webpack hot
 * @return {import('rollup').PluginHooks}
 */
export default function webpackHot(exnext) {
  return {
    name: 'rollup-plugin-webpack-hot',
    resolveImportMeta(property) {
      if (property === 'webpackHot') {
        return exnext ? 'import.meta.webpackHot' : 'module.hot';
      }
    }
  };
}
