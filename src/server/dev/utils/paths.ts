/**
 * @module paths
 */

import { URL } from 'url';
import { IStats } from '/server/interface';
import { Compilation, MultiStats, Stats } from 'webpack';

type Path = [outputPath: string, publicPath: string];

function getOutputPath(compilation: Compilation): string {
  // The `output.path` is always present and always absolute.
  const { path } = compilation.outputOptions;

  // Get the path.
  return compilation.getPath(path ? path : '');
}

function getPublicPath(compilation: Compilation): string {
  const { publicPath } = compilation.outputOptions;
  // @see https://webpack.js.org/guides/public-path/#automatic-publicpath
  const path = publicPath ? compilation.getPath(publicPath) : 'auto';

  // Return / if auto.
  if (path === 'auto') {
    return '/';
  }

  // Get the path.
  try {
    return new URL(path).pathname;
  } catch {
    return `/${path}/`.replace(/\/{2,}/g, '/');
  }
}

function getStats(stats: IStats): Stats[] {
  if (isMultiStatsMode(stats)) {
    return stats.stats;
  }

  // Return the stats.
  return [stats];
}

function isMultiStatsMode(stats: IStats): stats is MultiStats {
  return 'stats' in stats;
}

export function getPaths(stats: IStats): Path[] {
  const paths: Path[] = [];
  const childStats = getStats(stats);

  // Get the paths.
  for (const { compilation } of childStats) {
    paths.push([
      // Output path.
      getOutputPath(compilation),
      // Public path.
      getPublicPath(compilation)
    ]);
  }

  // Return the paths.
  return paths;
}
