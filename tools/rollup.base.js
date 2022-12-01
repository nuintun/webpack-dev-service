/**
 * @module rollup.base
 */

import { createRequire } from 'module';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const babelHelpers = 'bundled';
const extensions = ['.ts', '.js'];
const corejs = { version: '^3.0.0', proposals: true };
const targets = { browsers: ['defaults', 'not IE >= 0'] };
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
        esModule: false,
        exports: 'auto',
        interop: 'auto',
        preserveModules: true,
        format: esnext ? 'esm' : 'cjs',
        generatedCode: { constBindings: true },
        dir: esnext ? 'server/esm' : 'server/cjs',
        chunkFileNames: `[name].${esnext ? 'js' : 'cjs'}`,
        entryFileNames: `[name].${esnext ? 'js' : 'cjs'}`
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
        interop: 'auto',
        exports: 'auto',
        esModule: false,
        preserveModules: true,
        generatedCode: { constBindings: true }
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
      external: ['tslib', /core-js/, 'ansi-regex'],
      onwarn(error, warn) {
        if (error.code !== 'CIRCULAR_DEPENDENCY') {
          warn(error);
        }
      }
    }
  ];
}
