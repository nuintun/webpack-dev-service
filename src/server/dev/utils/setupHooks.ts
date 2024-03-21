/**
 * @module setupHooks
 */

import { StatsOptions } from 'webpack';
import { Context, InitialContext, Options } from '/server/dev/interface';
import { isBoolean, isSingleCompilerMode, isString, PLUGIN_NAME } from './common';

function normalizeStatsOptions(statsOptions: Options['stats']): StatsOptions {
  if (statsOptions == null) {
    return { preset: 'normal' };
  } else if (isString(statsOptions)) {
    return { preset: statsOptions };
  } else if (isBoolean(statsOptions)) {
    return statsOptions ? { preset: 'normal' } : { preset: 'none' };
  }

  if (statsOptions.colors == null) {
    // TODO 自动颜色 supports-color
    statsOptions.colors = true;
  }

  return statsOptions;
}

function getStatsOptions(context: InitialContext): StatsOptions | { children: StatsOptions[] } {
  const { compiler } = context;
  const { stats } = context.options;

  if (stats != null) {
    if (isSingleCompilerMode(compiler)) {
      return normalizeStatsOptions(stats);
    }

    return {
      children: compiler.compilers.map(() => normalizeStatsOptions(stats))
    };
  }

  if (isSingleCompilerMode(compiler)) {
    return normalizeStatsOptions(compiler.options.stats);
  }

  return {
    children: compiler.compilers.map(({ options }) => normalizeStatsOptions(options.stats))
  };
}

export function setupHooks(context: InitialContext): void {
  function invalid(): void {
    if (context.state) {
      context.logger.log('Compilation starting...');
    }

    // We are now in invalid state
    context.stats = null;
    context.state = false;
  }

  function done(stats: NonNullable<Context['stats']>): void {
    // We are now on valid state
    context.state = true;
    context.stats = stats;

    // Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling
    process.nextTick(() => {
      const { state } = context;

      // Check if still in valid state
      if (state) {
        const { logger, callbacks } = context;

        logger.log('Compilation finished');

        context.callbacks = [];

        for (const callback of callbacks) {
          callback(stats);
        }

        const statsOptions = getStatsOptions(context);
        const printedStats = stats.toString(statsOptions as StatsOptions);

        // Avoid extra empty line when `stats: 'none'`
        if (printedStats) {
          logger.log(printedStats);
        }
      }
    });
  }

  const { hooks } = context.compiler;

  hooks.done.tap(PLUGIN_NAME, done);
  hooks.invalid.tap(PLUGIN_NAME, invalid);
  hooks.watchRun.tap(PLUGIN_NAME, invalid);
}
