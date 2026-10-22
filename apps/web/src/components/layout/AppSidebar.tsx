import type { ToolCategory, ToolMetadata } from '@nemokit/core';
import {
  Boxes,
  Home,
  FileCode,
  Binary,
  Globe,
  KeyRound,
  Fingerprint,
  FileKey,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface AppSidebarProps {
  readonly tools: ReadonlyArray<ToolMetadata>;
  readonly activeView: string; // 'home' or toolId
  readonly onSelectView: (viewId: string) => void;
  readonly isMobileOpen: boolean;
  readonly onCloseMobile: () => void;
}

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  formatters: 'Formatters',
  converters: 'Converters',
  crypto: 'Cryptography',
  web: 'Web & URLs',
};

export function AppSidebar({
  tools,
  activeView,
  onSelectView,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const getToolIcon = (id: string) => {
    switch (id) {
      case 'json-formatter':
        return <FileCode className="h-4 w-4" />;
      case 'base64-tool':
        return <Binary className="h-4 w-4" />;
      case 'url-tool':
        return <Globe className="h-4 w-4" />;
      case 'hash-tool':
        return <KeyRound className="h-4 w-4" />;
      case 'uuid-tool':
        return <Fingerprint className="h-4 w-4" />;
      case 'jwt-tool':
        return <FileKey className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const categories: ToolCategory[] = ['formatters', 'converters', 'crypto', 'web'];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200/80 bg-[#fbfbf9] transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-stone-200/60">
          <button
            type="button"
            onClick={() => {
              onSelectView('home');
              onCloseMobile();
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs group-hover:bg-stone-800 transition-colors">
              <Boxes className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-stone-900 leading-none">
                Nemokit
              </span>
              <span className="text-[10px] text-stone-400 font-medium tracking-tight mt-0.5">
                Tool Engine
              </span>
            </div>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Views */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onSelectView('home');
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                activeView === 'home'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Overview & Dashboard</span>
            </button>
          </div>

          {/* Grouped Tools */}
          {categories.map(category => {
            const categoryTools = tools.filter(t => t.category === category);
            if (categoryTools.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  {CATEGORY_LABELS[category]}
                </div>

                {categoryTools.map(tool => {
                  const isActive = activeView === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        onSelectView(tool.id);
                        onCloseMobile();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? 'text-white' : 'text-stone-500'}>
                          {getToolIcon(tool.id)}
                        </span>
                        <span className="truncate">{tool.name}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-stone-400" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-stone-200/60 p-4">
          <div className="flex items-center gap-2 rounded-xl bg-white border border-stone-200/80 p-2.5 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col text-[11px] leading-tight">
              <span className="font-semibold text-stone-800">100% Client-Side</span>
              <span className="text-stone-400">Zero data leaves device</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
