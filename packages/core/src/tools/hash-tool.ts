import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface HashToolInput {
  readonly text: string;
  readonly algorithm?: HashAlgorithm;
}

export interface HashToolOutput {
  readonly hex: string;
  readonly algorithm: HashAlgorithm;
  readonly bitLength: number;
  readonly byteLength: number;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      hex += byte.toString(16).padStart(2, '0');
    }
  }
  return hex;
}

export const hashTool: Tool<HashToolInput, HashToolOutput> = {
  id: 'hash-tool',
  name: 'Cryptographic Hash Generator',
  description:
    'Computes SHA-1, SHA-256, SHA-384, and SHA-512 hashes using the browser-native Web Crypto API.',
  category: 'crypto',

  async execute(
    input: HashToolInput,
    handlers?: Partial<ResultHandlers<HashToolOutput, void>>
  ): Promise<ToolExecutionResult<HashToolOutput>> {
    const startTime = performance.now();

    if (!input || typeof input.text !== 'string') {
      const res = onFailure('Input text is required to compute a hash.', 'INVALID_INPUT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const algorithm: HashAlgorithm = input.algorithm ?? 'SHA-256';
    const supported: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

    if (!supported.includes(algorithm)) {
      const res = onFailure(`Unsupported hash algorithm: ${algorithm}`, 'UNSUPPORTED_ALGORITHM');
      handlers?.onFailure?.(res.error);
      return res;
    }

    try {
      const cryptoApi = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined;

      if (!cryptoApi || !cryptoApi.subtle) {
        const res = onFailure(
          'Web Crypto API (crypto.subtle) is not available in this environment.',
          'CRYPTO_UNAVAILABLE'
        );
        handlers?.onFailure?.(res.error);
        return res;
      }

      const encoded = new TextEncoder().encode(input.text);
      const hashBuffer = await cryptoApi.subtle.digest(algorithm, encoded);
      const hex = bufferToHex(hashBuffer);
      const byteLength = hashBuffer.byteLength;
      const bitLength = byteLength * 8;
      const durationMs = performance.now() - startTime;

      const res = onSuccess(
        {
          hex,
          algorithm,
          bitLength,
          byteLength,
        },
        durationMs
      );
      handlers?.onSuccess?.(res.data, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Hash calculation failed.';
      const res = onFailure(`Hash generation error: ${message}`, 'HASH_ERROR');
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
