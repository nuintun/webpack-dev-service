/**
 * @module rollup
 */

import pkg from '../package.json';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const babelHelpers = 'bundled';
const extensions = ['.ts', '.js'];
const corejs = { version: '^3.0.0', proposals: true };
const targets = { browsers: ['defaults', 'not IE >= 0'] };

const banner = `/**
 * @package ${pkg.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

export default [
  {
    input: 'src/client/index.ts',
    output: {
      banner,
      format: 'esm',
      file: 'client.js'
    },
    plugins: [
      resolve({
        extensions
      }),
      babel({
        extensions,
        babelHelpers,
        presets: [
          [
            '@babel/preset-env',
            {
              corejs,
              targets,
              bugfixes: true,
              useBuiltIns: 'usage'
            }
          ],
          [
            '@babel/preset-typescript',
            {
              optimizeConstEnums: true
            }
          ]
        ]
      })
    ],
    external: [/core-js/, 'ansi-regex']
  },
  {
    input: 'src/server/index.ts',
    output: {
      banner,
      format: 'cjs',
      interop: false,
      exports: 'auto',
      file: 'index.js',
      preferConst: true
    },
    plugins: [
      resolve({
        extensions
      }),
      babel({
        extensions,
        babelHelpers,
        presets: [
          [
            '@babel/preset-typescript',
            {
              optimizeConstEnums: true
            }
          ]
        ]
      })
    ],
    external: ['ws', 'webpack', 'koa-compose', 'memoize-one', 'path/posix', 'webpack-dev-middleware']
  }
];
