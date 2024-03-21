/**
 * @module middleware
 */

import { Middleware } from 'koa';
import { Context } from './interface';

export function middleware(_context: Context): Middleware {
  return async () => {};
}
