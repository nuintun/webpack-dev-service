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
