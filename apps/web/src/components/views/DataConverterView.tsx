import { useState, useEffect } from 'react';
import { dataConverterTool } from '@nemokit/core';
import type { DataConverterOutput, DataFormat } from '@nemokit/core';
import { RefreshCw, Copy, Check, ArrowRightLeft, Sparkles, AlertCircle } from 'lucide-react';

const SAMPLE_JSON = `[
  { "id": 1, "name": "Alice Cooper", "role": "Lead Architect", "active": true },
  { "id": 2, "name": "Bob Martin", "role": "Systems Engineer", "active": false },
  { "id": 3, "name": "Charlie Day", "role": "DevOps Specialist", "active": true }
]`;

export function DataConverterView() {
  const [content, setContent] = useState<string>(SAMPLE_JSON);
  const [fromFormat, setFromFormat] = useState<DataFormat>('json');
  const [toFormat, setToFormat] = useState<DataFormat>('yaml');
  const [copied, setCopied] = useState<boolean>(false);

  const [output, setOutput] = useState<DataConverterOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    dataConverterTool.execute(
      { content, fromFormat, toFormat },
      {
        onSuccess: data => {
          setOutput(data);
          setErrorMessage(null);
        },
        onFailure: err => {
          setErrorMessage(err.message);
          setOutput(null);
        },
      }
    );
  }, [content, fromFormat, toFormat]);

  const handleSwap = () => {
    if (!output) return;
    setContent(output.converted);
    const temp = fromFormat;
    setFromFormat(toFormat);
    setToFormat(temp);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output.converted);
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
              <RefreshCw className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              JSON ⇄ YAML ⇄ CSV Converter
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Convert structured data bidirectionally between JSON, YAML, and CSV with real-time
            validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-stone-500" />
            Swap Formats
          </button>
          <button
            type="button"
            onClick={() => {
              setContent(SAMPLE_JSON);
              setFromFormat('json');
              setToFormat('yaml');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-stone-500" />
            Sample Data
          </button>
        </div>
      </div>

      {/* Format Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/90 bg-stone-50/70 p-3.5">
        <div className="flex items-center gap-3">
          {/* Source Format */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Source:</span>
            <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 shadow-2xs">
              {(['json', 'yaml', 'csv'] as DataFormat[]).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFromFormat(f)}
                  className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-md transition-colors ${
                    fromFormat === f
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <span className="text-stone-400 font-bold">→</span>

          {/* Target Format */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Target:</span>
            <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 shadow-2xs">
              {(['json', 'yaml', 'csv'] as DataFormat[]).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setToFormat(f)}
                  className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-md transition-colors ${
                    toFormat === f
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!output}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Copied Converted
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-stone-500" />
              Copy {toFormat.toUpperCase()}
            </>
          )}
        </button>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Editor Grid: Input vs Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Textarea */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Input ({fromFormat.toUpperCase()})</span>
            <span className="font-mono text-stone-400">{content.length} chars</span>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`Paste your ${fromFormat.toUpperCase()} content here...`}
            rows={16}
            className="w-full rounded-xl border border-stone-200 bg-white p-3.5 font-mono text-xs text-stone-800 shadow-xs placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Target Textarea */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Converted ({toFormat.toUpperCase()})</span>
            {output && (
              <span className="font-mono text-stone-400">
                {output.stats.outputLength} chars
                {output.stats.itemCount !== undefined && ` • ${output.stats.itemCount} items`}
              </span>
            )}
          </div>
          <textarea
            readOnly
            value={output ? output.converted : ''}
            placeholder="Awaiting converted output..."
            rows={16}
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 font-mono text-xs text-stone-800 shadow-xs placeholder:text-stone-400 focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
