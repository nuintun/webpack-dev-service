/**
 * @module interface
 */

import { Compiler, MultiCompiler, Stats, MultiStats, Configuration } from 'webpack';

export type IStats = Stats | MultiStats;
export type ICompiler = Compiler | MultiCompiler;
export type IStatsOptions = NonNullable<Configuration['stats']>;
export type ILogger = ReturnType<Compiler['getInfrastructureLogger']>;
