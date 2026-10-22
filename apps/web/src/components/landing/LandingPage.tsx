import type { ToolMetadata } from '@nemokit/core';
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
} from 'lucide-react';

interface LandingPageProps {
  readonly tools: ReadonlyArray<ToolMetadata>;
  readonly onLaunchApp: (toolId?: string) => void;
}

export function LandingPage({ tools, onLaunchApp }: LandingPageProps) {
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
      default:
        return <Layers className="h-5 w-5 text-stone-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 antialiased selection:bg-stone-200 flex flex-col">
      {/* Public Navigation */}
      <nav className="border-b border-stone-200/70 bg-[#faf9f6]/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-20">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs">
              <Boxes className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-stone-900 leading-none">
                Nemokit
              </span>
              <span className="text-[11px] text-stone-400 font-medium tracking-tight mt-0.5">
                Modern Utility Platform
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#tools" className="hover:text-stone-900 transition-colors">
              Tools
            </a>
            <a href="#architecture" className="hover:text-stone-900 transition-colors">
              Architecture
            </a>
            <a href="#privacy" className="hover:text-stone-900 transition-colors">
              Privacy
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onLaunchApp()}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-all hover:gap-2.5"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden border-b border-stone-200/60 bg-gradient-to-b from-[#f5f3ee] to-[#faf9f6]">
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
          <div className="flex flex-col items-center text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Built for focused work
            </h2>
            <p className="mt-2 text-stone-500 text-sm max-w-xl">
              Each utility features a purpose-built workspace instead of generic auto-generated
              forms. Click any tool to jump straight in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map(tool => (
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

                  <h3 className="mt-5 font-semibold text-base text-stone-900 group-hover:text-stone-950">
                    {tool.name}
                  </h3>
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
      <footer className="mt-auto py-10 px-6 bg-white border-t border-stone-200/70 text-xs text-stone-500">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">Nemokit</span>
            <span>•</span>
            <span>Your tools. One place. No clutter.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onLaunchApp()}
              className="font-medium text-stone-800 hover:text-stone-950 transition-colors"
            >
              Open Web App
            </button>
            <span>Light mode only</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
