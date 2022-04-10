/**
 * @module ansi
 * @see https://github.com/Tjatse/ansi-html
 */

import ansiRegex from 'ansi-regex';

const ANSI_RE: RegExp = ansiRegex();

const DEFAULT_COLORS: Required<Colors> = {
  black: '#000',
  red: '#ff0000',
  green: '#209805',
  yellow: '#e8bf03',
  blue: '#0000ff',
  magenta: '#ff00ff',
  cyan: '#00ffee',
  lightgrey: '#f0f0f0',
  darkgrey: '#888',
  // [Foregroud, Background]
  reset: ['#fff', '#000']
};

const STYLES: Record<number | string, keyof Colors> = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'lightgrey'
};

const OPEN_TAGS: Record<number | string, string> = {
  // Bold
  1: 'font-weight: bold;',
  // Dim
  2: 'opacity: 0.5;',
  // Italic
  3: '<i>',
  // Underscore
  4: '<u>',
  // Hidden
  8: 'display: none;',
  // Delete
  9: '<del>'
};

const CLOSE_TAGS: Record<number | string, string> = {
  // Reset italic
  23: '</i>',
  // Reset underscore
  24: '</u>',
  // Reset delete
  29: '</del>'
};

for (const code of [0, 21, 22, 27, 28, 39, 49]) {
  CLOSE_TAGS[code] = '</span>';
}

function encodeHTML(text: string): string {
  return String(text).replace(/[<>]/g, match => {
    return `&#6${match === '<' ? 0 : 2};`;
  });
}

function resolveTags(colors: Colors): {
  open: Record<number | string, string>;
  close: Record<number | string, string>;
} {
  const colours = { ...DEFAULT_COLORS, ...colors };

  const open = { ...OPEN_TAGS };
  const close = { ...CLOSE_TAGS };
  const [foregroud, background] = colours.reset;

  // Reset all
  open[0] = `font-weight: normal; opacity: 1; color: ${foregroud} ; background: ${background}`;
  // Inverse
  open[7] = `color: ${background}; background: ${foregroud}`;
  // Dark grey
  open[90] = `color: ${colours.darkgrey}`;

  for (const code of Object.keys(STYLES)) {
    const style = STYLES[code];
    const color = colors[style] || foregroud;

    open[code] = `color: ${color};`;
    open[~~code + 10] = `background: ${color};`;
  }

  return { open, close };
}

export interface Colors {
  red?: string;
  blue?: string;
  cyan?: string;
  black?: string;
  green?: string;
  yellow?: string;
  magenta?: string;
  darkgrey?: string;
  lightgrey?: string;
  reset?: [foregroud: string, background: string];
}

export default class Ansi {
  private readonly open: Record<string | number, string>;
  private readonly close: Record<string | number, string>;

  constructor(colors: Colors) {
    const { open, close } = resolveTags(colors);

    this.open = open;
    this.close = close;
  }

  convert(text: string): string {
    text = encodeHTML(text);

    // Returns the text if the string has no ANSI escape code
    if (!ANSI_RE.test(text)) return text;

    // Cache opened sequence
    const codes: string[] = [];
    const { open, close } = this;

    // Replace with markup
    let html = text.replace(/\033\[(\d+)m/g, (_match, code) => {
      const openTag = open[code];

      if (openTag) {
        // If current sequence has been opened, close it.
        if (!!~codes.indexOf(code)) {
          // Pop sequence
          codes.pop();

          return '</span>';
        }

        // Open tag.
        codes.push(code);

        return openTag[0] === '<' ? openTag : `<span style="${openTag}">`;
      }

      const closeTag = close[code];

      if (closeTag) {
        // Pop sequence
        codes.pop();

        return closeTag;
      }

      return '';
    });

    // Make sure tags are closed.
    const { length } = codes;

    if (length > 0) {
      html += '</span>'.repeat(length);
    }

    return html;
  }
}
