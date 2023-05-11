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
