/**
 * @module middleware
 */

import { Middleware } from 'koa';
import { Service } from './Service';
import { ready } from './utils/ready';
import { decodeURI } from './utils/http';
import { getPaths } from './utils/paths';
import { IStats } from '/server/interface';
import { Context, FileService } from './interface';

function getFileServices(context: Context, stats: IStats): FileService[] {
  const cached = context.services;

  // Cache hit.
  if (cached) {
    return cached;
  }

  const paths = getPaths(stats);
  const { fs, options } = context;
  const services: FileService[] = [];
  const { etag, ignore, headers, acceptRanges, lastModified } = options;

  // Get the file services.
  for (const [outputPath, publicPath] of paths) {
    services.push([
      publicPath,
      new Service(outputPath, {
        fs,
        etag,
        ignore,
        headers,
        acceptRanges,
        lastModified
      })
    ]);
  }

  // Cache services.
  context.services = services;

  // Return services.
  return services;
}

function getFileServicesAsync(context: Context, path: string): Promise<FileService[]> {
  return new Promise(resolve => {
    const { stats } = context;

    // If stats exists, resolve immediately.
    if (stats) {
      resolve(getFileServices(context, stats));
    } else {
      // Log waiting info.
      context.logger.info(`wait until bundle finished: ${path}`);

      // Otherwise, wait until bundle finished.
      ready(context, stats => {
        resolve(getFileServices(context, stats));
      });
    }
  });
}

export function middleware(context: Context): Middleware {
  // Middleware.
  return async (ctx, next) => {
    const path = decodeURI(ctx.path);

    // Path -1 or null byte(s).
    if (path === -1 || path.includes('\0')) {
      return ctx.throw(400);
    }

    // Is path respond.
    let respond = false;

    // Get the file services.
    const services = await getFileServicesAsync(context, path);

    // Try to respond.
    for (const [publicPath, service] of services) {
      if (path.startsWith(publicPath)) {
        ctx.path = path.slice(publicPath.length);

        respond = await service.response(ctx);

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
