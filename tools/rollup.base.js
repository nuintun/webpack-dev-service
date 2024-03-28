/**
 * @module rollup.base
 */

import { createRequire } from 'module';
import metaURL from './plugins/meta-url.js';
import replace from '@rollup/plugin-replace';
import treeShake from './plugins/tree-shake.js';
import webpackHot from './plugins/webpack-hot.js';
import typescript from '@rollup/plugin-typescript';

const pkg = createRequire(import.meta.url)('../package.json');

const banner = `/**
  * @package ${pkg.name}
  * @license ${pkg.license}
  * @version ${pkg.version}
  * @author ${pkg.author.name} <${pkg.author.email}>
  * @description ${pkg.description}
  * @see ${pkg.homepage}
  */
 `;

/**
 * @function env
 * @param {boolean} esnext
 * @return {import('rollup').Plugin}
 */
function env(esnext) {
  const ext = esnext ? 'js' : 'cjs';
  const client = `../../client/main.${ext}`;

  return replace({
    preventAssignment: true,
    values: {
      __HOT_CLIENT__: JSON.stringify(client)
    }
  });
}

/**
 * @function rollup
 * @param {boolean} [esnext]
 * @return {import('rollup').RollupOptions[]}
 */
export default function rollup(esnext) {
  return [
    {
      input: 'src/server/index.ts',
      output: {
        banner,
        esModule: false,
        exports: 'auto',
        interop: 'auto',
        preserveModules: true,
        format: esnext ? 'esm' : 'cjs',
        generatedCode: { constBindings: true },
        dir: esnext ? 'esm/server' : 'cjs/server',
        entryFileNames: `[name].${esnext ? 'js' : 'cjs'}`,
        chunkFileNames: `[name].${esnext ? 'js' : 'cjs'}`
      },
      plugins: [env(esnext), metaURL(esnext), typescript(), treeShake()],
      onwarn(error, warn) {
        if (error.code !== 'CIRCULAR_DEPENDENCY') {
          warn(error);
        }
      },
      external: [
        'fs',
        'ws',
        'url',
        'etag',
        'path',
        'memfs',
        'tslib',
        'crypto',
        'stream',
        'destroy',
        'webpack',
        'koa-compose',
        'range-parser',
        'schema-utils',
        'supports-color'
      ]
    },
    {
      input: ['src/client/main.ts', 'src/client/index.ts'],
      output: {
        banner,
        esModule: false,
        exports: 'auto',
        interop: 'auto',
        preserveModules: true,
        format: esnext ? 'esm' : 'cjs',
        generatedCode: { constBindings: true },
        dir: esnext ? 'esm/client' : 'cjs/client',
        entryFileNames: `[name].${esnext ? 'js' : 'cjs'}`,
        chunkFileNames: `[name].${esnext ? 'js' : 'cjs'}`
      },
      plugins: [webpackHot(esnext), typescript(), treeShake()],
      onwarn(error, warn) {
        if (error.code !== 'CIRCULAR_DEPENDENCY') {
          warn(error);
        }
      },
      external: ['tslib', '@nuintun/ansi']
    }
  ];
}
