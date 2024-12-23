/**
 * @module paths
 */

import webpack from 'webpack';
import { URL } from 'node:url';
import { UnionStats } from '/server/interface';

type PathsItem = [
  // Output path.
  outputPath: string,
  // Public path.
  publicPath: string
];

function getStats(stats: UnionStats): webpack.Stats[] {
  if ('stats' in stats) {
    return stats.stats;
  }

  // Return the stats.
  return [stats];
}

function getPublicPath(compilation: webpack.Compilation): string {
  const { publicPath } = compilation.outputOptions;

  // @see https://webpack.js.org/guides/public-path/#automatic-publicpath
  if (publicPath === 'auto') {
    return '/';
  }

  // Get public path.
  const path = compilation.getPath(publicPath ?? '');

  // Get public path without protocol.
  return new URL(path, 'https://127.0.0.1').pathname;
}

function getOutputPath(compilation: webpack.Compilation): string {
  // The `output.path` is always present and always absolute.
  const { path } = compilation.outputOptions;

  // Get the path.
  return compilation.getPath(path ?? '');
}

export function getPaths(stats: UnionStats): PathsItem[] {
  const paths: PathsItem[] = [];
  const childStats = getStats(stats);

  // Get the paths.
  for (const { compilation } of childStats) {
    const outputPath = getOutputPath(compilation);
    const publicPath = getPublicPath(compilation);

    // Cache paths.
    paths.push([outputPath, publicPath]);
  }

  // Return the paths.
  return paths;
}
