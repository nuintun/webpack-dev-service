import { regexp } from './utils';

const CSI = String.raw`
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

const OSC = String.raw`
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

const OSC_ST = String.raw`
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

export const CSI_RE = regexp(CSI);
export const OSC_RE = regexp(OSC);
export const OSC_ST_RE = regexp(OSC_ST, 'g');
