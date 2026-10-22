import { useState, useMemo, useEffect, useCallback } from 'react';
import { httpRefTool, type HttpRefOutput } from '@nemokit/core';
import { Search, Copy, Check, Share2, Globe } from 'lucide-react';
import { serializeStateToUrl, parseSharedState } from '../../utils/shareState.js';

export function HttpRefView() {
  const initial = useMemo(() => {
    return parseSharedState<{
      query?: string;
      group?: string;
    }>('http-reference');
  }, []);

  const [query, setQuery] = useState<string>(initial?.query ?? '');
  const [activeGroup, setActiveGroup] = useState<string>(initial?.group ?? 'all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [output, setOutput] = useState<HttpRefOutput | null>(null);

  // Engine query execution
  useEffect(() => {
    httpRefTool.execute(
      { query, group: activeGroup },
      {
        onSuccess: data => {
          setOutput(data);
        },
        onFailure: () => {
          setOutput(null);
        },
      }
    );
  }, [query, activeGroup]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleShareLink = useCallback(() => {
    const url = serializeStateToUrl('http-reference', {
      query,
      group: activeGroup,
    });
    navigator.clipboard.writeText(url);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  }, [query, activeGroup]);

  const getStatusBadge = (category: string) => {
    switch (category) {
      case '1xx':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '2xx':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '3xx':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case '4xx':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '5xx':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getHeaderGroupBadge = (group: string) => {
    switch (group) {
      case 'auth':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'caching':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'security':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'cors':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const groups = [
    { id: 'all', label: 'All References' },
    { id: '1xx', label: '1xx Info' },
    { id: '2xx', label: '2xx Success' },
    { id: '3xx', label: '3xx Redirect' },
    { id: '4xx', label: '4xx Client' },
    { id: '5xx', label: '5xx Server' },
    { id: 'headers', label: 'HTTP Headers' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/80 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700">
            <Globe className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              HTTP Status & Headers Reference
            </h1>
            <p className="text-xs text-stone-500">
              Instant searchable reference for HTTP 1xx-5xx status codes and standard web headers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            {shareSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-stone-500" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search code or description (e.g. 404, CORS, ETag, Bearer, 502)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200/90 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400 shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Group Selector Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {groups.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGroup(g.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeGroup === g.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Directory */}
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto pr-1">
        {/* Status Codes Section */}
        {output && output.statusCodes.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 uppercase tracking-wider">
              <span>Status Codes ({output.statusCodes.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {output.statusCodes.map(codeItem => (
                <div
                  key={codeItem.code}
                  className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`font-mono text-base font-bold px-2.5 py-0.5 rounded-lg border ${getStatusBadge(
                            codeItem.category
                          )}`}
                        >
                          {codeItem.code}
                        </span>
                        <h3 className="font-semibold text-sm text-stone-900">{codeItem.phrase}</h3>
                      </div>
                      <span className="text-[11px] font-mono text-stone-400">{codeItem.rfc}</span>
                    </div>

                    <p className="mt-3 text-xs text-stone-600 leading-relaxed">
                      {codeItem.description}
                    </p>

                    <div className="mt-3 rounded-xl bg-stone-50 border border-stone-100 p-2.5 text-[11px] text-stone-600 leading-relaxed">
                      <span className="font-semibold text-stone-700">Common Use: </span>
                      {codeItem.commonUseCases}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="text-[11px]">{codeItem.categoryName}</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${codeItem.code} ${codeItem.phrase}`,
                          `code-${codeItem.code}`
                        )
                      }
                      className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900"
                    >
                      {copiedKey === `code-${codeItem.code}` ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HTTP Headers Section */}
        {output && output.headers.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 uppercase tracking-wider">
              <span>Standard HTTP Headers ({output.headers.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {output.headers.map(header => (
                <div
                  key={header.name}
                  className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-stone-900">
                        {header.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${getHeaderGroupBadge(
                            header.group
                          )}`}
                        >
                          {header.group}
                        </span>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded uppercase">
                          {header.type}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs text-stone-600 leading-relaxed">
                      {header.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-stone-900 text-stone-100 px-3 py-2 font-mono text-[11px]">
                      <span className="truncate">{header.example}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(header.example, `header-${header.name}`)}
                        className="ml-2 text-stone-400 hover:text-white transition-colors"
                      >
                        {copiedKey === `header-${header.name}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {header.rfc && (
                    <div className="mt-3 pt-2 text-[10px] text-stone-400 font-mono text-right">
                      {header.rfc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {output && output.totalMatches === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center text-xs text-stone-500">
            No matching status codes or headers found for query "{query}".
          </div>
        )}
      </div>
    </div>
  );
}
