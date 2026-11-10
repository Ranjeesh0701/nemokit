import { useEffect, useState } from 'react';
import { hashTool } from '@nemokit/core';
import type { HashAlgorithm, HashToolOutput } from '@nemokit/core';
import { KeyRound, Copy, Check, Trash2, AlertCircle } from 'lucide-react';

const SAMPLE_TEXT = 'Nemokit: Your tools. One place. No clutter.';

export function HashToolView() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [output, setOutput] = useState<HashToolOutput | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const computeHash = async (inputText: string, algo: HashAlgorithm) => {
    const result = await hashTool.execute({
      text: inputText,
      algorithm: algo,
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
    void computeHash(SAMPLE_TEXT, 'SHA-256');
  }, []);

  const handleExecute = (overrideAlgo?: HashAlgorithm) => {
    const a = overrideAlgo ?? algorithm;
    void computeHash(text, a);
  };

  const handleCopy = async () => {
    if (!output) return;
    const hashString = uppercase ? output.hex.toUpperCase() : output.hex;
    try {
      await navigator.clipboard.writeText(hashString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
              <KeyRound className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Cryptographic Hash Generator
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes using the browser's
            hardware-accelerated Web Crypto API.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setText(SAMPLE_TEXT);
              void computeHash(SAMPLE_TEXT, algorithm);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            Sample
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

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Hash Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Input Plaintext
          </span>
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
          placeholder="Enter text to hash..."
          rows={6}
          className="mt-3 w-full resize-y rounded-xl border border-stone-200/60 bg-[#fdfdfc] p-3.5 font-mono text-xs text-stone-900 leading-relaxed placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
          spellCheck={false}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          {/* Algorithm selector pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
              {(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const).map(algo => (
                <button
                  key={algo}
                  type="button"
                  onClick={() => {
                    setAlgorithm(algo);
                    handleExecute(algo);
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    algorithm === algo
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none ml-2">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={e => setUppercase(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Uppercase HEX</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => handleExecute()}
            className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
          >
            Compute Hash <span className="opacity-60 text-[10px] ml-1">⌘↵</span>
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {algorithm} Digest
          </span>
          {output && (
            <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
              <span>{output.bitLength} bits</span>
              <span>•</span>
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
          <div className="rounded-xl border border-stone-200/60 bg-[#fbfbf9] p-4 font-mono text-xs text-stone-900 break-all leading-relaxed select-all">
            {output ? (
              uppercase ? (
                output.hex.toUpperCase()
              ) : (
                output.hex
              )
            ) : (
              <span className="text-stone-400 italic">Digest will appear here...</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
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
                Copy Hash
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
