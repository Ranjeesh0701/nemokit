import { useEffect, useMemo, useState } from 'react';
import {
  ToolRegistry,
  jsonFormatterTool,
  base64Tool,
  urlTool,
  hashTool,
  uuidTool,
  jwtTool,
} from '@nemokit/core';
import type { ToolMetadata } from '@nemokit/core';
import { AppSidebar } from './components/layout/AppSidebar.js';
import { AppHeader } from './components/layout/AppHeader.js';
import { HomeLandingView } from './components/views/HomeLandingView.js';
import { JsonFormatterView } from './components/JsonFormatterView.js';
import { Base64View } from './components/Base64View.js';
import { UrlToolView } from './components/UrlToolView.js';
import { HashToolView } from './components/HashToolView.js';
import { UuidToolView } from './components/views/UuidToolView.js';
import { JwtToolView } from './components/views/JwtToolView.js';

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
    return reg;
  }, []);

  const tools: ReadonlyArray<ToolMetadata> = useMemo(() => registry.getAll(), [registry]);

  // Read view from window hash (e.g. #/tools/json-formatter -> 'json-formatter')
  const getViewFromHash = (): string => {
    const hash = window.location.hash;
    if (hash.startsWith('#/tools/')) {
      return hash.replace('#/tools/', '') || 'home';
    }
    return 'home';
  };

  const [activeView, setActiveView] = useState<string>(() => getViewFromHash());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync hash changes (browser back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      setActiveView(getViewFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectView = (viewId: string) => {
    setActiveView(viewId);
    if (viewId === 'home') {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/tools/${viewId}`;
    }
  };

  const activeTool = useMemo(() => tools.find(t => t.id === activeView), [tools, activeView]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf9f6] text-stone-800 antialiased selection:bg-stone-200">
      {/* App Sidebar */}
      <AppSidebar
        tools={tools}
        activeView={activeView}
        onSelectView={handleSelectView}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader
          activeView={activeView}
          activeTool={activeTool}
          onSelectView={handleSelectView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-6xl">
            {activeView === 'home' && (
              <HomeLandingView
                tools={tools}
                onSelectTool={handleSelectView}
                searchQuery={searchQuery}
              />
            )}
            {activeView === 'json-formatter' && <JsonFormatterView />}
            {activeView === 'base64-tool' && <Base64View />}
            {activeView === 'url-tool' && <UrlToolView />}
            {activeView === 'hash-tool' && <HashToolView />}
            {activeView === 'uuid-tool' && <UuidToolView />}
            {activeView === 'jwt-tool' && <JwtToolView />}
          </div>
        </main>

        {/* Minimal Bottom Status Bar */}
        <footer className="h-8 border-t border-stone-200/60 bg-[#fbfbf9]/80 px-4 sm:px-6 flex items-center justify-between text-[11px] text-stone-400 select-none">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Browser-First Engine Active</span>
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
