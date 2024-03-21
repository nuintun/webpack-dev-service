/**
 * @module getPaths
 */

import { Compilation, MultiStats, Stats } from 'webpack';
import { Context, Options } from '/server/dev/interface';

function isSingleStatsMode(stats: Stats | MultiStats): stats is Stats {
  return !('stats' in stats);
}

function getStats(stats: Stats | MultiStats | null): Stats[] {
  if (stats == null) {
    return [];
  }

  if (isSingleStatsMode(stats)) {
    return [stats];
  }

  return stats.stats;
}

function getOutputPath(compilation: Compilation): string {
  const { path } = compilation.outputOptions;

  return compilation.getPath(path != null ? path : '');
}

function getPublicPath({ publicPath }: Options, compilation: Compilation): string {
  if (publicPath != null) {
    return compilation.getPath(publicPath);
  }

  publicPath = compilation.outputOptions.publicPath;

  return compilation.getPath(publicPath != null ? publicPath : '');
}

interface Path {
  outputPath: string;
  publicPath: string;
}

export function getPaths({ stats, options }: Context): Path[] {
  const publicPaths: Path[] = [];
  const childStats = getStats(stats);

  for (const { compilation } of childStats) {
    // The `output.path` is always present and always absolute
    const outputPath = getOutputPath(compilation);
    const publicPath = getPublicPath(options, compilation);

    publicPaths.push({ outputPath, publicPath });
  }

  return publicPaths;
}
