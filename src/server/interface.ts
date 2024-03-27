/**
 * @module interface
 */

import { Compiler, Configuration, MultiCompiler, MultiStats, Stats, Watching } from 'webpack';

export type IStats = Stats | MultiStats;

export type ICompiler = Compiler | MultiCompiler;

export type IStatsOptions = NonNullable<Configuration['stats']>;

export type ILogger = ReturnType<Compiler['getInfrastructureLogger']>;

export type IWatching = Watching | ReturnType<MultiCompiler['watch']>;
