/**
 * @module .babelrc
 * @description Babel 配置
 */

const corejs = { version: '^3.0.0', proposals: true };
const targets = { browsers: ['defaults', 'ie >= 10'] };

export default {
  presets: [
    ['@babel/preset-env', { bugfixes: true, corejs, useBuiltIns: 'usage', targets }],
    ['@babel/preset-react', { runtime: 'automatic', development: true }]
  ]
};
