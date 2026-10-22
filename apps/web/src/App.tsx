import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import {
  ToolRegistry,
  jsonFormatterTool,
  base64Tool,
  urlTool,
  hashTool,
  uuidTool,
  jwtTool,
  sqlFormatterTool,
  timestampTool,
  pdfSplitTool,
  textSplitTool,
  diffTool,
  passwordTool,
  colorTool,
  cronTool,
  regexTool,
  qrTool,
  pdfMergeTool,
  curlConverterTool,
  dataConverterTool,
  fileHashTool,
  markdownTool,
  chmodTool,
  htmlPreviewTool,
  httpRefTool,
  bgRemoverTool,
  imageRedactorTool,
  imageConverterTool,
  imageToSvgTool,
  faviconTool,
} from '@nemokit/core';
import type { ToolMetadata } from '@nemokit/core';
import { LandingPage } from './components/landing/LandingPage.js';
import { AppSidebar } from './components/layout/AppSidebar.js';
import { AppHeader } from './components/layout/AppHeader.js';
import { CommandPalette } from './components/CommandPalette.js';
import { HomeLandingView } from './components/views/HomeLandingView.js';
import { useToolFavorites } from './hooks/useToolFavorites.js';
import { usePwaInstall } from './hooks/usePwaInstall.js';
import { Check } from 'lucide-react';

// Lazy-loaded tool views for optimal bundle splitting and near-instant initial render
const JsonFormatterView = lazy(() =>
  import('./components/JsonFormatterView.js').then(m => ({ default: m.JsonFormatterView }))
);
const Base64View = lazy(() =>
  import('./components/Base64View.js').then(m => ({ default: m.Base64View }))
);
const UrlToolView = lazy(() =>
  import('./components/UrlToolView.js').then(m => ({ default: m.UrlToolView }))
);
const HashToolView = lazy(() =>
  import('./components/HashToolView.js').then(m => ({ default: m.HashToolView }))
);
const UuidToolView = lazy(() =>
  import('./components/views/UuidToolView.js').then(m => ({ default: m.UuidToolView }))
);
const JwtToolView = lazy(() =>
  import('./components/views/JwtToolView.js').then(m => ({ default: m.JwtToolView }))
);
const SqlFormatterView = lazy(() =>
  import('./components/views/SqlFormatterView.js').then(m => ({ default: m.SqlFormatterView }))
);
const TimestampView = lazy(() =>
  import('./components/views/TimestampView.js').then(m => ({ default: m.TimestampView }))
);
const PdfSplitView = lazy(() =>
  import('./components/views/PdfSplitView.js').then(m => ({ default: m.PdfSplitView }))
);
const TextSplitView = lazy(() =>
  import('./components/views/TextSplitView.js').then(m => ({ default: m.TextSplitView }))
);
const DiffToolView = lazy(() =>
  import('./components/views/DiffToolView.js').then(m => ({ default: m.DiffToolView }))
);
const PasswordToolView = lazy(() =>
  import('./components/views/PasswordToolView.js').then(m => ({ default: m.PasswordToolView }))
);
const ColorToolView = lazy(() =>
  import('./components/views/ColorToolView.js').then(m => ({ default: m.ColorToolView }))
);
const CronToolView = lazy(() =>
  import('./components/views/CronToolView.js').then(m => ({ default: m.CronToolView }))
);
const RegexToolView = lazy(() =>
  import('./components/views/RegexToolView.js').then(m => ({ default: m.RegexToolView }))
);
const QrToolView = lazy(() =>
  import('./components/views/QrToolView.js').then(m => ({ default: m.QrToolView }))
);
const PdfMergeView = lazy(() =>
  import('./components/views/PdfMergeView.js').then(m => ({ default: m.PdfMergeView }))
);
const CurlConverterView = lazy(() =>
  import('./components/views/CurlConverterView.js').then(m => ({ default: m.CurlConverterView }))
);
const DataConverterView = lazy(() =>
  import('./components/views/DataConverterView.js').then(m => ({ default: m.DataConverterView }))
);
const FileHashView = lazy(() =>
  import('./components/views/FileHashView.js').then(m => ({ default: m.FileHashView }))
);
const MarkdownView = lazy(() =>
  import('./components/views/MarkdownView.js').then(m => ({ default: m.MarkdownView }))
);
const ChmodToolView = lazy(() =>
  import('./components/views/ChmodToolView.js').then(m => ({ default: m.ChmodToolView }))
);
const HtmlPreviewView = lazy(() =>
  import('./components/views/HtmlPreviewView.js').then(m => ({ default: m.HtmlPreviewView }))
);
const HttpRefView = lazy(() =>
  import('./components/views/HttpRefView.js').then(m => ({ default: m.HttpRefView }))
);
const BgRemoverView = lazy(() =>
  import('./components/views/BgRemoverView.js').then(m => ({ default: m.BgRemoverView }))
);
const ImageRedactorView = lazy(() =>
  import('./components/views/ImageRedactorView.js').then(m => ({ default: m.ImageRedactorView }))
);
const ImageConverterView = lazy(() =>
  import('./components/views/ImageConverterView.js').then(m => ({ default: m.ImageConverterView }))
);
const ImageToSvgView = lazy(() =>
  import('./components/views/ImageToSvgView.js').then(m => ({ default: m.ImageToSvgView }))
);
const FaviconGeneratorView = lazy(() =>
  import('./components/views/FaviconGeneratorView.js').then(m => ({ default: m.FaviconGeneratorView }))
);

function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className="flex items-center justify-between pb-6 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-stone-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-48 rounded bg-stone-200" />
            <div className="h-3 w-64 rounded bg-stone-100" />
          </div>
        </div>
      </div>
      <div className="h-72 w-full rounded-2xl bg-stone-100/70 border border-stone-200/60" />
    </div>
  );
}

type RouteState = { mode: 'landing' } | { mode: 'app'; activeToolId: string };

export default function App() {
  // Initialize and populate core engine registry with all 21 tools
  const registry = useMemo(() => {
    const reg = new ToolRegistry();
    reg.register(jsonFormatterTool);
    reg.register(sqlFormatterTool);
    reg.register(diffTool);
    reg.register(regexTool);
    reg.register(textSplitTool);
    reg.register(markdownTool);
    reg.register(base64Tool);
    reg.register(jwtTool);
    reg.register(timestampTool);
    reg.register(colorTool);
    reg.register(dataConverterTool);
    reg.register(pdfSplitTool);
    reg.register(pdfMergeTool);
    reg.register(hashTool);
    reg.register(uuidTool);
    reg.register(passwordTool);
    reg.register(fileHashTool);
    reg.register(urlTool);
    reg.register(qrTool);
    reg.register(cronTool);
    reg.register(curlConverterTool);
    reg.register(chmodTool);
    reg.register(htmlPreviewTool);
    reg.register(httpRefTool);
    reg.register(bgRemoverTool);
    reg.register(imageRedactorTool);
    reg.register(imageConverterTool);
    reg.register(imageToSvgTool);
    reg.register(faviconTool);
    return reg;
  }, []);

  const tools: ReadonlyArray<ToolMetadata> = useMemo(() => registry.getAll(), [registry]);

  const parseRouteFromHash = (): RouteState => {
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') {
      return { mode: 'landing' };
    }

    if (hash.startsWith('#/app/')) {
      const raw = hash.replace('#/app/', '').trim();
      const toolId = raw.split('?')[0];
      return { mode: 'app', activeToolId: toolId || 'dashboard' };
    }

    if (hash === '#/app') {
      return { mode: 'app', activeToolId: 'dashboard' };
    }

    if (hash.startsWith('#/tools/')) {
      const raw = hash.replace('#/tools/', '').trim();
      const toolId = raw.split('?')[0];
      return { mode: 'app', activeToolId: toolId || 'dashboard' };
    }

    return { mode: 'landing' };
  };

  const [route, setRoute] = useState<RouteState>(() => parseRouteFromHash());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeToolId = route.mode === 'app' ? route.activeToolId : undefined;
  const { favorites, toggleFavorite, isFavorite, clearAllData } = useToolFavorites(activeToolId);
  const { canInstall, installApp } = usePwaInstall();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // Sync hash changes (browser back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRouteFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global hotkeys: ⌘K, ⌘↵, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // ⌘↵ or Ctrl+↵: Trigger active tool run
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('nemokit:trigger-run'));
        showToast('Triggered tool execution (⌘↵)');
        return;
      }

      // Esc: Return to Dashboard if inside a tool
      if (e.key === 'Escape') {
        if (!isCommandPaletteOpen && activeToolId && activeToolId !== 'dashboard') {
          window.location.hash = '#/app/dashboard';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, activeToolId]);

  const handleLaunchApp = (toolId?: string) => {
    const targetTool = toolId ?? 'json-formatter';
    window.location.hash = `#/app/${targetTool}`;
  };

  const handleSelectView = (viewId: string) => {
    if (viewId === 'home' || viewId === 'dashboard') {
      window.location.hash = '#/app/dashboard';
    } else {
      window.location.hash = `#/app/${viewId}`;
    }
  };

  // If on Landing Page mode, render the dedicated public marketing landing page
  if (route.mode === 'landing') {
    return (
      <LandingPage
        tools={tools}
        onLaunchApp={handleLaunchApp}
        canInstall={canInstall}
        onInstallApp={installApp}
      />
    );
  }

  // Inside the Web App Workspace
  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#faf9f6] text-stone-800 antialiased selection:bg-stone-200">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl border border-stone-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tools={tools}
        onSelectTool={handleSelectView}
        favorites={favorites}
      />

      {/* App Sidebar with Compact Icon Mode & Favorites */}
      <AppSidebar
        tools={tools}
        activeView={activeToolId === 'dashboard' ? 'home' : (activeToolId ?? 'home')}
        onSelectView={handleSelectView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        favorites={favorites}
        onClearAllData={() => {
          clearAllData();
          showToast('Workspace data and favorites reset to default.');
        }}
      />

      {/* Main App Workspace Canvas */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader
          activeView={activeToolId === 'dashboard' ? 'home' : (activeToolId ?? 'home')}
          activeTool={activeTool}
          onSelectView={handleSelectView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isFavorite={activeTool ? isFavorite(activeTool.id) : false}
          onToggleFavorite={toggleFavorite}
          canInstall={canInstall}
          onInstallApp={installApp}
        />

        {/* Scrollable View Area with Suspense Lazy Boundaries */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="w-full flex-1 flex flex-col">
            <Suspense fallback={<ViewSkeleton />}>
              {activeToolId === 'dashboard' && (
                <HomeLandingView
                  tools={tools}
                  onSelectTool={handleSelectView}
                  searchQuery=""
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              )}
              {activeToolId === 'json-formatter' && <JsonFormatterView />}
              {activeToolId === 'sql-formatter' && <SqlFormatterView />}
              {activeToolId === 'diff-tool' && <DiffToolView />}
              {activeToolId === 'regex-tester' && <RegexToolView />}
              {activeToolId === 'text-splitter' && <TextSplitView />}
              {activeToolId === 'markdown-preview' && <MarkdownView />}
              {activeToolId === 'base64-tool' && <Base64View />}
              {activeToolId === 'jwt-tool' && <JwtToolView />}
              {activeToolId === 'timestamp-tool' && <TimestampView />}
              {activeToolId === 'color-tool' && <ColorToolView />}
              {activeToolId === 'data-converter' && <DataConverterView />}
              {activeToolId === 'pdf-splitter' && <PdfSplitView />}
              {activeToolId === 'pdf-merge' && <PdfMergeView />}
              {activeToolId === 'hash-tool' && <HashToolView />}
              {activeToolId === 'uuid-tool' && <UuidToolView />}
              {activeToolId === 'password-tool' && <PasswordToolView />}
              {activeToolId === 'file-checksum' && <FileHashView />}
              {activeToolId === 'url-tool' && <UrlToolView />}
              {activeToolId === 'qr-tool' && <QrToolView />}
              {activeToolId === 'cron-tool' && <CronToolView />}
              {activeToolId === 'curl-converter' && <CurlConverterView />}
              {activeToolId === 'chmod-calculator' && <ChmodToolView />}
              {activeToolId === 'html-preview' && <HtmlPreviewView />}
              {activeToolId === 'http-reference' && <HttpRefView />}
              {activeToolId === 'bg-remover' && <BgRemoverView />}
              {activeToolId === 'image-redactor' && <ImageRedactorView />}
              {activeToolId === 'image-converter' && <ImageConverterView />}
              {activeToolId === 'image-to-svg' && <ImageToSvgView />}
              {activeToolId === 'favicon-generator' && <FaviconGeneratorView />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
