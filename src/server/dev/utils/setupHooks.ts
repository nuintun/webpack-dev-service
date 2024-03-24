/**
 * @module setupHooks
 */

import { StatsOptions } from 'webpack';
import supportsColor from 'supports-color';
import { IStatsOptions } from '/server/interface';
import { Context, InitialContext } from '/server/dev/interface';
import { isBoolean, isMultiCompilerMode, isString, PLUGIN_NAME } from '/server/utils';

function normalizeStatsOptions(statsOptions?: IStatsOptions): StatsOptions {
  if (statsOptions == null) {
    return { preset: 'normal' };
  } else if (isString(statsOptions)) {
    return { preset: statsOptions };
  } else if (isBoolean(statsOptions)) {
    return statsOptions ? { preset: 'normal' } : { preset: 'none' };
  }

  if (statsOptions.colors == null) {
    const { stdout, stderr } = supportsColor;

    statsOptions.colors = stdout !== false && stderr !== false;
  }

  return statsOptions;
}

function getStatsOptions(context: InitialContext): StatsOptions {
  const { compiler } = context;
  const { stats } = context.options;

  if (stats != null) {
    if (!isMultiCompilerMode(compiler)) {
      return normalizeStatsOptions(stats);
    }

    return {
      children: compiler.compilers.map(() => normalizeStatsOptions(stats))
    } as unknown as StatsOptions;
  }

  if (!isMultiCompilerMode(compiler)) {
    return normalizeStatsOptions(compiler.options.stats);
  }

  return {
    children: compiler.compilers.map(({ options }) => normalizeStatsOptions(options.stats))
  } as unknown as StatsOptions;
}

export function setupHooks(context: InitialContext): void {
  function invalid(): void {
    if (context.state) {
      context.logger.log('Compilation starting...');
    }

    // We are now in invalid state.
    context.state = false;
    context.stats = undefined;
  }

  const statsOptions = getStatsOptions(context);

  function done(stats: NonNullable<Context['stats']>): void {
    // We are now on valid state
    context.state = true;
    context.stats = stats;

    // Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling.
    process.nextTick(() => {
      const { state } = context;

      // Check if still in valid state.
      if (state) {
        const { logger, callbacks } = context;

        logger.log('Compilation finished');

        context.callbacks = [];

        for (const callback of callbacks) {
          callback(stats);
        }

        const printedStats = stats.toString(statsOptions);

        // Avoid extra empty line when `stats: 'none'`.
        if (printedStats) {
          console.log(printedStats);
        }
      }
    });
  }

  const { hooks } = context.compiler;

  hooks.done.tap(PLUGIN_NAME, done);
  hooks.invalid.tap(PLUGIN_NAME, invalid);
  hooks.watchRun.tap(PLUGIN_NAME, invalid);
}
