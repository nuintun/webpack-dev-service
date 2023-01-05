/**
 * @module index
 */

import { TokenType } from './enum';
import { CSI_RE, OSC_RE, OSC_ST_RE } from './regx';
import { AnsiBlock, AnsiColor, AnsiToken, BlockToken } from './interface';

export default class Ansi {
  private buffer = '';

  private dim = false;
  private bold = false;
  private blink = false;
  private hidden = false;
  private italic = false;
  private reverse = false;
  private underline = false;
  private strikethrough = false;

  private colors256: AnsiColor[];
  private colors16: AnsiColor[][];

  private color: AnsiColor | null = null;
  private background: AnsiColor | null = null;

  constructor() {
    const colors16: AnsiColor[][] = [
      // Normal colors
      [
        // Black
        [0, 0, 0],
        // Red
        [187, 0, 0],
        // Green
        [0, 187, 0],
        // Yellow
        [187, 187, 0],
        // Blue
        [0, 0, 187],
        // Magenta
        [187, 0, 187],
        // Cyan
        [0, 187, 187],
        // White
        [255, 255, 255]
      ],
      // Bright colors
      [
        // Bright Black
        [85, 85, 85],
        // Bright Red
        [255, 85, 85],
        // Bright Green
        [0, 255, 0],
        // Bright Yellow
        [255, 255, 85],
        // Bright Blue
        [85, 85, 255],
        // Bright Magenta
        [255, 85, 255],
        // Bright Cyan
        [85, 255, 255],
        // Bright White
        [255, 255, 255]
      ]
    ];

    const colors256: AnsiColor[] = [];

    // Index 0..15 : Ansi-Colors
    for (const palette of colors16) {
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
          // Color 256
          colors256.push([levels[r], levels[g], levels[b]]);
        }
      }
    }

    // Index 232..255 : Grayscale
    let grayscale = 8;

    for (let i = 0; i < 24; ++i, grayscale += 10) {
      // Color 256
      colors256.push([grayscale, grayscale, grayscale]);
    }

    // Init props
    this.colors16 = colors16;
    this.colors256 = colors256;
  }

  private read(): AnsiToken {
    const { buffer } = this;
    const { length } = buffer;
    const pos = buffer.indexOf('\x1B');

    // The most common case, no ESC codes
    if (pos < 0) {
      this.buffer = '';

      return {
        value: buffer,
        type: TokenType.TEXT
      };
    }

    if (pos > 0) {
      this.buffer = buffer.slice(pos);

      return {
        type: TokenType.TEXT,
        value: buffer.slice(0, pos)
      };
    }

    if (length === 1) {
      // Lone ESC in Buffer, We don't know yet
      return {
        type: TokenType.INCESC
      };
    }

    const peek = buffer.charAt(1);

    // We treat this as a single ESC
    // Which effecitvely shows
    if (peek !== '[' && peek !== ']') {
      this.buffer = buffer.slice(1);

      // DeMorgan
      return {
        type: TokenType.ESC
      };
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
        return {
          type: TokenType.INCESC
        };
      }

      // match is an array
      // 0 - total match
      // 1 - private mode chars group
      // 2 - digits and semicolons group
      // 3 - command
      // 4 - illegal char

      if (match[4]) {
        this.buffer = buffer.slice(1);

        // Illegal sequence, just remove the ESC
        return {
          type: TokenType.ESC
        };
      }

      this.buffer = buffer.slice(match[0].length);

      // If not a valid SGR, we don't handle
      if (match[1] !== '' || match[3] !== 'm') {
        return {
          value: match[2],
          type: TokenType.UNKNOWN
        };
      } else {
        return {
          signal: match[2],
          type: TokenType.SGR
        };
      }
    }

    // OSC CHECK
    if (peek === ']') {
      if (length < 4) {
        return {
          type: TokenType.INCESC
        };
      }

      if (buffer.charAt(2) !== '8' || buffer.charAt(3) !== ';') {
        this.buffer = buffer.slice(1);

        // This is not a match, so we'll just treat it as ESC
        return {
          type: TokenType.ESC
        };
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
          return {
            type: TokenType.INCESC
          };
        }

        // If an illegal character was found, bail on the match
        if (match[3]) {
          this.buffer = buffer.slice(1);

          // Illegal sequence, just remove the ESC
          return {
            type: TokenType.ESC
          };
        }
      }

      // OK, at this point we should have a FULL match!
      // Lets try to match that now
      const match = buffer.match(OSC_RE);

      if (match === null) {
        this.buffer = buffer.slice(1);

        // Illegal sequence, just remove the ESC
        return {
          type: TokenType.ESC
        };
      }

      this.buffer = buffer.slice(match[0].length);

      // If a valid SGR
      // match is an array
      // 0 - total match
      // 1 - URL
      // 2 - Text
      return {
        url: match[1],
        value: match[2],
        type: TokenType.OSC
      };
    }

    return {
      type: TokenType.EOS
    };
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
    for (; index <= maxIndex; index++) {
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
        this.color = null;
      } else if (code === 49) {
        this.background = null;
      } else if (code >= 30 && code < 38) {
        this.color = this.colors16[0][code - 30];
      } else if (code >= 40 && code < 48) {
        this.background = this.colors16[0][code - 40];
      } else if (code >= 90 && code < 98) {
        this.color = this.colors16[1][code - 90];
      } else if (code >= 100 && code < 108) {
        this.background = this.colors16[1][code - 100];
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
              this.color = this.colors256[index];
            } else {
              this.background = this.colors256[index];
            }
          }

          // MODE 2 - True Color
          if (mode === 2 && index + 2 <= maxIndex) {
            const r = read() & 0xff;
            const g = read() & 0xff;
            const b = read() & 0xff;

            // True Color
            const color: AnsiColor = [r, g, b];

            if (isForeground) {
              this.color = color;
            } else {
              this.background = color;
            }
          }
        }
      } else {
        this.dim = false;
        this.bold = false;
        this.blink = false;
        this.hidden = false;
        this.italic = false;
        this.reverse = false;
        this.underline = false;
        this.strikethrough = false;

        this.color = null;
        this.background = null;
      }
    }
  }

  private block(token: BlockToken): AnsiBlock {
    const block: AnsiBlock = {
      value: token.value,
      style: {
        dim: this.dim,
        bold: this.bold,
        blink: this.blink,
        hidden: this.hidden,
        italic: this.italic,
        reverse: this.reverse,
        underline: this.underline,
        strikethrough: this.strikethrough
      }
    };

    const { style } = block;
    const { color, background } = this;

    if (color) {
      style.color = color;
    }

    if (background) {
      style.background = background;
    }

    if ('url' in token) {
      block.url = token.url;
    }

    return block;
  }

  public parse(text: string): AnsiBlock[] {
    this.buffer = text;

    const blocks: AnsiBlock[] = [];

    while (this.buffer) {
      const token = this.read();

      switch (token.type) {
        case TokenType.EOS:
        case TokenType.INCESC:
          break;
        case TokenType.ESC:
        case TokenType.UNKNOWN:
          continue;
        case TokenType.SGR:
          this.process(token.signal);
          continue;
        case TokenType.OSC:
        case TokenType.TEXT:
          blocks.push(this.block(token));
          continue;
        default:
          continue;
      }
    }

    return blocks;
  }
}
