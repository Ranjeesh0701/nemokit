import { useState, useMemo } from 'react';
import type { ToolCategory, ToolMetadata } from '@nemokit/core';
import {
  Boxes,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  FileCode,
  Binary,
  Globe,
  KeyRound,
  Fingerprint,
  FileKey,
  Database,
  Clock,
  FileText,
  Scissors,
  AlignLeft,
  Layers,
  Sparkles,
  Lock,
  GitCompare,
  Palette,
  CalendarClock,
  Search,
  QrCode,
  FilePlus2,
  Terminal,
  RefreshCw,
  FileCheck,
  FileEdit,
  Download,
} from 'lucide-react';

interface LandingPageProps {
  readonly tools: ReadonlyArray<ToolMetadata>;
  readonly onLaunchApp: (toolId?: string) => void;
  readonly canInstall?: boolean;
  readonly onInstallApp?: () => void;
}

const CATEGORY_DETAILS: Record<ToolCategory, { title: string; subtitle: string }> = {
  formatters: {
    title: 'Formatters & Beautifiers',
    subtitle: 'Clean, validate, and restructure source code and structured data.',
  },
  converters: {
    title: 'Converters & Decoders',
    subtitle: 'Transform between data formats, encodings, timestamps, and permissions.',
  },
  crypto: {
    title: 'Cryptography & Security',
    subtitle: 'Generate secure tokens, cryptographically secure IDs, and file checksums.',
  },
  web: {
    title: 'Web & Network Utilities',
    subtitle: 'Inspect URLs, test regexes, generate QR codes, and consult HTTP specs.',
  },
  pdf: {
    title: 'PDF Document Studio',
    subtitle: 'Client-side PDF page extraction, splitting, and merging.',
  },
};

const CATEGORIES_ORDER: ReadonlyArray<ToolCategory> = [
  'formatters',
  'converters',
  'crypto',
  'web',
  'pdf',
];

export function LandingPage({ tools, onLaunchApp, canInstall, onInstallApp }: LandingPageProps) {
  const getToolIcon = (id: string) => {
    switch (id) {
      case 'json-formatter':
        return <FileCode className="h-5 w-5 text-amber-600" />;
      case 'base64-tool':
        return <Binary className="h-5 w-5 text-blue-600" />;
      case 'url-tool':
        return <Globe className="h-5 w-5 text-emerald-600" />;
      case 'hash-tool':
        return <KeyRound className="h-5 w-5 text-purple-600" />;
      case 'uuid-tool':
        return <Fingerprint className="h-5 w-5 text-indigo-600" />;
      case 'jwt-tool':
        return <FileKey className="h-5 w-5 text-rose-600" />;
      case 'sql-formatter':
        return <Database className="h-5 w-5 text-cyan-600" />;
      case 'timestamp-tool':
        return <Clock className="h-5 w-5 text-teal-600" />;
      case 'document-converter':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'pdf-splitter':
        return <Scissors className="h-5 w-5 text-red-600" />;
      case 'text-splitter':
        return <AlignLeft className="h-5 w-5 text-sky-600" />;
      case 'diff-tool':
        return <GitCompare className="h-5 w-5 text-indigo-600" />;
      case 'password-tool':
        return <Lock className="h-5 w-5 text-emerald-600" />;
      case 'color-tool':
        return <Palette className="h-5 w-5 text-pink-600" />;
      case 'cron-tool':
        return <CalendarClock className="h-5 w-5 text-amber-600" />;
      case 'regex-tester':
        return <Search className="h-5 w-5 text-violet-600" />;
      case 'qr-tool':
        return <QrCode className="h-5 w-5 text-teal-600" />;
      case 'pdf-merge':
        return <FilePlus2 className="h-5 w-5 text-rose-600" />;
      case 'curl-converter':
        return <Terminal className="h-5 w-5 text-emerald-600" />;
      case 'data-converter':
        return <RefreshCw className="h-5 w-5 text-indigo-600" />;
      case 'file-checksum':
        return <FileCheck className="h-5 w-5 text-teal-600" />;
      case 'markdown-preview':
        return <FileEdit className="h-5 w-5 text-amber-600" />;
      case 'chmod-calculator':
        return <Lock className="h-5 w-5 text-amber-600" />;
      case 'html-preview':
        return <Code2 className="h-5 w-5 text-orange-600" />;
      case 'http-reference':
        return <Globe className="h-5 w-5 text-cyan-600" />;
      default:
        return <Layers className="h-5 w-5 text-stone-600" />;
    }
  };

  const [activeCategory, setActiveCategory] = useState<'all' | ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [tools, activeCategory, searchQuery]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<ToolCategory, ToolMetadata[]>();
    CATEGORIES_ORDER.forEach(cat => {
      map.set(cat, []);
    });
    filteredTools.forEach(tool => {
      const list = map.get(tool.category) ?? [];
      list.push(tool);
      map.set(tool.category, list);
    });
    return map;
  }, [filteredTools]);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 antialiased selection:bg-stone-200 flex flex-col">
      {/* Public Navigation */}
      <nav className="border-b border-stone-200/70 bg-[#faf9f6]/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-2xs">
              <Boxes className="h-4 w-4" />
            </span>
            <span className="text-base font-bold tracking-tight text-stone-900 leading-none">
              Nemokit
            </span>
            <span className="rounded-md bg-stone-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 leading-none">
              v0.1
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <a href="#tools" className="hover:text-stone-950 transition-colors">
              Tools ({tools.length})
            </a>
            <a href="#architecture" className="hover:text-stone-950 transition-colors">
              Architecture
            </a>
            <a href="#privacy" className="hover:text-stone-950 transition-colors">
              Privacy
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            {canInstall && onInstallApp && (
              <button
                type="button"
                onClick={onInstallApp}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-stone-500" />
                <span>Install</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onLaunchApp()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-colors"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden border-b border-stone-200/60 bg-linear-to-b from-[#f5f3ee] to-[#faf9f6]">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-stone-700 shadow-2xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Browser-first tool engine • Zero telemetry</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
            Your tools. One place. <br />
            <span className="text-stone-400">No clutter.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-stone-600 leading-relaxed">
            Nemokit is a premium, distraction-free utility suite designed for developers, students,
            and creators. Every tool runs locally in your browser with dedicated, thoughtful
            interfaces.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onLaunchApp('json-formatter')}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 transition-all"
            >
              <span>Open Web App</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300/80 bg-white px-6 py-3.5 text-sm font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-400 transition-all"
            >
              Explore Tools ({tools.length})
            </a>
          </div>

          {/* Quick trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% Client-Side</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-600" />
              <span>Instant Local Execution</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-stone-600" />
              <span>No Accounts or Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Showcase Section */}
      <section id="tools" className="py-20 px-6 border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Built for focused work
            </h2>
            <p className="mt-2 text-stone-500 text-sm max-w-xl">
              Each utility features a purpose-built workspace instead of generic auto-generated
              forms. Click any tool to jump straight in.
            </p>
          </div>

          {/* Category Filter Chips & Instant Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
                }`}
              >
                All Tools ({tools.length})
              </button>
              {CATEGORIES_ORDER.map(cat => {
                const count = tools.filter(t => t.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
                    }`}
                  >
                    {CATEGORY_DETAILS[cat].title.split('&')[0]?.trim() || cat} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter tools..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-400 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categorized Tools Sections */}
          <div className="flex flex-col gap-14">
            {CATEGORIES_ORDER.map(category => {
              const categoryTools = groupedByCategory.get(category) ?? [];
              if (categoryTools.length === 0) return null;
              const meta = CATEGORY_DETAILS[category];

              return (
                <div key={category} className="flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200/60 pb-3 gap-1">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-stone-900">
                        {meta.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">{meta.subtitle}</p>
                    </div>
                    <span className="text-xs font-mono font-medium text-stone-400">
                      {categoryTools.length} {categoryTools.length === 1 ? 'tool' : 'tools'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryTools.map(tool => (
                      <div
                        key={tool.id}
                        onClick={() => onLaunchApp(tool.id)}
                        className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs hover:border-stone-400 hover:shadow-md transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-50 border border-stone-100 group-hover:scale-105 transition-transform">
                              {getToolIcon(tool.id)}
                            </span>
                            <span className="rounded-md bg-stone-100 px-2.5 py-0.5 text-[10px] font-medium text-stone-600 uppercase tracking-wider">
                              {tool.category}
                            </span>
                          </div>

                          <h4 className="mt-5 font-semibold text-base text-stone-900 group-hover:text-stone-950">
                            {tool.name}
                          </h4>
                          <p className="mt-1.5 text-xs text-stone-500 leading-relaxed line-clamp-2">
                            {tool.description}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-stone-800 group-hover:text-stone-950">
                          <span>Launch tool workspace</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredTools.length === 0 && (
              <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center text-xs text-stone-500">
                No tools found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section
        id="architecture"
        className="py-20 px-6 border-b border-stone-200/60 bg-[#f7f6f2]/50"
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Engine Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                A decoupled engine behind every operation
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Most tool websites stitch together ad-heavy pages with arbitrary backend scripts.
                Nemokit is architected as an independent, typed TypeScript engine (`@nemokit/core`)
                that compiles separately from the React user interface.
              </p>

              <div className="pt-2 space-y-2.5 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                  <span>Strict type contracts for every input and output</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                  <span>Sub-millisecond execution times directly in memory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                  <span>Extensible registry ready for local and future remote runners</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs font-mono text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 text-stone-400 text-[11px]">
                <Code2 className="h-3.5 w-3.5" />
                <span>engine-contract.ts</span>
              </div>
              <pre className="mt-3 text-stone-700 leading-relaxed overflow-x-auto">
                {`const registry = new ToolRegistry();
registry.register(jsonFormatterTool);

// Fully typed execution without React:
const result = await tool.execute({
  raw: '{"platform": "Nemokit"}',
  indent: 2,
});

if (result.success) {
  // result.data is strictly typed
  console.log(result.data.formatted);
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Pledge Section */}
      <section id="privacy" className="py-20 px-6 border-b border-stone-200/60">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-stone-100 text-stone-900 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Your data never leaves your machine
          </h2>
          <p className="mt-3 text-stone-600 text-sm max-w-xl mx-auto leading-relaxed">
            Tokens, secrets, API payloads, and private URLs should never be sent to third-party
            servers just to format or inspect them. Nemokit processes everything using standard
            browser APIs (Web Crypto, TextEncoder, URL).
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => onLaunchApp()}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-all"
            >
              <span>Start Using Nemokit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="mt-auto border-t border-stone-200/70 bg-[#f7f6f2]/80 px-6 pt-12 pb-8 text-xs text-stone-600">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-10 border-b border-stone-200/60">
            {/* Left brand column */}
            <div className="flex flex-col items-start gap-3 max-w-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-white shadow-2xs">
                  <Boxes className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-bold tracking-tight text-stone-900">Nemokit</span>
                <span className="rounded bg-stone-200/60 px-1.5 py-0.5 text-[9px] font-semibold text-stone-600">
                  v0.1
                </span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed">
                Privacy-first developer utilities running 100% locally in your browser memory.
                No servers, no tracking, and zero latency.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  100% Client-Side
                </span>
                <span>•</span>
                <span>Zero Telemetry</span>
              </div>
            </div>

            {/* Right link columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
              <div>
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] block mb-3">
                  Categories
                </span>
                <ul className="space-y-2 text-stone-500">
                  <li>
                    <a
                      href="#tools"
                      onClick={() => setActiveCategory('formatters')}
                      className="hover:text-stone-900 transition-colors"
                    >
                      Formatters
                    </a>
                  </li>
                  <li>
                    <a
                      href="#tools"
                      onClick={() => setActiveCategory('converters')}
                      className="hover:text-stone-900 transition-colors"
                    >
                      Converters
                    </a>
                  </li>
                  <li>
                    <a
                      href="#tools"
                      onClick={() => setActiveCategory('crypto')}
                      className="hover:text-stone-900 transition-colors"
                    >
                      Cryptography
                    </a>
                  </li>
                  <li>
                    <a
                      href="#tools"
                      onClick={() => setActiveCategory('web')}
                      className="hover:text-stone-900 transition-colors"
                    >
                      Web & Network
                    </a>
                  </li>
                  <li>
                    <a
                      href="#tools"
                      onClick={() => setActiveCategory('pdf')}
                      className="hover:text-stone-900 transition-colors"
                    >
                      PDF Studio
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] block mb-3">
                  Platform
                </span>
                <ul className="space-y-2 text-stone-500">
                  <li>
                    <a href="#architecture" className="hover:text-stone-900 transition-colors">
                      Engine Architecture
                    </a>
                  </li>
                  <li>
                    <a href="#privacy" className="hover:text-stone-900 transition-colors">
                      Privacy Principle
                    </a>
                  </li>
                  <li>
                    <span className="text-stone-400">PWA Offline Enabled</span>
                  </li>
                  <li>
                    <span className="text-stone-400">Command Palette (⌘K)</span>
                  </li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] block mb-3">
                  Quick Access
                </span>
                <button
                  type="button"
                  onClick={() => onLaunchApp('json-formatter')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition-all"
                >
                  <span>Open Web App</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Status */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
            <p>© {new Date().getFullYear()} Nemokit. Engineered for distraction-free work.</p>
            <div className="flex items-center gap-4 text-stone-400 text-[11px]">
              <span>Client memory execution</span>
              <span>•</span>
              <span>Open web standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
