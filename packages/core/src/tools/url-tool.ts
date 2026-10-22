import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

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

  execute(
    input: UrlToolInput,
    handlers?: Partial<ResultHandlers<UrlToolOutput, void>>
  ): ToolExecutionResult<UrlToolOutput> {
    const startTime = performance.now();

    if (!input || typeof input.url !== 'string' || input.url.trim() === '') {
      const res = onFailure('URL or URI text cannot be empty.', 'EMPTY_INPUT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const raw = input.url.trim();
    const action = input.action ?? 'parse';

    if (action === 'encode-component') {
      try {
        const encoded = encodeURIComponent(raw);
        const durationMs = performance.now() - startTime;
        const res = onSuccess(
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
          durationMs
        );
        handlers?.onSuccess?.(res.data, durationMs);
        return res;
      } catch (err: unknown) {
        const res = onFailure(
          err instanceof Error ? err.message : 'URI encoding failed.',
          'ENCODE_ERROR'
        );
        handlers?.onFailure?.(res.error);
        return res;
      }
    }

    if (action === 'decode-component') {
      try {
        const decoded = decodeURIComponent(raw);
        const durationMs = performance.now() - startTime;
        const res = onSuccess(
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
          durationMs
        );
        handlers?.onSuccess?.(res.data, durationMs);
        return res;
      } catch (err: unknown) {
        const res = onFailure(
          err instanceof Error ? err.message : 'URI decoding failed.',
          'DECODE_ERROR'
        );
        handlers?.onFailure?.(res.error);
        return res;
      }
    }

    // Standard Parse
    try {
      const candidateUrl =
        raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('file://')
          ? raw
          : `https://${raw}`;

      const parsed = new URL(candidateUrl);
      const queryParams: UrlQueryParam[] = [];
      parsed.searchParams.forEach((value, key) => {
        queryParams.push({ key, value });
      });

      const durationMs = performance.now() - startTime;
      const res = onSuccess(
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
        durationMs
      );
      handlers?.onSuccess?.(res.data, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Malformed URL.';
      const res = onFailure(`Invalid URL: ${message}`, 'INVALID_URL');
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
