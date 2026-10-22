import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface FileHashInput {
  readonly filename: string;
  readonly bytes: Uint8Array;
  readonly expectedChecksum?: string;
}

export interface FileHashOutput {
  readonly filename: string;
  readonly sizeBytes: number;
  readonly sizeFormatted: string;
  readonly hashes: {
    readonly sha256: string;
    readonly sha512: string;
    readonly sha1: string;
  };
  readonly verification?: {
    readonly expected: string;
    readonly matches: boolean;
    readonly algorithmDetected: 'sha256' | 'sha512' | 'sha1' | 'unknown';
  };
}

function bufToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    hex += (b < 16 ? '0' : '') + b.toString(16);
  }
  return hex;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const fileHashTool: Tool<FileHashInput, FileHashOutput> = {
  id: 'file-checksum',
  name: 'File Checksum & Hash Verifier',
  description:
    'Computes SHA-256, SHA-512, and SHA-1 checksums for any local file client-side and validates against expected hashes.',
  category: 'crypto',

  async execute(
    input: FileHashInput,
    handlers?: Partial<ResultHandlers<FileHashOutput, void>>
  ): Promise<ToolExecutionResult<FileHashOutput>> {
    const startTime = performance.now();

    const filename = input?.filename || 'unknown_file';
    const bytes = input?.bytes;

    if (!bytes || bytes.length === 0) {
      const res = onFailure('File is empty or no file was provided.', 'EMPTY_FILE');
      handlers?.onFailure?.(res.error);
      return res;
    }

    try {
      // Compute SHA-256, SHA-512, SHA-1 in parallel
      const [sha256Buf, sha512Buf, sha1Buf] = await Promise.all([
        crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource),
        crypto.subtle.digest('SHA-512', bytes as unknown as BufferSource),
        crypto.subtle.digest('SHA-1', bytes as unknown as BufferSource),
      ]);

      const sha256 = bufToHex(sha256Buf);
      const sha512 = bufToHex(sha512Buf);
      const sha1 = bufToHex(sha1Buf);

      let verification: FileHashOutput['verification'] = undefined;
      const expected = (input?.expectedChecksum ?? '').trim().toLowerCase();

      if (expected) {
        let algo: 'sha256' | 'sha512' | 'sha1' | 'unknown' = 'unknown';
        if (expected.length === 64) algo = 'sha256';
        else if (expected.length === 128) algo = 'sha512';
        else if (expected.length === 40) algo = 'sha1';

        const matches = expected === sha256 || expected === sha512 || expected === sha1;

        verification = {
          expected,
          matches,
          algorithmDetected: algo,
        };
      }

      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      const output: FileHashOutput = {
        filename,
        sizeBytes: bytes.length,
        sizeFormatted: formatBytes(bytes.length),
        hashes: {
          sha256,
          sha512,
          sha1,
        },
        verification,
      };

      const successRes = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output);
      return successRes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error hashing file';
      const res = onFailure(msg, 'HASH_ERROR');
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
