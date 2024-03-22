/**
 * @module getPaths
 */

import { URL } from 'url';
import { ready } from './ready';
import { Context } from '/server/dev/interface';
import { Compilation, MultiStats, Stats } from 'webpack';

interface Path {
  outputPath: string;
  publicPath: string;
}

const cache = new WeakMap<Context['compiler'], Path[]>();

function getOutputPath(compilation: Compilation): string {
  const { path } = compilation.outputOptions;

  return compilation.getPath(path != null ? path : '');
}

function getPublicPath(compilation: Compilation): string {
  const { publicPath } = compilation.outputOptions;
  const path = compilation.getPath(publicPath != null ? publicPath : '');

  try {
    return new URL(path).pathname;
  } catch {
    return path;
  }
}

function getStats(stats: Stats | MultiStats | null): Stats[] {
  if (stats == null) {
    return [];
  }

  if (isMultiStatsMode(stats)) {
    return stats.stats;
  }

  return [stats];
}

function isMultiStatsMode(stats: Stats | MultiStats): stats is MultiStats {
  return 'stats' in stats;
}

export function getPaths(context: Context, name: string): Promise<Path[]> {
  return new Promise(resolve => {
    const { compiler } = context;
    const paths = cache.get(compiler);

    if (paths != null) {
      resolve(paths);
    } else {
      ready(
        context,
        stats => {
          const paths: Path[] = [];
          const childStats = getStats(stats);

          for (const { compilation } of childStats) {
            // The `output.path` is always present and always absolute
            const outputPath = getOutputPath(compilation);
            const publicPath = getPublicPath(compilation);

            paths.push({ outputPath, publicPath });
          }

          cache.set(compiler, paths);

          resolve(paths);
        },
        name
      );
    }
  });
}
