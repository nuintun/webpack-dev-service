/**
 * @module global
 */

/// <reference types="react" />
/// <reference types="webpack/module" />

declare module '*.module.css' {
  const content: {
    readonly [name: string]: string;
  };

  export = content;
}

declare module '*.css' {
  const content: string;

  export = content;
}

declare module '*.svg' {
  const content: string;

  export = content;
}

declare module '*.mp4' {
  const content: string;

  export = content;
}

declare module 'webpack-dev-service/client' {
  const { on, off } = await import('../types/client');

  export { on, off };
}
