import type { Tool, ToolExecutionResult } from '../types.js';
import { failureResult, successResult } from '../types.js';

export interface Base64Input {
  readonly text: string;
  readonly mode: 'encode' | 'decode';
  readonly urlSafe?: boolean;
}

export interface Base64Output {
  readonly result: string;
  readonly byteLength: number;
  readonly mode: 'encode' | 'decode';
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export const base64Tool: Tool<Base64Input, Base64Output> = {
  id: 'base64-tool',
  name: 'Base64 Converter',
  description: 'Encodes text to Base64 and decodes Base64 to text with UTF-8 and URL-safe support.',
  category: 'converters',

  execute(input: Base64Input): ToolExecutionResult<Base64Output> {
    const startTime = performance.now();

    if (!input || typeof input.text !== 'string') {
      return failureResult('Input text is required.', 'INVALID_INPUT');
    }

    if (input.text.trim() === '') {
      return successResult(
        {
          result: '',
          byteLength: 0,
          mode: input.mode,
        },
        performance.now() - startTime
      );
    }

    try {
      if (input.mode === 'encode') {
        let b64 = utf8ToBase64(input.text);
        if (input.urlSafe) {
          b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        const byteLength = new TextEncoder().encode(b64).length;
        return successResult(
          {
            result: b64,
            byteLength,
            mode: 'encode',
          },
          performance.now() - startTime
        );
      } else {
        // Decode
        let normalized = input.text.trim();
        if (input.urlSafe) {
          normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
          while (normalized.length % 4 !== 0) {
            normalized += '=';
          }
        }
        const decoded = base64ToUtf8(normalized);
        const byteLength = new TextEncoder().encode(decoded).length;
        return successResult(
          {
            result: decoded,
            byteLength,
            mode: 'decode',
          },
          performance.now() - startTime
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid Base64 sequence.';
      return failureResult(
        input.mode === 'decode'
          ? `Decoding failed: ${message}. Ensure the string is valid Base64.`
          : `Encoding failed: ${message}`,
        'BASE64_ERROR'
      );
    }
  },
};
