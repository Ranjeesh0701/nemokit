import { useState, useMemo } from 'react';
import {
  Terminal,
  Bot,
  Copy,
  Check,
  Sparkles,
  Search,
  ShieldCheck,
  CheckCircle2,
  Server,
  Cpu,
} from 'lucide-react';

interface McpToolInfo {
  readonly id: string;
  readonly name: string;
  readonly category: 'formatters' | 'schema' | 'svg' | 'crypto' | 'web' | 'system';
  readonly description: string;
  readonly promptExample: string;
  readonly parameters: ReadonlyArray<{
    name: string;
    type: string;
    required: boolean;
    desc: string;
  }>;
}

const MCP_TOOLS: ReadonlyArray<McpToolInfo> = [
  {
    id: 'nemokit_format_json',
    name: 'nemokit_format_json',
    category: 'formatters',
    description:
      'Validate, prettify, or minify JSON data with customizable indentation (1-8 spaces or minified).',
    promptExample: 'Format this raw API response with 2-space indentation.',
    parameters: [
      { name: 'raw', type: 'string', required: true, desc: 'The raw JSON string to format' },
      {
        name: 'indent',
        type: 'number',
        required: false,
        desc: 'Indentation spaces (0 for minified, default 2)',
      },
    ],
  },
  {
    id: 'nemokit_validate_json_schema',
    name: 'nemokit_validate_json_schema',
    category: 'schema',
    description:
      'Validate a JSON data payload against a JSON Schema Draft-07 specification and return structured validation errors.',
    promptExample: 'Validate this payload against my user profile JSON schema.',
    parameters: [
      { name: 'schema', type: 'string', required: true, desc: 'Draft-07 JSON Schema markup' },
      { name: 'data', type: 'string', required: true, desc: 'JSON data to test' },
    ],
  },
  {
    id: 'nemokit_generate_mock_json',
    name: 'nemokit_generate_mock_json',
    category: 'schema',
    description:
      'Generate realistic mock JSON fixtures from a JSON Schema specification using smart heuristics for emails, UUIDs, dates, and names.',
    promptExample: 'Generate 5 realistic mock user records from this schema.',
    parameters: [
      {
        name: 'schema',
        type: 'string',
        required: true,
        desc: 'JSON schema to generate mock values from',
      },
      {
        name: 'count',
        type: 'number',
        required: false,
        desc: 'Number of sample records (1-50, default 3)',
      },
      {
        name: 'seed',
        type: 'number',
        required: false,
        desc: 'PRNG seed for reproducible mock fixtures',
      },
    ],
  },
  {
    id: 'nemokit_infer_json_schema',
    name: 'nemokit_infer_json_schema',
    category: 'schema',
    description:
      'Infer a strict JSON Schema Draft-07 specification from sample JSON data payload with deep nested object and array detection.',
    promptExample: 'Generate a JSON Schema Draft-07 from this sample payload.',
    parameters: [
      { name: 'json', type: 'string', required: true, desc: 'Sample JSON payload string' },
      {
        name: 'requiredByDefault',
        type: 'boolean',
        required: false,
        desc: 'Mark all discovered object keys as required (default true)',
      },
    ],
  },
  {
    id: 'nemokit_format_sql',
    name: 'nemokit_format_sql',
    category: 'formatters',
    description:
      'Format and beautify SQL queries with dialect support (PostgreSQL, MySQL, SQLite, Standard SQL).',
    promptExample: 'Beautify this Postgres query with uppercase keywords and 2-space indents.',
    parameters: [
      { name: 'sql', type: 'string', required: true, desc: 'SQL query string' },
      {
        name: 'dialect',
        type: 'string',
        required: false,
        desc: 'Dialect: postgresql, mysql, sqlite, sql',
      },
      {
        name: 'uppercase',
        type: 'boolean',
        required: false,
        desc: 'Capitalize keywords (SELECT, FROM, WHERE)',
      },
    ],
  },
  {
    id: 'nemokit_diff_texts',
    name: 'nemokit_diff_texts',
    category: 'formatters',
    description:
      'Compute line-by-line differences between two text strings using the Myers diff algorithm.',
    promptExample: 'Compare these two configuration files and highlight differences.',
    parameters: [
      { name: 'original', type: 'string', required: true, desc: 'Original / baseline text' },
      { name: 'modified', type: 'string', required: true, desc: 'Modified / updated text' },
      {
        name: 'ignoreWhitespace',
        type: 'boolean',
        required: false,
        desc: 'Ignore whitespace differences',
      },
    ],
  },
  {
    id: 'nemokit_optimize_svg',
    name: 'nemokit_optimize_svg',
    category: 'svg',
    description:
      'Sanitize vector bloat, round decimal precision, strip editor namespaces (Inkscape/Sketch), and generate clean React JSX.',
    promptExample: 'Strip Inkscape editor namespaces and output production React JSX for this SVG.',
    parameters: [
      { name: 'svg', type: 'string', required: true, desc: 'Raw SVG markup string' },
      {
        name: 'precision',
        type: 'number',
        required: false,
        desc: 'Coordinate precision (1-4, default 1)',
      },
      {
        name: 'removeComments',
        type: 'boolean',
        required: false,
        desc: 'Strip XML comments (default true)',
      },
    ],
  },
  {
    id: 'nemokit_generate_logo_svg',
    name: 'nemokit_generate_logo_svg',
    category: 'svg',
    description:
      'Procedurally build high-resolution vector logos, brand badges, app icons, and emblems with 19 container shapes.',
    promptExample: 'Create a modern purple-to-pink gradient shield logo with sparkles for Acme AI.',
    parameters: [
      {
        name: 'shape',
        type: 'string',
        required: false,
        desc: 'Shape: squircle, circle, shield, diamond, hexagon, etc.',
      },
      { name: 'bgColor1', type: 'string', required: false, desc: 'Primary gradient color' },
      { name: 'bgColor2', type: 'string', required: false, desc: 'Secondary gradient color' },
      {
        name: 'iconId',
        type: 'string',
        required: false,
        desc: 'zap, terminal, sparkles, shield, rocket, code, etc.',
      },
      { name: 'wordmark', type: 'string', required: false, desc: 'Brand title label text' },
    ],
  },
  {
    id: 'nemokit_generate_pattern_svg',
    name: 'nemokit_generate_pattern_svg',
    category: 'svg',
    description:
      'Generate seamless repeating SVG background patterns and CSS background-image data URLs.',
    promptExample: 'Generate an isometric cubes repeating background pattern in deep slate.',
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        required: false,
        desc: 'Pattern: isometric-cubes, dots, grid, waves, circuit, etc.',
      },
      {
        name: 'foreground',
        type: 'string',
        required: false,
        desc: 'Pattern line/stroke hex color',
      },
      { name: 'background', type: 'string', required: false, desc: 'Base container hex color' },
      {
        name: 'scale',
        type: 'number',
        required: false,
        desc: 'Pattern tile size (8-128, default 32)',
      },
    ],
  },
  {
    id: 'nemokit_generate_random_svg',
    name: 'nemokit_generate_random_svg',
    category: 'svg',
    description:
      'Procedurally generate organic fluid blobs, layered waves, pixel identicons, low-poly constellations, or tech circuits.',
    promptExample:
      'Generate a multi-layered generative fluid blob with cyan and fuchsia gradients.',
    parameters: [
      {
        name: 'type',
        type: 'string',
        required: false,
        desc: 'Type: blob, waves, identicon, constellation, circuits',
      },
      {
        name: 'complexity',
        type: 'number',
        required: false,
        desc: 'Point count / complexity (3-12, default 6)',
      },
      { name: 'seed', type: 'number', required: false, desc: 'PRNG seed for deterministic output' },
    ],
  },
  {
    id: 'nemokit_base64',
    name: 'nemokit_base64',
    category: 'formatters',
    description:
      'Encode UTF-8 text to Base64 (standard or URL-safe) or decode Base64 back to text.',
    promptExample: 'Encode this API key payload to URL-safe Base64 without padding.',
    parameters: [
      { name: 'action', type: 'string', required: true, desc: '"encode" or "decode"' },
      { name: 'input', type: 'string', required: true, desc: 'String to process' },
      { name: 'urlSafe', type: 'boolean', required: false, desc: 'Use URL-safe character set' },
    ],
  },
  {
    id: 'nemokit_parse_url',
    name: 'nemokit_parse_url',
    category: 'web',
    description:
      'Parse URL into components (protocol, hostname, port, pathname, search params, hash) or encode/decode URL components.',
    promptExample: 'Parse all query parameters from this webhook redirect URL.',
    parameters: [
      { name: 'action', type: 'string', required: true, desc: '"parse", "encode", or "decode"' },
      { name: 'input', type: 'string', required: true, desc: 'URL or URL component string' },
    ],
  },
  {
    id: 'nemokit_hash',
    name: 'nemokit_hash',
    category: 'crypto',
    description:
      'Compute cryptographic hashes (SHA-256, SHA-512, SHA-1, SHA-384, MD5) or HMAC signatures with a secret key.',
    promptExample: 'Generate a SHA-256 hash of this payload for signature verification.',
    parameters: [
      { name: 'input', type: 'string', required: true, desc: 'Text to hash' },
      {
        name: 'algorithm',
        type: 'string',
        required: false,
        desc: 'SHA-256, SHA-512, SHA-1, MD5, etc.',
      },
      { name: 'hmacKey', type: 'string', required: false, desc: 'Optional secret key for HMAC' },
    ],
  },
  {
    id: 'nemokit_generate_uuid',
    name: 'nemokit_generate_uuid',
    category: 'crypto',
    description:
      'Generate standard UUIDv4, UUIDv7 (timestamp-ordered), or URL-friendly NanoIDs with custom length.',
    promptExample: 'Generate 5 UUIDv7 identifiers ordered by timestamp.',
    parameters: [
      { name: 'version', type: 'string', required: false, desc: '"v4", "v7", or "nanoid"' },
      {
        name: 'count',
        type: 'number',
        required: false,
        desc: 'Quantity to generate (1-100, default 1)',
      },
    ],
  },
  {
    id: 'nemokit_decode_jwt',
    name: 'nemokit_decode_jwt',
    category: 'crypto',
    description:
      'Decode and inspect JSON Web Tokens (JWT) headers and claims payload with expiration and issue date analysis.',
    promptExample: 'Inspect the claims and check the expiry status of this JWT token.',
    parameters: [
      {
        name: 'token',
        type: 'string',
        required: true,
        desc: 'The full JWT string (header.payload.signature)',
      },
    ],
  },
  {
    id: 'nemokit_convert_timestamp',
    name: 'nemokit_convert_timestamp',
    category: 'system',
    description:
      'Convert between Unix timestamps (seconds/ms), ISO-8601, RFC-2822, and human relative times.',
    promptExample: 'Convert this Unix timestamp 1718000000 into UTC ISO-8601 format.',
    parameters: [
      { name: 'input', type: 'string | number', required: true, desc: 'Timestamp or date string' },
      {
        name: 'targetFormat',
        type: 'string',
        required: false,
        desc: 'iso, unix-sec, unix-ms, rfc2822, relative',
      },
    ],
  },
  {
    id: 'nemokit_generate_password',
    name: 'nemokit_generate_password',
    category: 'crypto',
    description:
      'Generate cryptographically secure random passwords or Diceware-style passphrase word sequences.',
    promptExample: 'Generate a 24-character high-entropy password with symbols.',
    parameters: [
      {
        name: 'length',
        type: 'number',
        required: false,
        desc: 'Character length (8-128, default 16)',
      },
      {
        name: 'useUppercase',
        type: 'boolean',
        required: false,
        desc: 'Include uppercase characters',
      },
      { name: 'useNumbers', type: 'boolean', required: false, desc: 'Include numbers' },
      { name: 'useSymbols', type: 'boolean', required: false, desc: 'Include special symbols' },
    ],
  },
  {
    id: 'nemokit_convert_color',
    name: 'nemokit_convert_color',
    category: 'formatters',
    description:
      'Convert colors between HEX, RGB, HSL, and HSV color models with channel breakdown.',
    promptExample: 'Convert #6366f1 to HSL and RGB notation.',
    parameters: [
      {
        name: 'color',
        type: 'string',
        required: true,
        desc: 'Color string (e.g. "#6366f1" or "rgb(99, 102, 241)")',
      },
    ],
  },
  {
    id: 'nemokit_check_wcag_contrast',
    name: 'nemokit_check_wcag_contrast',
    category: 'web',
    description:
      'Evaluate WCAG 2.1 color contrast ratio and determine AA / AAA compliance for normal and large text.',
    promptExample: 'Check WCAG contrast compliance between #ffffff and #6366f1.',
    parameters: [
      { name: 'foreground', type: 'string', required: true, desc: 'Foreground text color hex' },
      { name: 'background', type: 'string', required: true, desc: 'Background color hex' },
    ],
  },
  {
    id: 'nemokit_explain_cron',
    name: 'nemokit_explain_cron',
    category: 'system',
    description:
      'Parse and explain standard 5-part cron expressions into plain English with next scheduled run dates.',
    promptExample: 'Explain what cron schedule "*/15 0 * * 1-5" does and list next run times.',
    parameters: [
      { name: 'expression', type: 'string', required: true, desc: 'Cron expression string' },
    ],
  },
  {
    id: 'nemokit_test_regex',
    name: 'nemokit_test_regex',
    category: 'system',
    description:
      'Evaluate Regular Expressions against test strings with capture groups, match indices, and flags.',
    promptExample: 'Test this email regex against a list of sample addresses.',
    parameters: [
      { name: 'pattern', type: 'string', required: true, desc: 'Regex pattern string' },
      { name: 'text', type: 'string', required: true, desc: 'Target string to test against' },
      { name: 'flags', type: 'string', required: false, desc: 'Regex flags (e.g. "gi", "m")' },
    ],
  },
  {
    id: 'nemokit_convert_curl',
    name: 'nemokit_convert_curl',
    category: 'web',
    description:
      'Convert cURL command strings into Fetch, Axios, Python requests, or Node.js HTTP snippet code.',
    promptExample: 'Convert this curl POST command into a modern JavaScript fetch snippet.',
    parameters: [
      { name: 'curl', type: 'string', required: true, desc: 'Raw curl command line string' },
      { name: 'target', type: 'string', required: false, desc: 'fetch, axios, python, node' },
    ],
  },
  {
    id: 'nemokit_convert_data',
    name: 'nemokit_convert_data',
    category: 'formatters',
    description: 'Bi-directionally convert data formats between JSON, YAML, TOML, and XML.',
    promptExample: 'Convert this YAML configuration into formatted JSON.',
    parameters: [
      { name: 'input', type: 'string', required: true, desc: 'Data payload string' },
      { name: 'from', type: 'string', required: true, desc: 'json, yaml, toml, xml' },
      { name: 'to', type: 'string', required: true, desc: 'json, yaml, toml, xml' },
    ],
  },
  {
    id: 'nemokit_calculate_chmod',
    name: 'nemokit_calculate_chmod',
    category: 'system',
    description:
      'Calculate Unix file permissions between octal (755) and symbolic (rwxr-xr-x) representations.',
    promptExample: 'What permissions does chmod 644 set, and what is its symbolic string?',
    parameters: [
      { name: 'octal', type: 'string', required: false, desc: 'Octal string (e.g. "755", "644")' },
      {
        name: 'symbolic',
        type: 'string',
        required: false,
        desc: 'Symbolic string (e.g. "rwxr-xr-x")',
      },
    ],
  },
  {
    id: 'nemokit_http_reference',
    name: 'nemokit_http_reference',
    category: 'web',
    description:
      'Query comprehensive HTTP status codes (100-599) and standard HTTP headers with RFC specifications.',
    promptExample: 'Look up HTTP status code 429 and its associated Retry-After header.',
    parameters: [
      {
        name: 'query',
        type: 'string',
        required: true,
        desc: 'Search query (e.g. "404", "cache-control", "cors")',
      },
    ],
  },
  {
    id: 'nemokit_generate_qr_code',
    name: 'nemokit_generate_qr_code',
    category: 'web',
    description:
      'Generate high-density QR code matrix data, SVG elements, or data URLs for URLs and text.',
    promptExample: 'Generate a clean SVG QR code for https://nemokit.dev.',
    parameters: [
      { name: 'text', type: 'string', required: true, desc: 'Content or URL to encode' },
      { name: 'errorCorrection', type: 'string', required: false, desc: 'L, M, Q, H (default M)' },
    ],
  },
];

export function McpServerView() {
  const [selectedClient, setSelectedClient] = useState<'claude' | 'cursor' | 'zed' | 'cli'>(
    'claude'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const claudeConfigSnippet = `{
  "mcpServers": {
    "nemokit": {
      "command": "npx",
      "args": ["-y", "@nemokit/mcp"]
    }
  }
}`;

  const cursorConfigSnippet = `{
  "mcpServers": {
    "nemokit": {
      "command": "npx",
      "args": ["-y", "@nemokit/mcp"]
    }
  }
}`;

  const zedConfigSnippet = `{
  "context_servers": [
    {
      "id": "nemokit",
      "command": "npx",
      "args": ["-y", "@nemokit/mcp"]
    }
  ]
}`;

  const cliSnippet = `npx -y @nemokit/mcp`;

  const filteredTools = useMemo(() => {
    return MCP_TOOLS.filter(tool => {
      const matchesSearch =
        !searchQuery ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.promptExample.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-6 w-full flex-1 pb-12 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Model Context Protocol (MCP) Server
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              26 Tools Available
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Connect all 26 Nemokit developer tools directly to your AI assistants (Claude Desktop,
            Cursor, Zed, Cline, Antigravity) via local stdio.
          </p>
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Local Stdio</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 shadow-xs">
            <Cpu className="h-3.5 w-3.5 text-indigo-600" />
            <span>Zero API Keys Needed</span>
          </div>
        </div>
      </div>

      {/* Quick Setup Guide Card */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200/60 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-600" />
              One-Click Integration Configuration
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Copy and paste into your AI assistant settings file to instantly register the Nemokit
              tool suite.
            </p>
          </div>

          {/* Client Selector Pills */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedClient('claude')}
              className={`rounded-md px-3 py-1 transition-all ${
                selectedClient === 'claude'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Claude Desktop
            </button>
            <button
              type="button"
              onClick={() => setSelectedClient('cursor')}
              className={`rounded-md px-3 py-1 transition-all ${
                selectedClient === 'cursor'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Cursor
            </button>
            <button
              type="button"
              onClick={() => setSelectedClient('zed')}
              className={`rounded-md px-3 py-1 transition-all ${
                selectedClient === 'zed'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Zed
            </button>
            <button
              type="button"
              onClick={() => setSelectedClient('cli')}
              className={`rounded-md px-3 py-1 transition-all ${
                selectedClient === 'cli'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              CLI Command
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {selectedClient === 'claude' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-1">
                <span>
                  Paste into{' '}
                  <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-800">
                    claude_desktop_config.json
                  </code>
                  :
                </span>
                <span className="text-stone-400 text-[11px]">
                  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
                </span>
              </div>
              <div className="relative rounded-xl border border-stone-800 bg-stone-900 p-4 font-mono text-xs text-stone-100 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleCopy(claudeConfigSnippet, 'claude')}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-2.5 py-1 text-xs text-stone-200 hover:bg-stone-700 transition-colors"
                >
                  {copiedKey === 'claude' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-stone-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <pre className="overflow-x-auto text-[12px] leading-relaxed text-indigo-300">
                  {claudeConfigSnippet}
                </pre>
              </div>
            </div>
          )}

          {selectedClient === 'cursor' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-1">
                <span>
                  Paste into{' '}
                  <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-800">
                    .cursor/mcp.json
                  </code>{' '}
                  or add via Cursor Settings &gt; MCP:
                </span>
                <span className="text-stone-400 text-[11px]">Project or Global MCP Config</span>
              </div>
              <div className="relative rounded-xl border border-stone-800 bg-stone-900 p-4 font-mono text-xs text-stone-100 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleCopy(cursorConfigSnippet, 'cursor')}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-2.5 py-1 text-xs text-stone-200 hover:bg-stone-700 transition-colors"
                >
                  {copiedKey === 'cursor' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-stone-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <pre className="overflow-x-auto text-[12px] leading-relaxed text-cyan-300">
                  {cursorConfigSnippet}
                </pre>
              </div>
            </div>
          )}

          {selectedClient === 'zed' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-1">
                <span>
                  Paste into Zed{' '}
                  <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-800">
                    ~/.config/zed/settings.json
                  </code>
                  :
                </span>
                <span className="text-stone-400 text-[11px]">
                  Command Palette &gt; Open Settings
                </span>
              </div>
              <div className="relative rounded-xl border border-stone-800 bg-stone-900 p-4 font-mono text-xs text-stone-100 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleCopy(zedConfigSnippet, 'zed')}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-2.5 py-1 text-xs text-stone-200 hover:bg-stone-700 transition-colors"
                >
                  {copiedKey === 'zed' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-stone-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <pre className="overflow-x-auto text-[12px] leading-relaxed text-amber-300">
                  {zedConfigSnippet}
                </pre>
              </div>
            </div>
          )}

          {selectedClient === 'cli' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-1">
                <span>Execute or inspect in any shell terminal over standard I/O (stdio):</span>
                <span className="text-stone-400 text-[11px]">Works with Node 18+ or Bun</span>
              </div>
              <div className="relative rounded-xl border border-stone-800 bg-stone-900 p-4 font-mono text-xs text-stone-100 shadow-inner flex items-center justify-between">
                <code className="text-emerald-400 text-sm">{cliSnippet}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(cliSnippet, 'cli')}
                  className="flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-2.5 py-1 text-xs text-stone-200 hover:bg-stone-700 transition-colors"
                >
                  {copiedKey === 'cli' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-stone-400" />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Directory Section Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Server className="h-4 w-4 text-indigo-600" />
            Registered Tools Directory ({filteredTools.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Full parameter schema and prompt invocation examples for each MCP capability.
          </p>
        </div>

        {/* Search & Category filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools or prompts..."
              className="rounded-lg border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-700 shadow-xs focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="formatters">Formatters & Diff</option>
            <option value="schema">JSON Schema & Mock</option>
            <option value="svg">SVG & Generative</option>
            <option value="crypto">Security & Crypto</option>
            <option value="web">Web & Network</option>
            <option value="system">System & Cron</option>
          </select>
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map(tool => (
          <div
            key={tool.id}
            className="flex flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs hover:border-stone-300 transition-all"
          >
            <div>
              {/* Card Title & Copy Identifier */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    {tool.name}
                  </span>
                </div>
                <button
                  type="button"
                  title="Copy tool name"
                  onClick={() => handleCopy(tool.name, `tool-${tool.id}`)}
                  className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                >
                  {copiedKey === `tool-${tool.id}` ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">{tool.description}</p>

              {/* Parameters list */}
              <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Parameters ({tool.parameters.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {tool.parameters.map(param => (
                    <span
                      key={param.name}
                      title={`${param.desc} (${param.type})`}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono ${
                        param.required
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-stone-50 text-stone-600 border border-stone-200/70'
                      }`}
                    >
                      {param.name}
                      {param.required && <span className="text-rose-500 font-bold">*</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Prompt invocation preview */}
            <div className="mt-4 rounded-lg bg-stone-50 border border-stone-200/70 p-2.5 text-[11px] text-stone-600">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Example Prompt:
              </span>
              <p className="mt-0.5 italic text-stone-500">"{tool.promptExample}"</p>
            </div>
          </div>
        ))}
      </div>

      {/* Guaranteed Bottom Spacing Spacer matching other screens */}
      <div className="h-12 sm:h-16 shrink-0 w-full" aria-hidden="true" />
    </div>
  );
}
