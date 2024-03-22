/**
 * @module middleware
 */

import Files from './Files';
import { Middleware } from 'koa';
import { Context } from './interface';
import { whenReady } from './utils/ready';
import { decodeURI } from './utils/common';
import { getPathsAsync } from './utils/getPaths';

interface FilesInstance {
  files: Files;
  publicPath: string;
}

const cache = new WeakMap<Context['compiler'], FilesInstance[]>();

async function getFilesInstances(context: Context): Promise<FilesInstance[]> {
  const cached = cache.get(context.compiler);

  if (cached != null) {
    return cached;
  }

  const { options } = context;
  const instances: FilesInstance[] = [];
  const paths = await getPathsAsync(context);

  for (const { outputPath, publicPath } of paths) {
    instances.push({
      publicPath,
      files: new Files(outputPath, {
        etag: options.etag,
        headers: options.headers,
        fs: context.outputFileSystem,
        acceptRanges: options.acceptRanges,
        cacheControl: options.cacheControl,
        lastModified: options.lastModified
      })
    });
  }

  return instances;
}

export function middleware(context: Context): Middleware {
  return async (ctx, next) => {
    const path = decodeURI(ctx.path);

    // Path -1 or null byte(s)
    if (path === -1 || path.includes('\0')) {
      return ctx.throw(400);
    }

    ctx.path = path;

    let respond = false;

    const instances = await getFilesInstances(context);

    for (const { files, publicPath } of instances) {
      if (path.startsWith(publicPath)) {
        ctx.path = path.slice(publicPath.length);

        if (await whenReady(context)) {
          respond = await files.response(ctx);

          if (respond) {
            return;
          } else {
            ctx.path = path;
          }
        }
      }
    }

    if (!respond) {
      if (await whenReady(context)) {
        await next();
      }
    }
  };
}
