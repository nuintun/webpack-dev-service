/**
 * @module middleware
 */

import Files from './Files';
import { Middleware } from 'koa';
import { Context } from './interface';
import { ready } from './utils/ready';
import { decodeURI } from './utils/http';
import { IStats } from '/server/interface';
import { getPaths } from './utils/getPaths';

interface FilesInstance {
  files: Files;
  publicPath: string;
}

function getFilesInstances({ fs, options }: Context, stats: IStats): FilesInstance[] {
  const paths = getPaths(stats);
  const instances: FilesInstance[] = [];
  const { etag, ignore, headers, acceptRanges, lastModified } = options;

  // Get the files instances.
  for (const { outputPath, publicPath } of paths) {
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

  return instances;
}

function getFilesInstancesAsync(context: Context): Promise<FilesInstance[]> {
  return new Promise(resolve => {
    const { stats } = context;
    // If stats exists, resolve immediately.
    if (stats) {
      resolve(getFilesInstances(context, stats));
    } else {
      // Otherwise, wait until bundle finished.
      ready(context, stats => {
        resolve(getFilesInstances(context, stats));
      });
    }
  });
}

export function middleware(context: Context): Middleware {
  let instances: FilesInstance[];

  // Middleware.
  return async (ctx, next) => {
    const path = decodeURI(ctx.path);

    // Path -1 or null byte(s).
    if (path === -1 || path.includes('\0')) {
      return ctx.throw(400);
    }

    // Instances not initialized.
    if (!instances) {
      // Log waiting info.
      context.logger.info(`wait until bundle finished: ${path}`);

      // Get the files instances.
      instances = await getFilesInstancesAsync(context);
    }

    // Is path respond.
    let respond = false;

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
