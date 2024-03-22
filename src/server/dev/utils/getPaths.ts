/**
 * @module getPaths
 */

import { ready } from './ready';
import { Compilation, MultiStats, Stats } from 'webpack';
import { Context, Options } from '/server/dev/interface';

interface Path {
  outputPath: string;
  publicPath: string;
}

const cache = new WeakMap<Context['compiler'], Path[]>();

function isMultiStatsMode(stats: Stats | MultiStats): stats is MultiStats {
  return 'stats' in stats;
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
          const { options } = context;
          const childStats = getStats(stats);

          for (const { compilation } of childStats) {
            // The `output.path` is always present and always absolute
            const outputPath = getOutputPath(compilation);
            const publicPath = getPublicPath(options, compilation);

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
