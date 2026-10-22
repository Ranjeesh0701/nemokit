import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

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

  execute(
    input: Base64Input,
    handlers?: Partial<ResultHandlers<Base64Output, void>>
  ): ToolExecutionResult<Base64Output> {
    const startTime = performance.now();

    if (!input || typeof input.text !== 'string') {
      const res = onFailure('Input text is required.', 'INVALID_INPUT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    if (input.text.trim() === '') {
      const durationMs = performance.now() - startTime;
      const res = onSuccess<Base64Output>(
        {
          result: '',
          byteLength: 0,
          mode: input.mode,
        },
        durationMs
      );
      handlers?.onSuccess?.(res.data, durationMs);
      return res;
    }

    try {
      if (input.mode === 'encode') {
        let b64 = utf8ToBase64(input.text);
        if (input.urlSafe) {
          b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        const byteLength = new TextEncoder().encode(b64).length;
        const durationMs = performance.now() - startTime;
        const res = onSuccess<Base64Output>(
          {
            result: b64,
            byteLength,
            mode: 'encode',
          },
          durationMs
        );
        handlers?.onSuccess?.(res.data, durationMs);
        return res;
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
        const durationMs = performance.now() - startTime;
        const res = onSuccess<Base64Output>(
          {
            result: decoded,
            byteLength,
            mode: 'decode',
          },
          durationMs
        );
        handlers?.onSuccess?.(res.data, durationMs);
        return res;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid Base64 sequence.';
      const res = onFailure(
        input.mode === 'decode'
          ? `Decoding failed: ${message}. Ensure the string is valid Base64.`
          : `Encoding failed: ${message}`,
        'BASE64_ERROR'
      );
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
