import { useState, useEffect } from 'react';
import { cronTool } from '@nemokit/core';
import type { CronToolOutput } from '@nemokit/core';
import { CalendarClock, Copy, Check, Clock, Calendar, Sparkles, AlertCircle } from 'lucide-react';

const CRON_PRESETS = [
  { label: 'Every 5 Mins', expr: '*/5 * * * *' },
  { label: 'Every 15 Mins', expr: '*/15 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily at Midnight', expr: '0 0 * * *' },
  { label: 'Weekdays at 9 AM', expr: '0 9 * * 1-5' },
  { label: 'Sundays at Noon', expr: '0 12 * * 0' },
  { label: 'Monthly (1st)', expr: '0 0 1 * *' },
];

export function CronToolView() {
  const [expression, setExpression] = useState<string>('*/15 9-17 * * 1-5');
  const [copied, setCopied] = useState<boolean>(false);
  const [result, setResult] = useState<{ data: CronToolOutput | null; error: string | null }>({
    data: null,
    error: null,
  });

  useEffect(() => {
    cronTool.execute(
      { expression },
      {
        onSuccess: data => setResult({ data, error: null }),
        onFailure: err => setResult({ data: null, error: err.message }),
      }
    );
  }, [expression]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <CalendarClock className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Cron Expression Parser & Humanizer
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Parse 5-part cron syntax into plain English explanations, inspect field intervals, and
            preview upcoming run times.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CRON_PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setExpression(p.expr)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cron Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-stone-500 block mb-1">
            5-Field Cron Expression
          </label>
          <input
            type="text"
            value={expression}
            onChange={e => setExpression(e.target.value)}
            placeholder="e.g. */15 * * * *"
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 font-mono text-base font-semibold text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
          />
        </div>

        <button
          type="button"
          onClick={() => handleCopy(expression)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 self-end sm:self-auto transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-stone-500" />
              Copy Syntax
            </>
          )}
        </button>
      </div>

      {/* Validation Error Banner */}
      {result.error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{result.error}</span>
        </div>
      )}

      {result.data && (
        <>
          {/* Plain English Translation Hero */}
          <div className="flex items-start gap-4 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Natural Language Schedule
              </span>
              <p className="mt-1 text-lg sm:text-xl font-medium tracking-tight text-stone-900 leading-snug">
                {result.data.humanDescription}
              </p>
            </div>
          </div>

          {/* 5-Field Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(result.data.fields).map(([key, field]) => (
              <div
                key={key}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-3.5 shadow-xs"
              >
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    {field.name}
                  </span>
                  <div className="mt-1 font-mono text-xl font-bold text-stone-900">{field.raw}</div>
                </div>
                <div className="mt-3 text-xs text-stone-600 pt-2 border-t border-stone-100 font-medium">
                  {field.description}
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Schedule Occurrences */}
          <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Next 5 Scheduled Executions
              </span>
              <span className="font-normal normal-case text-stone-400">
                Calculated from local browser time
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {result.data.nextOccurrences.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  No upcoming occurrences found within search window.
                </div>
              ) : (
                result.data.nextOccurrences.map((occurrence, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 text-xs font-medium text-stone-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 text-stone-500 font-mono text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-sm text-stone-900">{occurrence}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      Run #{idx + 1}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
