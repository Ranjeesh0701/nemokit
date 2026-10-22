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
} from '@nemokit/core';
import type { ToolMetadata } from '@nemokit/core';
import { LandingPage } from './components/landing/LandingPage.js';
import { AppSidebar } from './components/layout/AppSidebar.js';
import { AppHeader } from './components/layout/AppHeader.js';
import { HomeLandingView } from './components/views/HomeLandingView.js';
import { JsonFormatterView } from './components/JsonFormatterView.js';
import { Base64View } from './components/Base64View.js';
import { UrlToolView } from './components/UrlToolView.js';
import { HashToolView } from './components/HashToolView.js';
import { UuidToolView } from './components/views/UuidToolView.js';
import { JwtToolView } from './components/views/JwtToolView.js';
import { SqlFormatterView } from './components/views/SqlFormatterView.js';
import { TimestampView } from './components/views/TimestampView.js';

type RouteState = { mode: 'landing' } | { mode: 'app'; activeToolId: string }; // 'dashboard' or specific tool id

export default function App() {
  // Initialize and populate core engine registry with all registered tools
  const registry = useMemo(() => {
    const reg = new ToolRegistry();
    reg.register(jsonFormatterTool);
    reg.register(base64Tool);
    reg.register(urlTool);
    reg.register(hashTool);
    reg.register(uuidTool);
    reg.register(jwtTool);
    reg.register(sqlFormatterTool);
    reg.register(timestampTool);
    return reg;
  }, []);

  const tools: ReadonlyArray<ToolMetadata> = useMemo(() => registry.getAll(), [registry]);

  const parseRouteFromHash = (): RouteState => {
    const hash = window.location.hash;
    // Default root or #/ is the dedicated Landing Page
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

    // Backward-compat for #/tools/xyz
    if (hash.startsWith('#/tools/')) {
      const toolId = hash.replace('#/tools/', '').trim();
      return { mode: 'app', activeToolId: toolId || 'dashboard' };
    }

    return { mode: 'landing' };
  };

  const [route, setRoute] = useState<RouteState>(() => parseRouteFromHash());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Sync hash changes (browser back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRouteFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf9f6] text-stone-800 antialiased selection:bg-stone-200">
      {/* App Sidebar with Compact Mode */}
      <AppSidebar
        tools={tools}
        activeView={activeToolId === 'dashboard' ? 'home' : activeToolId}
        onSelectView={handleSelectView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader
          activeView={activeToolId === 'dashboard' ? 'home' : activeToolId}
          activeTool={activeTool}
          onSelectView={handleSelectView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable Workspace View Container */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-6xl">
            {activeToolId === 'dashboard' && (
              <HomeLandingView
                tools={tools}
                onSelectTool={handleSelectView}
                searchQuery={searchQuery}
              />
            )}
            {activeToolId === 'json-formatter' && <JsonFormatterView />}
            {activeToolId === 'base64-tool' && <Base64View />}
            {activeToolId === 'url-tool' && <UrlToolView />}
            {activeToolId === 'hash-tool' && <HashToolView />}
            {activeToolId === 'uuid-tool' && <UuidToolView />}
            {activeToolId === 'jwt-tool' && <JwtToolView />}
            {activeToolId === 'sql-formatter' && <SqlFormatterView />}
            {activeToolId === 'timestamp-tool' && <TimestampView />}
          </div>
        </main>

        {/* Minimal Bottom Status Bar */}
        <footer className="h-8 border-t border-stone-200/60 bg-[#fbfbf9]/80 px-4 sm:px-6 flex items-center justify-between text-[11px] text-stone-400 select-none">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Workspace Active • Client-Side Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Shortcut: ⌘/Ctrl + Enter to run</span>
            <span>•</span>
            <span>Nemokit v0.1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
