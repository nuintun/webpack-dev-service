import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const corejs = { version: '^3.0.0', proposals: true };
const targets = { browsers: ['defaults', 'ie >= 10'] };

export default [
  {
    input: 'src/client/index.js',
    output: {
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
