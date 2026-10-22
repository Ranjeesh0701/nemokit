import type { ToolMetadata } from '@nemokit/core';
import { Menu, Search, Home, Star } from 'lucide-react';

interface AppHeaderProps {
  readonly activeView: string;
  readonly activeTool?: ToolMetadata;
  readonly onSelectView: (view: string) => void;
  readonly onOpenMobileSidebar: () => void;
  readonly onOpenCommandPalette: () => void;
  readonly isFavorite?: boolean;
  readonly onToggleFavorite?: (toolId: string) => void;
}

export function AppHeader({
  activeView,
  activeTool,
  onSelectView,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  isFavorite,
  onToggleFavorite,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md select-none shrink-0">
      {/* Left: Mobile hamburger & Active Tool Title */}
      <div className="flex items-center gap-3 truncate">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 shadow-2xs md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        {activeView === 'home' || !activeTool ? (
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-900 text-white">
              <Home className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold text-stone-900 tracking-tight">
              Overview & Dashboard
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 truncate">
            <button
              type="button"
              onClick={() => onSelectView('home')}
              className="text-stone-400 hover:text-stone-700 transition-colors hidden sm:flex items-center"
              title="Return to Dashboard"
            >
              <Home className="h-4 w-4" />
            </button>
            <span className="text-stone-300 hidden sm:inline">/</span>
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 uppercase tracking-wider hidden sm:inline">
              {activeTool.category}
            </span>
            <h1 className="text-sm font-bold text-stone-900 tracking-tight truncate">
              {activeTool.name}
            </h1>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(activeTool.id)}
                title={isFavorite ? 'Remove from favorites' : 'Pin to favorites'}
                className={`p-1 rounded-lg transition-colors shrink-0 ${
                  isFavorite
                    ? 'text-amber-500 hover:bg-amber-50'
                    : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Center/Right: Command Palette Launcher Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="inline-flex items-center gap-2.5 rounded-xl border border-stone-200/90 bg-[#faf9f6] px-3 py-1.5 text-xs text-stone-500 hover:border-stone-300 hover:bg-stone-100 transition-all shadow-2xs group"
        >
          <Search className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
          <span className="hidden sm:inline">Jump to tool...</span>
          <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-3xs">
            ⌘K
          </kbd>
        </button>

        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
          <span>Run:</span>
          <kbd className="rounded border border-stone-200 bg-white px-1 py-0.5 text-[10px] text-stone-600">
            ⌘↵
          </kbd>
        </div>
      </div>
    </header>
  );
}
