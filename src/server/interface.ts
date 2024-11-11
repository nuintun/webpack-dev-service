/**
 * @module interface
 */

import webpack from 'webpack';

export type UnionStats = webpack.Stats | webpack.MultiStats;

export type GetProp<T, P extends keyof T> = NonNullable<T[P]>;

export type StatsOptions = GetProp<webpack.Configuration, 'stats'>;

export type UnionCompiler = webpack.Compiler | webpack.MultiCompiler;

export type RequiredKeys<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Logger = ReturnType<GetProp<webpack.Compiler, 'getInfrastructureLogger'>>;

export type UnionWatching = webpack.Watching | ReturnType<GetProp<webpack.MultiCompiler, 'watch'>>;

export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
