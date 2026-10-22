import { useEffect, useState } from 'react';
import { jsonFormatterTool } from '@nemokit/core';
import type { JsonFormatterOutput } from '@nemokit/core';
import { Copy, Check, Trash2, FileCode, ArrowDownToLine, AlertCircle } from 'lucide-react';

const SAMPLE_JSON = `{
  "product": "Nemokit",
  "tagline": "Your tools. One place. No clutter.",
  "features": [
    "browser-first engine",
    "zero tracking",
    "instant client-side execution"
  ],
  "engine": {
    "version": "0.1.0",
    "decoupled": true,
    "frameworkAgnostic": true
  }
}`;

export function JsonFormatterView() {
  const [input, setInput] = useState<string>(SAMPLE_JSON);
  const [indent, setIndent] = useState<number | '\t'>(2);
  const [output, setOutput] = useState<JsonFormatterOutput | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatText = async (textToFormat: string, indentSpacing: number | '\t') => {
    await jsonFormatterTool.execute(
      {
        raw: textToFormat,
        indent: indentSpacing,
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
    void formatText(SAMPLE_JSON, 2);
  }, []);

  const handleFormat = (overrideIndent?: number | '\t') => {
    const activeIndent = overrideIndent ?? indent;
    void formatText(input, activeIndent);
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      const linesCount = 1;
      const byteSize = new TextEncoder().encode(minified).length;
      setOutput({ formatted: minified, linesCount, byteSize });
      setErrorMessage(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON syntax.';
      setErrorMessage(message);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = output.formatted;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output.formatted], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput(null);
    setErrorMessage(null);
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_JSON);
    void formatText(SAMPLE_JSON, indent);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <FileCode className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">JSON Formatter</h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Validate, clean, and format raw JSON locally in your browser.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            Sample
          </button>
          <button
            type="button"
            onClick={handleClear}
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
            <p className="font-medium">JSON Syntax Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Editor & Output Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full min-w-0">
        {/* Input Column */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Raw Input
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
            placeholder="Paste your JSON here..."
            rows={18}
            className="mt-3 w-full resize-y rounded-xl border border-stone-200/60 bg-[#fdfdfc] p-3.5 font-mono text-xs text-stone-900 leading-relaxed placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
            spellCheck={false}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
            {/* Indent selector */}
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span className="font-medium text-stone-500">Indent:</span>
              <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
                {[
                  { label: '2 spaces', value: 2 },
                  { label: '4 spaces', value: 4 },
                  { label: 'Tab', value: '\t' as const },
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setIndent(opt.value);
                      handleFormat(opt.value);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      indent === opt.value
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMinify}
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
              >
                Minify
              </button>
              <button
                type="button"
                onClick={() => handleFormat()}
                className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
              >
                Format <span className="opacity-60 text-[10px] ml-1">⌘↵</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Formatted Output
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

          <div className="relative mt-3">
            <pre className="h-[396px] overflow-auto rounded-xl border border-stone-200/60 bg-[#fbfbf9] p-3.5 font-mono text-xs text-stone-900 leading-relaxed">
              {output ? (
                output.formatted
              ) : (
                <span className="text-stone-400 italic">Formatted output will appear here...</span>
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
              Download .json
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
