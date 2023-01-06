/**
 * @module utils
 */

import { AnsiColor } from './interface';

export function toUint8(uint8: number): number {
  return uint8 & 0xff;
}

export function getThemeColor(defaultColor: AnsiColor, color?: AnsiColor): AnsiColor {
  if (color) {
    const [r, g, b] = color;

    return [toUint8(r), toUint8(g), toUint8(b)];
  }

  return defaultColor;
}
