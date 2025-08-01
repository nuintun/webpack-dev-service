/**
 * @module ReadStream
 */

import { PathLike } from 'node:fs';
import { Buffer } from 'node:buffer';
import { Range } from './utils/http';
import { Readable } from 'node:stream';
import { FileSystem } from './utils/fs';

const enum ReadState {
  PREFIX,
  RANGE,
  SUFFIX
}

export interface Options {
  fs: FileSystem;
  highWaterMark?: number;
}

interface Callback {
  (error?: Error | null): void;
}

const DISPOSE_EVENT = Symbol('dispose');

export class ReadStream extends Readable {
  readonly #fs: FileSystem;
  readonly #path: PathLike;
  readonly #ranges: Range[];

  #bytesRead: number = 0;
  #fd: number | null = null;
  #reading: boolean = false;
  #currentRangeIndex: number = 0;
  #readState: ReadState = ReadState.PREFIX;

  /**
   * @constructor
   * @param path The file path.
   * @param ranges The ranges to read.
   * @param options The stream options.
   */
  constructor(path: PathLike, ranges: Range[], options: Options) {
    const { fs, highWaterMark } = options;

    super({ highWaterMark });

    this.#fs = fs;
    this.#path = path;
    this.#ranges = ranges;
  }

  /**
   * @override
   * @method _construct
   * @param callback The callback.
   */
  override _construct(callback: Callback): void {
    this.#fs.open(this.#path, 'r', (openError, fd) => {
      if (openError == null) {
        this.#fd = fd;
      }

      callback(openError);
    });
  }

  /**
   * @private
   * @method #getRange
   */
  #getRange(): Range | undefined {
    return this.#ranges[this.#currentRangeIndex];
  }

  /**
   * @private
   * @method #getPadding
   * @param range The current range.
   */
  #getPadding(range: Range): Buffer | undefined {
    switch (this.#readState) {
      case ReadState.PREFIX:
        return range.prefix;
      case ReadState.SUFFIX:
        return range.suffix;
    }
  }

  /**
   * @private
   * @method #readPadding
   * @param fd The file descriptor.
   * @param range The current range.
   * @param size The number of bytes to read.
   */
  #readPadding(fd: number, range: Range, size: number): void {
    let bytesRead = 0;

    const padding = this.#getPadding(range);

    // If padding exists.
    if (padding != null) {
      const { length } = padding;
      const begin = this.#bytesRead;

      if (begin < length) {
        bytesRead = Math.min(size, length - begin);

        const end = begin + bytesRead;

        this.push(padding.subarray(begin, end));

        this.#bytesRead = end;
      }
    }

    // If no padding or read completed.
    if (bytesRead < size) {
      this.#bytesRead = 0;

      // Change read state.
      switch (this.#readState) {
        case ReadState.PREFIX:
          this.#readState = ReadState.RANGE;

          this.#readFileRange(fd, range, size - bytesRead);
          break;
        case ReadState.SUFFIX:
          this.#currentRangeIndex++;
          this.#readState = ReadState.PREFIX;

          const nextRange = this.#getRange();

          if (nextRange == null) {
            this.push(null);
          } else {
            this.#readPadding(fd, nextRange, size - bytesRead);
          }
          break;
      }
    }
  }

  /**
   * @private
   * @method #readFileRange
   * @param fd The file descriptor.
   * @param range The current range.
   * @param size The number of bytes to read.
   */
  #readFileRange(fd: number, range: Range, size: number): void {
    const { length } = range;
    const bytesRead = this.#bytesRead;

    // File range not finished.
    if (bytesRead < length) {
      this.#reading = true;

      const bytesToRead = Math.min(size, length - bytesRead);
      const buffer = Buffer.allocUnsafeSlow(bytesToRead);
      const position = range.offset + bytesRead;

      // Read file range.
      this.#fs.read(fd, buffer, 0, bytesToRead, position, (readError, bytesRead, buffer) => {
        this.#reading = false;

        // Tell ._destroy() that it's safe to close the fd now.
        if (this.destroyed) {
          this.emit(DISPOSE_EVENT, readError);
        } else if (readError != null) {
          this.destroy(readError);
        } else if (bytesRead !== bytesToRead) {
          this.destroy(new RangeError('invalid read operation'));
        } else {
          this.push(buffer);

          this.#bytesRead += bytesRead;

          // file range read completed.
          if (bytesRead < size) {
            this.#bytesRead = 0;
            this.#readState = ReadState.SUFFIX;

            this.#readPadding(fd, range, size - bytesRead);
          }
        }
      });
    } else {
      this.#bytesRead = 0;
      this.#readState = ReadState.SUFFIX;

      this.#readPadding(fd, range, size);
    }
  }

  /**
   * @override
   * @method _read
   * @param size The number of bytes to read.
   */
  override _read(size: number): void {
    if (!this.#reading) {
      const fd = this.#fd;
      const range = this.#getRange();

      // If fd or range is null, finish stream.
      if (fd == null || range == null) {
        this.push(null);
      } else {
        // Read bytes from range.
        switch (this.#readState) {
          case ReadState.PREFIX:
          case ReadState.SUFFIX:
            this.#readPadding(fd, range, size);
            break;
          case ReadState.RANGE:
            this.#readFileRange(fd, range, size);
            break;
        }
      }
    }
  }

  /**
   * @private
   * @method #dispose
   * @param error The error.
   * @param callback The callback.
   */
  #dispose(error: Error | null, callback: Callback): void {
    const fd = this.#fd;

    if (fd != null) {
      this.#fd = null;

      // Close the fd.
      this.#fs.close(fd, closeError => {
        callback(error ?? closeError);
      });
    } else {
      callback(error);
    }
  }

  /**
   * @override
   * @method _destroy
   * @param error The error.
   * @param callback The callback.
   */
  override _destroy(error: Error | null, callback: Callback): void {
    // Wait I/O completion.
    if (this.#reading) {
      this.once(DISPOSE_EVENT, disposeError => {
        this.#dispose(error ?? disposeError, callback);
      });
    } else {
      this.#dispose(error, callback);
    }
  }
}
