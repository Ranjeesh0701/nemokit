import type { Tool, ToolExecutionResult } from '../types.js';
import { failureResult, successResult } from '../types.js';

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

  execute(input: JsonFormatterInput): ToolExecutionResult<JsonFormatterOutput> {
    if (!input || typeof input.raw !== 'string' || input.raw.trim() === '') {
      return failureResult('Input is empty. Please provide valid JSON.', 'EMPTY_INPUT');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(input.raw);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON syntax.';
      return failureResult(message, 'INVALID_JSON');
    }

    const indent = input.indent ?? 2;
    const formatted = JSON.stringify(parsed, null, indent);
    const linesCount = formatted.split('\n').length;
    const byteSize = new TextEncoder().encode(formatted).length;

    return successResult({
      formatted,
      linesCount,
      byteSize,
    });
  },
};
