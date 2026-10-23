import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  jsonFormatterTool,
  jsonSchemaTool,
  sqlFormatterTool,
  diffTool,
  base64Tool,
  urlTool,
  hashTool,
  uuidTool,
  jwtTool,
  timestampTool,
  passwordTool,
  colorTool,
  evaluateWcagContrast,
  cronTool,
  regexTool,
  curlConverterTool,
  dataConverterTool,
  chmodTool,
  httpRefTool,
  svgOptimizerTool,
  logoBuilderTool,
  patternGeneratorTool,
  randomSvgTool,
  qrTool,
} from '@nemokit/core';

export function createNemokitMcpServer(): McpServer {
  const server = new McpServer({
    name: 'nemokit',
    version: '0.1.0',
  });

  // 1. JSON Formatter & Minifier
  server.tool(
    'nemokit_format_json',
    'Validate, format, or minify JSON data with customizable indentation (1-8 spaces, or 0 for minified).',
    {
      raw: z.string().describe('The raw JSON string to format or minify.'),
      indent: z
        .number()
        .min(0)
        .max(8)
        .default(2)
        .describe('Indentation spaces (0 for minified on a single line, default 2).'),
    },
    async ({ raw, indent }) => {
      const res = await jsonFormatterTool.execute({
        raw,
        indent: indent === 0 ? 0 : indent,
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: res.data.formatted,
          },
        ],
      };
    }
  );

  // 2. JSON Schema Validator
  server.tool(
    'nemokit_validate_json_schema',
    'Validate a JSON data payload against a JSON Schema Draft-07 specification and return structured validation errors.',
    {
      schema: z.string().describe('The JSON Schema string (Draft-07).'),
      data: z.string().describe('The JSON data payload string to validate against the schema.'),
    },
    async ({ schema, data }) => {
      const res = await jsonSchemaTool.execute({
        action: 'validate',
        schema,
        data,
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data.validation, null, 2),
          },
        ],
      };
    }
  );

  // 3. JSON Schema Mock Generator
  server.tool(
    'nemokit_generate_mock_json',
    'Generate realistic synthetic mock fixture data from a JSON Schema.',
    {
      schema: z.string().describe('The JSON Schema string.'),
      arrayLength: z
        .number()
        .min(1)
        .max(20)
        .default(2)
        .describe('Number of items to generate for array schemas (default 2).'),
    },
    async ({ schema, arrayLength }) => {
      const res = await jsonSchemaTool.execute({
        action: 'mock',
        schema,
        mockOptions: { arrayLength, useDefaults: true },
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data.mockData, null, 2),
          },
        ],
      };
    }
  );

  // 4. JSON Schema Inferer
  server.tool(
    'nemokit_infer_json_schema',
    'Infer a valid JSON Schema Draft-07 structure from sample JSON data.',
    {
      data: z.string().describe('Sample JSON string to reverse-engineer into a schema.'),
    },
    async ({ data }) => {
      const res = await jsonSchemaTool.execute({
        action: 'infer',
        schema: {},
        data,
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data.inferredSchema, null, 2),
          },
        ],
      };
    }
  );

  // 5. SQL Formatter
  server.tool(
    'nemokit_format_sql',
    'Format messy or minified SQL queries with clean indentation and uppercase keywords.',
    {
      sql: z.string().describe('The raw SQL query string to format.'),
      uppercaseKeywords: z
        .boolean()
        .default(true)
        .describe('Whether to uppercase standard SQL keywords (SELECT, FROM, etc.).'),
      indent: z.number().min(2).max(8).default(2).describe('Indentation spaces (default 2).'),
    },
    async ({ sql, uppercaseKeywords, indent }) => {
      const res = await sqlFormatterTool.execute({
        raw: sql,
        uppercaseKeywords,
        indent,
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [{ type: 'text', text: res.data.formatted }],
      };
    }
  );

  // 6. Diff Tool
  server.tool(
    'nemokit_diff_texts',
    'Compare two text strings or code snippets to compute line additions, deletions, and similarity.',
    {
      original: z.string().describe('The baseline / original text or code.'),
      modified: z.string().describe('The revised / modified text or code.'),
      ignoreWhitespace: z
        .boolean()
        .default(false)
        .describe('Whether to ignore whitespace differences.'),
    },
    async ({ original, modified, ignoreWhitespace }) => {
      const res = await diffTool.execute({ original, modified, ignoreWhitespace });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                similarity: `${res.data.similarityPercentage}%`,
                additions: res.data.additions,
                deletions: res.data.deletions,
                lines: res.data.lines,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 7. Base64 Converter
  server.tool(
    'nemokit_base64',
    'Encode UTF-8 text to Base64 or decode Base64 back to text with URL-safe option.',
    {
      text: z.string().describe('The text to encode or Base64 string to decode.'),
      mode: z.enum(['encode', 'decode']).describe("Operation mode: 'encode' or 'decode'."),
      urlSafe: z
        .boolean()
        .default(false)
        .describe('Whether to use URL-safe base64 (- and _ instead of + and /).'),
    },
    async ({ text, mode, urlSafe }) => {
      const res = await base64Tool.execute({ text, mode, urlSafe });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [{ type: 'text', text: res.data.result }],
      };
    }
  );

  // 8. URL Parser & Query Inspector
  server.tool(
    'nemokit_parse_url',
    'Parse a URL string into its protocol, host, port, path, query parameters, and hash.',
    {
      url: z.string().describe('The URL string to parse.'),
    },
    async ({ url }) => {
      const res = await urlTool.execute({ url, action: 'parse' });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    }
  );

  // 9. Cryptographic Hash Generator
  server.tool(
    'nemokit_hash',
    'Compute a cryptographic hash (SHA-256, SHA-512, SHA-384, or SHA-1) for a text string.',
    {
      text: z.string().describe('The input text string to hash.'),
      algorithm: z
        .enum(['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1'])
        .default('SHA-256')
        .describe('Hash algorithm to use.'),
    },
    async ({ text, algorithm }) => {
      const res = await hashTool.execute({ text, algorithm });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    }
  );

  // 10. UUID Generator
  server.tool(
    'nemokit_generate_uuid',
    'Generate one or more RFC 4122 compliant version 4 UUIDs.',
    {
      count: z.number().min(1).max(100).default(1).describe('Number of UUIDs to generate.'),
      uppercase: z.boolean().default(false).describe('Whether to format UUIDs in uppercase.'),
      removeHyphens: z
        .boolean()
        .default(false)
        .describe('Whether to remove hyphens from the output.'),
    },
    async ({ count, uppercase, removeHyphens }) => {
      const res = await uuidTool.execute({ count, uppercase, removeHyphens });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [{ type: 'text', text: res.data.uuids.join('\n') }],
      };
    }
  );

  // 11. JWT Decoder
  server.tool(
    'nemokit_decode_jwt',
    'Inspect and decode a JSON Web Token (JWT) header and payload without verifying cryptographic signature.',
    {
      token: z.string().describe('The raw JWT token string (xxx.yyy.zzz).'),
    },
    async ({ token }) => {
      const res = await jwtTool.execute({ token });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                header: res.data.header,
                payload: res.data.payload,
                isExpired: res.data.isExpired,
                expiresAt: res.data.expiresAt,
                issuedAt: res.data.issuedAt,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 12. Timestamp Converter
  server.tool(
    'nemokit_convert_timestamp',
    'Convert between Unix epoch timestamps (seconds/milliseconds) and ISO-8601 UTC/local date strings.',
    {
      value: z
        .string()
        .describe('A Unix timestamp in seconds or ms, or an ISO date string (e.g. 1700000000).'),
    },
    async ({ value }) => {
      const res = await timestampTool.execute({ value });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    }
  );

  // 13. Password Generator
  server.tool(
    'nemokit_generate_password',
    'Generate a cryptographically secure random password with entropy score and strength rating.',
    {
      length: z.number().min(6).max(128).default(16).describe('Password length (default 16).'),
      includeUppercase: z.boolean().default(true),
      includeLowercase: z.boolean().default(true),
      includeNumbers: z.boolean().default(true),
      includeSymbols: z.boolean().default(true),
      excludeAmbiguous: z
        .boolean()
        .default(true)
        .describe("Exclude ambiguous characters like 'l', '1', 'O', '0'."),
    },
    async ({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeAmbiguous,
    }) => {
      const res = await passwordTool.execute({
        length,
        count: 1,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        excludeAmbiguous,
      });
      if (!res.success || !res.data.passwords[0]) {
        return {
          isError: true,
          content: [
            { type: 'text', text: res.success ? 'No password generated' : res.error.message },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data.passwords[0], null, 2),
          },
        ],
      };
    }
  );

  // 14. Color Converter & Harmonies
  server.tool(
    'nemokit_convert_color',
    'Convert a color across HEX, RGB, HSL, and HSV formats, calculate luminance, shades (50-900), and color harmonies.',
    {
      color: z
        .string()
        .describe(
          'The color string to convert (e.g. "#4f46e5", "rgb(79, 70, 229)", "hsl(243, 75%, 59%)").'
        ),
    },
    async ({ color }) => {
      const res = await colorTool.execute({ color });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    }
  );

  // 15. WCAG Contrast Checker
  server.tool(
    'nemokit_check_wcag_contrast',
    'Calculate the contrast ratio between foreground and background colors and check WCAG 2.1 AA and AAA compliance.',
    {
      foreground: z.string().describe('Foreground color (HEX or RGB, e.g. "#ffffff").'),
      background: z.string().describe('Background color (HEX or RGB, e.g. "#4f46e5").'),
    },
    async ({ foreground, background }) => {
      const result = evaluateWcagContrast(foreground, background);
      if (!result) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'Invalid color format provided.' }],
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // 16. Cron Explainer
  server.tool(
    'nemokit_explain_cron',
    'Explain a 5-part cron expression in plain English and calculate upcoming execution dates.',
    {
      expression: z.string().describe('A 5-part cron expression (e.g. "*/15 * * * *").'),
    },
    async ({ expression }) => {
      const res = await cronTool.execute({ expression });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                description: res.data.humanDescription,
                nextOccurrences: res.data.nextOccurrences,
                fields: res.data.fields,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 17. Regex Tester
  server.tool(
    'nemokit_test_regex',
    'Test a regular expression against text, visualize matches, and extract capture groups.',
    {
      pattern: z.string().describe('The regex pattern string without leading/trailing slashes.'),
      flags: z.string().default('g').describe('Regex flags (e.g. "g", "i", "m").'),
      text: z.string().describe('The test string to match against.'),
      replacement: z.string().optional().describe('Optional replacement string for substitution.'),
    },
    async ({ pattern, flags, text, replacement }) => {
      const res = await regexTool.execute({ pattern, flags, testString: text, replacement });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    }
  );

  // 18. cURL Converter
  server.tool(
    'nemokit_convert_curl',
    'Convert a raw cURL command into JavaScript Fetch, Axios, Python Requests, or Go net/http code.',
    {
      curlCommand: z.string().describe('The raw cURL command string.'),
    },
    async ({ curlCommand }) => {
      const res = await curlConverterTool.execute({ curlCommand });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data.snippets, null, 2),
          },
        ],
      };
    }
  );

  // 19. Data Converter (JSON / YAML / CSV)
  server.tool(
    'nemokit_convert_data',
    'Convert structured data bidirectionally between JSON, YAML, and CSV formats.',
    {
      content: z.string().describe('The data string to convert.'),
      fromFormat: z.enum(['json', 'yaml', 'csv']).describe('Source data format.'),
      toFormat: z.enum(['json', 'yaml', 'csv']).describe('Target data format.'),
    },
    async ({ content, fromFormat, toFormat }) => {
      const res = await dataConverterTool.execute({ content, fromFormat, toFormat });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [{ type: 'text', text: res.data.converted }],
      };
    }
  );

  // 20. Chmod Calculator
  server.tool(
    'nemokit_calculate_chmod',
    'Calculate UNIX file permissions between octal (e.g. "755") and symbolic ("rwxr-xr-x") representations.',
    {
      octal: z.string().optional().describe('Numeric octal permissions (e.g. "755", "644").'),
      symbolic: z
        .string()
        .optional()
        .describe('Symbolic permissions string (e.g. "-rwxr-xr-x", "rwxr-xr-x").'),
    },
    async ({ octal, symbolic }) => {
      const res = await chmodTool.execute({ octal, symbolic });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                octal: res.data.octal,
                symbolic: res.data.symbolic,
                commands: res.data.commands,
                user: res.data.user,
                group: res.data.group,
                others: res.data.others,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 21. HTTP Status & Headers Reference
  server.tool(
    'nemokit_http_reference',
    'Search and lookup HTTP response status codes (e.g. 404, 418) or standard HTTP headers with RFC details.',
    {
      query: z
        .string()
        .describe(
          'Search query for status codes or headers (e.g. "404", "cache-control", "cors").'
        ),
    },
    async ({ query }) => {
      const res = await httpRefTool.execute({ query });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                statusCodes: res.data.statusCodes,
                headers: res.data.headers,
                totalMatches: res.data.totalMatches,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 22. SVG Optimizer & Cleaner
  server.tool(
    'nemokit_optimize_svg',
    'Sanitize, minify vector bloat, round decimal precision, strip editor namespaces (Inkscape/Sketch), and generate React JSX.',
    {
      svg: z.string().describe('The raw SVG XML markup string.'),
      precision: z
        .number()
        .min(1)
        .max(4)
        .default(1)
        .describe('Decimal precision for path coordinates (default 1).'),
      removeComments: z.boolean().default(true),
      removeMetadata: z.boolean().default(true),
      removeEditorAttributes: z
        .boolean()
        .default(true)
        .describe('Strip Sketch/Inkscape editor attributes.'),
      collapseWhitespace: z.boolean().default(true),
    },
    async ({
      svg,
      precision,
      removeComments,
      removeMetadata,
      removeEditorAttributes,
      collapseWhitespace,
    }) => {
      const res = await svgOptimizerTool.execute({
        svg,
        precision,
        removeComments,
        removeMetadata,
        removeEditorAttributes,
        collapseWhitespace,
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                stats: res.data.stats,
                optimizedSvg: res.data.optimized,
                reactJsx: res.data.reactJsx,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 23. Logo & Brand Badge Generator
  server.tool(
    'nemokit_generate_logo_svg',
    'Generate clean vector SVG app icons and brand badges with 19 customizable shapes, gradients, icons, or monograms.',
    {
      shape: z
        .enum([
          'squircle',
          'circle',
          'square',
          'rounded-rect',
          'diamond',
          'hexagon',
          'hexagon-horizontal',
          'octagon',
          'triangle',
          'triangle-inverted',
          'pentagon',
          'shield',
          'shield-curved',
          'shield-pointed',
          'pill',
          'arch',
          'starburst',
          'clover',
          'cross',
        ])
        .default('squircle')
        .describe('Container frame geometry (19 shapes available).'),
      bgColor1: z.string().default('#4f46e5').describe('Primary background gradient color.'),
      bgColor2: z.string().default('#06b6d4').describe('Secondary background gradient color.'),
      gradientAngle: z.number().default(135).describe('Gradient angle in degrees (0-360).'),
      contentType: z
        .enum(['icon', 'monogram'])
        .default('icon')
        .describe("Emblem type: 'icon' or 'monogram'."),
      iconId: z
        .string()
        .default('zap')
        .describe(
          'Icon ID: zap, terminal, sparkles, shield, rocket, code, database, cpu, box, layers, infinity, flame, globe, heart, star, key, compass, feather, pulse.'
        ),
      monogramText: z.string().default('NK').describe('Monogram text if contentType is monogram.'),
      monogramFont: z.enum(['sans', 'serif', 'mono']).default('sans'),
      borderWidth: z.number().default(4).describe('Border width in pixels (0 for none).'),
      borderColor: z.string().default('#ffffff40'),
      shadow: z.boolean().default(true),
      symbolColor: z.string().default('#ffffff'),
      wordmark: z.string().optional().describe('Optional brand name or subtitle below emblem.'),
    },
    async config => {
      const res = await logoBuilderTool.execute({
        ...config,
        backgroundType: 'gradient',
        symbolScale: 0.5,
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [{ type: 'text', text: res.data.svg }],
      };
    }
  );

  // 24. Background & Pattern Generator
  server.tool(
    'nemokit_generate_pattern_svg',
    'Generate seamless repeating vector pattern textures and CSS background rules (dots, grid, lines, hexagons, waves, circuits, etc.).',
    {
      patternType: z
        .enum([
          'dots',
          'grid',
          'lines',
          'crosshatch',
          'hexagons',
          'waves',
          'chevrons',
          'circuits',
          'memphis',
          'triangles',
        ])
        .default('dots'),
      foreground: z.string().default('#6366f1').describe('Pattern element color.'),
      background: z.string().default('#ffffff').describe('Background color or "transparent".'),
      spacing: z.number().min(8).max(120).default(24).describe('Tile size/spacing in pixels.'),
      strokeWidth: z.number().min(0.5).max(10).default(2).describe('Stroke or particle thickness.'),
      opacity: z.number().min(0.05).max(1).default(0.8).describe('Pattern opacity (0.05-1.0).'),
    },
    async config => {
      const res = await patternGeneratorTool.execute(config);
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                cssRule: res.data.cssRule,
                cssDataUrl: res.data.cssDataUrl,
                svg: res.data.svg,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 25. Procedural Random SVG Generator
  server.tool(
    'nemokit_generate_random_svg',
    'Procedurally generate random organic blobs, layered waves, pixel identicons, low-poly constellations, or tech circuits.',
    {
      type: z
        .enum(['blob', 'waves', 'identicon', 'constellation', 'circuits'])
        .default('blob')
        .describe('Type of generative graphic.'),
      complexity: z.number().min(3).max(12).default(6).describe('Complexity / point count (3-12).'),
      color1: z.string().default('#06b6d4'),
      color2: z.string().default('#a855f7'),
      color3: z.string().default('#ec4899'),
      background: z.string().default('#09090b'),
      isTransparent: z.boolean().default(false),
      seed: z.number().optional().describe('Deterministic PRNG seed for reproducible graphics.'),
    },
    async config => {
      const res = await randomSvgTool.execute({
        ...config,
        seed: config.seed ?? Math.floor(Math.random() * 1000000),
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                svg: res.data.svg,
                reactJsx: res.data.reactJsx,
                cssDataUrl: res.data.cssDataUrl,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 26. QR Code Generator
  server.tool(
    'nemokit_generate_qr_code',
    'Generate customizable vector QR code SVG and Data URL for text, URLs, or Wi-Fi configurations.',
    {
      text: z.string().describe('The URL or text payload to encode into the QR code.'),
      errorCorrectionLevel: z
        .enum(['L', 'M', 'Q', 'H'])
        .default('M')
        .describe('Error correction level (L=7%, M=15%, Q=25%, H=30%).'),
      darkColor: z.string().default('#000000'),
      lightColor: z.string().default('#ffffff'),
    },
    async ({ text, errorCorrectionLevel, darkColor, lightColor }) => {
      const res = await qrTool.execute({
        text,
        errorCorrectionLevel,
        darkColor,
        lightColor,
      });
      if (!res.success) {
        return { isError: true, content: [{ type: 'text', text: res.error.message }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: res.data.svg,
          },
        ],
      };
    }
  );

  return server;
}
