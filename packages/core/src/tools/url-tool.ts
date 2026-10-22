import type { Tool, ToolExecutionResult } from '../types.js';
import { failureResult, successResult } from '../types.js';

export interface UrlQueryParam {
  readonly key: string;
  readonly value: string;
}

export interface UrlToolInput {
  readonly url: string;
  readonly action?: 'parse' | 'encode-component' | 'decode-component';
}

export interface UrlToolOutput {
  readonly protocol: string;
  readonly hostname: string;
  readonly port: string;
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
  readonly queryParams: ReadonlyArray<UrlQueryParam>;
  readonly formatted: string;
}

export const urlTool: Tool<UrlToolInput, UrlToolOutput> = {
  id: 'url-tool',
  name: 'URL Parser & Encoder',
  description:
    'Deconstructs URLs into protocol, host, pathname, and query parameters, with URI encoding support.',
  category: 'web',

  execute(input: UrlToolInput): ToolExecutionResult<UrlToolOutput> {
    const startTime = performance.now();

    if (!input || typeof input.url !== 'string' || input.url.trim() === '') {
      return failureResult('URL or URI text cannot be empty.', 'EMPTY_INPUT');
    }

    const raw = input.url.trim();
    const action = input.action ?? 'parse';

    if (action === 'encode-component') {
      try {
        const encoded = encodeURIComponent(raw);
        return successResult(
          {
            protocol: '',
            hostname: '',
            port: '',
            pathname: '',
            search: '',
            hash: '',
            queryParams: [],
            formatted: encoded,
          },
          performance.now() - startTime
        );
      } catch (err: unknown) {
        return failureResult(
          err instanceof Error ? err.message : 'URI encoding failed.',
          'ENCODE_ERROR'
        );
      }
    }

    if (action === 'decode-component') {
      try {
        const decoded = decodeURIComponent(raw);
        return successResult(
          {
            protocol: '',
            hostname: '',
            port: '',
            pathname: '',
            search: '',
            hash: '',
            queryParams: [],
            formatted: decoded,
          },
          performance.now() - startTime
        );
      } catch (err: unknown) {
        return failureResult(
          err instanceof Error ? err.message : 'URI decoding failed.',
          'DECODE_ERROR'
        );
      }
    }

    // Standard Parse
    try {
      // If no protocol was provided (e.g. "github.com/org/repo"), try prepending https://
      const candidateUrl =
        raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('file://')
          ? raw
          : `https://${raw}`;

      const parsed = new URL(candidateUrl);
      const queryParams: UrlQueryParam[] = [];
      parsed.searchParams.forEach((value, key) => {
        queryParams.push({ key, value });
      });

      return successResult(
        {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port,
          pathname: parsed.pathname,
          search: parsed.search,
          hash: parsed.hash,
          queryParams,
          formatted: parsed.toString(),
        },
        performance.now() - startTime
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Malformed URL.';
      return failureResult(`Invalid URL: ${message}`, 'INVALID_URL');
    }
  },
};
