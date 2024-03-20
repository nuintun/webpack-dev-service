/**
 * @module override
 */

import { Compiler as ICompiler } from 'webpack';

declare module 'webpack' {
  export class Compiler extends ICompiler {
    [key: symbol]: boolean;
  }
}
