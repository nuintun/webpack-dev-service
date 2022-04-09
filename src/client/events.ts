/**
 * @module events
 */

import { HashMessage, InvalidMessage, OkMessage, ProblemsMessage, ProgressMessage } from './message';

interface Events {
  ok: OkEvent[];
  hash: HashEvent[];
  invalid: InvalidEvent[];
  progress: ProgressEvent[];
  problems: ProblemsEvent[];
}

const events: Events = {
  ok: [],
  hash: [],
  invalid: [],
  progress: [],
  problems: []
};

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

export function emit(event: keyof Events, message: any, options: Options): void {
  const callbacks = events[event];

  if (callbacks && callbacks.length > 0) {
    for (const callback of callbacks) {
      callback(message, options);
    }
  }
}

export function on(event: 'invalid', callback: InvalidEvent): void;
export function on(event: 'progress', callback: ProgressEvent): void;
export function on(event: 'hash', callback: HashEvent): void;
export function on(event: 'problems', callback: ProblemsEvent): void;
export function on(event: 'ok', callback: OkEvent): void;
export function on(event: keyof Events, callback: (message: any, options: Options) => void): void {
  const callbacks = events[event];

  if (callbacks) {
    callbacks.push(callback);
  }
}

export function off(event: 'invalid', callback?: InvalidEvent): void;
export function off(event: 'progress', callback?: ProgressEvent): void;
export function off(event: 'hash', callback?: HashEvent): void;
export function off(event: 'problems', callback?: ProblemsEvent): void;
export function off(event: 'ok', callback?: OkEvent): void;
export function off(event: keyof Events, callback?: (message: any, options: Options) => void): void {
  const callbacks = events[event];

  if (callbacks) {
    if (callback) {
      const index = callbacks.indexOf(callback);

      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    } else {
      events[event] = [];
    }
  }
}
