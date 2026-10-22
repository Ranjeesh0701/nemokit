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
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  Clock,
  Scissors,
  AlignLeft,
} from 'lucide-react';

interface AppSidebarProps {
  readonly tools: ReadonlyArray<ToolMetadata>;
  readonly activeView: string; // 'home' or toolId
  readonly onSelectView: (viewId: string) => void;
  readonly isCollapsed: boolean;
  readonly onToggleCollapse: () => void;
  readonly isMobileOpen: boolean;
  readonly onCloseMobile: () => void;
}

const CATEGORY_CONFIG: Record<ToolCategory, { label: string }> = {
  formatters: { label: 'Formatters' },
  converters: { label: 'Converters' },
  pdf: { label: 'PDF Studio' },
  crypto: { label: 'Security' },
  web: { label: 'Web' },
};

export function AppSidebar({
  tools,
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const getToolIcon = (id: string) => {
    switch (id) {
      case 'json-formatter':
        return <FileCode className="h-4 w-4" />;
      case 'sql-formatter':
        return <Database className="h-4 w-4" />;
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
      case 'timestamp-tool':
        return <Clock className="h-4 w-4" />;
      case 'pdf-splitter':
        return <Scissors className="h-4 w-4" />;
      case 'text-splitter':
        return <AlignLeft className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const categories: ToolCategory[] = ['formatters', 'converters', 'pdf', 'crypto', 'web'];

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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-stone-200/80 bg-[#fbfbf9] transition-all duration-200 select-none md:static md:translate-x-0 shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-60'}`}
      >
        {/* Brand & Collapse Header */}
        <div
          className={`flex h-14 items-center border-b border-stone-200/60 ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
          }`}
        >
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => {
                onSelectView('home');
                onCloseMobile();
              }}
              className="flex items-center gap-2.5 text-left group truncate"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white shadow-2xs group-hover:bg-stone-800 transition-colors">
                <Boxes className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-bold tracking-tight text-stone-900 leading-none">
                Nemokit
              </span>
              <span className="rounded bg-stone-200/70 px-1.5 py-0.5 text-[9px] font-semibold text-stone-600">
                v0.1
              </span>
            </button>
          )}

          {/* Collapse/Expand Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-colors"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <div className={`flex-1 overflow-y-auto py-3 space-y-4 ${isCollapsed ? 'px-2' : 'px-2.5'}`}>
          {/* Main Dashboard Link */}
          <div>
            <button
              type="button"
              title={isCollapsed ? 'Overview & Dashboard' : undefined}
              onClick={() => {
                onSelectView('home');
                onCloseMobile();
              }}
              className={`flex w-full items-center rounded-xl text-xs font-medium transition-colors ${
                isCollapsed ? 'justify-center h-9 px-0' : 'gap-2 px-2.5 py-1.5'
              } ${
                activeView === 'home'
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
              }`}
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </div>

          {/* Grouped Tools */}
          {categories.map(category => {
            const categoryTools = tools.filter(t => t.category === category);
            if (categoryTools.length === 0) return null;

            return (
              <div key={category} className="space-y-0.5">
                {isCollapsed ? (
                  <div className="my-1.5 border-t border-stone-200/70" />
                ) : (
                  <div className="flex items-center justify-between px-2.5 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    <span>{CATEGORY_CONFIG[category].label}</span>
                    <span className="text-[9px] font-mono opacity-60">{categoryTools.length}</span>
                  </div>
                )}

                {categoryTools.map(tool => {
                  const isActive = activeView === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      title={isCollapsed ? tool.name : undefined}
                      onClick={() => {
                        onSelectView(tool.id);
                        onCloseMobile();
                      }}
                      className={`flex w-full items-center rounded-xl text-xs font-medium transition-colors ${
                        isCollapsed ? 'justify-center h-9 px-0' : 'justify-between px-2.5 py-1.5'
                      } ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-xs font-semibold'
                          : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`}>
                          {getToolIcon(tool.id)}
                        </span>
                        {!isCollapsed && <span className="truncate">{tool.name}</span>}
                      </div>
                      {!isCollapsed && isActive && (
                        <ChevronRight className="h-3 w-3 text-stone-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className={`border-t border-stone-200/60 ${isCollapsed ? 'p-2' : 'p-2.5'}`}>
          <div
            className={`flex items-center rounded-xl bg-white border border-stone-200/70 shadow-3xs ${
              isCollapsed ? 'justify-center p-2' : 'gap-2 p-2'
            }`}
            title="Private: zero telemetry, 100% in-browser"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col text-[10px] leading-tight truncate">
                <span className="font-semibold text-stone-800">100% Local Execution</span>
                <span className="text-stone-400">No data leaves your device</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
