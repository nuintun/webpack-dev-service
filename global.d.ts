/**
 * @module global.d.ts
 */

declare const __WDS_HOT_OPTIONS__: {
  name: string;
  hmr: boolean;
  path: string;
  progress: boolean;
};

declare const __resourceQuery: string;
declare const __webpack_hash__: string;

interface ImportMeta {
  url: string;
  webpack: number;
  webpackHot: {
    check(autoApply?: boolean): Promise<(string | number)[] | null>;
    status(): 'idle' | 'check' | 'prepare' | 'ready' | 'dispose' | 'apply' | 'abort' | 'fail';
  };
}
