/**
 * @module utils
 */

import webpack from 'webpack';
import { Context } from 'koa';
import { URL } from 'node:url';
import { isBoolean, isString } from '/server/utils';
import { NormalizedOptions, Options } from './interface';

export const BASE_URL = 'wss://127.0.0.1';

export function isUpgradable({ request }: Context): boolean {
  const upgrade = request.get('Upgrade');

  return !!upgrade && /^websocket$/i.test(upgrade.trim());
}

export function getOptions(options?: Options): NormalizedOptions {
  const settings = {
    hmr: true,
    path: '/hot',
    reload: true,
    overlay: true,
    progress: true,
    ...options
  };

  settings.path = new URL(settings.path, BASE_URL).pathname;

  return settings;
}

export function hasIssues<T>(issues: ArrayLike<T> | undefined): boolean {
  return Array.isArray(issues) && issues.length > 0;
}

export function getStatsOptions(compiler: webpack.Compiler): webpack.StatsOptions {
  let statsOptions = compiler.options.stats;

  if (isString(statsOptions)) {
    statsOptions = { preset: statsOptions };
  } else if (isBoolean(statsOptions)) {
    statsOptions = statsOptions ? { preset: 'normal' } : { preset: 'none' };
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

export function getTimestamp({ builtAt, children = [] }: webpack.StatsCompilation): number {
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
