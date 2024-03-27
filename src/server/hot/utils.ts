/**
 * @module utils
 */

import { Context } from 'koa';
import { Options } from './interface';
import { StatsCompilation, StatsOptions } from 'webpack';
import { ICompiler, IStatsOptions } from '/server/interface';
import { isMultiCompilerMode, isObject } from '/server/utils';

export const WEBSOCKET_RE = /^websocket$/i;

function normalize(path: string): string {
  const segments: string[] = [];
  const parts = path.split(/[\\/]+/);

  for (const segment of parts) {
    switch (segment) {
      case '.':
        break;
      case '..':
        segments.pop();
        break;
      default:
        segments.push(segment);
        break;
    }
  }

  const pathname = segments.join('/');

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function getOptions(options?: Options): Required<Options> {
  const settings = {
    hmr: true,
    wss: false,
    path: '/hot',
    reload: true,
    overlay: true,
    progress: true,
    ...options
  };

  settings.path = normalize(settings.path);

  return settings;
}

export function isUpgradable(context: Context, detector: RegExp): boolean {
  const { upgrade } = context.headers;

  return !!upgrade && detector.test(upgrade.trim());
}

export function hasIssues<T>(issues: ArrayLike<T> | undefined): boolean {
  return Array.isArray(issues) && issues.length > 0;
}

function normalizeStatsOptions(statsOptions?: IStatsOptions): StatsOptions {
  if (!isObject(statsOptions)) {
    statsOptions = {};
  }

  return {
    ...statsOptions,
    all: false,
    hash: true,
    colors: true,
    errors: true,
    assets: false,
    builtAt: true,
    warnings: true,
    errorDetails: false
  };
}

export function getStatsOptions(compiler: ICompiler): StatsOptions {
  if (isMultiCompilerMode(compiler)) {
    return {
      children: compiler.compilers.map(({ options }) => {
        return normalizeStatsOptions(options.stats);
      })
    } as unknown as StatsOptions;
  }

  return normalizeStatsOptions(compiler.options.stats);
}

export function getTimestamp({ builtAt, children = [] }: StatsCompilation): number {
  if (builtAt != null) {
    return builtAt;
  }

  let timestamp = -1;

  for (const { builtAt = timestamp } of children) {
    if (builtAt > timestamp) {
      timestamp = builtAt;
    }
  }

  return timestamp < 0 ? Date.now() : timestamp;
}
