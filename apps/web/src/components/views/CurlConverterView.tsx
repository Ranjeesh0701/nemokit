import { useState, useEffect } from 'react';
import { curlConverterTool } from '@nemokit/core';
import type { CurlConverterOutput } from '@nemokit/core';
import { Terminal, Copy, Check, Sparkles, AlertCircle, Code2 } from 'lucide-react';

const SAMPLE_CURL = `curl 'https://api.github.com/repos/nemokit/core/releases' \\
  -X POST \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'Authorization: Bearer ghp_sampletoken123456' \\
  -H 'Content-Type: application/json' \\
  -d '{"tag_name":"v1.0.0","name":"Initial Release","draft":false}'`;

type SnippetLang = 'jsFetch' | 'axios' | 'pythonRequests' | 'nodeHttps' | 'goNetHttp';

export function CurlConverterView() {
  const [curlCommand, setCurlCommand] = useState<string>(SAMPLE_CURL);
  const [selectedLang, setSelectedLang] = useState<SnippetLang>('jsFetch');
  const [copied, setCopied] = useState<boolean>(false);
  const [result, setResult] = useState<{ data: CurlConverterOutput | null; error: string | null }>({
    data: null,
    error: null,
  });

  useEffect(() => {
    curlConverterTool.execute(
      { curlCommand },
      {
        onSuccess: data => setResult({ data, error: null }),
        onFailure: err => setResult({ data: null, error: err.message }),
      }
    );
  }, [curlCommand]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const currentCode = result.data ? result.data.snippets[selectedLang] : '';

  const getMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'POST':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Terminal className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              cURL to Code Converter
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Convert browser network cURL requests into production-grade fetch, Axios, Python, and Go
            code.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurlCommand(SAMPLE_CURL)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-stone-500" />
          Load Sample cURL
        </button>
      </div>

      {/* Main Grid: cURL input vs Code Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
        {/* Input Column */}
        <div className="lg:col-span-5 flex flex-col gap-2 min-w-0 flex-1 min-h-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Raw cURL Command</span>
            <button
              type="button"
              onClick={() => setCurlCommand('')}
              className="text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          </div>
          <textarea
            value={curlCommand}
            onChange={e => setCurlCommand(e.target.value)}
            placeholder="curl 'https://api.example.com' -H '...' ..."
            className="w-full flex-1 min-h-[180px] rounded-xl border border-stone-200 bg-white p-3.5 font-mono text-xs text-stone-800 shadow-xs placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-y"
            spellCheck={false}
          />

          {result.data && (
            <div className="mt-2 flex flex-col gap-2 rounded-xl border border-stone-200/90 bg-white p-4 shadow-xs text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Parsed Request
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 font-mono font-bold text-[11px] border ${getMethodBadge(
                    result.data.parsed.method
                  )}`}
                >
                  {result.data.parsed.method}
                </span>
                <span className="font-mono text-stone-700 truncate">{result.data.parsed.url}</span>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-stone-100 text-stone-500 text-[11px]">
                <span>{Object.keys(result.data.parsed.headers).length} headers</span>
                <span>{result.data.parsed.body ? 'Payload attached' : 'No body'}</span>
                {result.data.parsed.auth && <span>Auth credentials present</span>}
              </div>
            </div>
          )}
        </div>

        {/* Code Output Column */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-w-0 flex-1 min-h-0">
          {/* Language Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'jsFetch', label: 'JavaScript (Fetch)' },
                { id: 'axios', label: 'Axios' },
                { id: 'pythonRequests', label: 'Python (Requests)' },
                { id: 'nodeHttps', label: 'Node.js' },
                { id: 'goNetHttp', label: 'Go (net/http)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedLang(tab.id as SnippetLang)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedLang === tab.id
                      ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleCopy(currentCode)}
              disabled={!currentCode}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Copied Code
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-stone-500" />
                  Copy Snippet
                </>
              )}
            </button>
          </div>

          {/* Error Banner */}
          {result.error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{result.error}</span>
            </div>
          )}

          {/* Code Viewer */}
          <div className="relative rounded-2xl border border-stone-200 bg-stone-900 p-4 text-stone-100 shadow-sm overflow-hidden flex-1 min-h-[220px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-[11px] font-mono text-stone-400">
              <span className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-stone-400" />
                Target Snippet
              </span>
              <span>UTF-8</span>
            </div>
            <pre className="mt-3 overflow-auto font-mono text-xs leading-relaxed text-stone-100 selection:bg-stone-700 flex-1">
              {currentCode || '// Awaiting valid cURL input...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
