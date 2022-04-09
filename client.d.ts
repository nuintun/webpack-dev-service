declare module 'ui/utils/ansi' {
  export interface Colors {
    red?: string;
    blue?: string;
    cyan?: string;
    black?: string;
    green?: string;
    yellow?: string;
    magenta?: string;
    darkgrey?: string;
    lightgrey?: string;
    reset?: [foregroud: string, background: string];
  }
  export default class Ansi {
    private readonly open;
    private readonly close;
    constructor(colors: Colors);
    convert(text: string): string;
  }
}
declare module 'ui/utils/index' {
  export function injectCSS(css: string, styleElement?: HTMLStyleElement): HTMLStyleElement;
  export function appendHTML(html: string, parent?: HTMLElement): ChildNode[];
}
declare module 'ui/overlay' {
  import { StatsError } from 'webpack';
  export default class Overlay {
    private hidden;
    private readonly name;
    private readonly close;
    private readonly aside;
    private readonly errorsList;
    private readonly errorsTitle;
    private readonly warningsList;
    private readonly warningsTitle;
    constructor(name: string);
    setProblems(type: 'errors' | 'warnings', problems: StatsError[]): void;
    show(): void;
    hide(): void;
  }
}
declare module 'ui/progress' {
  export default class Progress {
    private timer?;
    private hidden;
    private readonly svg;
    private readonly track;
    constructor();
    update(value: number): void;
    show(): void;
    hide(): void;
  }
}
declare module 'message' {
  /**
   * @module message
   */
  import { StatsError } from 'webpack';
  export interface InvalidMessage {
    action: 'invalid';
    payload: {
      path: string;
      builtAt: number;
    };
  }
  export interface ProgressMessage {
    action: 'progress';
    payload: {
      value: number;
      status: string;
      message: string;
    };
  }
  export interface HashMessage {
    action: 'hash';
    payload: {
      hash: string;
    };
  }
  export interface ProblemsMessage {
    action: 'problems';
    payload: {
      builtAt: number;
      errors: StatsError[];
      warnings: StatsError[];
    };
  }
  export interface OkMessage {
    action: 'ok';
    payload: {
      builtAt: number;
    };
  }
}
declare module 'events' {
  /**
   * @module events
   */
  import { HashMessage, InvalidMessage, OkMessage, ProblemsMessage, ProgressMessage } from 'message';
  interface Events {
    ok: OkEvent[];
    hash: HashEvent[];
    invalid: InvalidEvent[];
    progress: ProgressEvent[];
    problems: ProblemsEvent[];
  }
  export interface Options {
    readonly hmr: boolean;
    readonly name: string;
    readonly host: string;
    readonly path: string;
    readonly live: boolean;
    readonly overlay: boolean;
    readonly progress: boolean;
  }
  export interface InvalidEvent {
    (message: InvalidMessage['payload'], options: Options): void;
  }
  export interface ProgressEvent {
    (message: ProgressMessage['payload'], options: Options): void;
  }
  export interface HashEvent {
    (message: HashMessage['payload'], options: Options): void;
  }
  export interface ProblemsEvent {
    (message: ProblemsMessage['payload'], options: Options): void;
  }
  export interface OkEvent {
    (message: OkMessage['payload'], options: Options): void;
  }
  export function emit(event: keyof Events, message: any, options: Options): void;
  export function on(event: 'invalid', callback: InvalidEvent): void;
  export function on(event: 'progress', callback: ProgressEvent): void;
  export function on(event: 'hash', callback: HashEvent): void;
  export function on(event: 'problems', callback: ProblemsEvent): void;
  export function on(event: 'ok', callback: OkEvent): void;
  export function off(event: 'invalid', callback?: InvalidEvent): void;
  export function off(event: 'progress', callback?: ProgressEvent): void;
  export function off(event: 'hash', callback?: HashEvent): void;
  export function off(event: 'problems', callback?: ProblemsEvent): void;
  export function off(event: 'ok', callback?: OkEvent): void;
}
declare module 'hot' {
  export function updateHash(value: string): void;
  export function isUpdateIdle(): boolean;
  export function isUpdateAvailable(): boolean;
  export function attemptUpdates(hmr: boolean, fallback: (error?: Error) => void): void;
}
declare module 'index' {
  import { off, on } from 'events';
  export { on, off };
}
