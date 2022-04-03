/**
 * @module rollup
 */

import pkg from './package.json';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const targets = { browsers: ['defaults'] };
const corejs = { version: '^3.0.0', proposals: true };

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
    input: 'src/client/index.js',
    output: {
      banner,
      format: 'esm',
      file: 'client.js'
    },
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              corejs,
              targets,
              bugfixes: true,
              useBuiltIns: 'usage'
            }
          ]
        ]
      })
    ],
    external: [/core-js/, 'ansi-regex']
  },
  {
    input: 'src/server/index.js',
    output: {
      banner,
      format: 'cjs',
      interop: false,
      exports: 'auto',
      file: 'index.js',
      preferConst: true
    },
    plugins: [resolve()],
    external: ['ws', 'webpack', 'koa-compose', 'memoize-one', 'webpack-dev-middleware']
  }
];
