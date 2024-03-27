/**
 * @module middleware
 */

import Files from './Files';
import { Middleware } from 'koa';
import { Context } from './interface';
import { ready } from './utils/ready';
import { decodeURI } from './utils/http';
import { getPaths } from './utils/getPaths';
import { ICompiler, IStats } from '/server/interface';

interface FilesInstance {
  files: Files;
  publicPath: string;
}

type InstancesCache = WeakMap<ICompiler, FilesInstance[]>;

function getFilesInstances(context: Context, stats: IStats, cache: InstancesCache): FilesInstance[] {
  const { compiler } = context;
  const cached = cache.get(compiler);

  // Cache hit.
  if (cached) {
    return cached;
  }

  const paths = getPaths(stats);
  const { fs, options } = context;
  const instances: FilesInstance[] = [];
  const { etag, ignore, headers, acceptRanges, lastModified } = options;

  // Get the files instances.
  for (const [outputPath, publicPath] of paths) {
    instances.push({
      publicPath,
      files: new Files(outputPath, {
        fs,
        etag,
        ignore,
        headers,
        acceptRanges,
        lastModified
      })
    });
  }

  // Set cache.
  cache.set(compiler, instances);

  // Return instances.
  return instances;
}

function getFilesInstancesAsync(path: string, context: Context, cache: InstancesCache): Promise<FilesInstance[]> {
  return new Promise(resolve => {
    const { stats } = context;

    // If stats exists, resolve immediately.
    if (stats) {
      resolve(getFilesInstances(context, stats, cache));
    } else {
      // Log waiting info.
      context.logger.info(`wait until bundle finished: ${path}`);

      // Otherwise, wait until bundle finished.
      ready(context, stats => {
        resolve(getFilesInstances(context, stats, cache));
      });
    }
  });
}

export function middleware(context: Context): Middleware {
  const cache: InstancesCache = new WeakMap();

  // Middleware.
  return async (ctx, next) => {
    const path = decodeURI(ctx.path);

    // Path -1 or null byte(s).
    if (path === -1 || path.includes('\0')) {
      return ctx.throw(400);
    }

    // Is path respond.
    let respond = false;

    // Get the files instances.
    const instances = await getFilesInstancesAsync(path, context, cache);

    // Try to respond.
    for (const { files, publicPath } of instances) {
      if (path.startsWith(publicPath)) {
        ctx.path = path.slice(publicPath.length);

        respond = await files.response(ctx);

        if (respond) {
          return;
        } else {
          ctx.path = path;
        }
      }
    }

    // Not respond.
    if (!respond) {
      await next();
    }
  };
}
