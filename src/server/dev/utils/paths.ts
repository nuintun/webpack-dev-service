/**
 * @module paths
 */

import { URL } from 'url';
import { unixify } from './path';
import { IStats } from '/server/interface';
import { Compilation, MultiStats, Stats } from 'webpack';

type PathsItem = [
  // Output path.
  outputPath: string,
  // Public path.
  publicPath: string
];

function normalize(path: string): string {
  path = unixify(path);

  if (/^\//.test(path)) {
    return path;
  }

  return `/${path}`;
}

function getStats(stats: IStats): Stats[] {
  if (isMultiStatsMode(stats)) {
    return stats.stats;
  }

  // Return the stats.
  return [stats];
}

function getOutputPath(compilation: Compilation): string {
  // The `output.path` is always present and always absolute.
  const { path } = compilation.outputOptions;

  // Get the path.
  return compilation.getPath(path ?? '');
}

function getPublicPath(compilation: Compilation): string {
  const { publicPath } = compilation.outputOptions;

  // @see https://webpack.js.org/guides/public-path/#automatic-publicpath
  if (publicPath === 'auto') {
    return '/';
  }

  // Get public path.
  const path = compilation.getPath(publicPath ?? '');

  // Get public path without protocol.
  try {
    return new URL(path).pathname;
  } catch {
    return normalize(path);
  }
}

function isMultiStatsMode(stats: IStats): stats is MultiStats {
  return 'stats' in stats;
}

export function getPaths(stats: IStats): PathsItem[] {
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
