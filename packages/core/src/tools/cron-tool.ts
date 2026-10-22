import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface CronToolInput {
  readonly expression: string;
}

export interface CronFieldDetail {
  readonly name: string;
  readonly raw: string;
  readonly description: string;
}

export interface CronToolOutput {
  readonly expression: string;
  readonly humanDescription: string;
  readonly fields: {
    readonly minute: CronFieldDetail;
    readonly hour: CronFieldDetail;
    readonly dayOfMonth: CronFieldDetail;
    readonly month: CronFieldDetail;
    readonly dayOfWeek: CronFieldDetail;
  };
  readonly nextOccurrences: ReadonlyArray<string>;
}

function describeField(field: string, unit: string): string {
  if (field === '*') return `every ${unit}`;
  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2), 10);
    return `every ${step} ${unit}s`;
  }
  if (field.includes('-')) {
    const [start, end] = field.split('-');
    return `${unit}s ${start} through ${end}`;
  }
  if (field.includes(',')) {
    return `${unit}s ${field}`;
  }
  return `at ${unit} ${field}`;
}

function parseCronPart(part: string, min: number, max: number): number[] {
  const values = new Set<number>();

  const subparts = part.split(',');
  for (const sub of subparts) {
    if (sub === '*') {
      for (let i = min; i <= max; i++) values.add(i);
    } else if (sub.startsWith('*/')) {
      const step = parseInt(sub.slice(2), 10);
      if (isNaN(step) || step <= 0) continue;
      for (let i = min; i <= max; i += step) values.add(i);
    } else if (sub.includes('-')) {
      const [startStr, endStr] = sub.split('-');
      const start = parseInt(startStr ?? '', 10);
      const end = parseInt(endStr ?? '', 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(min, start); i <= Math.min(max, end); i++) {
          values.add(i);
        }
      }
    } else {
      const val = parseInt(sub, 10);
      if (!isNaN(val) && val >= min && val <= max) {
        values.add(val);
      }
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

function calculateNextOccurrences(
  minutePart: string,
  hourPart: string,
  domPart: string,
  monthPart: string,
  dowPart: string,
  count = 5
): string[] {
  const minutes = parseCronPart(minutePart, 0, 59);
  const hours = parseCronPart(hourPart, 0, 23);
  const doms = parseCronPart(domPart, 1, 31);
  const months = parseCronPart(monthPart, 1, 12);
  const dows = parseCronPart(dowPart, 0, 6);

  if (
    minutes.length === 0 ||
    hours.length === 0 ||
    doms.length === 0 ||
    months.length === 0 ||
    dows.length === 0
  ) {
    return [];
  }

  const occurrences: string[] = [];
  const current = new Date();
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  // Safety break after 5 years or 100,000 steps
  const maxSearchSteps = 100000;
  let steps = 0;

  while (occurrences.length < count && steps < maxSearchSteps) {
    steps++;
    const m = current.getMonth() + 1;
    if (!months.includes(m)) {
      current.setMonth(current.getMonth() + 1, 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const d = current.getDate();
    const dow = current.getDay();
    const matchesDom = domPart === '*' || doms.includes(d);
    const matchesDow = dowPart === '*' || dows.includes(dow);

    if (domPart !== '*' && dowPart !== '*') {
      // If both are specified, either matching is standard cron behaviour
      if (!matchesDom && !matchesDow) {
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
        continue;
      }
    } else if (!matchesDom || !matchesDow) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const h = current.getHours();
    if (!hours.includes(h)) {
      current.setHours(current.getHours() + 1, 0, 0, 0);
      continue;
    }

    const min = current.getMinutes();
    if (!minutes.includes(min)) {
      current.setMinutes(current.getMinutes() + 1);
      continue;
    }

    occurrences.push(
      current.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );

    current.setMinutes(current.getMinutes() + 1);
  }

  return occurrences;
}

function generateHumanSummary(
  min: string,
  hr: string,
  dom: string,
  mon: string,
  dow: string
): string {
  if (min === '*' && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
    return 'Every minute, every day';
  }
  if (min === '0' && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
    return 'At minute 0 of every hour';
  }
  if (min === '0' && hr === '0' && dom === '*' && mon === '*' && dow === '*') {
    return 'At 00:00 (midnight) every day';
  }
  if (min === '0' && hr === '12' && dom === '*' && mon === '*' && dow === '*') {
    return 'At 12:00 PM (noon) every day';
  }
  if (min === '0' && hr === '9' && dom === '*' && mon === '*' && dow === '1-5') {
    return 'At 09:00 AM, Monday through Friday';
  }
  if (min.startsWith('*/') && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `Every ${min.slice(2)} minutes`;
  }

  const parts: string[] = [];

  if (min.startsWith('*/')) {
    parts.push(`Every ${min.slice(2)} minutes`);
  } else if (min === '0') {
    parts.push('At the start of the hour');
  } else if (min === '*') {
    parts.push('Every minute');
  } else {
    parts.push(`At minute ${min}`);
  }

  if (hr.startsWith('*/')) {
    parts.push(`every ${hr.slice(2)} hours`);
  } else if (hr.includes('-')) {
    parts.push(`between hours ${hr}`);
  } else if (hr !== '*') {
    parts.push(`at hour ${hr}:00`);
  }

  if (dom !== '*') {
    parts.push(`on day ${dom} of the month`);
  }

  if (mon !== '*') {
    parts.push(`in month ${mon}`);
  }

  if (dow === '1-5') {
    parts.push('on weekdays (Mon-Fri)');
  } else if (dow === '0,6' || dow === '6,0') {
    parts.push('on weekends (Sat-Sun)');
  } else if (dow !== '*') {
    parts.push(`on day-of-week ${dow}`);
  }

  return parts.join(', ');
}

export const cronTool: Tool<CronToolInput, CronToolOutput> = {
  id: 'cron-tool',
  name: 'Cron Expression Parser & Humanizer',
  description:
    'Translates 5-part cron schedules into plain English descriptions, breaks down fields, and calculates upcoming run times.',
  category: 'web',

  execute(
    input: CronToolInput,
    handlers?: Partial<ResultHandlers<CronToolOutput, void>>
  ): ToolExecutionResult<CronToolOutput> {
    const startTime = performance.now();
    const raw = (input?.expression ?? '*/15 * * * *').trim().replace(/\s+/g, ' ');
    const parts = raw.split(' ');

    if (parts.length !== 5) {
      const res = onFailure(
        `Standard cron requires exactly 5 fields (minute hour dayOfMonth month dayOfWeek). Received ${parts.length} parts.`,
        'INVALID_CRON_FIELDS'
      );
      handlers?.onFailure?.(res.error);
      return res;
    }

    const [minStr, hrStr, domStr, monStr, dowStr] = parts as [
      string,
      string,
      string,
      string,
      string,
    ];

    const humanDescription = generateHumanSummary(minStr, hrStr, domStr, monStr, dowStr);
    const nextOccurrences = calculateNextOccurrences(minStr, hrStr, domStr, monStr, dowStr, 5);

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const output: CronToolOutput = {
      expression: raw,
      humanDescription,
      fields: {
        minute: {
          name: 'Minute (0 - 59)',
          raw: minStr,
          description: describeField(minStr, 'minute'),
        },
        hour: {
          name: 'Hour (0 - 23)',
          raw: hrStr,
          description: describeField(hrStr, 'hour'),
        },
        dayOfMonth: {
          name: 'Day of Month (1 - 31)',
          raw: domStr,
          description: describeField(domStr, 'day'),
        },
        month: {
          name: 'Month (1 - 12)',
          raw: monStr,
          description: describeField(monStr, 'month'),
        },
        dayOfWeek: {
          name: 'Day of Week (0 - 6, Sun-Sat)',
          raw: dowStr,
          description: describeField(dowStr, 'weekday'),
        },
      },
      nextOccurrences,
    };

    const successRes = onSuccess(output, durationMs);
    handlers?.onSuccess?.(output);
    return successRes;
  },
};
