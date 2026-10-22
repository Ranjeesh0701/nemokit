import { useEffect, useState } from 'react';
import { urlTool } from '@nemokit/core';
import type { UrlToolOutput } from '@nemokit/core';
import { Globe, Copy, Check, Trash2, AlertCircle } from 'lucide-react';

const SAMPLE_URL =
  'https://nemokit.dev/tools/json-formatter?theme=light&view=split&indent=2#preview';

export function UrlToolView() {
  const [inputUrl, setInputUrl] = useState<string>(SAMPLE_URL);
  const [action, setAction] = useState<'parse' | 'encode-component' | 'decode-component'>('parse');
  const [output, setOutput] = useState<UrlToolOutput | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const processUrl = async (
    raw: string,
    currentAction: 'parse' | 'encode-component' | 'decode-component'
  ) => {
    const result = await urlTool.execute({
      url: raw,
      action: currentAction,
    });

    if (result.success) {
      setOutput(result.data);
      setDuration(result.durationMs ?? null);
      setErrorMessage(null);
    } else {
      setErrorMessage(result.error.message);
      setOutput(null);
    }
  };

  useEffect(() => {
    void processUrl(SAMPLE_URL, 'parse');
  }, []);

  const handleExecute = (overrideAction?: 'parse' | 'encode-component' | 'decode-component') => {
    const act = overrideAction ?? action;
    void processUrl(inputUrl, act);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Globe className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              URL Parser & Encoder
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Deconstruct URLs into components, inspect query parameters, and encode/decode URI
            strings.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setInputUrl(SAMPLE_URL);
              void processUrl(SAMPLE_URL, action);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            Sample
          </button>
          <button
            type="button"
            onClick={() => {
              setInputUrl('');
              setOutput(null);
              setErrorMessage(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-stone-400" />
            Clear
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">URL Parse Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Input & Mode Row */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
            {[
              { id: 'parse', label: 'Parse URL' },
              { id: 'encode-component', label: 'Encode URI' },
              { id: 'decode-component', label: 'Decode URI' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  const act = tab.id as typeof action;
                  setAction(act);
                  handleExecute(act);
                }}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  action === tab.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {duration !== null && (
              <span className="text-xs font-mono text-emerald-700">{duration.toFixed(2)} ms</span>
            )}
            <button
              type="button"
              onClick={() => handleExecute()}
              className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
            >
              Execute <span className="opacity-60 text-[10px] ml-1">⌘↵</span>
            </button>
          </div>
        </div>

        <div className="relative mt-1">
          <input
            type="text"
            value={inputUrl}
            onChange={e => {
              setInputUrl(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleExecute();
              }
            }}
            placeholder="Enter a URL (e.g., https://example.com/path?key=value)..."
            className="w-full rounded-xl border border-stone-200/80 bg-[#fdfdfc] px-3.5 py-2.5 font-mono text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
          />
        </div>
      </div>

      {/* Output Section */}
      {output && (
        <div className="flex flex-col gap-6">
          {action === 'parse' ? (
            <>
              {/* Components Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Protocol', value: output.protocol || '—' },
                  { label: 'Hostname', value: output.hostname || '—' },
                  { label: 'Port', value: output.port || 'default' },
                  { label: 'Pathname', value: output.pathname || '/' },
                  { label: 'Search', value: output.search || '—' },
                  { label: 'Hash', value: output.hash || '—' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="flex flex-col rounded-xl border border-stone-200/80 bg-white p-3 shadow-xs"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      {item.label}
                    </span>
                    <span className="mt-1 font-mono text-xs font-medium text-stone-900 truncate">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Query Parameters Table */}
              <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Query Parameters ({output.queryParams.length})
                  </span>
                </div>

                {output.queryParams.length > 0 ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-stone-100 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                          <th className="pb-2 pr-4">Key</th>
                          <th className="pb-2 pr-4">Value</th>
                          <th className="pb-2 text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {output.queryParams.map((param, idx) => (
                          <tr key={`${param.key}-${idx}`} className="hover:bg-stone-50/70">
                            <td className="py-2.5 pr-4 font-semibold text-stone-800">
                              {param.key}
                            </td>
                            <td className="py-2.5 pr-4 text-stone-600 break-all">{param.value}</td>
                            <td className="py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(param.value, `param-${param.key}-${idx}`)
                                }
                                className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[10px] text-stone-600 hover:bg-stone-50"
                              >
                                {copiedKey === `param-${param.key}-${idx}` ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3 text-stone-400" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-stone-400">
                    No query parameters present in this URL.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* URI Component Encode/Decode Output */
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {action === 'encode-component' ? 'Encoded URI' : 'Decoded URI'}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(output.formatted, 'uri-result')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
                >
                  {copiedKey === 'uri-result' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-stone-300" />
                      Copy Result
                    </>
                  )}
                </button>
              </div>

              <pre className="mt-3 overflow-auto rounded-xl border border-stone-200/60 bg-[#fbfbf9] p-3.5 font-mono text-xs text-stone-900 leading-relaxed break-all">
                {output.formatted}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
