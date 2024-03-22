/**
 * @module boundary
 */

// prettier-ignore
const CHARS = [
  // 0-9
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  // A-M
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  // N-Z
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // a-m
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  // n-z
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

/**
 * @function generate
 * @description Generate a boundary.
 */
export function generate(): string {
  let boundary = '';

  // Create boundary.
  for (let i = 0; i < 38; i++) {
    boundary += CHARS[Math.floor(Math.random() * 62)];
  }

  // Return boundary.
  return boundary;
}
