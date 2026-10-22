import { useState, useRef, useEffect, useCallback } from 'react';
import {
  createIcoFile,
  FAVICON_SIZES,
  generateHtmlSnippet,
  generateManifestSnippet,
  type FaviconDimension,
} from '@nemokit/core';
import {
  Download,
  Copy,
  Check,
  Code2,
  Globe,
  Smartphone,
  Image as ImageIcon,
} from 'lucide-react';
import { downloadAsFile } from '../../utils/fileDownload.js';

const SAMPLE_ICON_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="%231c1917"/><polygon points="128,48 208,188 48,188" fill="%23f59e0b"/><circle cx="128" cy="142" r="28" fill="%23ffffff"/></svg>`;

export function FaviconGeneratorView() {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_ICON_SVG);
  const [appName, setAppName] = useState<string>('My Web App');
  const [themeColor, setThemeColor] = useState<string>('#1c1917');
  const [bgColor, setBgColor] = useState<'transparent' | 'white' | 'dark'>('transparent');
  const [shape, setShape] = useState<'square' | 'rounded' | 'circle'>('rounded');
  const [paddingPercent, setPaddingPercent] = useState<number>(8);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'browser' | 'ios' | 'html' | 'manifest'>('browser');

  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const renderedIconsRef = useRef<Map<number, Blob>>(new Map());

  // Render all standard favicon sizes to offscreen canvases
  const renderIcons = useCallback(async () => {
    const img = originalImageRef.current;
    if (!img) return;

    const iconBlobs = new Map<number, Blob>();

    for (const item of FAVICON_SIZES) {
      const canvas = document.createElement('canvas');
      canvas.width = item.size;
      canvas.height = item.size;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // 1. Background fill
      if (bgColor === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, item.size, item.size);
      } else if (bgColor === 'dark') {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, item.size, item.size);
      }

      // 2. Shape clipping
      if (shape === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(item.size / 2, item.size / 2, item.size / 2, 0, Math.PI * 2);
        ctx.clip();
      } else if (shape === 'rounded') {
        const radius = Math.round(item.size * 0.22);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, item.size, item.size, radius);
        ctx.clip();
      }

      // 3. Draw image with padding
      const pad = Math.round(item.size * (paddingPercent / 100));
      const drawSize = item.size - pad * 2;
      ctx.drawImage(img, pad, pad, drawSize, drawSize);

      if (shape !== 'square') {
        ctx.restore();
      }

      // Convert to blob
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        iconBlobs.set(item.size, blob);
      }
    }

    renderedIconsRef.current = iconBlobs;
  }, [bgColor, shape, paddingPercent]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImageRef.current = img;
      void renderIcons();
    };
    img.src = imageSrc;
  }, [imageSrc, renderIcons]);

  useEffect(() => {
    void renderIcons();
  }, [renderIcons]);

  // Download true Windows/browser favicon.ico multi-resolution file
  const handleDownloadIco = async () => {
    const icon16 = renderedIconsRef.current.get(16);
    const icon32 = renderedIconsRef.current.get(32);
    const icon48 = renderedIconsRef.current.get(48);

    if (!icon16 || !icon32 || !icon48) return;

    const b16 = new Uint8Array(await icon16.arrayBuffer());
    const b32 = new Uint8Array(await icon32.arrayBuffer());
    const b48 = new Uint8Array(await icon48.arrayBuffer());

    const icoBytes = createIcoFile([
      { size: 16, data: b16 },
      { size: 32, data: b32 },
      { size: 48, data: b48 },
    ]);

    downloadAsFile('favicon.ico', icoBytes, 'image/x-icon');
  };

  const handleDownloadSingle = (item: FaviconDimension) => {
    const blob = renderedIconsRef.current.get(item.size);
    if (!blob) return;
    downloadAsFile(item.name, blob, 'image/png');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const htmlCode = generateHtmlSnippet(appName, themeColor);
  const manifestCode = generateManifestSnippet(appName, themeColor);

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700">
            <Globe className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Favicon & App Icon Studio
              </h1>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase">
                Cross-Platform
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Generate binary multi-size favicon.ico, Apple touch icons, Android PWA assets, and webmanifest tags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadIco}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download favicon.ico</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
        {/* Left Column: Customization Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* File Upload Dropzone */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
              Source Icon or Logo
            </span>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-4 cursor-pointer bg-stone-50/50 hover:bg-stone-100/50 transition-all text-center">
              <ImageIcon className="h-6 w-6 text-stone-400 mb-1.5" />
              <span className="text-xs font-medium text-stone-700">Drop high-res logo or icon</span>
              <span className="text-[10px] text-stone-400 mt-0.5">Recommended 512×512 or SVG</span>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    if (ev.target?.result) {
                      setImageSrc(ev.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Icon Configuration */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Style & Packaging
            </span>

            {/* App Name & Theme Color */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 flex flex-col gap-1.5">
                <span className="text-xs font-medium text-stone-600">App Name:</span>
                <input
                  type="text"
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  placeholder="My Web App"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-stone-600">Theme:</span>
                <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg p-1">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={e => setThemeColor(e.target.value)}
                    className="h-6 w-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-stone-600 truncate">{themeColor}</span>
                </div>
              </div>
            </div>

            {/* Shape selection */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-stone-600">Icon Shape:</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'square' as const, label: 'Square' },
                  { id: 'rounded' as const, label: 'Squircle' },
                  { id: 'circle' as const, label: 'Circle' },
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShape(s.id)}
                    className={`py-1.5 rounded-lg border font-medium text-center transition-all ${
                      shape === s.id
                        ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Backdrop Color */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-stone-600">Background Fill:</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'transparent' as const, label: 'Transparent' },
                  { id: 'white' as const, label: 'White' },
                  { id: 'dark' as const, label: 'Dark' },
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBgColor(b.id)}
                    className={`py-1.5 rounded-lg border font-medium text-center transition-all ${
                      bgColor === b.id
                        ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Padding slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Inner Icon Padding:</span>
                <span className="font-mono font-semibold text-stone-800">{paddingPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={paddingPercent}
                onChange={e => setPaddingPercent(Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Device Previews & Assets */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Output Mode Tabs */}
          <div className="flex items-center gap-1.5 border-b border-stone-200/80 pb-2">
            {[
              { id: 'browser' as const, label: 'Browser Tab Preview', icon: Globe },
              { id: 'ios' as const, label: 'iOS & Mobile Preview', icon: Smartphone },
              { id: 'html' as const, label: 'HTML <head> Tags', icon: Code2 },
              { id: 'manifest' as const, label: 'Web Manifest', icon: Code2 },
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPreviewTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === tab.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Browser Tab Preview Card */}
          {previewTab === 'browser' && (
            <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Realistic Browser Tab Simulation</span>
                <span className="text-[11px] font-mono text-stone-400">16×16 & 32×32 Favicon</span>
              </div>

              <div className="p-8 bg-[#eef0f2] flex flex-col gap-4">
                {/* Browser Mockup Bar */}
                <div className="rounded-xl bg-white shadow-sm border border-stone-300/80 overflow-hidden max-w-lg mx-auto w-full">
                  <div className="bg-[#e2e5e9] px-3 pt-2.5 pb-0 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 pr-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>

                    {/* Active tab */}
                    <div className="bg-white rounded-t-lg px-3 py-1.5 flex items-center gap-2 border-t border-x border-stone-300 text-xs font-medium text-stone-800 shadow-2xs max-w-xs">
                      <img src={imageSrc} alt="Favicon" className="h-4 w-4 rounded-xs shrink-0 object-contain" />
                      <span className="truncate">{appName}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
                    <div className="flex-1 bg-stone-100 rounded-md px-2.5 py-1 text-[11px] text-stone-500 font-mono truncate">
                      https://{appName.toLowerCase().replace(/\s+/g, '')}.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* iOS Preview Card */}
          {previewTab === 'ios' && (
            <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 text-xs font-semibold text-stone-700">
                <span>Apple Touch Icon (180×180) Homescreen Simulation</span>
              </div>

              <div className="p-8 bg-stone-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-lg overflow-hidden border border-stone-700 p-2 flex items-center justify-center">
                    <img src={imageSrc} alt="Apple Touch Icon" className="h-full w-full object-contain" />
                  </div>
                  <span className="text-xs font-medium text-white tracking-tight">{appName}</span>
                </div>
              </div>
            </div>
          )}

          {/* HTML Code Preview */}
          {previewTab === 'html' && (
            <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>HTML &lt;head&gt; Integration Snippet</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(htmlCode, 'html')}
                  className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900"
                >
                  {copiedKey === 'html' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={htmlCode}
                rows={8}
                className="p-4 font-mono text-xs text-stone-800 bg-stone-50/40 resize-none focus:outline-hidden leading-relaxed"
              />
            </div>
          )}

          {/* Webmanifest Code Preview */}
          {previewTab === 'manifest' && (
            <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>site.webmanifest Configuration</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(manifestCode, 'manifest')}
                  className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900"
                >
                  {copiedKey === 'manifest' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={manifestCode}
                rows={12}
                className="p-4 font-mono text-xs text-stone-800 bg-stone-50/40 resize-none focus:outline-hidden leading-relaxed"
              />
            </div>
          )}

          {/* Individual Assets Export Table */}
          <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between text-xs font-semibold text-stone-800 uppercase tracking-wider">
              <span>Standard Asset Renders</span>
              <span className="text-[11px] font-mono font-normal text-stone-400">
                {FAVICON_SIZES.length} assets
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {FAVICON_SIZES.map(item => (
                <div
                  key={item.size}
                  className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-stone-800 w-16">
                      {item.size}×{item.size}
                    </span>
                    <span className="font-mono text-stone-600 font-medium">{item.name}</span>
                    <span className="text-stone-400 text-[11px] hidden sm:inline">
                      • {item.purpose}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    <span>PNG</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
