import { useEffect, useState } from 'react';
import { base64Tool } from '@nemokit/core';
import type { Base64Output } from '@nemokit/core';
import {
  Binary,
  Copy,
  Check,
  Trash2,
  ArrowDownToLine,
  AlertCircle,
  ArrowLeftRight,
} from 'lucide-react';

const SAMPLE_TEXT = 'Hello, Nemokit! 🚀 Built with zero clutter and pure TypeScript.';

export function Base64View() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [output, setOutput] = useState<Base64Output | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const processBase64 = async (
    inputText: string,
    currentMode: 'encode' | 'decode',
    isUrlSafe: boolean
  ) => {
    const result = await base64Tool.execute({
      text: inputText,
      mode: currentMode,
      urlSafe: isUrlSafe,
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
    void processBase64(SAMPLE_TEXT, 'encode', false);
  }, []);

  const handleExecute = (nextMode?: 'encode' | 'decode', nextUrlSafe?: boolean) => {
    const m = nextMode ?? mode;
    const u = nextUrlSafe ?? urlSafe;
    void processBase64(text, m, u);
  };

  const handleSwap = () => {
    if (!output || !output.result) return;
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setText(output.result);
    setMode(nextMode);
    void processBase64(output.result, nextMode, urlSafe);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = output.result;
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
    const blob = new Blob([output.result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'encoded.b64.txt' : 'decoded.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Binary className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Base64 Converter
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Encode UTF-8 text to standard or URL-safe Base64 and decode back in real-time.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!output || !output.result}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-stone-500" />
            Swap Input/Output
          </button>
          <button
            type="button"
            onClick={() => {
              setText('');
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

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Conversion Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Editor & Output Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full min-w-0">
        {/* Input Column */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {mode === 'encode' ? 'Plaintext Input' : 'Base64 Input'}
              </span>
            </div>
            <span className="text-xs font-mono text-stone-400">{text.length} chars</span>
          </div>

          <textarea
            value={text}
            onChange={e => {
              setText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleExecute();
              }
            }}
            placeholder={
              mode === 'encode' ? 'Type or paste plaintext here...' : 'Paste Base64 string here...'
            }
            rows={14}
            className="mt-3 w-full resize-y rounded-xl border border-stone-200/60 bg-[#fdfdfc] p-3.5 font-mono text-xs text-stone-900 leading-relaxed placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
            spellCheck={false}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
            {/* Mode & URL-Safe Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
                {(['encode', 'decode'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      handleExecute(m, urlSafe);
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                      mode === m
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={e => {
                    const checked = e.target.checked;
                    setUrlSafe(checked);
                    handleExecute(mode, checked);
                  }}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span>URL-safe (- and _)</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => handleExecute()}
              className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
            >
              Convert <span className="opacity-60 text-[10px] ml-1">⌘↵</span>
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {mode === 'encode' ? 'Base64 Output' : 'Plaintext Output'}
            </span>
            {output && (
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                <span>{output.byteLength} bytes</span>
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
            <pre className="h-[312px] overflow-auto rounded-xl border border-stone-200/60 bg-[#fbfbf9] p-3.5 font-mono text-xs text-stone-900 leading-relaxed break-all whitespace-pre-wrap">
              {output ? (
                output.result
              ) : (
                <span className="text-stone-400 italic">Result will appear here...</span>
              )}
            </pre>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              disabled={!output || !output.result}
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ArrowDownToLine className="h-3.5 w-3.5 text-stone-500" />
              Download
            </button>
            <button
              type="button"
              disabled={!output || !output.result}
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
