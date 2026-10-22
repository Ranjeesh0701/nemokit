import { useState, useEffect } from 'react';
import { regexTool } from '@nemokit/core';
import type { RegexToolOutput } from '@nemokit/core';
import { Search, Copy, Check, AlertCircle, ArrowRightLeft } from 'lucide-react';

const REGEX_PRESETS = [
  { name: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  {
    name: 'URL / Link',
    pattern:
      'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
  },
  {
    name: 'IPv4 Address',
    pattern:
      '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
  },
  {
    name: 'UUID v4',
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
    flags: 'gi',
  },
  {
    name: 'SemVer',
    pattern:
      'v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?',
    flags: 'g',
  },
  { name: 'Slug (kebab-case)', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: 'g' },
];

const DEFAULT_TEXT = `Welcome to Nemokit! For support, email hello@nemokit.dev or security@nemokit.org.
Visit https://nemokit.dev or test local gateway at 192.168.1.1 and 10.0.0.1.
Release v1.4.2 includes uuid 550e8400-e29b-41d4-a716-446655440000.`;

export function RegexToolView() {
  const [pattern, setPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState<string>('g');
  const [testString, setTestString] = useState<string>(DEFAULT_TEXT);
  const [replacement, setReplacement] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [output, setOutput] = useState<RegexToolOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    regexTool.execute(
      {
        pattern,
        flags,
        testString,
        replacement: replacement || undefined,
      },
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
  }, [pattern, flags, testString, replacement]);

  const handleToggleFlag = (flagChar: string) => {
    if (flags.includes(flagChar)) {
      setFlags(flags.replace(flagChar, ''));
    } else {
      setFlags(flags + flagChar);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const applyPreset = (preset: (typeof REGEX_PRESETS)[0]) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Search className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Regex Tester & Explainer
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Real-time regular expression tester with capture groups inspection, substitution
            preview, and common presets.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {REGEX_PRESETS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Input & Flags Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
        <div className="flex-1 flex items-center min-w-0">
          <span className="text-stone-400 font-mono text-lg font-bold px-1 select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="Type regex pattern..."
            className="flex-1 bg-transparent px-2 py-1 font-mono text-sm sm:text-base font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none"
            spellCheck={false}
          />
          <span className="text-stone-400 font-mono text-lg font-bold px-1 select-none">/</span>
        </div>

        {/* Flag toggles */}
        <div className="flex items-center gap-1 sm:pl-4 sm:border-l border-stone-100 shrink-0">
          {['g', 'i', 'm', 's'].map(f => {
            const isActive = flags.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => handleToggleFlag(f)}
                className={`h-8 w-8 rounded-lg font-mono text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
                title={`Flag: ${f}`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Test String & Matches Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
        {/* Test String Input */}
        <div className="lg:col-span-7 flex flex-col gap-2 min-w-0 flex-1 min-h-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Test String</span>
            {output && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 text-white px-2 py-0.5 text-xs font-mono font-medium">
                {output.matchCount} {output.matchCount === 1 ? 'match' : 'matches'} found
              </span>
            )}
          </div>
          <textarea
            value={testString}
            onChange={e => setTestString(e.target.value)}
            placeholder="Paste text to test your regular expression against..."
            className="w-full flex-1 min-h-[220px] lg:min-h-[280px] rounded-xl border border-stone-200 bg-white p-3.5 font-mono text-xs sm:text-sm text-stone-800 shadow-xs placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-y"
            spellCheck={false}
          />

          {/* Replacement section */}
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-stone-50/60 p-4">
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <ArrowRightLeft className="h-3.5 w-3.5 text-stone-500" />
              Substitution / Replacement
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replacement}
                onChange={e => setReplacement(e.target.value)}
                placeholder="Replacement string (e.g. [REDACTED] or $1)..."
                className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-mono text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
              />
              {output?.substituted && (
                <button
                  type="button"
                  onClick={() => handleCopy(output.substituted ?? '', 'sub')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
                >
                  {copiedKey === 'sub' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-stone-500" />
                  )}
                  Copy Result
                </button>
              )}
            </div>
            {output?.substituted && (
              <pre className="mt-1 max-h-32 overflow-auto rounded-lg bg-white border border-stone-200 p-2.5 font-mono text-xs text-stone-800 whitespace-pre-wrap break-all">
                {output.substituted}
              </pre>
            )}
          </div>
        </div>

        {/* Matches Inspector Column */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-w-0 flex-1 min-h-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Matches & Capture Groups</span>
            <span className="text-stone-400 font-mono text-[11px]">
              {output ? `${output.matches.length} captured` : '0'}
            </span>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-h-[300px] lg:min-h-[calc(100vh-25rem)] max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
            {output && output.matches.length > 0 ? (
              output.matches.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-1.5 rounded-xl border border-stone-200/90 bg-white p-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[11px] font-mono font-medium text-amber-800">
                      Match #{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      index: {m.index} • len: {m.length}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-semibold text-stone-900 bg-stone-50 p-2 rounded-lg break-all select-all">
                    {m.match}
                  </div>

                  {m.captureGroups.length > 0 && (
                    <div className="mt-1 flex flex-col gap-1 pt-1.5 border-t border-stone-100 text-[11px]">
                      <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                        Groups
                      </span>
                      {m.captureGroups.map((grp, gIdx) => (
                        <div key={gIdx} className="flex items-center gap-2 font-mono">
                          <span className="text-stone-400 shrink-0">Group {gIdx + 1}:</span>
                          <span className="text-stone-800 bg-stone-100/70 px-1.5 py-0.5 rounded break-all">
                            {grp || '<empty>'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-400">
                No matches found with current pattern and test text.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
