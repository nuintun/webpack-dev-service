/**
 * @module enum
 */

export const enum TokenType {
  EOS, // End Operating System
  ESC, // ASCII ESC(escape) char
  OSC, // Operating System Command
  SGR, // Select Graphic Rendition
  TEXT, // ANSI normal text group
  INCESC, // An Incomplete ESC sequence
  UNKNOWN // A valid CSI but not an SGR code
}
