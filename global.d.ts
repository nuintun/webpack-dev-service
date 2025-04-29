/**
 * @module global.d.ts
 */

/// <reference types="webpack/module" />

declare module '*.svg' {
  const content: string;

  export = content;
}

declare const __ESM__: boolean;

declare const __HOT_CLIENT__: string;

declare const __PLUGIN_NAME__: string;

declare type HotUpdateStatus = `${webpack.HotUpdateStatus}`;
