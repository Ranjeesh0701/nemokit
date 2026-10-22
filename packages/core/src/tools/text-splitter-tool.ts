import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface TextChunk {
  readonly index: number;
  readonly content: string;
  readonly wordCount: number;
  readonly charCount: number;
}

export interface TextSplitInput {
  readonly text: string;
  readonly splitBy: 'words' | 'characters' | 'lines' | 'delimiter';
  readonly chunkSize?: number;
  readonly delimiter?: string;
}

export interface TextSplitOutput {
  readonly chunks: ReadonlyArray<TextChunk>;
  readonly totalChunks: number;
  readonly originalWordCount: number;
  readonly originalCharCount: number;
}

function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export const textSplitTool: Tool<TextSplitInput, TextSplitOutput> = {
  id: 'text-splitter',
  name: 'Text & Word Splitter',
  description:
    'Splits long text and documents by word count, character size, lines, or custom delimiters for LLMs and data processing.',
  category: 'formatters',

  execute(
    input: TextSplitInput,
    handlers?: Partial<ResultHandlers<TextSplitOutput, void>>
  ): ToolExecutionResult<TextSplitOutput> {
    const startTime = performance.now();

    if (!input || typeof input.text !== 'string' || input.text.trim() === '') {
      const res = onFailure('Input text cannot be empty.', 'EMPTY_INPUT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const raw = input.text.trim();
    const originalWordCount = countWords(raw);
    const originalCharCount = raw.length;
    const splitBy = input.splitBy ?? 'words';
    const chunkSize = Math.max(input.chunkSize ?? (splitBy === 'characters' ? 500 : 100), 1);
    const rawChunks: string[] = [];

    if (splitBy === 'words') {
      const words = raw.split(/\s+/).filter(Boolean);
      for (let i = 0; i < words.length; i += chunkSize) {
        rawChunks.push(words.slice(i, i + chunkSize).join(' '));
      }
    } else if (splitBy === 'characters') {
      for (let i = 0; i < raw.length; i += chunkSize) {
        rawChunks.push(raw.slice(i, i + chunkSize));
      }
    } else if (splitBy === 'lines') {
      const lines = raw.split('\n');
      for (let i = 0; i < lines.length; i += chunkSize) {
        rawChunks.push(lines.slice(i, i + chunkSize).join('\n'));
      }
    } else if (splitBy === 'delimiter') {
      const delimiter = input.delimiter || '\n\n';
      const parts = raw.split(delimiter);
      for (const p of parts) {
        if (p.trim()) rawChunks.push(p.trim());
      }
    }

    const chunks: TextChunk[] = rawChunks.map((content, idx) => ({
      index: idx + 1,
      content,
      wordCount: countWords(content),
      charCount: content.length,
    }));

    const durationMs = performance.now() - startTime;
    const res = onSuccess(
      {
        chunks,
        totalChunks: chunks.length,
        originalWordCount,
        originalCharCount,
      },
      durationMs
    );
    handlers?.onSuccess?.(res.data, durationMs);
    return res;
  },
};
