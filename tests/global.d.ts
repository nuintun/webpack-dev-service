/**
 * @module global
 */

/// <reference types="react" />
/// <reference types="webpack/module" />

declare module '*.module.css' {
  const content: {
    readonly [name: string]: string;
  };

  export default content;
}

declare module '*.css' {
  const content: string;

  export default content;
}

declare module '*.svg' {
  const content: string;

  export default content;
}

declare module '*.mp4' {
  const content: string;

  export default content;
}

declare module 'webpack-dev-service/events' {
  export = import('../types/client/events');
}
