/**
 * @module schema
 */

import { validate } from 'schema-utils';

type Schema = Parameters<typeof validate>[0];

export const schema: Schema = {
  type: 'object',
  properties: {
    hot: {
      description: 'Enable or disable HMR server.',
      anyOf: [
        {
          type: 'boolean',
          enum: [false]
        },
        {
          type: 'object',
          properties: {
            hmr: {
              type: 'boolean',
              description: 'Enable or disable Hot Module Replacement.'
            },
            path: {
              type: 'string',
              description: 'Specify the path used by the HMR server.'
            },
            wss: {
              type: 'boolean',
              description: 'Use WebSockets Secure (wss://) for HMR instead of the default WebSocket (ws://).'
            },
            reload: {
              type: 'boolean',
              description: 'Control whether the full page should be reloaded when HMR failure.'
            },
            overlay: {
              type: 'boolean',
              description: 'Enable or disable an error overlay in the browser when there are compilation errors.'
            },
            progress: {
              type: 'boolean',
              description: 'Display a progress bar in the browser during the build process.'
            }
          },
          additionalProperties: false
        }
      ]
    },
    etag: {
      type: 'boolean',
      description: 'Enable or disable the ETag functionality for file serving.'
    },
    acceptRanges: {
      type: 'boolean',
      description: 'Indicate whether the server supports range requests for file resources.'
    },
    lastModified: {
      type: 'boolean',
      description: 'Enable or disable sending last modified headers for file resources.'
    },
    headers: {
      description: 'Headers to serve with files.',
      anyOf: [
        {
          type: 'object',
          additionalProperties: {
            anyOf: [
              {
                type: 'string'
              },
              {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            ]
          },
          description: 'Headers object to serve with files.'
        },
        {
          instanceof: 'Function',
          description: 'Function that returns headers to serve with files.'
        }
      ]
    },
    fs: {
      type: 'object',
      description: 'The output file system used by the dev server.'
    },
    stats: {
      type: 'object',
      description: 'Options for the statistics output.'
    },
    writeToDisk: {
      anyOf: [
        {
          type: 'boolean',
          description: 'Enable or disable writing files to disk.'
        },
        {
          instanceof: 'Function',
          description: 'Function that determines if a file should be written to disk based on its target path.'
        }
      ]
    },
    onDone: {
      instanceof: 'Function',
      description: 'Callback function when the build is done, providing statistics and options.'
    }
  },
  additionalProperties: false
};
