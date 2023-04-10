/**
 * @module clean
 */

import { rimraf } from 'rimraf';

rimraf.sync(['types', 'server', 'client']);
