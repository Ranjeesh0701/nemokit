import { useEffect, useState } from 'react';
import { uuidTool } from '@nemokit/core';
import type { UuidToolOutput } from '@nemokit/core';
import { Fingerprint, Copy, Check, RefreshCw } from 'lucide-react';

export function UuidToolView() {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [removeHyphens, setRemoveHyphens] = useState<boolean>(false);
  const [output, setOutput] = useState<UuidToolOutput | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | 'all' | null>(null);

  const generateUuids = async (qty: number, isUpper: boolean, noHyphens: boolean) => {
    const result = await uuidTool.execute({
      count: qty,
      uppercase: isUpper,
      removeHyphens: noHyphens,
    });

    if (result.success) {
      setOutput(result.data);
      setDuration(result.durationMs ?? null);
    }
  };

  useEffect(() => {
    void generateUuids(5, false, false);
  }, []);

  const handleCopyAll = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output.uuids.join('\n'));
      setCopiedIndex('all');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyOne = async (id: string, index: number) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
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
              <Fingerprint className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              UUID / GUID Generator
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Generate RFC 4122 compliant version 4 UUIDs locally in bulk with instant format options.
          </p>
        </div>

        <button
          type="button"
          onClick={() => generateUuids(count, uppercase, removeHyphens)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </button>
      </div>

      {/* Configuration Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-700">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-500">Quantity:</span>
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
              {[1, 5, 10, 25].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setCount(q);
                    generateUuids(q, uppercase, removeHyphens);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    count === q
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={e => {
                const val = e.target.checked;
                setUppercase(val);
                generateUuids(count, val, removeHyphens);
              }}
              className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span>Uppercase</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeHyphens}
              onChange={e => {
                const val = e.target.checked;
                setRemoveHyphens(val);
                generateUuids(count, uppercase, val);
              }}
              className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span>Remove hyphens</span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
        >
          {copiedIndex === 'all' ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Copied All!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-stone-400" />
              Copy All ({output?.count ?? 0})
            </>
          )}
        </button>
      </div>

      {/* Output List */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-[#fbfbf9]">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Generated Identifiers
          </span>
          {duration !== null && (
            <span className="text-xs font-mono text-emerald-700">{duration.toFixed(2)} ms</span>
          )}
        </div>

        <div className="divide-y divide-stone-100">
          {output?.uuids.map((uuid, idx) => (
            <div
              key={uuid}
              className="flex items-center justify-between px-4 py-3 hover:bg-stone-50/70 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-stone-300 w-5 text-right">{idx + 1}</span>
                <span className="font-mono text-xs text-stone-800 select-all font-medium">
                  {uuid}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyOne(uuid, idx)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600 hover:bg-stone-50 transition-all"
              >
                {copiedIndex === idx ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3 text-stone-400" />
                )}
                <span>Copy</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
