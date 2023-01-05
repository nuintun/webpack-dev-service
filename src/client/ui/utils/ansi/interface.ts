/**
 * @module interface
 */

import { TokenType } from './enum';

export interface AnsiColor {
  rgb: [
    // Red
    R: number,
    // Green
    G: number,
    // Blue
    B: number
  ];
  type: string;
}

export interface AnsiBlock {
  url: string;
  text: string;
  dim: boolean;
  bold: boolean;
  blink: boolean;
  hidden: boolean;
  italic: boolean;
  reverse: boolean;
  underline: boolean;
  bg: AnsiColor | null;
  fg: AnsiColor | null;
  strikethrough: boolean;
}

export interface AnsiToken {
  url: string;
  text: string;
  type: TokenType;
}
