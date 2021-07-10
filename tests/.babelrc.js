/**
 * @module .babelrc
 * @description Babel 配置
 */

'use strict';

const targets = { browsers: ['defaults'] };
const corejs = { version: '^3.0.0', proposals: true };
const development = process.env.BABEL_ENV !== 'production';

module.exports = {
  presets: [
    ['@babel/preset-env', { bugfixes: true, corejs, useBuiltIns: 'usage', targets }],
    ['@babel/preset-react', { runtime: 'automatic', development }]
  ]
};
