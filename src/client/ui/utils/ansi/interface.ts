import { PacketType } from './enum';

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

export interface AnsiText {
  text: string;
  dim: boolean;
  bg: AnsiColor;
  fg: AnsiColor;
  bold: boolean;
  blink: boolean;
  hidden: boolean;
  italic: boolean;
  reverse: boolean;
  underline: boolean;
  strikethrough: boolean;
}

export interface TextPacket {
  url: string;
  text: string;
  type: PacketType;
}
