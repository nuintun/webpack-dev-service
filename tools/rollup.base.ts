/**
 * @module rollup.base
 */

import url from '@rollup/plugin-url';
import { isBuiltin } from 'node:module';
import metaURL from './plugins/meta-url.ts';
import type { RollupOptions } from 'rollup';
import replace from '@rollup/plugin-replace';
import webpackHot from './plugins/webpack-hot.ts';
import typescript from '@rollup/plugin-typescript';
import pkg from '../package.json' with { type: 'json' };

const externals = [
  // @ts-ignore
  // dependencies
  ...Object.keys(pkg.dependencies ?? {}),
  // @ts-ignore
  // peer dependencies
  ...Object.keys(pkg.peerDependencies ?? {})
];

const banner = `/**
 * @module webpack-dev-service
 * @package ${pkg.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

/**
 * @function env
 * @description replace environment variables
 * @param {boolean} esnext is esnext
 */
function env(esnext: boolean) {
  const ext = esnext ? 'js' : 'cjs';
  const client = `../../client/main.${ext}`;

  return replace({
    preventAssignment: true,
    values: {
      __ESM__: `${esnext} === true`,
      __HOT_CLIENT__: JSON.stringify(client),
      __PLUGIN_NAME__: JSON.stringify(pkg.name)
    }
  });
}

/**
 * @function rollup
 * @description rollup configuration
 * @param {boolean} [esnext] is esnext
 */
export default function rollup(esnext = false): RollupOptions {
  return {
    input: ['src/server/index.ts', 'src/client/main.ts', 'src/client/index.ts'],
    output: {
      banner,
      esModule: false,
      interop: 'auto',
      exports: 'named',
      preserveModules: true,
      dir: esnext ? 'esm' : 'cjs',
      format: esnext ? 'esm' : 'cjs',
      generatedCode: { constBindings: true },
      entryFileNames: `[name].${esnext ? 'js' : 'cjs'}`,
      chunkFileNames: `[name].${esnext ? 'js' : 'cjs'}`
    },
    plugins: [
      env(esnext),
      metaURL(esnext),
      webpackHot(esnext),
      url({ limit: Infinity }),
      typescript({
        rootDir: 'src',
        declaration: true,
        declarationDir: esnext ? 'esm' : 'cjs',
        include: ['../src/**/*', '../global.d.ts']
      })
    ],
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    },
    external(source) {
      if (isBuiltin(source)) {
        return true;
      }

      for (const external of externals) {
        if (source === external || source.startsWith(`${external}/`)) {
          return true;
        }
      }

      return false;
    }
  };
}
