import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface HttpStatusCodeItem {
  readonly code: number;
  readonly phrase: string;
  readonly category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  readonly categoryName: string;
  readonly description: string;
  readonly rfc: string;
  readonly commonUseCases: string;
}

export interface HttpHeaderItem {
  readonly name: string;
  readonly type: 'request' | 'response' | 'both';
  readonly group: 'caching' | 'security' | 'cors' | 'auth' | 'content';
  readonly description: string;
  readonly example: string;
  readonly rfc?: string;
}

export interface HttpRefInput {
  readonly query?: string;
  readonly group?: string; // 'all', '1xx', '2xx', '3xx', '4xx', '5xx', 'headers'
}

export interface HttpRefOutput {
  readonly statusCodes: ReadonlyArray<HttpStatusCodeItem>;
  readonly headers: ReadonlyArray<HttpHeaderItem>;
  readonly totalMatches: number;
}

export const HTTP_STATUS_CODES: ReadonlyArray<HttpStatusCodeItem> = [
  // 1xx Informational
  {
    code: 100,
    phrase: 'Continue',
    category: '1xx',
    categoryName: 'Informational',
    description: 'Initial part of a request received, client should proceed with the rest.',
    rfc: 'RFC 9110 §15.2.1',
    commonUseCases: 'Expect: 100-continue handshake before uploading large request payloads.',
  },
  {
    code: 101,
    phrase: 'Switching Protocols',
    category: '1xx',
    categoryName: 'Informational',
    description: 'Server agrees to change application protocol per Upgrade request header.',
    rfc: 'RFC 9110 §15.2.2',
    commonUseCases: 'HTTP/1.1 upgrading to WebSocket connections (ws:// / wss://).',
  },
  {
    code: 103,
    phrase: 'Early Hints',
    category: '1xx',
    categoryName: 'Informational',
    description: 'Allows returning headers like Link before final HTTP response is ready.',
    rfc: 'RFC 8297',
    commonUseCases: 'Preloading critical CSS/JS stylesheets while server renders response.',
  },

  // 2xx Success
  {
    code: 200,
    phrase: 'OK',
    category: '2xx',
    categoryName: 'Success',
    description: 'Request has succeeded. Meaning of success depends on HTTP method.',
    rfc: 'RFC 9110 §15.3.1',
    commonUseCases: 'Standard response for successful GET, POST, or PUT calls.',
  },
  {
    code: 201,
    phrase: 'Created',
    category: '2xx',
    categoryName: 'Success',
    description: 'Request fulfilled and resulted in one or more new resources being created.',
    rfc: 'RFC 9110 §15.3.2',
    commonUseCases: 'POST endpoint creates a new database record; returns Location header.',
  },
  {
    code: 202,
    phrase: 'Accepted',
    category: '2xx',
    categoryName: 'Success',
    description: 'Request accepted for processing, but processing has not completed.',
    rfc: 'RFC 9110 §15.3.3',
    commonUseCases: 'Asynchronous task queues, batch jobs, background export pipelines.',
  },
  {
    code: 204,
    phrase: 'No Content',
    category: '2xx',
    categoryName: 'Success',
    description:
      'Request fulfilled successfully, but server does not need to return an entity body.',
    rfc: 'RFC 9110 §15.3.5',
    commonUseCases: 'DELETE resource success or POST actions needing no UI payload updates.',
  },
  {
    code: 206,
    phrase: 'Partial Content',
    category: '2xx',
    categoryName: 'Success',
    description:
      'Server successfully delivering part of resource requested by client Range header.',
    rfc: 'RFC 9110 §15.3.7',
    commonUseCases: 'Resumable file downloads and video/audio HTML5 media streaming.',
  },

  // 3xx Redirection
  {
    code: 301,
    phrase: 'Moved Permanently',
    category: '3xx',
    categoryName: 'Redirection',
    description:
      'Target resource has been assigned a new permanent URI. Clients should update bookmarks.',
    rfc: 'RFC 9110 §15.4.2',
    commonUseCases: 'HTTP to HTTPS migration, canonical domain redirects, URL restructuring.',
  },
  {
    code: 302,
    phrase: 'Found',
    category: '3xx',
    categoryName: 'Redirection',
    description: 'Target resource resides temporarily under a different URI.',
    rfc: 'RFC 9110 §15.4.3',
    commonUseCases: 'Temporary redirection, post-login redirects, A/B testing splits.',
  },
  {
    code: 304,
    phrase: 'Not Modified',
    category: '3xx',
    categoryName: 'Redirection',
    description:
      'Resource has not been modified since version specified in If-None-Match or If-Modified-Since.',
    rfc: 'RFC 9110 §15.4.5',
    commonUseCases: 'HTTP browser caching; server tells client to use locally cached response.',
  },
  {
    code: 307,
    phrase: 'Temporary Redirect',
    category: '3xx',
    categoryName: 'Redirection',
    description:
      'Target resource resides temporarily under different URI; MUST NOT change HTTP method.',
    rfc: 'RFC 9110 §15.4.8',
    commonUseCases: 'POST redirect where original POST body must be re-sent to new URI.',
  },
  {
    code: 308,
    phrase: 'Permanent Redirect',
    category: '3xx',
    categoryName: 'Redirection',
    description: 'Target resource has permanent new URI; MUST NOT change HTTP method.',
    rfc: 'RFC 9110 §15.4.9',
    commonUseCases: 'Permanent redirect preserving POST/PUT methods without degrading to GET.',
  },

  // 4xx Client Error
  {
    code: 400,
    phrase: 'Bad Request',
    category: '4xx',
    categoryName: 'Client Error',
    description:
      'Server cannot process request due to client error (e.g. malformed syntax, invalid framing).',
    rfc: 'RFC 9110 §15.5.1',
    commonUseCases:
      'Invalid JSON request payload, missing mandatory query params, schema validation failure.',
  },
  {
    code: 401,
    phrase: 'Unauthorized',
    category: '4xx',
    categoryName: 'Client Error',
    description: 'Request lacks valid authentication credentials for target resource.',
    rfc: 'RFC 9110 §15.5.2',
    commonUseCases: 'Missing or expired Bearer JWT token, missing Authorization header.',
  },
  {
    code: 403,
    phrase: 'Forbidden',
    category: '4xx',
    categoryName: 'Client Error',
    description: 'Server understands request but refuses authorization (even if authenticated).',
    rfc: 'RFC 9110 §15.5.4',
    commonUseCases: 'User is logged in but lacks admin role / RBAC permission to access resource.',
  },
  {
    code: 404,
    phrase: 'Not Found',
    category: '4xx',
    categoryName: 'Client Error',
    description:
      'Origin server did not find current representation for target resource or hides existence.',
    rfc: 'RFC 9110 §15.5.5',
    commonUseCases: 'Unknown URL path, deleted resource ID, or missing REST document.',
  },
  {
    code: 405,
    phrase: 'Method Not Allowed',
    category: '4xx',
    categoryName: 'Client Error',
    description:
      'Method received in request-line is known by server but not supported by target resource.',
    rfc: 'RFC 9110 §15.5.6',
    commonUseCases: 'Sending POST or DELETE to a static read-only GET endpoint.',
  },
  {
    code: 408,
    phrase: 'Request Timeout',
    category: '4xx',
    categoryName: 'Client Error',
    description: 'Server timed out waiting for client to finish transmitting request.',
    rfc: 'RFC 9110 §15.5.9',
    commonUseCases: 'Slow mobile network or stalled client connection during file upload.',
  },
  {
    code: 409,
    phrase: 'Conflict',
    category: '4xx',
    categoryName: 'Client Error',
    description: 'Request could not be completed due to conflict with current state of resource.',
    rfc: 'RFC 9110 §15.5.10',
    commonUseCases: 'Unique email constraint collision on user registration, Git merge conflict.',
  },
  {
    code: 410,
    phrase: 'Gone',
    category: '4xx',
    categoryName: 'Client Error',
    description:
      'Target resource is no longer available at server and condition is expected to be permanent.',
    rfc: 'RFC 9110 §15.5.11',
    commonUseCases:
      'Deprecated APIs permanently shut down, purged records, search engine de-indexing.',
  },
  {
    code: 413,
    phrase: 'Payload Too Large',
    category: '4xx',
    categoryName: 'Client Error',
    description:
      'Server refuses to process request because payload exceeds limits configured on server.',
    rfc: 'RFC 9110 §15.5.14',
    commonUseCases: 'User uploads a 100MB file exceeding nginx client_max_body_size.',
  },
  {
    code: 415,
    phrase: 'Unsupported Media Type',
    category: '4xx',
    categoryName: 'Client Error',
    description: 'Origin server refuses request because payload is in unsupported format.',
    rfc: 'RFC 9110 §15.5.16',
    commonUseCases: 'Sending XML to an endpoint expecting Content-Type: application/json.',
  },
  {
    code: 422,
    phrase: 'Unprocessable Entity',
    category: '4xx',
    categoryName: 'Client Error',
    description:
      'Syntax of request is valid, but server is unable to process contained instructions.',
    rfc: 'RFC 9110 §15.5.21',
    commonUseCases: 'Semantic validation error (e.g. password too short, age must be > 18).',
  },
  {
    code: 429,
    phrase: 'Too Many Requests',
    category: '4xx',
    categoryName: 'Client Error',
    description: 'User has sent too many requests in a given amount of time (rate limiting).',
    rfc: 'RFC 6585',
    commonUseCases: 'Exceeded API quota; typically accompanied by Retry-After header.',
  },

  // 5xx Server Error
  {
    code: 500,
    phrase: 'Internal Server Error',
    category: '5xx',
    categoryName: 'Server Error',
    description: 'Server encountered unexpected condition preventing it from fulfilling request.',
    rfc: 'RFC 9110 §15.6.1',
    commonUseCases: 'Unhandled exception, database query crash, nil pointer dereference.',
  },
  {
    code: 501,
    phrase: 'Not Implemented',
    category: '5xx',
    categoryName: 'Server Error',
    description: 'Server does not support functionality required to fulfill request.',
    rfc: 'RFC 9110 §15.6.2',
    commonUseCases: 'HTTP method or feature planned for a future API version.',
  },
  {
    code: 502,
    phrase: 'Bad Gateway',
    category: '5xx',
    categoryName: 'Server Error',
    description:
      'Server received invalid response from upstream server while acting as gateway/proxy.',
    rfc: 'RFC 9110 §15.6.3',
    commonUseCases: 'Nginx / Cloudflare cannot talk to crashed backend NodeJS or Go application.',
  },
  {
    code: 503,
    phrase: 'Service Unavailable',
    category: '5xx',
    categoryName: 'Server Error',
    description:
      'Server currently unable to handle request due to temporary overload or maintenance.',
    rfc: 'RFC 9110 §15.6.4',
    commonUseCases: 'Scheduled maintenance windows, DDoS mitigation, container pool exhaustion.',
  },
  {
    code: 504,
    phrase: 'Gateway Timeout',
    category: '5xx',
    categoryName: 'Server Error',
    description:
      'Server acting as gateway/proxy did not receive timely response from upstream server.',
    rfc: 'RFC 9110 §15.6.5',
    commonUseCases: 'Upstream microservice took longer than proxy timeout (e.g. 30s or 60s).',
  },
];

export const HTTP_HEADERS: ReadonlyArray<HttpHeaderItem> = [
  {
    name: 'Authorization',
    type: 'request',
    group: 'auth',
    description: 'Carries client credentials for authenticating a request.',
    example: 'Authorization: Bearer eyJhbGciOiJIUzI1Ni...',
    rfc: 'RFC 9110 §11.6.2',
  },
  {
    name: 'Cache-Control',
    type: 'both',
    group: 'caching',
    description: 'Directives for caching mechanisms in requests and responses.',
    example: 'Cache-Control: public, max-age=31536000, immutable',
    rfc: 'RFC 9111 §5.2',
  },
  {
    name: 'Content-Security-Policy',
    type: 'response',
    group: 'security',
    description:
      'Controls resources the user agent is allowed to load for a given page to mitigate XSS.',
    example:
      "Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com",
    rfc: 'W3C CSP Level 3',
  },
  {
    name: 'Strict-Transport-Security',
    type: 'response',
    group: 'security',
    description: 'Informs browsers that site should only be accessed using HTTPS (HSTS).',
    example: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
    rfc: 'RFC 6797',
  },
  {
    name: 'ETag',
    type: 'response',
    group: 'caching',
    description: 'Identifier for a specific version of a resource used for conditional requests.',
    example: 'ETag: W/"33a64df551425fcc55e4d42a148795d9f25f89d4"',
    rfc: 'RFC 9110 §8.8.3',
  },
  {
    name: 'Access-Control-Allow-Origin',
    type: 'response',
    group: 'cors',
    description: 'Indicates whether response can be shared with requesting code from given origin.',
    example: 'Access-Control-Allow-Origin: https://app.nemokit.com',
    rfc: 'W3C CORS',
  },
  {
    name: 'Access-Control-Allow-Methods',
    type: 'response',
    group: 'cors',
    description:
      'Specifies methods allowed when accessing resource in response to preflight request.',
    example: 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS',
    rfc: 'W3C CORS',
  },
  {
    name: 'X-Content-Type-Options',
    type: 'response',
    group: 'security',
    description:
      'Prevents MIME type sniffing by instructing browsers to strictly adhere to Content-Type.',
    example: 'X-Content-Type-Options: nosniff',
    rfc: 'Fetch Spec §8.1',
  },
  {
    name: 'Content-Type',
    type: 'both',
    group: 'content',
    description: 'Indicates original media type of the resource before any encoding is applied.',
    example: 'Content-Type: application/json; charset=utf-8',
    rfc: 'RFC 9110 §8.3',
  },
];

export const httpRefTool: Tool<HttpRefInput, HttpRefOutput> = {
  id: 'http-reference',
  name: 'HTTP Status & Headers Reference',
  description:
    'Searchable cheat-sheet and specification reference for HTTP 1xx-5xx status codes and standard request/response headers.',
  category: 'web',

  execute(
    input: HttpRefInput,
    handlers?: Partial<ResultHandlers<HttpRefOutput, void>>
  ): ToolExecutionResult<HttpRefOutput> {
    const startTime = performance.now();
    try {
      const q = (input.query ?? '').toLowerCase().trim();
      const group = (input.group ?? 'all').toLowerCase();

      let filteredCodes = HTTP_STATUS_CODES;
      if (group !== 'all' && group !== 'headers') {
        filteredCodes = filteredCodes.filter(c => c.category === group);
      } else if (group === 'headers') {
        filteredCodes = [];
      }

      if (q) {
        filteredCodes = filteredCodes.filter(
          c =>
            c.code.toString().includes(q) ||
            c.phrase.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.commonUseCases.toLowerCase().includes(q)
        );
      }

      let filteredHeaders = HTTP_HEADERS;
      if (group !== 'all' && group !== 'headers') {
        filteredHeaders = [];
      }

      if (q) {
        filteredHeaders = filteredHeaders.filter(
          h =>
            h.name.toLowerCase().includes(q) ||
            h.description.toLowerCase().includes(q) ||
            h.example.toLowerCase().includes(q) ||
            h.group.toLowerCase().includes(q)
        );
      }

      const result: HttpRefOutput = {
        statusCodes: filteredCodes,
        headers: filteredHeaders,
        totalMatches: filteredCodes.length + filteredHeaders.length,
      };

      const durationMs = performance.now() - startTime;
      const res = onSuccess(result, durationMs);
      handlers?.onSuccess?.(result, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to query HTTP reference';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
