/**
 * @module interface
 */

import { Compiler, Configuration, MultiCompiler, MultiStats, Stats, Watching } from 'webpack';

export type IStats = Stats | MultiStats;

export type ICompiler = Compiler | MultiCompiler;

export type IStatsOptions = GetProp<Configuration, 'stats'>;

export type ILogger = ReturnType<GetProp<Compiler, 'getInfrastructureLogger'>>;

export type IWatching = Watching | ReturnType<GetProp<MultiCompiler, 'watch'>>;
