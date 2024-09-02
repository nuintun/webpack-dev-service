/**
 * @module interface
 */

import webpack from 'webpack';

export type IStats = webpack.Stats | webpack.MultiStats;

export type GetProp<T, P extends keyof T> = NonNullable<T[P]>;

export type ICompiler = webpack.Compiler | webpack.MultiCompiler;

export type IStatsOptions = GetProp<webpack.Configuration, 'stats'>;

export type ILogger = ReturnType<GetProp<webpack.Compiler, 'getInfrastructureLogger'>>;

export type IWatching = webpack.Watching | ReturnType<GetProp<webpack.MultiCompiler, 'watch'>>;

export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
