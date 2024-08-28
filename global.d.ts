/**
 * @module global.d.ts
 */

/// <reference types="webpack/module" />

declare const __HOT_CLIENT__: string;

declare type HotUpdateStatus = `${webpack.HotUpdateStatus}`;

declare type GetProp<T, P extends keyof T> = NonNullable<T[P]>;

declare type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
