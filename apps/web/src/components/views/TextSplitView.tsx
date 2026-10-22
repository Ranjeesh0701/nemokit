import { useEffect, useState } from 'react';
import { textSplitTool } from '@nemokit/core';
import type { TextChunk, TextSplitOutput } from '@nemokit/core';
import { AlignLeft, Copy, Check, Trash2, AlertCircle } from 'lucide-react';

const SAMPLE_TEXT = `TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

Nemokit establishes a browser-first tool engine. The engine operates purely in TypeScript without React or UI dependencies, maintaining strict type contracts for every input and output.

Everyday developer utilities should be fast, private, and pleasant to use. Many online converters upload your data to remote servers or inject ads. Nemokit executes calculations locally inside the browser memory.

When building scalable architectures, separation of concerns is vital. By keeping the core engine separate from the user interface, we can test execution logic in Node, run it in the browser, or migrate to Web Workers without rewriting UI components.`;

export function TextSplitView() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [splitBy, setSplitBy] = useState<'words' | 'characters' | 'lines' | 'delimiter'>('words');
  const [chunkSize, setChunkSize] = useState<number>(30);
  const [delimiter, setDelimiter] = useState<string>('\n\n');
  const [output, setOutput] = useState<TextSplitOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | 'all' | null>(null);

  const splitContent = (
    rawText: string,
    mode: 'words' | 'characters' | 'lines' | 'delimiter',
    size: number,
    delim: string
  ) => {
    const result = textSplitTool.execute(
      {
        text: rawText,
        splitBy: mode,
        chunkSize: size,
        delimiter: delim,
      },
      {
        onSuccess: data => {
          setOutput(data);
          setErrorMessage(null);
        },
        onFailure: error => {
          setErrorMessage(error.message);
          setOutput(null);
        },
      }
    );
    // Support sync execution
    if (result && typeof result === 'object' && 'success' in result && result.success) {
      setOutput(result.data);
      setErrorMessage(null);
    }
  };

  useEffect(() => {
    splitContent(SAMPLE_TEXT, 'words', 30, '\n\n');
  }, []);

  const handleCopyChunk = async (chunkText: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(chunkText);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyAllJson = async () => {
    if (!output) return;
    try {
      const json = JSON.stringify(
        output.chunks.map(c => c.content),
        null,
        2
      );
      await navigator.clipboard.writeText(json);
      setCopiedIndex('all');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <AlignLeft className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Text & Word Splitter
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Split long text, articles, or prompts into chunks by word count, character size, lines,
            or delimiters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setText(SAMPLE_TEXT);
              splitContent(SAMPLE_TEXT, splitBy, chunkSize, delimiter);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            Sample Text
          </button>
          <button
            type="button"
            onClick={() => {
              setText('');
              setOutput(null);
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
            <p className="font-medium">Split Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Input & Split Options Dual-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0 flex-1 min-h-0">
        {/* Left: Input Text */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0 flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Raw Input Text
            </span>
            <span className="text-xs font-mono text-stone-400">
              {output
                ? `${output.originalWordCount} words • ${output.originalCharCount} chars`
                : `${text.length} chars`}
            </span>
          </div>

          <textarea
            value={text}
            onChange={e => {
              const val = e.target.value;
              setText(val);
              splitContent(val, splitBy, chunkSize, delimiter);
            }}
            placeholder="Paste your text here to split..."
            className="mt-3 w-full flex-1 min-h-[350px] lg:min-h-[calc(100vh-21rem)] resize-y rounded-xl border border-stone-200/60 bg-[#fdfdfc] p-3.5 font-mono text-xs text-stone-900 leading-relaxed placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
            spellCheck={false}
          />

          {/* Controls Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
            {/* Split Mode Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-stone-500">Split by:</span>
              <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
                {[
                  { id: 'words', label: 'Words' },
                  { id: 'characters', label: 'Chars' },
                  { id: 'lines', label: 'Lines' },
                  { id: 'delimiter', label: 'Delimiter' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      const mode = opt.id as typeof splitBy;
                      setSplitBy(mode);
                      const defaultSize = mode === 'characters' ? 500 : mode === 'lines' ? 10 : 30;
                      setChunkSize(defaultSize);
                      splitContent(text, mode, defaultSize, delimiter);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      splitBy === opt.id
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chunk Size / Delimiter Input */}
            <div className="flex items-center gap-2">
              {splitBy === 'delimiter' ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-stone-500">Delimiter:</span>
                  <input
                    type="text"
                    value={delimiter}
                    onChange={e => {
                      const val = e.target.value;
                      setDelimiter(val);
                      splitContent(text, splitBy, chunkSize, val);
                    }}
                    placeholder="e.g. --- or \n\n"
                    className="w-24 rounded-lg border border-stone-200 px-2 py-1 font-mono text-xs text-stone-900"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-stone-500">Size:</span>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={chunkSize}
                    onChange={e => {
                      const val = Math.max(parseInt(e.target.value, 10) || 1, 1);
                      setChunkSize(val);
                      splitContent(text, splitBy, val, delimiter);
                    }}
                    className="w-20 rounded-lg border border-stone-200 px-2 py-1 font-mono text-xs text-stone-900"
                  />
                  <span className="text-stone-400 capitalize">{splitBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Chunks Output */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0 flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Generated Chunks ({output?.totalChunks ?? 0})
            </span>
            {output && output.chunks.length > 0 && (
              <button
                type="button"
                onClick={handleCopyAllJson}
                className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors"
              >
                {copiedIndex === 'all' ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Copied All JSON!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-stone-400" />
                    <span>Copy All as JSON</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-3 flex-1 flex flex-col gap-3 min-h-[350px] lg:min-h-[calc(100vh-21rem)] max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
            {output && output.chunks.length > 0 ? (
              output.chunks.map((chunk: TextChunk, idx: number) => (
                <div
                  key={chunk.index}
                  className="rounded-xl border border-stone-200/70 bg-[#fbfbf9] p-3.5 flex flex-col gap-2 hover:border-stone-300 transition-colors group"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-100/80 pb-2">
                    <span className="font-semibold text-stone-600">Chunk #{chunk.index}</span>
                    <div className="flex items-center gap-3">
                      <span>
                        {chunk.wordCount} words • {chunk.charCount} chars
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyChunk(chunk.content, idx)}
                        className="inline-flex items-center gap-1 rounded border border-stone-200 bg-white px-2 py-0.5 text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-stone-400" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-stone-800 leading-relaxed whitespace-pre-wrap select-all">
                    {chunk.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-stone-400 italic">
                Chunks will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
