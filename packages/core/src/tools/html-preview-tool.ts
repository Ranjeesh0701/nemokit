import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface HtmlPreviewInput {
  readonly code: string;
  readonly type?: 'html' | 'svg';
}

export interface HtmlPreviewOutput {
  readonly type: 'html' | 'svg';
  readonly raw: string;
  readonly minified: string;
  readonly beautified: string;
  readonly stats: {
    readonly originalBytes: number;
    readonly minifiedBytes: number;
    readonly reductionPercent: number;
  };
}

function minifyMarkup(raw: string): string {
  return raw
    // Remove HTML/SVG comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Collapse multiple whitespace inside tags/attributes
    .replace(/\s{2,}/g, ' ')
    // Trim edges
    .trim();
}

function beautifyMarkup(raw: string, indentSize = 2): string {
  const indent = ' '.repeat(indentSize);
  let depth = 0;
  const tokens: string[] = [];

  // Match tags, comments, text content
  const regex = /(<\/?[a-zA-Z0-9:-]+(?:\s+[^>]*?)?\/?>|<!--[\s\S]*?-->|[^<]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    const token = match[0].trim();
    if (!token) continue;

    // Comment
    if (token.startsWith('<!--')) {
      tokens.push(indent.repeat(depth) + token);
      continue;
    }

    // Closing tag: </tag>
    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      tokens.push(indent.repeat(depth) + token);
      continue;
    }

    // Self-closing tag or void tags: <img />, <br>, <hr>, <meta>, <link>, etc.
    const isSelfClosing =
      token.endsWith('/>') ||
      /^<(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(?:\s+[^>]*?)?>$/i.test(token);

    if (isSelfClosing) {
      tokens.push(indent.repeat(depth) + token);
      continue;
    }

    // Opening tag: <tag ...>
    if (token.startsWith('<')) {
      tokens.push(indent.repeat(depth) + token);
      depth++;
      continue;
    }

    // Pure text content
    tokens.push(indent.repeat(depth) + token);
  }

  return tokens.join('\n');
}

export const htmlPreviewTool: Tool<HtmlPreviewInput, HtmlPreviewOutput> = {
  id: 'html-preview',
  name: 'HTML & SVG Previewer',
  description: 'Live sandboxed preview, minification, and clean formatting for HTML templates and SVG vector graphics.',
  category: 'formatters',

  execute(
    input: HtmlPreviewInput,
    handlers?: Partial<ResultHandlers<HtmlPreviewOutput, void>>
  ): ToolExecutionResult<HtmlPreviewOutput> {
    const startTime = performance.now();
    try {
      const code = input.code || '';
      const detectedType: 'html' | 'svg' =
        input.type ??
        (/<svg[\s>]/i.test(code) && !/<html[\s>]/i.test(code) && !/<body[\s>]/i.test(code)
          ? 'svg'
          : 'html');

      const minified = minifyMarkup(code);
      const beautified = beautifyMarkup(code);

      const originalBytes = new TextEncoder().encode(code).length;
      const minifiedBytes = new TextEncoder().encode(minified).length;
      const reductionPercent =
        originalBytes > 0
          ? Math.max(0, Math.round(((originalBytes - minifiedBytes) / originalBytes) * 100))
          : 0;

      const result: HtmlPreviewOutput = {
        type: detectedType,
        raw: code,
        minified,
        beautified,
        stats: {
          originalBytes,
          minifiedBytes,
          reductionPercent,
        },
      };

      const durationMs = performance.now() - startTime;
      const res = onSuccess(result, durationMs);
      handlers?.onSuccess?.(result, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process HTML/SVG code';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
