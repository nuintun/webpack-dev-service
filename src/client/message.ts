/**
 * @module message
 */

import { StatsError } from 'webpack';

export interface Invalid {
  action: 'invalid';
  payload: {
    path: string;
    builtAt: number;
  };
}

export interface Progress {
  action: 'progress';
  payload: {
    value: number;
    status: string;
    message: string;
  };
}

export interface Hash {
  action: 'hash';
  payload: {
    hash: string;
  };
}

export interface Issues {
  action: 'issues';
  payload: {
    builtAt: number;
    errors: StatsError[];
    warnings: StatsError[];
  };
}

export interface OK {
  action: 'ok';
  payload: {
    builtAt: number;
  };
}
