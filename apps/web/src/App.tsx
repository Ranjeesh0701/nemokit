import { useEffect, useMemo, useState } from 'react';
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
} from '@nemokit/core';
import type { ToolMetadata } from '@nemokit/core';
import { LandingPage } from './components/landing/LandingPage.js';
import { AppSidebar } from './components/layout/AppSidebar.js';
import { AppHeader } from './components/layout/AppHeader.js';
import { CommandPalette } from './components/CommandPalette.js';
import { HomeLandingView } from './components/views/HomeLandingView.js';
import { JsonFormatterView } from './components/JsonFormatterView.js';
import { Base64View } from './components/Base64View.js';
import { UrlToolView } from './components/UrlToolView.js';
import { HashToolView } from './components/HashToolView.js';
import { UuidToolView } from './components/views/UuidToolView.js';
import { JwtToolView } from './components/views/JwtToolView.js';
import { SqlFormatterView } from './components/views/SqlFormatterView.js';
import { TimestampView } from './components/views/TimestampView.js';
import { PdfSplitView } from './components/views/PdfSplitView.js';
import { TextSplitView } from './components/views/TextSplitView.js';
import { DiffToolView } from './components/views/DiffToolView.js';
import { PasswordToolView } from './components/views/PasswordToolView.js';
import { ColorToolView } from './components/views/ColorToolView.js';
import { CronToolView } from './components/views/CronToolView.js';

type RouteState = { mode: 'landing' } | { mode: 'app'; activeToolId: string };

export default function App() {
  // Initialize and populate core engine registry with all tools
  const registry = useMemo(() => {
    const reg = new ToolRegistry();
    reg.register(jsonFormatterTool);
    reg.register(sqlFormatterTool);
    reg.register(diffTool);
    reg.register(textSplitTool);
    reg.register(base64Tool);
    reg.register(jwtTool);
    reg.register(timestampTool);
    reg.register(colorTool);
    reg.register(pdfSplitTool);
    reg.register(hashTool);
    reg.register(uuidTool);
    reg.register(passwordTool);
    reg.register(urlTool);
    reg.register(cronTool);
    return reg;
  }, []);

  const tools: ReadonlyArray<ToolMetadata> = useMemo(() => registry.getAll(), [registry]);

  const parseRouteFromHash = (): RouteState => {
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') {
      return { mode: 'landing' };
    }

    if (hash.startsWith('#/app/')) {
      const toolId = hash.replace('#/app/', '').trim();
      return { mode: 'app', activeToolId: toolId || 'dashboard' };
    }

    if (hash === '#/app') {
      return { mode: 'app', activeToolId: 'dashboard' };
    }

    if (hash.startsWith('#/tools/')) {
      const toolId = hash.replace('#/tools/', '').trim();
      return { mode: 'app', activeToolId: toolId || 'dashboard' };
    }

    return { mode: 'landing' };
  };

  const [route, setRoute] = useState<RouteState>(() => parseRouteFromHash());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Sync hash changes (browser back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRouteFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global shortcut: ⌘K or Ctrl+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    return <LandingPage tools={tools} onLaunchApp={handleLaunchApp} />;
  }

  // Inside the Web App Workspace
  const activeToolId = route.activeToolId;
  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#faf9f6] text-stone-800 antialiased selection:bg-stone-200">
      {/* Global ⌘K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tools={tools}
        onSelectTool={handleSelectView}
      />

      {/* App Sidebar with Compact Icon Mode */}
      <AppSidebar
        tools={tools}
        activeView={activeToolId === 'dashboard' ? 'home' : activeToolId}
        onSelectView={handleSelectView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Workspace Canvas */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader
          activeView={activeToolId === 'dashboard' ? 'home' : activeToolId}
          activeTool={activeTool}
          onSelectView={handleSelectView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            {activeToolId === 'dashboard' && (
              <HomeLandingView tools={tools} onSelectTool={handleSelectView} searchQuery="" />
            )}
            {activeToolId === 'json-formatter' && <JsonFormatterView />}
            {activeToolId === 'sql-formatter' && <SqlFormatterView />}
            {activeToolId === 'diff-tool' && <DiffToolView />}
            {activeToolId === 'text-splitter' && <TextSplitView />}
            {activeToolId === 'base64-tool' && <Base64View />}
            {activeToolId === 'jwt-tool' && <JwtToolView />}
            {activeToolId === 'timestamp-tool' && <TimestampView />}
            {activeToolId === 'color-tool' && <ColorToolView />}
            {activeToolId === 'pdf-splitter' && <PdfSplitView />}
            {activeToolId === 'hash-tool' && <HashToolView />}
            {activeToolId === 'uuid-tool' && <UuidToolView />}
            {activeToolId === 'password-tool' && <PasswordToolView />}
            {activeToolId === 'url-tool' && <UrlToolView />}
            {activeToolId === 'cron-tool' && <CronToolView />}
          </div>
        </main>
      </div>
    </div>
  );
}
