/**
 * @module events
 */

import { Options } from './client';
import * as Message from './message';

type Listeners = {
  [E in keyof Events]: Events[E][];
};

interface Messages {
  ok: Message.OK['payload'];
  hash: Message.Hash['payload'];
  invalid: Message.Invalid['payload'];
  problems: Message.Problems['payload'];
  progress: Message.Progress['payload'];
}

interface Events {
  ok: (message: Messages['ok'], options: Options) => void;
  hash: (message: Messages['hash'], options: Options) => void;
  invalid: (message: Messages['invalid'], options: Options) => void;
  problems: (message: Messages['problems'], options: Options) => void;
  progress: (message: Messages['progress'], options: Options) => void;
}

const events: Listeners = {
  ok: [],
  hash: [],
  invalid: [],
  problems: [],
  progress: []
};

/**
 * @function on
 * @description Add an event listener callback.
 * @param event Event name.
 * @param callback Event listener callback.
 */
export function on<E extends keyof Events>(event: E, callback: Events[E]): void {
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
export function off<E extends keyof Events>(event: E, callback?: Events[E]): void {
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

export function emit<E extends keyof Events>(event: E, message: Messages[E], options: Options): void {
  const callbacks = events[event];

  if (callbacks && callbacks.length > 0) {
    for (const callback of callbacks) {
      callback(message as any, options);
    }
  }
}
