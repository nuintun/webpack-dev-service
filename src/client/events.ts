/**
 * @module events
 */

import { Options } from './client';
import * as Message from './message';

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

export interface InvalidEvent {
  (message: Message.Invalid['payload'], options: Options): void;
}

export interface ProgressEvent {
  (message: Message.Progress['payload'], options: Options): void;
}

export interface HashEvent {
  (message: Message.Hash['payload'], options: Options): void;
}

export interface ProblemsEvent {
  (message: Message.Problems['payload'], options: Options): void;
}

export interface OkEvent {
  (message: Message.OK['payload'], options: Options): void;
}

export function emit(event: keyof Events, message: any, options: Options): void {
  const callbacks = events[event];

  if (callbacks && callbacks.length > 0) {
    for (const callback of callbacks) {
      callback(message, options);
    }
  }
}

/**
 * @function on
 * @description Add an event listener callback.
 * @param event Event name.
 * @param callback Event listener callback.
 */
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

/**
 * @function off
 * @description Remove an event listener callback.
 * @param event Event name.
 * @param callback Event listener callback.
 */
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
