/**
 * @module message
 */

import { StatsError } from 'webpack';

export interface Invalid {
  action: 'invalid';
  payload: {
    path: string;
    timestamp: number;
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
    timestamp: number;
  };
}

export interface Issues {
  action: 'issues';
  payload: {
    timestamp: number;
    errors: StatsError[];
    warnings: StatsError[];
  };
}

export interface OK {
  action: 'ok';
  payload: {
    timestamp: number;
  };
}
