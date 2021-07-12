export default [
  {
    input: 'src/client/index.js',
    output: {
      format: 'cjs',
      interop: false,
      exports: 'auto',
      file: 'client/index.js'
    },
    external: ['ansi-html', 'html-entities']
  },
  {
    input: 'src/server/index.js',
    output: {
      format: 'cjs',
      interop: false,
      exports: 'auto',
      file: 'index.js'
    },
    external: ['ws', 'webpack', 'koa-compose', 'memoize-one', 'webpack-dev-middleware']
  }
];
