export default [
  {
    input: 'src/server/index.js',
    output: {
      format: 'cjs',
      exports: 'auto',
      file: 'index.js'
    },
    external: ['ws', 'koa-compose', 'memoize-one', 'webpack-dev-middleware']
  }
];
