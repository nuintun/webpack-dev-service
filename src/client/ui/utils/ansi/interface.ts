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
  dim: boolean;
  text: string;
  url?: string;
  bold: boolean;
  bg?: AnsiColor;
  fg?: AnsiColor;
  blink: boolean;
  hidden: boolean;
  italic: boolean;
  reverse: boolean;
  underline: boolean;
  strikethrough: boolean;
}

export interface EOSToken {
  type: TokenType.EOS;
}

export interface ESCToken {
  text: string;
  type: TokenType.ESC;
}

export interface OSCToken {
  url: string;
  text: string;
  type: TokenType.OSC;
}

export interface SGRToken {
  text: string;
  type: TokenType.SGR;
}

export interface TEXTToken {
  text: string;
  type: TokenType.TEXT;
}

export interface INCESCToken {
  type: TokenType.INCESC;
}

export interface UNKNOWNToken {
  text: string;
  type: TokenType.UNKNOWN;
}

export type AnsiToken = BlockToken | EOSToken | INCESCToken;

export type BlockToken = ESCToken | OSCToken | SGRToken | TEXTToken | UNKNOWNToken;
