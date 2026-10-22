import { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  Clock,
  Scissors,
  AlignLeft,
  GitCompare,
  Lock,
  Palette,
  CalendarClock,
  ArrowRightLeft,
  Search,
  QrCode,
  FilePlus2,
  Terminal,
  Star,
  FileCheck,
  FileEdit,
  RefreshCw,
  RotateCcw,
  Code2,
} from 'lucide-react';

interface AppSidebarProps {
  readonly tools: ReadonlyArray<ToolMetadata>;
  readonly activeView: string; // 'home' or toolId
  readonly onSelectView: (viewId: string) => void;
  readonly isCollapsed: boolean;
  readonly onToggleCollapse: () => void;
  readonly isMobileOpen: boolean;
  readonly onCloseMobile: () => void;
  readonly favorites?: ReadonlyArray<string>;
  readonly onClearAllData?: () => void;
}

type SidebarCategory = 'favorites' | ToolCategory;

interface CategoryConfig {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_CONFIG: Record<ToolCategory, CategoryConfig> = {
  formatters: { label: 'Formatters', icon: FileCode },
  converters: { label: 'Converters', icon: ArrowRightLeft },
  pdf: { label: 'PDF Studio', icon: Scissors },
  crypto: { label: 'Security', icon: Lock },
  web: { label: 'Web', icon: Globe },
};

export function AppSidebar({
  tools,
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  favorites = [],
  onClearAllData,
}: AppSidebarProps) {
  const favoriteTools = tools.filter(t => favorites.includes(t.id));

  // Accordion state: by default, all categories are expanded
  const [openCategories, setOpenCategories] = useState<Set<SidebarCategory>>(
    () =>
      new Set<SidebarCategory>(['favorites', 'formatters', 'converters', 'pdf', 'crypto', 'web'])
  );

  // Popover state for compact mode when hovering over a category icon
  const [popoverCategory, setPopoverCategory] = useState<SidebarCategory | null>(null);
  const popoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = (category: SidebarCategory) => {
    if (popoverTimeoutRef.current !== null) {
      window.clearTimeout(popoverTimeoutRef.current);
      popoverTimeoutRef.current = null;
    }
    setPopoverCategory(category);
  };

  const handleMouseLeave = () => {
    if (popoverTimeoutRef.current !== null) {
      window.clearTimeout(popoverTimeoutRef.current);
    }
    popoverTimeoutRef.current = window.setTimeout(() => {
      setPopoverCategory(null);
      popoverTimeoutRef.current = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (popoverTimeoutRef.current !== null) {
        window.clearTimeout(popoverTimeoutRef.current);
      }
    };
  }, []);

  const activeTool = tools.find(t => t.id === activeView);

  // Auto-expand category containing active tool if it was closed
  useEffect(() => {
    if (activeTool) {
      setOpenCategories(prev => {
        if (prev.has(activeTool.category)) return prev;
        const next = new Set(prev);
        next.add(activeTool.category);
        return next;
      });
    }
  }, [activeTool]);

  const toggleCategory = (category: SidebarCategory) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

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
      case 'diff-tool':
        return <GitCompare className="h-4 w-4" />;
      case 'password-tool':
        return <Lock className="h-4 w-4" />;
      case 'color-tool':
        return <Palette className="h-4 w-4" />;
      case 'cron-tool':
        return <CalendarClock className="h-4 w-4" />;
      case 'regex-tester':
        return <Search className="h-4 w-4" />;
      case 'qr-tool':
        return <QrCode className="h-4 w-4" />;
      case 'pdf-merge':
        return <FilePlus2 className="h-4 w-4" />;
      case 'curl-converter':
        return <Terminal className="h-4 w-4" />;
      case 'data-converter':
        return <RefreshCw className="h-4 w-4" />;
      case 'file-checksum':
        return <FileCheck className="h-4 w-4" />;
      case 'markdown-preview':
        return <FileEdit className="h-4 w-4" />;
      case 'chmod-calculator':
        return <Lock className="h-4 w-4" />;
      case 'html-preview':
        return <Code2 className="h-4 w-4" />;
      case 'http-reference':
        return <Globe className="h-4 w-4" />;
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
            onClick={() => {
              setPopoverCategory(null);
              onToggleCollapse();
            }}
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

        {/* Navigation Content */}
        <div
          className={`flex-1 py-3 space-y-3 ${
            isCollapsed ? 'px-2 overflow-visible' : 'px-2.5 overflow-y-auto'
          }`}
        >
          {/* Main Dashboard Link */}
          <div>
            <button
              type="button"
              title={isCollapsed ? 'Overview & Dashboard' : undefined}
              onClick={() => {
                onSelectView('home');
                onCloseMobile();
                setPopoverCategory(null);
              }}
              className={`flex w-full items-center rounded-xl text-xs font-medium transition-colors ${
                isCollapsed ? 'justify-center h-10 px-0' : 'gap-2 px-2.5 py-1.5'
              } ${
                activeView === 'home'
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
              }`}
            >
              <Home className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </div>

          {/* Compact Mode: Icon-Only for Categories with Popover Flyout */}
          {isCollapsed ? (
            <div className="space-y-2 pt-1 border-t border-stone-200/70">
              {/* Favorites Category in Compact Mode */}
              {favoriteTools.length > 0 && (
                <div
                  key="favorites"
                  className="relative flex justify-center"
                  onMouseEnter={() => handleMouseEnter('favorites')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    title={`Favorites (${favoriteTools.length} tools)`}
                    onClick={() => {
                      if (favoriteTools[0]) {
                        onSelectView(favoriteTools[0].id);
                        setPopoverCategory(null);
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-500 hover:bg-amber-50 transition-all"
                  >
                    <Star className="h-4 w-4 fill-amber-400" />
                  </button>

                  {/* Popover Flyout */}
                  {popoverCategory === 'favorites' && (
                    <div
                      className="absolute left-full top-0 z-50 -ml-1 pl-3"
                      onMouseEnter={() => handleMouseEnter('favorites')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-56 rounded-xl border border-stone-200/90 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                        <div className="flex items-center justify-between px-2.5 py-1.5 pb-1 border-b border-stone-100 mb-1">
                          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                            <Star className="h-3 w-3 fill-amber-400" />
                            Favorites
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                            {favoriteTools.length}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {favoriteTools.map(tool => {
                            const isActive = activeView === tool.id;
                            return (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => {
                                  onSelectView(tool.id);
                                  setPopoverCategory(null);
                                }}
                                className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  isActive
                                    ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    className={`shrink-0 ${
                                      isActive ? 'text-white' : 'text-stone-400'
                                    }`}
                                  >
                                    {getToolIcon(tool.id)}
                                  </span>
                                  <span className="truncate">{tool.name}</span>
                                </div>
                                {isActive && (
                                  <ChevronRight className="h-3 w-3 text-stone-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {categories.map(category => {
                const categoryTools = tools.filter(t => t.category === category);
                if (categoryTools.length === 0) return null;
                const isCategoryActive = activeTool?.category === category;
                const config = CATEGORY_CONFIG[category];
                const CategoryIcon = config.icon;
                const isPopoverOpen = popoverCategory === category;

                return (
                  <div
                    key={category}
                    className="relative flex justify-center"
                    onMouseEnter={() => handleMouseEnter(category)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      title={`${config.label} (${categoryTools.length} tools)`}
                      onClick={() => {
                        // Navigate to active tool in this category or the first one
                        const targetTool = isCategoryActive ? activeView : categoryTools[0]?.id;
                        if (targetTool) {
                          onSelectView(targetTool);
                          setPopoverCategory(null);
                        }
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                        isCategoryActive
                          ? 'bg-stone-900 text-white shadow-xs font-semibold'
                          : 'text-stone-500 hover:bg-stone-200/70 hover:text-stone-900'
                      }`}
                    >
                      <CategoryIcon className="h-4 w-4" />
                    </button>

                    {/* Compact Mode Floating Flyout with Zero-Gap Bridge */}
                    {isPopoverOpen && (
                      <div
                        className="absolute left-full top-0 z-50 -ml-1 pl-3"
                        onMouseEnter={() => handleMouseEnter(category)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="w-56 rounded-xl border border-stone-200/90 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                          <div className="flex items-center justify-between px-2.5 py-1.5 pb-1 border-b border-stone-100 mb-1">
                            <span className="text-xs font-semibold text-stone-800">
                              {config.label}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                              {categoryTools.length}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            {categoryTools.map(tool => {
                              const isActive = activeView === tool.id;
                              return (
                                <button
                                  key={tool.id}
                                  type="button"
                                  onClick={() => {
                                    onSelectView(tool.id);
                                    setPopoverCategory(null);
                                  }}
                                  className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isActive
                                      ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span
                                      className={`shrink-0 ${
                                        isActive ? 'text-white' : 'text-stone-400'
                                      }`}
                                    >
                                      {getToolIcon(tool.id)}
                                    </span>
                                    <span className="truncate">{tool.name}</span>
                                  </div>
                                  {isActive && (
                                    <ChevronRight className="h-3 w-3 text-stone-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Normal Mode: Category Accordions */
            <div className="space-y-1 pt-1 border-t border-stone-200/50">
              {/* Favorites Accordion Category */}
              {favoriteTools.length > 0 && (
                <div key="favorites" className="rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategory('favorites')}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-200/30 hover:text-stone-900 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Star className="h-3.5 w-3.5 shrink-0 text-amber-500 fill-amber-400" />
                      <span className="truncate">Favorites</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                        {favoriteTools.length}
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-200 ${
                          openCategories.has('favorites') ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {openCategories.has('favorites') && (
                    <div className="mt-0.5 mb-1 pl-3 space-y-0.5 border-l border-stone-200/70 ml-3.5">
                      {favoriteTools.map(tool => {
                        const isActive = activeView === tool.id;
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => {
                              onSelectView(tool.id);
                              onCloseMobile();
                            }}
                            className={`flex w-full items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-stone-900 text-white shadow-xs font-semibold'
                                : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`}
                              >
                                {getToolIcon(tool.id)}
                              </span>
                              <span className="truncate">{tool.name}</span>
                            </div>
                            {isActive && (
                              <ChevronRight className="h-3 w-3 text-stone-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {categories.map(category => {
                const categoryTools = tools.filter(t => t.category === category);
                if (categoryTools.length === 0) return null;

                const isOpen = openCategories.has(category);
                const isCategoryActive = activeTool?.category === category;
                const config = CATEGORY_CONFIG[category];
                const CategoryIcon = config.icon;

                return (
                  <div key={category} className="rounded-xl overflow-hidden">
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isCategoryActive
                          ? 'text-stone-900 bg-stone-200/40'
                          : 'text-stone-600 hover:bg-stone-200/30 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CategoryIcon
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isCategoryActive ? 'text-stone-900' : 'text-stone-400'
                          }`}
                        />
                        <span className="truncate">{config.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          {categoryTools.length}
                        </span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Accordion Body: Tools in this Category */}
                    {isOpen && (
                      <div className="mt-0.5 mb-1 pl-3 space-y-0.5 border-l border-stone-200/70 ml-3.5">
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
                              className={`flex w-full items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isActive
                                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                                  : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className={`shrink-0 ${
                                    isActive ? 'text-white' : 'text-stone-400'
                                  }`}
                                >
                                  {getToolIcon(tool.id)}
                                </span>
                                <span className="truncate">{tool.name}</span>
                              </div>
                              {isActive && (
                                <ChevronRight className="h-3 w-3 text-stone-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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

          {!isCollapsed && onClearAllData && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset local workspace? This will clear pinned favorites and all locally stored session data.'
                  )
                ) {
                  onClearAllData();
                }
              }}
              className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-1 text-[10px] font-medium text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
              title="Clear all stored favorites and local session history"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Local Workspace</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
