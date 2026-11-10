import { useEffect, useState } from 'react';
import { timestampTool } from '@nemokit/core';
import type { TimestampToolOutput } from '@nemokit/core';
import { Clock, Copy, Check, AlertCircle, Play, Pause } from 'lucide-react';

export function TimestampView() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [isLive, setIsLive] = useState<boolean>(true);
  const [inputValue, setInputValue] = useState<string>(() => String(Math.floor(Date.now() / 1000)));
  const [output, setOutput] = useState<TimestampToolOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live ticker
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const convertValue = async (val: string) => {
    const result = await timestampTool.execute({ value: val });
    if (result.success) {
      setOutput(result.data);
      setErrorMessage(null);
    } else {
      setErrorMessage(result.error.message);
      setOutput(null);
    }
  };

  useEffect(() => {
    void convertValue(String(Math.floor(Date.now() / 1000)));
  }, []);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleSetNow = () => {
    const nowSec = String(Math.floor(Date.now() / 1000));
    setInputValue(nowSec);
    convertValue(nowSec);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Clock className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Unix Timestamp Converter
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Convert between Unix epoch timestamps (seconds/milliseconds) and human-readable
            UTC/local dates.
          </p>
        </div>

        {/* Live Ticker Card */}
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3.5 py-2 shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-stone-400">
              Current Epoch
            </span>
            <span className="font-mono text-xs font-bold text-stone-900">{currentEpoch}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsLive(prev => !prev)}
            title={isLive ? 'Pause ticker' : 'Resume live ticker'}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
          >
            {isLive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Timestamp or Date String
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetNow}
              className="rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Set to Now
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => {
              const val = e.target.value;
              setInputValue(val);
              if (val.trim()) {
                convertValue(val);
              } else {
                setOutput(null);
                setErrorMessage(null);
              }
            }}
            placeholder="e.g. 1700000000 or 2026-10-22T14:30:00Z"
            className="flex-1 rounded-xl border border-stone-200/80 bg-[#fdfdfc] px-3.5 py-2.5 font-mono text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
          />
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Parse Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Output Representation Cards */}
      {output && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'ISO 8601 (UTC)', value: output.isoUtc, key: 'iso' },
            { label: 'Local Timezone', value: output.localFormatted, key: 'local' },
            { label: 'Relative Time', value: output.relative, key: 'rel' },
            { label: 'Unix Timestamp (Seconds)', value: String(output.unixSeconds), key: 'sec' },
            {
              label: 'Unix Timestamp (Milliseconds)',
              value: String(output.unixMilliseconds),
              key: 'ms',
            },
          ].map(item => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs"
            >
              <div className="flex flex-col truncate pr-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  {item.label}
                </span>
                <span className="mt-1 font-mono text-xs font-semibold text-stone-900 truncate">
                  {item.value}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(item.value, item.key)}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-50 transition-colors shrink-0"
              >
                {copiedKey === item.key ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3 text-stone-400" />
                )}
                <span>Copy</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
