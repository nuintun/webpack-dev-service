/**
 * @module metaURL
 */

/***
 * @function metaURL
 * @param {boolean} [exnext]
 * @description Fixed meta url
 * @return {import('rollup').Plugin}
 */
export default function metaURL(exnext) {
  return {
    name: 'rollup-plugin-meta-url',
    resolveImportMeta(property) {
      if (property === 'url') {
        if (exnext) {
          return 'import.meta.url';
        }

        return `require('url').pathToFileURL(__filename)`;
      }
    }
  };
}
