/**
 * @module global.d.ts
 */

/// <reference types="webpack/module" />

declare const __WDS_HOT_OPTIONS__: {
  name: string;
  hmr: boolean;
  path: string;
  progress: boolean;
};

declare interface Window {
  __WDS_HOT_CLIENT_INITIALLED__: boolean;
}
