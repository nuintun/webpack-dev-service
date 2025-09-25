/**
 * @module middleware
 */

import { Middleware } from 'koa';
import { Service } from './Service';
import { ready } from './utils/ready';
import { decodeURI } from './utils/http';
import { getPaths } from './utils/paths';
import { UnionStats } from '/server/interface';
import { Context, FileService } from './interface';

function getFileServices(context: Context, stats: UnionStats): FileService[] {
  const { options } = context;
  const paths = getPaths(stats);
  const services: FileService[] = [];

  // Get the file services.
  for (const [outputPath, publicPath] of paths) {
    services.push([publicPath, new Service(outputPath, options)]);
  }

  // Return services.
  return services;
}

function getFileServicesAsync(context: Context): Promise<FileService[]> {
  return new Promise(resolve => {
    const { stats } = context;

    // If stats exists, resolve immediately.
    if (stats) {
      resolve(getFileServices(context, stats));
    } else {
      // Otherwise, wait until bundle finished.
      ready(context, stats => {
        resolve(getFileServices(context, stats));
      });
    }
  });
}

export async function middleware(context: Context): Promise<Middleware> {
  // Get the file services.
  const services = await getFileServicesAsync(context);

  // Middleware.
  return async (context, next) => {
    const { request } = context;
    const pathname = decodeURI(request.path);

    // Pathname decode failed or includes null byte(s).
    if (pathname === -1 || pathname.includes('\0')) {
      return context.throw(400);
    }

    // Get request method.
    const { method } = request;

    // Only support GET and HEAD (405).
    if (method === 'GET' || method === 'HEAD') {
      // Try to respond.
      for (const [publicPath, service] of services) {
        if (await service.respond(pathname, context, publicPath)) {
          return;
        }
      }
    }

    // Not respond.
    await next();
  };
}
