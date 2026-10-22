import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface JsonFormatterInput {
  readonly raw: string;
  readonly indent?: number | '\t';
}

export interface JsonFormatterOutput {
  readonly formatted: string;
  readonly linesCount: number;
  readonly byteSize: number;
}

/**
 * Built-in JSON Formatter tool.
 * Validates, repairs formatting, and measures line/byte size without UI dependencies.
 */
export const jsonFormatterTool: Tool<JsonFormatterInput, JsonFormatterOutput> = {
  id: 'json-formatter',
  name: 'JSON Formatter',
  description: 'Validates and formats JSON strings with customizable indentation.',
  category: 'formatters',

  execute(
    input: JsonFormatterInput,
    handlers?: Partial<ResultHandlers<JsonFormatterOutput, void>>
  ): ToolExecutionResult<JsonFormatterOutput> {
    const startTime = performance.now();

    if (!input || typeof input.raw !== 'string' || input.raw.trim() === '') {
      const res = onFailure('Input is empty. Please provide valid JSON.', 'EMPTY_INPUT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(input.raw);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON syntax.';
      const res = onFailure(message, 'INVALID_JSON');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const indent = input.indent ?? 2;
    const formatted = JSON.stringify(parsed, null, indent);
    const linesCount = formatted.split('\n').length;
    const byteSize = new TextEncoder().encode(formatted).length;
    const durationMs = performance.now() - startTime;

    const res = onSuccess(
      {
        formatted,
        linesCount,
        byteSize,
      },
      durationMs
    );
    handlers?.onSuccess?.(res.data, durationMs);
    return res;
  },
};
