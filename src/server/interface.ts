/**
 * @module interface
 */

import { Compiler, Configuration, MultiCompiler, MultiStats, Stats } from 'webpack';

export type IStats = Stats | MultiStats;
export type ICompiler = Compiler | MultiCompiler;
export type IStatsOptions = NonNullable<Configuration['stats']>;
export type ILogger = ReturnType<Compiler['getInfrastructureLogger']>;
