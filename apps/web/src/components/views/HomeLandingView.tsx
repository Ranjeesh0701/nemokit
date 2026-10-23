import { useMemo } from 'react';
import type { ToolCategory, ToolMetadata } from '@nemokit/core';
import {
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
  GitCompare,
  Lock,
  Palette,
  CalendarClock,
  Search,
  QrCode,
  FilePlus2,
  Terminal,
  Star,
  FileCheck,
  FileEdit,
  RefreshCw,
  Code2,
  Image as ImageIcon,
  EyeOff,
  Scale,
  ShieldCheck,
  Zap,
  Cpu,
  ArrowRight,
  Layers,
  Sparkles,
  Shapes,
  FileCheck2,
  Grid,
  Bot,
} from 'lucide-react';

interface HomeLandingViewProps {
  readonly tools: ReadonlyArray<ToolMetadata>;
  readonly onSelectTool: (toolId: string) => void;
  readonly searchQuery: string;
  readonly favorites?: ReadonlyArray<string>;
  readonly onToggleFavorite?: (toolId: string) => void;
}

const CATEGORY_TITLES: Record<ToolCategory, { title: string; subtitle: string }> = {
  formatters: {
    title: 'Formatters & Beautifiers',
    subtitle: 'Clean, validate, and structure your code and data.',
  },
  converters: {
    title: 'Converters & Decoders',
    subtitle: 'Transform between formats, encodings, and tokens.',
  },
  images: {
    title: 'Image Studio',
    subtitle: 'Client-side background removal, privacy redaction, and image compression.',
  },
  crypto: {
    title: 'Cryptography & Identifiers',
    subtitle: 'Generate secure tokens, UUIDs, and hardware-accelerated hashes.',
  },
  web: {
    title: 'Web & Network Utilities',
    subtitle: 'Parse URLs, inspect query strings, and handle URI encodings.',
  },
  pdf: {
    title: 'PDF & Document Studio',
    subtitle: 'Split, extract, and convert PDF pages and documents client-side.',
  },
};

export function HomeLandingView({
  tools,
  onSelectTool,
  searchQuery,
  favorites = [],
}: HomeLandingViewProps) {
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
      case 'bg-remover':
        return <ImageIcon className="h-5 w-5 text-violet-600" />;
      case 'image-redactor':
        return <EyeOff className="h-5 w-5 text-rose-600" />;
      case 'image-converter':
        return <Scale className="h-5 w-5 text-indigo-600" />;
      case 'image-to-svg':
        return <Sparkles className="h-5 w-5 text-amber-600" />;
      case 'favicon-generator':
        return <Globe className="h-5 w-5 text-teal-600" />;
      case 'svg-optimizer':
        return <Sparkles className="h-5 w-5 text-emerald-600" />;
      case 'json-schema':
        return <FileCheck2 className="h-5 w-5 text-indigo-600" />;
      case 'logo-builder':
        return <Shapes className="h-5 w-5 text-purple-600" />;
      case 'pattern-generator':
        return <Grid className="h-5 w-5 text-fuchsia-600" />;
      case 'random-svg':
        return <Sparkles className="h-5 w-5 text-pink-600" />;
      default:
        return <Layers className="h-5 w-5 text-stone-600" />;
    }
  };

  const groupedTools = useMemo(() => {
    const map = new Map<ToolCategory, ToolMetadata[]>();
    for (const tool of tools) {
      if (
        searchQuery &&
        !tool.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        continue;
      }
      const list = map.get(tool.category) ?? [];
      list.push(tool);
      map.set(tool.category, list);
    }
    return map;
  }, [tools, searchQuery]);

  return (
    <div className="flex flex-col gap-12 w-full pb-8">
      {/* Hero Section */}
      <div className="flex flex-col items-start gap-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-3 py-1 text-xs font-medium text-stone-600 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Nemokit 0.1 • Browser-First Utility Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
          Your tools. One place. <br />
          <span className="text-stone-400">No clutter.</span>
        </h1>

        <p className="max-w-2xl text-base text-stone-600 leading-relaxed">
          A modern, focused utility platform with dedicated workspaces for your everyday workflows.
          Engineered to run 100% in your browser with zero network lag and strict privacy.
        </p>

        {/* Feature Highlights */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-stone-900">Zero Latency</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Every calculation executes instantly in memory on your device.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-stone-900">Private by Design</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Zero tracking, no backend servers, your data never leaves the browser.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800">
              <Cpu className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-stone-900">Decoupled Engine</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Built on an independent TypeScript library engine for clean reliability.
              </p>
            </div>
          </div>
        </div>

        {/* MCP Spotlight Banner */}
        <div className="mt-2 w-full rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  NEW • Protocol v1.0
                </span>
                <span className="text-xs font-semibold text-stone-900">
                  Model Context Protocol (MCP) Server
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 max-w-xl">
                All 26 Nemokit developer tools can now be used as local stdio tools directly inside
                Claude Desktop, Cursor, Zed, and Cline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectTool('mcp-server')}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors shrink-0"
          >
            <span>Explore MCP Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Categorized Tools Directory */}
      <div className="flex flex-col gap-10">
        {(['formatters', 'converters', 'images', 'pdf', 'crypto', 'web'] as const).map(category => {
          const categoryTools = groupedTools.get(category) ?? [];
          if (categoryTools.length === 0) return null;
          const meta = CATEGORY_TITLES[category];

          return (
            <div key={category} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                  {meta.title}
                </h2>
                <p className="text-xs text-stone-500">{meta.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTools.map(tool => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onSelectTool(tool.id)}
                    className="group flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-left shadow-xs hover:border-stone-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 border border-stone-100 group-hover:scale-105 transition-transform">
                          {getToolIcon(tool.id)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {favorites?.includes(tool.id) && (
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          )}
                          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 capitalize">
                            {tool.category}
                          </span>
                        </div>
                      </div>

                      <h3 className="mt-4 font-semibold text-sm text-stone-900 group-hover:text-stone-950">
                        {tool.name}
                      </h3>
                      <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-stone-700 group-hover:text-stone-900">
                      <span>Open tool</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Planned Roadmap & Ideas */}
      <div className="rounded-2xl border border-stone-200/80 bg-[#f5f3ee]/50 p-6">
        <h3 className="text-sm font-semibold text-stone-900">Explore Ideas & Planned Extensions</h3>
        <p className="mt-1 text-xs text-stone-500">
          Nemokit's decoupled engine can host tools across multiple domains:
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-stone-200/60 bg-white p-3">
            <span className="font-semibold text-stone-800">Formatters</span>
            <p className="mt-1 text-stone-500 text-[11px]">SQL, HTML/XML, Markdown Prettier</p>
          </div>
          <div className="rounded-xl border border-stone-200/60 bg-white p-3">
            <span className="font-semibold text-stone-800">Converters</span>
            <p className="mt-1 text-stone-500 text-[11px]">
              Hex/Binary, Epoch Timestamp, Color HEX/RGB
            </p>
          </div>
          <div className="rounded-xl border border-stone-200/60 bg-white p-3">
            <span className="font-semibold text-stone-800">Cryptography</span>
            <p className="mt-1 text-stone-500 text-[11px]">HMAC Signer, Password Entropy, ULID</p>
          </div>
          <div className="rounded-xl border border-stone-200/60 bg-white p-3">
            <span className="font-semibold text-stone-800">Web & Network</span>
            <p className="mt-1 text-stone-500 text-[11px]">
              Curl to Fetch, User-Agent, HTTP Status Codes
            </p>
          </div>
        </div>
      </div>

      {/* Guaranteed Bottom Spacing Spacer matching other screens */}
      <div className="h-12 sm:h-16 shrink-0 w-full" aria-hidden="true" />
    </div>
  );
}
