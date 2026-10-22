import { useMemo, useState } from 'react';
import { ToolRegistry, jsonFormatterTool } from '@nemokit/core';
import type { ToolMetadata } from '@nemokit/core';
import { JsonFormatterView } from './components/JsonFormatterView.js';
import { Boxes, ShieldCheck, Sparkles, Code2, Search } from 'lucide-react';

export default function App() {
  // Initialize and populate core engine registry
  const registry = useMemo(() => {
    const reg = new ToolRegistry();
    reg.register(jsonFormatterTool);
    return reg;
  }, []);

  const tools: ReadonlyArray<ToolMetadata> = useMemo(() => registry.getAll(), [registry]);
  const [activeToolId, setActiveToolId] = useState<string>('json-formatter');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    const q = searchQuery.toLowerCase();
    return tools.filter(
      t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [tools, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#faf9f6]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs group-hover:bg-stone-800 transition-colors">
                <Boxes className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-stone-900 leading-none">
                  Nemokit
                </span>
                <span className="text-[10px] text-stone-400 font-medium tracking-tight mt-0.5">
                  Utility Platform
                </span>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/60 px-3 py-1 text-xs text-stone-600">
              <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
              <span>Browser-first & Private</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-full border border-stone-200/80 bg-white/70 pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Hero / Banner */}
      <section className="border-b border-stone-200/60 bg-gradient-to-b from-[#f5f3ee] to-[#faf9f6] py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-xs mb-3">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Fast, zero-latency browser tools</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Your tools. One place. No clutter.
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-stone-500">
            Everyday utilities designed with purpose. No ads, no telemetry, and powered by an
            independent client-side engine.
          </p>

          {/* Tool Category Selector */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {filteredTools.map(tool => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveToolId(tool.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  activeToolId === tool.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200/80 text-stone-700 hover:bg-stone-100/70 hover:border-stone-300'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tool Workspace */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {activeToolId === 'json-formatter' ? (
            <JsonFormatterView />
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-sm text-stone-500">
              Tool not selected or under construction.
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200/70 py-6 px-4 sm:px-6 lg:px-8 bg-white/50 text-xs text-stone-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Nemokit. Built with a decoupled browser-first engine.</p>
          <div className="flex items-center gap-4 text-stone-500">
            <span>Light mode only</span>
            <span>•</span>
            <span>No backend required</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
