/**
 * @module .babelrc
 * @description Babel 配置
 */

const targets = { browsers: ['defaults', 'ie >= 10'] };
const corejs = { version: '^3.0.0', proposals: true };
const development = process.env.BABEL_ENV !== 'production';

export default {
  presets: [
    ['@babel/preset-env', { bugfixes: true, corejs, useBuiltIns: 'usage', targets }],
    ['@babel/preset-react', { runtime: 'automatic', development }]
  ]
};
