import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface TimestampToolInput {
  readonly value: string | number;
}

export interface TimestampToolOutput {
  readonly unixSeconds: number;
  readonly unixMilliseconds: number;
  readonly isoUtc: string;
  readonly localFormatted: string;
  readonly relative: string;
}

function getRelativeTime(timestampMs: number): string {
  const diffSec = Math.round((timestampMs - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, 'second');
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month');
  return rtf.format(Math.round(diffDay / 365), 'year');
}

export const timestampTool: Tool<TimestampToolInput, TimestampToolOutput> = {
  id: 'timestamp-tool',
  name: 'Unix Timestamp Converter',
  description:
    'Converts between Unix epoch timestamps (seconds/ms) and human-readable UTC/local date strings with relative time.',
  category: 'converters',

  execute(
    input: TimestampToolInput,
    handlers?: Partial<ResultHandlers<TimestampToolOutput, void>>
  ): ToolExecutionResult<TimestampToolOutput> {
    const startTime = performance.now();

    if (!input || input.value === undefined || String(input.value).trim() === '') {
      const res = onFailure('Please provide a timestamp or date string.', 'EMPTY_INPUT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const raw = String(input.value).trim();
    let date: Date;

    if (/^-?\d+(\.\d+)?$/.test(raw)) {
      const num = Number(raw);
      if (Math.abs(num) < 1e11) {
        date = new Date(num * 1000);
      } else {
        date = new Date(num);
      }
    } else {
      date = new Date(raw);
    }

    if (isNaN(date.getTime())) {
      const res = onFailure(
        `Unable to parse "${raw}" as a timestamp or valid ISO date.`,
        'INVALID_TIMESTAMP'
      );
      handlers?.onFailure?.(res.error);
      return res;
    }

    const ms = date.getTime();
    const seconds = Math.floor(ms / 1000);
    const isoUtc = date.toISOString();
    const localFormatted = date.toLocaleString();
    const relative = getRelativeTime(ms);
    const durationMs = performance.now() - startTime;

    const res = onSuccess(
      {
        unixSeconds: seconds,
        unixMilliseconds: ms,
        isoUtc,
        localFormatted,
        relative,
      },
      durationMs
    );
    handlers?.onSuccess?.(res.data, durationMs);
    return res;
  },
};
