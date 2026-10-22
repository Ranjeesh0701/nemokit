import { useState, useEffect } from 'react';
import { diffTool } from '@nemokit/core';
import type { DiffToolOutput } from '@nemokit/core';
import { GitCompare, Copy, Check, ArrowRightLeft, Sparkles, RefreshCw } from 'lucide-react';

const SAMPLE_ORIGINAL = `export function calculateTotal(items: CartItem[]): number {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

const SAMPLE_MODIFIED = `export function calculateTotal(items: ReadonlyArray<CartItem>, taxRate = 0.05): number {
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * taxRate;
  return Math.round((subtotal + tax) * 100) / 100;
}`;

export function DiffToolView() {
  const [original, setOriginal] = useState<string>(SAMPLE_ORIGINAL);
  const [modified, setModified] = useState<string>(SAMPLE_MODIFIED);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [diffResult, setDiffResult] = useState<DiffToolOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    diffTool.execute(
      {
        original,
        modified,
        ignoreWhitespace,
      },
      {
        onSuccess: data => setDiffResult(data),
        onFailure: () => setDiffResult(null),
      }
    );
  }, [original, modified, ignoreWhitespace]);

  const handleSwap = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  };

  const handleLoadSample = () => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
  };

  const handleClear = () => {
    setOriginal('');
    setModified('');
  };

  const handleCopyUnifiedDiff = async () => {
    if (!diffResult) return;
    const diffText = diffResult.lines
      .map(line => {
        const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
        return `${prefix} ${line.content}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(diffText);
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
              <GitCompare className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Text Diff & Comparator
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Compare two code or text blocks line-by-line with LCS algorithm, highlighting additions
            and deletions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-stone-500" />
            Swap Sides
          </button>
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-stone-500" />
            Sample
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-stone-400" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor Inputs (Original vs Modified) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Original Text (Before)
            </span>
            <span className="font-mono text-stone-400">{original.split('\n').length} lines</span>
          </div>
          <textarea
            value={original}
            onChange={e => setOriginal(e.target.value)}
            placeholder="Paste original text or code..."
            rows={10}
            className="w-full rounded-xl border border-stone-200 bg-white p-3.5 font-mono text-xs text-stone-800 shadow-xs placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Modified */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Modified Text (After)
            </span>
            <span className="font-mono text-stone-400">{modified.split('\n').length} lines</span>
          </div>
          <textarea
            value={modified}
            onChange={e => setModified(e.target.value)}
            placeholder="Paste modified text or code..."
            rows={10}
            className="w-full rounded-xl border border-stone-200 bg-white p-3.5 font-mono text-xs text-stone-800 shadow-xs placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-y"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Controls Bar & Diff Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-stone-700">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={e => setIgnoreWhitespace(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            Ignore Leading & Trailing Whitespace
          </label>

          {diffResult && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 border border-emerald-200/60 font-mono">
                +{diffResult.additions} added
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 font-medium text-rose-700 border border-rose-200/60 font-mono">
                -{diffResult.deletions} removed
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-stone-200/70 px-2 py-0.5 font-medium text-stone-700 font-mono">
                {diffResult.similarityPercentage}% similarity
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyUnifiedDiff}
          disabled={!diffResult}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Copied Diff
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-stone-500" />
              Copy Unified Diff
            </>
          )}
        </button>
      </div>

      {/* Line-by-Line Diff Output */}
      {diffResult && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600">
            <span>Visual Line Comparison</span>
            <span className="text-stone-400 font-mono">
              {diffResult.lines.length} total lines rendered
            </span>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs font-mono text-xs">
            {diffResult.lines.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                Both texts are completely empty. Paste text above to calculate diff.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {diffResult.lines.map((line, idx) => {
                  const isAdded = line.type === 'added';
                  const isRemoved = line.type === 'removed';

                  return (
                    <div
                      key={idx}
                      className={`flex items-start text-xs leading-5 hover:bg-stone-50/50 ${
                        isAdded
                          ? 'bg-emerald-50/60 text-emerald-950 font-medium'
                          : isRemoved
                            ? 'bg-rose-50/60 text-rose-950 font-medium'
                            : 'text-stone-700'
                      }`}
                    >
                      {/* Original Line Number */}
                      <span className="w-10 sm:w-12 shrink-0 select-none px-2 py-1 text-right text-stone-400 font-mono text-[11px] border-r border-stone-100">
                        {line.lineNumberOriginal ?? ''}
                      </span>

                      {/* Modified Line Number */}
                      <span className="w-10 sm:w-12 shrink-0 select-none px-2 py-1 text-right text-stone-400 font-mono text-[11px] border-r border-stone-100">
                        {line.lineNumberModified ?? ''}
                      </span>

                      {/* Sign Indicator */}
                      <span
                        className={`w-6 shrink-0 select-none py-1 text-center font-bold text-[12px] ${
                          isAdded
                            ? 'text-emerald-600'
                            : isRemoved
                              ? 'text-rose-600'
                              : 'text-stone-300'
                        }`}
                      >
                        {isAdded ? '+' : isRemoved ? '-' : ' '}
                      </span>

                      {/* Line Content */}
                      <span className="flex-1 py-1 pr-3 whitespace-pre-wrap break-all min-w-0 font-mono">
                        {line.content || ' '}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
