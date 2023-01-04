/**
 * @module Ansi
 */

interface AnsiColor {
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

interface AnsiText {
  text: string;
  bg: AnsiColor;
  fg: AnsiColor;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

interface TextPacket {
  url: string;
  text: string;
  type: PacketType;
}

const enum PacketType {
  EOS,
  Text,
  Incomplete, // An Incomplete ESC sequence
  ESC, // A single ESC char - random
  Unknown, // A valid CSI but not an SGR code
  SGR, // Select Graphic Rendition
  OSCURL // Operating System Command
}

const CSI = `
  ^                           # beginning of line
  (?:                         # legal sequence
    \x1b\[                      # CSI
    ([\x3c-\x3f]?)              # private-mode char
    ([\d;]*)                    # any digits or semicolons
    ([\x20-\x2f]?               # an intermediate modifier
    [\x40-\x7e])                # the command
  )                           # legal sequence end
  |                           # alternate (second attempt)
  (?:                         # illegal sequence
    \x1b\[                      # CSI
    [\x20-\x7e]*                # anything legal
    ([\x00-\x1f:])              # anything illegal
  )                           # illegal sequence end
`;

const OSC = `
  ^                           # beginning of line
  \x1b\]8;                    # OSC Hyperlink
  [\x20-\x3a\x3c-\x7e]*       # params (excluding ;)
  ;                           # end of params
  ([\x21-\x7e]{0,512})        # URL capture
  (?:                         # ST sequence
    (?:\x1b\\)                  # ESC \
    |                           # alternate
    (?:\x07)                    # BEL (what xterm did)
  )                           # ST sequence end
  ([\x20-\x7e]+)              # TEXT capture
  \x1b\]8;;                   # OSC Hyperlink End
  (?:                         # ST sequence
    (?:\x1b\\)                  # ESC \
    |                           # alternate
    (?:\x07)                    # BEL (what xterm did)
  )                           # ST sequence end
`;

const OSC_ST = `
  (?:                         # legal sequence
    (\x1b\\)                    # ESC \
    |                           # alternate
    (\x07)                      # BEL (what xterm did)
  )                           # legal sequence end
  |                           # alternate (second attempt)
  (                           # illegal sequence
    [\x00-\x06]                 # anything illegal
    |                           # alternate
    [\x08-\x1a]                 # anything illegal
    |                           # alternate
    [\x1c-\x1f]                 # anything illegal
  )                           # illegal sequence end
`;

const CSI_RE = regexp(CSI);
const OSC_RE = regexp(OSC);
const OSC_ST_RE = regexp(OSC_ST, 'g');

export default class Ansi {
  private buffer = '';

  private colors: AnsiColor[][];
  private colors256: AnsiColor[];

  private bold = false;
  private italic = false;
  private underline = false;
  private fg: AnsiColor | null = null;
  private bg: AnsiColor | null = null;

  private protocols = { http: true, https: true };

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

  private read(): TextPacket {
    const { buffer } = this;
    const { length } = buffer;

    const packet: TextPacket = {
      url: '',
      text: '',
      type: PacketType.EOS
    };

    if (length > 0) {
      const pos = buffer.indexOf('\x1B');

      // The most common case, no ESC codes
      if (pos < 0) {
        packet.text = buffer;
        packet.type = PacketType.Text;

        this.buffer = '';

        return packet;
      }

      if (pos > 0) {
        packet.type = PacketType.Text;
        packet.text = buffer.slice(0, pos);

        this.buffer = buffer.slice(pos);

        return packet;
      }

      if (length === 1) {
        // Lone ESC in Buffer, We don't know yet
        packet.type = PacketType.Incomplete;

        return packet;
      }

      const peek = buffer.charAt(1);

      // We treat this as a single ESC
      // Which effecitvely shows
      if (peek != '[' && peek != ']') {
        // DeMorgan
        packet.type = PacketType.ESC;
        packet.text = buffer.slice(0, 1);

        this.buffer = buffer.slice(1);

        return packet;
      }

      // OK is this an SGR or OSC that we handle
      // SGR CHECK
      if (peek == '[') {
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
          packet.type = PacketType.Incomplete;

          return packet;
        }

        // match is an array
        // 0 - total match
        // 1 - private mode chars group
        // 2 - digits and semicolons group
        // 3 - command
        // 4 - illegal char

        if (match[4]) {
          // Illegal sequence, just remove the ESC
          packet.type = PacketType.ESC;
          packet.text = buffer.slice(0, 1);

          this.buffer = buffer.slice(1);

          return packet;
        }

        // If not a valid SGR, we don't handle
        if (match[1] != '' || match[3] != 'm') {
          packet.type = PacketType.Unknown;
        } else {
          packet.type = PacketType.SGR;
        }

        // Just the parameters
        packet.text = match[2];

        this.buffer = buffer.slice(match[0].length);

        return packet;
      }

      // OSC CHECK
      if (peek == ']') {
        if (length < 4) {
          packet.type = PacketType.Incomplete;

          return packet;
        }

        if (buffer.charAt(2) != '8' || buffer.charAt(3) != ';') {
          // This is not a match, so we'll just treat it as ESC
          packet.type = PacketType.ESC;
          packet.text = buffer.slice(0, 1);

          this.buffer = buffer.slice(1);

          return packet;
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
            packet.type = PacketType.Incomplete;

            return packet;
          }

          // If an illegal character was found, bail on the match
          if (match[3]) {
            // Illegal sequence, just remove the ESC
            packet.type = PacketType.ESC;
            packet.text = buffer.slice(0, 1);

            this.buffer = buffer.slice(1);

            return packet;
          }
        }

        // OK, at this point we should have a FULL match!
        // Lets try to match that now
        const match = buffer.match(OSC_RE);

        if (match === null) {
          // Illegal sequence, just remove the ESC
          packet.type = PacketType.ESC;
          packet.text = buffer.slice(0, 1);

          this.buffer = buffer.slice(1);

          return packet;
        }

        // match is an array
        // 0 - total match
        // 1 - URL
        // 2 - Text

        // If a valid SGR
        packet.url = match[1];
        packet.text = match[2];
        packet.type = PacketType.OSCURL;

        this.buffer = buffer.slice(match[0].length);

        return packet;
      }
    }

    return packet;
  }

  private process({ text }: TextPacket): void {
    let index = 0;

    // Ok - we have a valid "SGR" (Select Graphic Rendition)
    const cmds = text.split(';');
    const maxIndex = cmds.length - 1;

    // Read cmd by index
    const read = () => parseInt(cmds[index++], 10);

    // Each of these params affects the SGR state
    // Why do we shift through the array instead of a forEach??
    // ... because some commands consume the params that follow !
    for (let index = 0; index <= maxIndex; index++) {
      const cmd = read();

      if (cmd === 1) {
        this.bold = true;
      } else if (cmd === 3) {
        this.italic = true;
      } else if (cmd === 4) {
        this.underline = true;
      } else if (cmd === 22) {
        this.bold = false;
      } else if (cmd === 23) {
        this.italic = false;
      } else if (cmd === 24) {
        this.underline = false;
      } else if (cmd === 39) {
        this.fg = null;
      } else if (cmd === 49) {
        this.bg = null;
      } else if (cmd >= 30 && cmd < 38) {
        this.fg = this.colors[0][cmd - 30];
      } else if (cmd >= 40 && cmd < 48) {
        this.bg = this.colors[0][cmd - 40];
      } else if (cmd >= 90 && cmd < 98) {
        this.fg = this.colors[1][cmd - 90];
      } else if (cmd >= 100 && cmd < 108) {
        this.bg = this.colors[1][cmd - 100];
      } else if (cmd === 38 || cmd === 48) {
        // Extended set foreground/background color
        // validate that param exists
        if (index < maxIndex) {
          const mode = read();
          // Extend color (38=fg, 48=bg)
          const isForeground = cmd === 38;

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

  private hyperlink({ url, text }: TextPacket): string {
    const [protocol] = url.split(':');

    if (protocol && this.protocols[protocol.toLowerCase() as 'http' | 'https']) {
      return `<a href="${escapeHTML(url)}">${escapeHTML(text)}</a>`;
    }

    return text;
  }
}

function escapeHTML(text: string): string {
  return text.replace(/[&<>"']/gm, match => {
    switch (match) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#x27;';
      default:
        return match;
    }
  });
}

// ES5 template string transformer
function regexp(regexp: string, flag?: string): RegExp {
  // Remove white-space and comments
  return new RegExp(regexp.replace(/^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm, ''), flag);
}
