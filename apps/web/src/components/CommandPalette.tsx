import { useEffect, useState, useMemo, useRef } from 'react';
import type { ToolMetadata } from '@nemokit/core';
import {
  Search,
  FileCode,
  Binary,
  Globe,
  KeyRound,
  Fingerprint,
  FileKey,
  Database,
  Clock,
  Scissors,
  AlignLeft,
  GitCompare,
  Lock,
  Palette,
  CalendarClock,
  QrCode,
  FilePlus2,
  Terminal,
  Star,
  FileCheck,
  FileEdit,
  RefreshCw,
  Layers,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly tools: ReadonlyArray<ToolMetadata>;
  readonly onSelectTool: (toolId: string) => void;
  readonly favorites?: ReadonlyArray<string>;
}

export function CommandPalette({
  isOpen,
  onClose,
  tools,
  onSelectTool,
  favorites = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Sort favorites to top when query is empty
      return [...tools].sort((a, b) => {
        const aFav = favorites.includes(a.id) ? 1 : 0;
        const bFav = favorites.includes(b.id) ? 1 : 0;
        return bFav - aFav;
      });
    }
    const q = query.toLowerCase();
    return tools.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [tools, query, favorites]);

  // Auto-scroll the active item into view when navigating via keyboard
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeElement = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(filtered.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          onSelectTool(selected.id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onSelectTool, onClose]);

  // Reset selected index and scroll position on query change
  useEffect(() => {
    setSelectedIndex(0);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [query]);

  if (!isOpen) return null;

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
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-stone-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-stone-200/90 bg-white shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100">
          <Search className="h-4 w-4 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a tool name or category..."
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate pr-3">
                    <span className={isSelected ? 'text-white' : 'text-stone-500'}>
                      {getToolIcon(tool.id)}
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold truncate">{tool.name}</span>
                      <span
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-stone-300' : 'text-stone-400'
                        }`}
                      >
                        {tool.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {favorites.includes(tool.id) && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                        isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {tool.category}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-stone-400">
              No matching tools found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-stone-100 bg-stone-50/60 text-[11px] text-stone-400 select-none">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-stone-200 bg-white px-1 py-0.5 font-mono text-[10px] text-stone-600">
                ↑
              </kbd>{' '}
              <kbd className="rounded border border-stone-200 bg-white px-1 py-0.5 font-mono text-[10px] text-stone-600">
                ↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
                ↵
              </kbd>{' '}
              Open
            </span>
          </div>
          <span>
            <kbd className="rounded border border-stone-200 bg-white px-1 py-0.5 font-mono text-[10px] text-stone-600">
              Esc
            </kbd>{' '}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
