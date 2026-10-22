import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface ParsedCurl {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body?: string;
  readonly auth?: { user: string; pass: string };
}

export interface CurlConverterInput {
  readonly curlCommand: string;
}

export interface CurlConverterOutput {
  readonly parsed: ParsedCurl;
  readonly snippets: {
    readonly jsFetch: string;
    readonly axios: string;
    readonly pythonRequests: string;
    readonly nodeHttps: string;
    readonly goNetHttp: string;
  };
}

function parseCurl(rawCurl: string): ParsedCurl | null {
  // Normalize multi-line backslashes
  const clean = rawCurl.replace(/\\\r?\n/g, ' ').trim();
  if (!clean.toLowerCase().startsWith('curl')) {
    return null;
  }

  // Extract tokens respecting single and double quotes
  const tokens: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(clean)) !== null) {
    tokens.push(match[1] !== undefined ? match[1] : match[2] !== undefined ? match[2] : match[0]);
  }

  let method = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let body: string | undefined = undefined;
  let auth: { user: string; pass: string } | undefined = undefined;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i] ?? '';

    if (token === '-X' || token === '--request') {
      const next = tokens[++i];
      if (next) method = next.toUpperCase();
    } else if (token === '-H' || token === '--header') {
      const headerStr = tokens[++i];
      if (headerStr) {
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > 0) {
          const key = headerStr.slice(0, colonIdx).trim();
          const val = headerStr.slice(colonIdx + 1).trim();
          headers[key] = val;
        }
      }
    } else if (token === '-d' || token === '--data' || token === '--data-raw') {
      body = tokens[++i];
      if (method === 'GET') method = 'POST';
    } else if (token === '-u' || token === '--user') {
      const userPass = tokens[++i] ?? '';
      const [u, p] = userPass.split(':');
      if (u) auth = { user: u, pass: p ?? '' };
    } else if (!token.startsWith('-') && !url) {
      url = token;
    }
  }

  if (!url) return null;

  return { url, method, headers, body, auth };
}

function generateFetch(parsed: ParsedCurl): string {
  const options: Record<string, unknown> = {
    method: parsed.method,
  };

  const headers = { ...parsed.headers };
  if (parsed.auth) {
    const encoded = btoa(`${parsed.auth.user}:${parsed.auth.pass}`);
    headers['Authorization'] = `Basic ${encoded}`;
  }

  if (Object.keys(headers).length > 0) {
    options.headers = headers;
  }

  if (parsed.body && parsed.method !== 'GET') {
    options.body = parsed.body;
  }

  return `const response = await fetch('${parsed.url}', ${JSON.stringify(options, null, 2)});
const data = await response.json();
console.log(data);`;
}

function generateAxios(parsed: ParsedCurl): string {
  const lines: string[] = [`import axios from 'axios';\n`];
  lines.push(`const response = await axios({`);
  lines.push(`  url: '${parsed.url}',`);
  lines.push(`  method: '${parsed.method.toLowerCase()}',`);

  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`  headers: ${JSON.stringify(parsed.headers, null, 4)},`);
  }

  if (parsed.body && parsed.method !== 'GET') {
    try {
      JSON.parse(parsed.body);
      lines.push(`  data: ${parsed.body},`);
    } catch {
      lines.push(`  data: ${JSON.stringify(parsed.body)},`);
    }
  }

  lines.push(`});\nconsole.log(response.data);`);
  return lines.join('\n');
}

function generatePython(parsed: ParsedCurl): string {
  const lines: string[] = [`import requests\n`];
  lines.push(`url = "${parsed.url}"`);

  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(parsed.headers, null, 4)}`);
  } else {
    lines.push(`headers = {}`);
  }

  let bodyArg = '';
  if (parsed.body && parsed.method !== 'GET') {
    try {
      JSON.parse(parsed.body);
      lines.push(`payload = ${parsed.body}`);
      bodyArg = ', json=payload';
    } catch {
      lines.push(`payload = ${JSON.stringify(parsed.body)}`);
      bodyArg = ', data=payload';
    }
  }

  lines.push(
    `response = requests.${parsed.method.toLowerCase()}(url, headers=headers${bodyArg})\nprint(response.json())`
  );
  return lines.join('\n');
}

function generateNodeHttps(parsed: ParsedCurl): string {
  return `// Node 18+ native fetch
const res = await fetch('${parsed.url}', {
  method: '${parsed.method}',
  headers: ${JSON.stringify(parsed.headers, null, 2)},
  ${parsed.body && parsed.method !== 'GET' ? `body: JSON.stringify(${parsed.body}),` : ''}
});
const result = await res.json();
console.log(result);`;
}

function generateGo(parsed: ParsedCurl): string {
  const hasBody = parsed.body && parsed.method !== 'GET';
  return `package main

import (
	"fmt"
	"io"
	"net/http"
	${hasBody ? `"strings"` : ''}
)

func main() {
	url := "${parsed.url}"
	${hasBody ? `payload := strings.NewReader(\`${parsed.body}\`)` : `var payload io.Reader = nil`}

	req, _ := http.NewRequest("${parsed.method}", url, payload)
${Object.entries(parsed.headers)
  .map(([k, v]) => `\treq.Header.Add("${k}", "${v}")`)
  .join('\n')}

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))
}`;
}

export const curlConverterTool: Tool<CurlConverterInput, CurlConverterOutput> = {
  id: 'curl-converter',
  name: 'cURL to Code Converter',
  description:
    'Transforms raw cURL commands into production-ready fetch, Axios, Python requests, and Go HTTP snippets.',
  category: 'web',

  execute(
    input: CurlConverterInput,
    handlers?: Partial<ResultHandlers<CurlConverterOutput, void>>
  ): ToolExecutionResult<CurlConverterOutput> {
    const startTime = performance.now();
    const raw = (input?.curlCommand ?? '').trim();

    if (!raw) {
      const res = onFailure('Please paste a valid cURL command.', 'EMPTY_CURL');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const parsed = parseCurl(raw);
    if (!parsed) {
      const res = onFailure(
        'Unable to parse cURL command. Ensure it begins with "curl" and includes a valid URL.',
        'INVALID_CURL'
      );
      handlers?.onFailure?.(res.error);
      return res;
    }

    const snippets = {
      jsFetch: generateFetch(parsed),
      axios: generateAxios(parsed),
      pythonRequests: generatePython(parsed),
      nodeHttps: generateNodeHttps(parsed),
      goNetHttp: generateGo(parsed),
    };

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const output: CurlConverterOutput = {
      parsed,
      snippets,
    };

    const successRes = onSuccess(output, durationMs);
    handlers?.onSuccess?.(output);
    return successRes;
  },
};
