/**
 * @module global.d.ts
 */

/// <reference types="webpack/module" />

declare type HotUpdateStatus = `${webpack.HotUpdateStatus}`;

declare type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
