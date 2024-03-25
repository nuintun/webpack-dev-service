/**
 * @module middleware
 */

import Files from './Files';
import { Middleware } from 'koa';
import { Context } from './interface';
import { decodeURI } from './utils/http';
import { getPaths } from './utils/getPaths';

interface FilesInstance {
  files: Files;
  publicPath: string;
}

const cache = new WeakMap<Context['compiler'], FilesInstance[]>();

async function getFilesInstances(context: Context, name: string): Promise<FilesInstance[]> {
  const cached = cache.get(context.compiler);

  if (cached) {
    return cached;
  }

  const { options } = context;
  const instances: FilesInstance[] = [];
  const paths = await getPaths(context, name);

  for (const { outputPath, publicPath } of paths) {
    instances.push({
      publicPath,
      files: new Files(outputPath, {
        etag: options.etag,
        headers: options.headers,
        fs: context.outputFileSystem,
        acceptRanges: options.acceptRanges,
        lastModified: options.lastModified
      })
    });
  }

  return instances;
}

export function middleware(context: Context): Middleware {
  return async (ctx, next) => {
    const path = decodeURI(ctx.path);

    // Path -1 or null byte(s).
    if (path === -1 || path.includes('\0')) {
      return ctx.throw(400);
    }

    let respond = false;

    const instances = await getFilesInstances(context, path);

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

    if (!respond) {
      await next();
    }
  };
}
