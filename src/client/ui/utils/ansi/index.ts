/**
 * @module index
 */

import { TokenType } from './enum';
import { CSI_RE, OSC_RE, OSC_ST_RE } from './regx';
import { AnsiBlock, AnsiColor, AnsiStyle, AnsiToken, BlockToken } from './interface';

export default class Ansi {
  protected buffer = '';

  protected style: AnsiStyle = {
    dim: false,
    bold: false,
    color: null,
    blink: false,
    hidden: false,
    italic: false,
    reverse: false,
    background: null,
    underline: false,
    strikethrough: false
  };

  protected colors256: AnsiColor[];
  protected colors16: AnsiColor[][];

  public constructor() {
    const colors16: AnsiColor[][] = [
      // Colors 16 bit
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

    // Colors 256 bit
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
          colors256.push([levels[r], levels[g], levels[b]]);
        }
      }
    }

    // Index 232..255 : Grayscale
    let grayscale = 8;

    for (let i = 0; i < 24; ++i, grayscale += 10) {
      colors256.push([grayscale, grayscale, grayscale]);
    }

    // Init ANSI colors
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

  private reset(): void {
    const { style } = this;

    style.dim = false;
    style.bold = false;
    style.color = null;
    style.blink = false;
    style.hidden = false;
    style.italic = false;
    style.reverse = false;
    style.background = null;
    style.underline = false;
    style.strikethrough = false;
  }

  private process(signal: string): void {
    let index = 0;

    // Ok - we have a valid "SGR" (Select Graphic Rendition)
    const sequences = signal.split(';');
    const maxIndex = sequences.length - 1;

    // ANSI style and colors
    const { style, colors16, colors256 } = this;

    // Read cmd by index
    const read = () => parseInt(sequences[index++], 10);

    // Each of these params affects the SGR state
    // Why do we shift through the array instead of a forEach??
    // ... because some commands consume the params that follow !
    for (; index <= maxIndex; index++) {
      const code = read();

      if (code === 1) {
        style.bold = true;
      } else if (code === 2) {
        style.dim = true;
      } else if (code === 3) {
        style.italic = true;
      } else if (code === 4) {
        style.underline = true;
      } else if (code === 5) {
        style.blink = true;
      } else if (code === 7) {
        style.reverse = true;
      } else if (code === 8) {
        style.hidden = true;
      } else if (code === 9) {
        style.strikethrough = true;
      } else if (code === 21) {
        style.bold = false;
      } else if (code === 22) {
        style.dim = false;
        style.bold = false;
      } else if (code === 23) {
        style.italic = false;
      } else if (code === 24) {
        style.underline = false;
      } else if (code === 25) {
        style.blink = false;
      } else if (code === 27) {
        style.reverse = false;
      } else if (code === 28) {
        style.hidden = false;
      } else if (code === 29) {
        style.strikethrough = false;
      } else if (code === 39) {
        style.color = null;
      } else if (code === 49) {
        style.background = null;
      } else if (code >= 30 && code < 38) {
        style.color = colors16[0][code - 30];
      } else if (code >= 40 && code < 48) {
        style.background = colors16[0][code - 40];
      } else if (code >= 90 && code < 98) {
        style.color = colors16[1][code - 90];
      } else if (code >= 100 && code < 108) {
        style.background = colors16[1][code - 100];
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
              style.color = colors256[index];
            } else {
              style.background = colors256[index];
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
              style.color = color;
            } else {
              style.background = color;
            }
          }
        }
      } else {
        this.reset();
      }
    }
  }

  private block(token: BlockToken): AnsiBlock {
    const block: AnsiBlock = {
      value: token.value,
      style: { ...this.style }
    };

    if ('url' in token) {
      block.url = token.url;
    }

    return block;
  }

  public parse(text: string): AnsiBlock[] {
    this.buffer += text;

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

  public flush(): AnsiBlock | null {
    const { buffer } = this;

    // Flush buffer
    this.buffer = '';

    // Get flush block
    if (buffer !== '') {
      const block = this.block({
        value: buffer,
        type: TokenType.TEXT
      });

      // Reset
      this.reset();

      return block;
    }

    // Reset
    this.reset();

    return null;
  }
}
