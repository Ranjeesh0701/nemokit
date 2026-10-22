import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface DocumentConverterInput {
  readonly title: string;
  readonly content: string;
  readonly target: 'pdf' | 'word';
}

export interface DocumentConverterOutput {
  readonly htmlDocument: string;
  readonly filename: string;
  readonly wordCount: number;
  readonly characterCount: number;
  readonly target: 'pdf' | 'word';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Converts simple markdown formatting (headings, lists, bold, italics, code) to clean HTML.
 */
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      result.push('</ul>');
      inList = false;
    }

    if (trimmed === '') {
      continue;
    }

    // Paragraph with inline bold / code
    let formatted = escapeHtml(trimmed)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    result.push(`<p>${formatted}</p>`);
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

function buildWordHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    padding: 40px;
  }
  h1 { font-size: 22pt; color: #111; margin-bottom: 8pt; border-bottom: 1.5pt solid #eee; padding-bottom: 6pt; }
  h2 { font-size: 16pt; color: #222; margin-top: 18pt; margin-bottom: 6pt; }
  h3 { font-size: 13pt; color: #333; margin-top: 14pt; margin-bottom: 4pt; }
  p { margin-bottom: 10pt; }
  ul { margin-bottom: 10pt; padding-left: 20pt; }
  li { margin-bottom: 4pt; }
  code { font-family: 'Consolas', 'Courier New', monospace; background: #f4f4f4; padding: 2px 4px; font-size: 9.5pt; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export const documentConverterTool: Tool<DocumentConverterInput, DocumentConverterOutput> = {
  id: 'document-converter',
  name: 'Document & PDF Converter',
  description:
    'Converts text, markdown, and formatted content to printable PDF documents and Microsoft Word (.doc) files.',
  category: 'pdf',

  execute(
    input: DocumentConverterInput,
    handlers?: Partial<ResultHandlers<DocumentConverterOutput, void>>
  ): ToolExecutionResult<DocumentConverterOutput> {
    const startTime = performance.now();

    if (!input || typeof input.content !== 'string' || input.content.trim() === '') {
      const res = onFailure('Document content cannot be empty.', 'EMPTY_CONTENT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const title = input.title.trim() || 'Untitled Document';
    const bodyHtml = markdownToHtml(input.content);
    const htmlDocument = buildWordHtml(title, bodyHtml);

    const words = input.content.trim().split(/\s+/).filter(Boolean).length;
    const characterCount = input.content.length;

    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const filename = `${sanitizedTitle}.${input.target === 'word' ? 'doc' : 'pdf'}`;
    const durationMs = performance.now() - startTime;

    const res = onSuccess(
      {
        htmlDocument,
        filename,
        wordCount: words,
        characterCount,
        target: input.target,
      },
      durationMs
    );
    handlers?.onSuccess?.(res.data, durationMs);
    return res;
  },
};
