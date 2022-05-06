/**
 * @module rollup.base
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

/**
 * @function rollup
 * @param esnext
 * @param development
 */
export default function rollup(esnext) {
  return [
    {
      input: 'src/server/index.ts',
      output: {
        banner,
        interop: false,
        exports: 'auto',
        esModule: false,
        preferConst: true,
        format: esnext ? 'esm' : 'cjs',
        dir: esnext ? 'server/esm' : 'server/cjs'
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
      external: ['ws', 'tslib', 'webpack', 'koa-compose', 'memoize-one', 'path/posix', 'webpack-dev-middleware'],
      onwarn(error, warn) {
        if (error.code !== 'CIRCULAR_DEPENDENCY') {
          warn(error);
        }
      }
    },
    {
      input: 'src/client/index.ts',
      output: {
        banner,
        dir: 'client',
        format: 'esm',
        interop: false,
        exports: 'auto',
        esModule: false,
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
      external: ['tslib', /core-js/, 'ansi-regex'],
      onwarn(error, warn) {
        if (error.code !== 'CIRCULAR_DEPENDENCY') {
          warn(error);
        }
      }
    }
  ];
}
