/**
 * @module regexp
 */

// prettier-ignore
// (?:                         # legal sequence
//   (\x1b\\)                    # ESC \
//   |                           # alternate
//   (\x07)                      # BEL (what xterm did)
// )                           # legal sequence end
// |                           # alternate (second attempt)
// (                           # illegal sequence
//   [\x00-\x06]                 # anything illegal
//   |                           # alternate
//   [\x08-\x1a]                 # anything illegal
//   |                           # alternate
//   [\x1c-\x1f]                 # anything illegal
// )                           # illegal sequence end
export const OSC_ST_RE = /(?:(\x1b\\)|(\x07))|([\x00-\x06]|[\x08-\x1a]|[\x1c-\x1f])/g;

// prettier-ignore
// ^                           # beginning of line
// (?:                         # legal sequence
//   \x1b\[                      # CSI
//   ([\x3c-\x3f]?)              # private-mode char
//   ([\d;]*)                    # any digits or semicolons
//   (                           # modifier command sequence
//     [\x20-\x2f]?                # an intermediate modifier
//     [\x40-\x7e]                 # the command
//   )                           # modifier command sequence end
// )                           # legal sequence end
// |                           # alternate (second attempt)
// (?:                         # illegal sequence
//   \x1b\[                      # CSI
//   [\x20-\x7e]*                # anything legal
//   ([\x00-\x1f:])              # anything illegal
// )                           # illegal sequence end
export const CSI_RE = /^(?:\x1b\[([\x3c-\x3f]?)([\d;]*)([\x20-\x2f]?[\x40-\x7e]))|(?:\x1b\[[\x20-\x7e]*([\x00-\x1f:]))/;

// prettier-ignore
// ^                           # beginning of line
// \x1b\]8;                    # OSC Hyperlink
// [\x20-\x3a\x3c-\x7e]*       # params (excluding ;)
// ;                           # end of params
// ([\x21-\x7e]{0,512})        # URL capture
// (?:                         # ST sequence
//   (?:\x1b\\)                  # ESC \
//   |                           # alternate
//   (?:\x07)                    # BEL (what xterm did)
// )                           # ST sequence end
// ([\x20-\x7e]+)              # TEXT capture
// \x1b\]8;;                   # OSC Hyperlink End
// (?:                         # ST sequence
//   (?:\x1b\\)                  # ESC \
//   |                           # alternate
//   (?:\x07)                    # BEL (what xterm did)
// )                           # ST sequence end
export const OSC_RE = /^\x1b\]8;[\x20-\x3a\x3c-\x7e]*;([\x21-\x7e]{0,512})(?:(?:\x1b\\)|(?:\x07))([\x20-\x7e]+)\x1b\]8;;(?:(?:\x1b\\)|(?:\x07))/;
