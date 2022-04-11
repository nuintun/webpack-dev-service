/**
 * @module rollup
 */

import rimraf from 'rimraf';
import pkg from './package.json';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const babelHelpers = 'bundled';
const extensions = ['.ts', '.js'];
const corejs = { version: '^3.0.0', proposals: true };
const targets = { browsers: ['defaults', 'not IE >= 0'] };

function clean(paths) {
  paths = Array.isArray(paths) ? paths : [paths];

  paths.forEach(path => rimraf.sync(path));
}

clean(['server', 'client', 'typings']);

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
    input: 'src/server/index.ts',
    output: {
      banner,
      format: 'cjs',
      dir: 'server',
      interop: false,
      exports: 'auto',
      preferConst: true
    },
    preserveModules: true,
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
  },
  {
    input: 'src/client/index.ts',
    output: {
      banner,
      format: 'esm',
      dir: 'client'
    },
    preserveModules: true,
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
  }
];
