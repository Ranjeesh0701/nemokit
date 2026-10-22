import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onSuccess } from '../types.js';

export interface MarkdownToolInput {
  readonly markdown: string;
}

export interface MarkdownToolOutput {
  readonly rawMarkdown: string;
  readonly html: string;
  readonly wordCount: number;
  readonly characterCount: number;
  readonly lineCount: number;
  readonly estimatedReadTimeMinutes: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  const htmlOut: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]!;
    const trimmed = rawLine.trim();

    // Code blocks ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        htmlOut.push(`<pre><code>${codeBuffer.map(escapeHtml).join('\n')}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inList) {
          htmlOut.push('</ul>');
          inList = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      if (inList) {
        htmlOut.push('</ul>');
        inList = false;
      }
      htmlOut.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) {
        htmlOut.push('</ul>');
        inList = false;
      }
      htmlOut.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) {
        htmlOut.push('</ul>');
        inList = false;
      }
      htmlOut.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }

    // Unordered lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        htmlOut.push('<ul>');
        inList = true;
      }
      htmlOut.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
      continue;
    }

    if (inList && trimmed === '') {
      htmlOut.push('</ul>');
      inList = false;
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      if (inList) {
        htmlOut.push('</ul>');
        inList = false;
      }
      htmlOut.push('<hr />');
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (inList) {
        htmlOut.push('</ul>');
        inList = false;
      }
      htmlOut.push(`<blockquote>${escapeHtml(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    // Regular paragraph
    if (trimmed.length > 0) {
      let p = escapeHtml(trimmed);
      // Bold
      p = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italics
      p = p.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Inline code
      p = p.replace(/`(.*?)`/g, '<code>$1</code>');
      htmlOut.push(`<p>${p}</p>`);
    }
  }

  if (inCodeBlock) {
    htmlOut.push(`<pre><code>${codeBuffer.map(escapeHtml).join('\n')}</code></pre>`);
  }
  if (inList) {
    htmlOut.push('</ul>');
  }

  return htmlOut.join('\n');
}

export const markdownTool: Tool<MarkdownToolInput, MarkdownToolOutput> = {
  id: 'markdown-preview',
  name: 'Markdown Live Editor & Stats',
  description:
    'Split-pane markdown editor with live HTML preview, reading time, word count, and HTML exporter.',
  category: 'formatters',

  execute(
    input: MarkdownToolInput,
    handlers?: Partial<ResultHandlers<MarkdownToolOutput, void>>
  ): ToolExecutionResult<MarkdownToolOutput> {
    const startTime = performance.now();
    const rawMarkdown = input?.markdown ?? '';

    const words = rawMarkdown.trim() ? rawMarkdown.trim().split(/\s+/).length : 0;
    const characters = rawMarkdown.length;
    const lines = rawMarkdown.split(/\r?\n/).length;
    const estimatedReadTimeMinutes = Math.max(1, Math.ceil(words / 200));

    const html = renderMarkdown(rawMarkdown);

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const output: MarkdownToolOutput = {
      rawMarkdown,
      html,
      wordCount: words,
      characterCount: characters,
      lineCount: lines,
      estimatedReadTimeMinutes,
    };

    const successRes = onSuccess(output, durationMs);
    handlers?.onSuccess?.(output);
    return successRes;
  },
};
