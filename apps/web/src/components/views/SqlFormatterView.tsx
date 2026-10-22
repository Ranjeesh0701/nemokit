import { useEffect, useState } from 'react';
import { sqlFormatterTool } from '@nemokit/core';
import type { SqlFormatterOutput } from '@nemokit/core';
import { Database, Copy, Check, Trash2, ArrowDownToLine, AlertCircle } from 'lucide-react';

const SAMPLE_SQL = `select u.id, u.username, u.email, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.active = 1 and u.created_at >= '2026-01-01' group by u.id, u.username, u.email having count(o.id) > 5 order by total_spent desc limit 50;`;

export function SqlFormatterView() {
  const [input, setInput] = useState<string>(SAMPLE_SQL);
  const [indent, setIndent] = useState<number>(2);
  const [uppercaseKeywords, setUppercaseKeywords] = useState<boolean>(true);
  const [output, setOutput] = useState<SqlFormatterOutput | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatSql = async (rawSql: string, indentSize: number, uppercase: boolean) => {
    await sqlFormatterTool.execute(
      {
        raw: rawSql,
        indent: indentSize,
        uppercaseKeywords: uppercase,
      },
      {
        onSuccess: (data, durationMs) => {
          setOutput(data);
          setDuration(durationMs ?? null);
          setErrorMessage(null);
        },
        onFailure: error => {
          setErrorMessage(error.message);
        },
      }
    );
  };

  useEffect(() => {
    void formatSql(SAMPLE_SQL, 2, true);
  }, []);

  const handleFormat = () => {
    void formatSql(input, indent, uppercaseKeywords);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output.formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Database className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">SQL Formatter</h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Structure raw SQL queries with standard indentation and uppercase reserved keywords.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setInput(SAMPLE_SQL);
              void formatSql(SAMPLE_SQL, indent, uppercaseKeywords);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            Sample
          </button>
          <button
            type="button"
            onClick={() => {
              setInput('');
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

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">SQL Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0 flex-1 min-h-0">
        {/* Input */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0 flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Raw SQL
            </span>
            <span className="text-xs font-mono text-stone-400">{input.length} chars</span>
          </div>

          <textarea
            value={input}
            onChange={e => {
              setInput(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleFormat();
              }
            }}
            placeholder="Paste your SQL statement here..."
            className="mt-3 w-full flex-1 min-h-[350px] lg:min-h-[calc(100vh-21rem)] resize-y rounded-xl border border-stone-200/60 bg-[#fdfdfc] p-3.5 font-mono text-xs text-stone-900 leading-relaxed placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
            spellCheck={false}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <span className="font-medium text-stone-500">Indent:</span>
                <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
                  {[2, 4].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setIndent(size);
                        void formatSql(input, size, uppercaseKeywords);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                        indent === size
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {size} spaces
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={uppercaseKeywords}
                  onChange={e => {
                    const checked = e.target.checked;
                    setUppercaseKeywords(checked);
                    void formatSql(input, indent, checked);
                  }}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span>Uppercase keywords</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleFormat}
              className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
            >
              Format <span className="opacity-60 text-[10px] ml-1">⌘↵</span>
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0 flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Formatted Query
            </span>
            {output && (
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                <span>{output.linesCount} lines</span>
                <span>•</span>
                <span>{output.byteSize} bytes</span>
                {duration !== null && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700">{duration.toFixed(2)} ms</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="relative mt-3 flex-1 flex flex-col min-h-0">
            <pre className="w-full flex-1 min-h-[350px] lg:min-h-[calc(100vh-21rem)] overflow-auto rounded-xl border border-stone-200/60 bg-[#fbfbf9] p-3.5 font-mono text-xs text-stone-900 leading-relaxed whitespace-pre">
              {output ? (
                output.formatted
              ) : (
                <span className="text-stone-400 italic">Formatted SQL will appear here...</span>
              )}
            </pre>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              disabled={!output}
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ArrowDownToLine className="h-3.5 w-3.5 text-stone-500" />
              Download .sql
            </button>
            <button
              type="button"
              disabled={!output}
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-stone-300" />
                  Copy Output
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
