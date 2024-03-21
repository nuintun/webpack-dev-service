/**
 * @module global.d.ts
 */

/// <reference types="webpack/module" />

declare const __WDS_HOT_OPTIONS__: {
  hmr: boolean;
  name: string;
  path: string;
  progress: boolean;
};

declare type HotUpdateStatus = `${webpack.HotUpdateStatus}`;

declare type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
