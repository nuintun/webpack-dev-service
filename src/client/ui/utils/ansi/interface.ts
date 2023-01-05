/**
 * @module interface
 */

import { TokenType } from './enum';

// type ColorType = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

// export type AnsiColorType = ColorType | `bright-${ColorType}`;

export type AnsiColor = [
  // Red
  R: number,
  // Green
  G: number,
  // Blue
  B: number
];

export interface AnsiBlock {
  url?: string;
  value: string;
  style: {
    dim: boolean;
    bold: boolean;
    blink: boolean;
    hidden: boolean;
    italic: boolean;
    reverse: boolean;
    color?: AnsiColor;
    underline: boolean;
    background?: AnsiColor;
    strikethrough: boolean;
  };
}

export interface EOSToken {
  type: TokenType.EOS;
}

export interface ESCToken {
  type: TokenType.ESC;
}

export interface OSCToken {
  url: string;
  value: string;
  type: TokenType.OSC;
}

export interface SGRToken {
  signal: string;
  type: TokenType.SGR;
}

export interface TEXTToken {
  value: string;
  type: TokenType.TEXT;
}

export interface INCESCToken {
  type: TokenType.INCESC;
}

export interface UNKNOWNToken {
  value: string;
  type: TokenType.UNKNOWN;
}

export type BlockToken = OSCToken | TEXTToken | UNKNOWNToken;

export type AnsiToken = EOSToken | ESCToken | SGRToken | INCESCToken | BlockToken;
