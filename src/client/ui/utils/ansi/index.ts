/**
 * @module index
 */

import { TokenType } from './enum';
import { CSI_RE, OSC_RE, OSC_ST_RE } from './regx';
import { AnsiBlock, AnsiColor, AnsiToken } from './interface';

export default class Ansi {
  private buffer = '';

  private colors: AnsiColor[][];
  private colors256: AnsiColor[];

  private dim = false;
  private bold = false;
  private blink = false;
  private hidden = false;
  private italic = false;
  private reverse = false;
  private underline = false;
  private strikethrough = false;
  private bg: AnsiColor | null = null;
  private fg: AnsiColor | null = null;

  constructor() {
    const colors: AnsiColor[][] = [
      // Normal colors
      [
        { type: 'black', rgb: [0, 0, 0] },
        { type: 'red', rgb: [187, 0, 0] },
        { type: 'green', rgb: [0, 187, 0] },
        { type: 'yellow', rgb: [187, 187, 0] },
        { type: 'blue', rgb: [0, 0, 187] },
        { type: 'magenta', rgb: [187, 0, 187] },
        { type: 'cyan', rgb: [0, 187, 187] },
        { type: 'white', rgb: [255, 255, 255] }
      ],
      // Bright colors
      [
        { type: 'bright-black', rgb: [85, 85, 85] },
        { type: 'bright-red', rgb: [255, 85, 85] },
        { type: 'bright-green', rgb: [0, 255, 0] },
        { type: 'bright-yellow', rgb: [255, 255, 85] },
        { type: 'bright-blue', rgb: [85, 85, 255] },
        { type: 'bright-magenta', rgb: [255, 85, 255] },
        { type: 'bright-cyan', rgb: [85, 255, 255] },
        { type: 'bright-white', rgb: [255, 255, 255] }
      ]
    ];

    const colors256: AnsiColor[] = [];

    // Index 0..15 : Ansi-Colors
    for (const palette of colors) {
      for (const color of palette) {
        colors256.push(color);
      }
    }

    // Index 16..231 : RGB 6x6x6
    // https://gist.github.com/jasonm23/2868981#file-xterm-256color-yaml
    const levels = [0, 95, 135, 175, 215, 255];

    for (let r = 0; r < 6; ++r) {
      for (let g = 0; g < 6; ++g) {
        for (let b = 0; b < 6; ++b) {
          colors256.push({
            type: 'color-256',
            rgb: [levels[r], levels[g], levels[b]]
          });
        }
      }
    }

    // Index 232..255 : Grayscale
    let grayscale = 8;

    for (let i = 0; i < 24; ++i, grayscale += 10) {
      colors256.push({
        type: 'color-256',
        rgb: [grayscale, grayscale, grayscale]
      });
    }

    // Init props
    this.colors = colors;
    this.colors256 = colors256;
  }

  private read(): AnsiToken {
    const { buffer } = this;
    const { length } = buffer;

    const token: AnsiToken = {
      url: '',
      text: '',
      type: TokenType.EOS
    };

    const pos = buffer.indexOf('\x1B');

    // The most common case, no ESC codes
    if (pos < 0) {
      token.text = buffer;
      token.type = TokenType.TEXT;

      this.buffer = '';

      return token;
    }

    if (pos > 0) {
      token.type = TokenType.TEXT;
      token.text = buffer.slice(0, pos);

      this.buffer = buffer.slice(pos);

      return token;
    }

    if (length === 1) {
      // Lone ESC in Buffer, We don't know yet
      token.type = TokenType.INCESC;

      return token;
    }

    const peek = buffer.charAt(1);

    // We treat this as a single ESC
    // Which effecitvely shows
    if (peek !== '[' && peek !== ']') {
      // DeMorgan
      token.type = TokenType.ESC;
      token.text = buffer.slice(0, 1);

      this.buffer = buffer.slice(1);

      return token;
    }

    // OK is this an SGR or OSC that we handle
    // SGR CHECK
    if (peek === '[') {
      // We do this regex initialization here so
      // we can keep the regex close to its use (Readability)
      // All ansi codes are typically in the following format.
      // We parse it and focus specifically on the
      // graphics commands (SGR)
      //
      // CONTROL-SEQUENCE-INTRODUCER CSI             (ESC, '[')
      // PRIVATE-MODE-CHAR                           (!, <, >, ?)
      // Numeric parameters separated by semicolons  ('0' - '9', ';')
      // Intermediate-modifiers                      (0x20 - 0x2f)
      // COMMAND-CHAR                                (0x40 - 0x7e)
      const match = buffer.match(CSI_RE);

      // This match is guaranteed to terminate (even on
      // invalid input). The key is to match on legal and
      // illegal sequences.
      // The first alternate matches everything legal and
      // the second matches everything illegal.
      //
      // If it doesn't match, then we have not received
      // either the full sequence or an illegal sequence.
      // If it does match, the presence of field 4 tells
      // us whether it was legal or illegal.

      if (match === null) {
        token.type = TokenType.INCESC;

        return token;
      }

      // match is an array
      // 0 - total match
      // 1 - private mode chars group
      // 2 - digits and semicolons group
      // 3 - command
      // 4 - illegal char

      if (match[4]) {
        // Illegal sequence, just remove the ESC
        token.type = TokenType.ESC;
        token.text = buffer.slice(0, 1);

        this.buffer = buffer.slice(1);

        return token;
      }

      // If not a valid SGR, we don't handle
      if (match[1] !== '' || match[3] !== 'm') {
        token.type = TokenType.UNKNOWN;
      } else {
        token.type = TokenType.SGR;
      }

      // Just the parameters
      token.text = match[2];

      this.buffer = buffer.slice(match[0].length);

      return token;
    }

    // OSC CHECK
    if (peek === ']') {
      if (length < 4) {
        token.type = TokenType.INCESC;

        return token;
      }

      if (buffer.charAt(2) !== '8' || buffer.charAt(3) !== ';') {
        // This is not a match, so we'll just treat it as ESC
        token.type = TokenType.ESC;
        token.text = buffer.slice(0, 1);

        this.buffer = buffer.slice(1);

        return token;
      }

      // We do this regex initialization here so
      // we can keep the regex close to its use (Readability)

      // Matching a Hyperlink OSC with a regex is difficult
      // because Javascript's regex engine doesn't support
      // 'partial match' support.
      //
      // Therefore, we require the system to match the
      // string-terminator(ST) before attempting a match.
      // Once we find it, we attempt the Hyperlink-Begin
      // match.
      // If that goes ok, we scan forward for the next
      // ST.
      // Finally, we try to match it all and return
      // the sequence.
      // Also, it is important to note that we consider
      // certain control characters as an invalidation of
      // the entire sequence.

      // We do regex initializations here so
      // we can keep the regex close to its use (Readability)

      // STRING-TERMINATOR
      // This is likely to terminate in most scenarios
      // because it will terminate on a newline

      // VERY IMPORTANT
      // We do a stateful regex match with exec.
      // If the regex is global, and it used with 'exec',
      // then it will search starting at the 'lastIndex'
      // If it matches, the regex can be used again to
      // find the next match.
      OSC_ST_RE.lastIndex = 0;

      // We might have the prefix and URI
      // Lets start our search for the ST twice
      for (let count = 0; count < 2; count++) {
        const match = OSC_ST_RE.exec(buffer);

        if (match === null) {
          token.type = TokenType.INCESC;

          return token;
        }

        // If an illegal character was found, bail on the match
        if (match[3]) {
          // Illegal sequence, just remove the ESC
          token.type = TokenType.ESC;
          token.text = buffer.slice(0, 1);

          this.buffer = buffer.slice(1);

          return token;
        }
      }

      // OK, at this point we should have a FULL match!
      // Lets try to match that now
      const match = buffer.match(OSC_RE);

      if (match === null) {
        // Illegal sequence, just remove the ESC
        token.type = TokenType.ESC;
        token.text = buffer.slice(0, 1);

        this.buffer = buffer.slice(1);

        return token;
      }

      // match is an array
      // 0 - total match
      // 1 - URL
      // 2 - Text

      // If a valid SGR
      token.url = match[1];
      token.text = match[2];
      token.type = TokenType.OSC;

      this.buffer = buffer.slice(match[0].length);

      return token;
    }

    return token;
  }

  private process(signal: string): void {
    let index = 0;

    // Ok - we have a valid "SGR" (Select Graphic Rendition)
    const sequences = signal.split(';');
    const maxIndex = sequences.length - 1;

    // Read cmd by index
    const read = () => parseInt(sequences[index++], 10);

    // Each of these params affects the SGR state
    // Why do we shift through the array instead of a forEach??
    // ... because some commands consume the params that follow !
    for (let index = 0; index <= maxIndex; index++) {
      const code = read();

      if (code === 1) {
        this.bold = true;
      } else if (code === 2) {
        this.dim = true;
      } else if (code === 3) {
        this.italic = true;
      } else if (code === 4) {
        this.underline = true;
      } else if (code === 5) {
        this.blink = true;
      } else if (code === 7) {
        this.reverse = true;
      } else if (code === 8) {
        this.hidden = true;
      } else if (code === 9) {
        this.strikethrough = true;
      } else if (code === 21) {
        this.bold = false;
      } else if (code === 22) {
        this.dim = false;
        this.bold = false;
      } else if (code === 23) {
        this.italic = false;
      } else if (code === 24) {
        this.underline = false;
      } else if (code === 25) {
        this.blink = false;
      } else if (code === 27) {
        this.reverse = false;
      } else if (code === 28) {
        this.hidden = false;
      } else if (code === 29) {
        this.strikethrough = false;
      } else if (code === 39) {
        this.fg = null;
      } else if (code === 49) {
        this.bg = null;
      } else if (code >= 30 && code < 38) {
        this.fg = this.colors[0][code - 30];
      } else if (code >= 40 && code < 48) {
        this.bg = this.colors[0][code - 40];
      } else if (code >= 90 && code < 98) {
        this.fg = this.colors[1][code - 90];
      } else if (code >= 100 && code < 108) {
        this.bg = this.colors[1][code - 100];
      } else if (code === 38 || code === 48) {
        // Extended set foreground/background color
        // validate that param exists
        if (index < maxIndex) {
          const mode = read();
          // Extend color (38=fg, 48=bg)
          const isForeground = code === 38;

          // MODE 5 - 256 color palette
          if (mode === 5 && index <= maxIndex) {
            const index = read() & 0xff;

            if (isForeground) {
              this.fg = this.colors256[index];
            } else {
              this.bg = this.colors256[index];
            }
          }

          // MODE 2 - True Color
          if (mode === 2 && index + 2 <= maxIndex) {
            const r = read() & 0xff;
            const g = read() & 0xff;
            const b = read() & 0xff;

            const color: AnsiColor = {
              rgb: [r, g, b],
              type: 'true-color'
            };

            if (isForeground) {
              this.fg = color;
            } else {
              this.bg = color;
            }
          }
        }
      } else {
        this.fg = null;
        this.bg = null;
        this.bold = false;
        this.italic = false;
        this.underline = false;
      }
    }
  }

  private block({ text, url }: AnsiToken): AnsiBlock {
    return {
      url,
      text,
      bg: this.bg,
      fg: this.fg,
      dim: this.dim,
      bold: this.bold,
      blink: this.blink,
      hidden: this.hidden,
      italic: this.italic,
      reverse: this.reverse,
      underline: this.underline,
      strikethrough: this.strikethrough
    };
  }

  public parse(text: string): AnsiBlock[] {
    this.buffer = text;

    const blocks: AnsiBlock[] = [];

    while (this.buffer) {
      const packet = this.read();

      switch (packet.type) {
        case TokenType.EOS:
        case TokenType.INCESC:
          break;
        case TokenType.ESC:
        case TokenType.UNKNOWN:
          continue;
        case TokenType.SGR:
          this.process(packet.text);
          continue;
        case TokenType.OSC:
        case TokenType.TEXT:
          blocks.push(this.block(packet));
          continue;
        default:
          continue;
      }
    }

    return blocks;
  }
}
