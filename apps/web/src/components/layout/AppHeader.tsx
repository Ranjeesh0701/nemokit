import type { ToolMetadata } from '@nemokit/core';
import { Menu, Search, ChevronRight, Home } from 'lucide-react';

interface AppHeaderProps {
  readonly activeView: string;
  readonly activeTool?: ToolMetadata;
  readonly onSelectView: (view: string) => void;
  readonly onOpenMobileSidebar: () => void;
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
}

export function AppHeader({
  activeView,
  activeTool,
  onSelectView,
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200/70 bg-[#faf9f6]/85 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-xs md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => onSelectView('home')}
            className={`inline-flex items-center gap-1 font-medium transition-colors ${
              activeView === 'home'
                ? 'text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>

          {activeTool && (
            <>
              <ChevronRight className="h-3 w-3 text-stone-300" />
              <span className="text-stone-400 capitalize hidden sm:inline">
                {activeTool.category}
              </span>
              <ChevronRight className="h-3 w-3 text-stone-300 hidden sm:inline" />
              <span className="font-semibold text-stone-900">{activeTool.name}</span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Search Input */}
      <div className="relative w-40 sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Filter tools..."
          className="w-full rounded-full border border-stone-200/80 bg-white/70 pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
        />
      </div>
    </header>
  );
}
