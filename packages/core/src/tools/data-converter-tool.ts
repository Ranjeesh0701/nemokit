import YAML from 'yaml';
import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export type DataFormat = 'json' | 'yaml' | 'csv';

export interface DataConverterInput {
  readonly content: string;
  readonly fromFormat: DataFormat;
  readonly toFormat: DataFormat;
}

export interface DataConverterOutput {
  readonly converted: string;
  readonly fromFormat: DataFormat;
  readonly toFormat: DataFormat;
  readonly stats: {
    readonly inputLength: number;
    readonly outputLength: number;
    readonly itemCount?: number;
  };
}

function parseCsv(csv: string): unknown[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const headers = lines[0]!.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i]!;
    // Match comma separated values respecting quotes
    const values: string[] = [];
    let cur = '';
    let inQuote = false;

    for (let c = 0; c < rawLine.length; c++) {
      const ch = rawLine[c];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        values.push(cur.trim().replace(/^["']|["']$/g, ''));
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur.trim().replace(/^["']|["']$/g, ''));

    const rowObj: Record<string, string> = {};
    for (let h = 0; h < headers.length; h++) {
      const key = headers[h] || `col_${h + 1}`;
      rowObj[key] = values[h] ?? '';
    }
    rows.push(rowObj);
  }

  return rows;
}

function toCsv(data: unknown): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return '';

  const sample = items[0];
  if (typeof sample !== 'object' || sample === null) {
    return items.map(String).join('\n');
  }

  const keys = Object.keys(sample as Record<string, unknown>);
  const header = keys.map(k => `"${k}"`).join(',');
  const lines = [header];

  for (const item of items) {
    if (typeof item === 'object' && item !== null) {
      const row = keys
        .map(k => {
          const val = (item as Record<string, unknown>)[k];
          const str = val === undefined || val === null ? '' : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',');
      lines.push(row);
    }
  }

  return lines.join('\n');
}

export const dataConverterTool: Tool<DataConverterInput, DataConverterOutput> = {
  id: 'data-converter',
  name: 'JSON ⇄ YAML ⇄ CSV Converter',
  description:
    'Translates structured data bidirectionally between JSON, YAML, and CSV formats client-side.',
  category: 'converters',

  execute(
    input: DataConverterInput,
    handlers?: Partial<ResultHandlers<DataConverterOutput, void>>
  ): ToolExecutionResult<DataConverterOutput> {
    const startTime = performance.now();
    const raw = (input?.content ?? '').trim();
    const from = input?.fromFormat ?? 'json';
    const to = input?.toFormat ?? 'yaml';

    if (!raw) {
      const res = onFailure('Input data content cannot be empty.', 'EMPTY_CONTENT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    if (from === to) {
      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      const sameRes: DataConverterOutput = {
        converted: raw,
        fromFormat: from,
        toFormat: to,
        stats: {
          inputLength: raw.length,
          outputLength: raw.length,
        },
      };
      const success = onSuccess(sameRes, durationMs);
      handlers?.onSuccess?.(sameRes);
      return success;
    }

    let parsedObj: unknown;

    // Step 1: Parse from input format
    try {
      if (from === 'json') {
        parsedObj = JSON.parse(raw);
      } else if (from === 'yaml') {
        parsedObj = YAML.parse(raw);
      } else if (from === 'csv') {
        parsedObj = parseCsv(raw);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : `Failed to parse input as ${from.toUpperCase()}`;
      const res = onFailure(`Invalid ${from.toUpperCase()} syntax: ${msg}`, 'PARSE_ERROR');
      handlers?.onFailure?.(res.error);
      return res;
    }

    // Step 2: Format to target format
    let converted = '';
    try {
      if (to === 'json') {
        converted = JSON.stringify(parsedObj, null, 2);
      } else if (to === 'yaml') {
        converted = YAML.stringify(parsedObj);
      } else if (to === 'csv') {
        converted = toCsv(parsedObj);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to serialize to ${to.toUpperCase()}`;
      const res = onFailure(`Serialization error: ${msg}`, 'SERIALIZE_ERROR');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const itemCount = Array.isArray(parsedObj)
      ? parsedObj.length
      : typeof parsedObj === 'object' && parsedObj !== null
        ? Object.keys(parsedObj).length
        : 1;

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const output: DataConverterOutput = {
      converted,
      fromFormat: from,
      toFormat: to,
      stats: {
        inputLength: raw.length,
        outputLength: converted.length,
        itemCount,
      },
    };

    const successRes = onSuccess(output, durationMs);
    handlers?.onSuccess?.(output);
    return successRes;
  },
};
