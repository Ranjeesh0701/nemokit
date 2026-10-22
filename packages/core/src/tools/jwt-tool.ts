import type { Tool, ToolExecutionResult } from '../types.js';
import { failureResult, successResult } from '../types.js';

export interface JwtToolInput {
  readonly token: string;
}

export interface JwtToolOutput {
  readonly header: Record<string, unknown>;
  readonly payload: Record<string, unknown>;
  readonly signature: string;
  readonly isExpired: boolean | null;
  readonly expiresAt: string | null;
  readonly issuedAt: string | null;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export const jwtTool: Tool<JwtToolInput, JwtToolOutput> = {
  id: 'jwt-tool',
  name: 'JWT Inspector',
  description:
    'Decodes JSON Web Tokens into header, payload, and signature with expiration analysis completely in the browser.',
  category: 'converters',

  execute(input: JwtToolInput): ToolExecutionResult<JwtToolOutput> {
    const startTime = performance.now();

    if (!input || typeof input.token !== 'string' || input.token.trim() === '') {
      return failureResult('Please provide a JWT token.', 'EMPTY_INPUT');
    }

    const parts = input.token.trim().split('.');
    if (parts.length < 2) {
      return failureResult(
        'Invalid JWT format: A valid token must have at least header and payload segments separated by dots.',
        'INVALID_JWT'
      );
    }

    const headerPart = parts[0];
    const payloadPart = parts[1];
    const signature = parts[2] ?? '';

    if (!headerPart || !payloadPart) {
      return failureResult('Malformed JWT: missing header or payload segment.', 'MALFORMED_JWT');
    }

    try {
      const headerJson = base64UrlDecode(headerPart);
      const payloadJson = base64UrlDecode(payloadPart);

      const header = JSON.parse(headerJson) as Record<string, unknown>;
      const payload = JSON.parse(payloadJson) as Record<string, unknown>;

      let isExpired: boolean | null = null;
      let expiresAt: string | null = null;
      let issuedAt: string | null = null;

      if (typeof payload['exp'] === 'number') {
        const expDate = new Date(payload['exp'] * 1000);
        expiresAt = expDate.toISOString();
        isExpired = expDate.getTime() <= Date.now();
      }

      if (typeof payload['iat'] === 'number') {
        issuedAt = new Date(payload['iat'] * 1000).toISOString();
      }

      return successResult(
        {
          header,
          payload,
          signature,
          isExpired,
          expiresAt,
          issuedAt,
        },
        performance.now() - startTime
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to parse JWT.';
      return failureResult(`JWT decoding failed: ${message}`, 'JWT_DECODE_ERROR');
    }
  },
};
