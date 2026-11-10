import { useState, useMemo } from 'react';
import { randomSvgTool, RANDOM_SVG_PALETTES } from '@nemokit/core';
import type { RandomSvgInput, RandomSvgType } from '@nemokit/core';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Shuffle,
  Sun,
  Moon,
  Grid,
  Code2,
  FileCode,
  Sliders,
  Palette,
} from 'lucide-react';

const SVG_TYPES: Array<{ id: RandomSvgType; label: string; desc: string }> = [
  { id: 'blob', label: 'Organic Blob', desc: 'Smooth cubic splines' },
  { id: 'waves', label: 'Layered Waves', desc: 'Flowing stacked waves' },
  { id: 'identicon', label: 'Pixel Identicon', desc: 'Symmetrical 5x5 avatar' },
  { id: 'constellation', label: 'Constellation', desc: 'Connected low-poly nodes' },
  { id: 'circuits', label: 'Tech Circuits', desc: 'Cyber microchip traces' },
];

export function RandomSvgView() {
  const [config, setConfig] = useState<RandomSvgInput>({
    type: 'blob',
    complexity: 6,
    color1: '#06b6d4',
    color2: '#a855f7',
    color3: '#ec4899',
    background: '#09090b',
    isTransparent: false,
    seed: 12345,
  });

  const [previewBg, setPreviewBg] = useState<'checker' | 'dark' | 'light'>('checker');
  const [activeTab, setActiveTab] = useState<'svg' | 'jsx' | 'uri'>('svg');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generate SVG in real time
  const output = useMemo(() => {
    const res = randomSvgTool.execute(config);
    return res.success ? res.data : null;
  }, [config]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleRandomize = () => {
    const types: RandomSvgType[] = ['blob', 'waves', 'identicon', 'constellation', 'circuits'];
    const randomType = types[Math.floor(Math.random() * types.length)] ?? 'blob';
    const palette =
      RANDOM_SVG_PALETTES[Math.floor(Math.random() * RANDOM_SVG_PALETTES.length)] ??
      RANDOM_SVG_PALETTES[0]!;
    const complexity = Math.floor(Math.random() * 7) + 4; // 4 to 10
    const newSeed = Math.floor(Math.random() * 1000000);

    setConfig({
      type: randomType,
      complexity,
      color1: palette.color1,
      color2: palette.color2,
      color3: palette.color3,
      background: palette.bg,
      isTransparent: config.isTransparent,
      seed: newSeed,
    });
  };

  const handleDownloadSvg = () => {
    if (!output?.svg) return;
    const blob = new Blob([output.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `random-${config.type}-${config.seed ?? 'art'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = (size: number = 1024) => {
    if (!output?.svg) return;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([output.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `random-${config.type}-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-5 sm:pb-6 shrink-0">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 aspect-square items-center justify-center rounded-xl bg-pink-600 text-white shadow-xs mt-0.5 sm:mt-0">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-snug">
                Random SVG Generator
              </h1>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 uppercase tracking-wider shrink-0 whitespace-nowrap">
                Vector Studio
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed max-w-2xl">
              Procedurally generate organic vector blobs, layered flowing waves, symmetrical
              identicons, and cyber circuits.
            </p>
          </div>
        </div>

        {/* Clean Single-Row Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:flex-initial min-w-36">
            <select
              aria-label="Preset color palette"
              value=""
              onChange={e => {
                const p = RANDOM_SVG_PALETTES.find(pal => pal.name === e.target.value);
                if (p) {
                  setConfig(prev => ({
                    ...prev,
                    color1: p.color1,
                    color2: p.color2,
                    color3: p.color3,
                    background: p.bg,
                  }));
                }
              }}
              className="w-full appearance-none flex items-center rounded-lg border border-stone-200 bg-white pl-3 pr-8 py-2 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            >
              <option value="" disabled>
                Palette Presets...
              </option>
              {RANDOM_SVG_PALETTES.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <Palette className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          </div>

          <button
            type="button"
            onClick={handleRandomize}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-stone-800 active:scale-[0.98] transition-all"
          >
            <Shuffle className="h-3.5 w-3.5 text-stone-300" />
            <span>Randomize</span>
            <span className="hidden sm:inline text-[10px] text-stone-400 font-mono font-normal bg-stone-800 px-1.5 py-0.5 rounded">
              ⌘↵
            </span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Controls + Right Live Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        {/* Left Control Panel (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6 min-w-0">
          {/* Section 1: Type Selection */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
              Vector Generator Category
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SVG_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, type: t.id }))}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    config.type === t.id
                      ? 'border-pink-600 bg-pink-50/60 text-pink-900 shadow-xs ring-1 ring-pink-500/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Complexity & Seed */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-pink-600" />
              Parameters & Randomness
            </span>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>Complexity / Points Count</span>
                  <span className="font-mono">{config.complexity}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={config.complexity}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, complexity: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-pink-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>Random Seed</span>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig(prev => ({
                        ...prev,
                        seed: Math.floor(Math.random() * 1000000),
                      }))
                    }
                    className="text-xs text-pink-600 hover:text-pink-800 font-semibold"
                  >
                    🎲 Reroll Seed
                  </button>
                </div>
                <input
                  type="number"
                  value={config.seed ?? 0}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, seed: parseInt(e.target.value, 10) || 0 }))
                  }
                  className="w-full rounded-lg border border-stone-200 px-3 py-1.5 font-mono text-xs text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Colors */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                Color Palette
              </span>
              <span className="text-[11px] text-stone-400">Curated Themes</span>
            </div>

            {/* Quick Palettes */}
            <div className="flex flex-wrap gap-1.5">
              {RANDOM_SVG_PALETTES.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    setConfig(prev => ({
                      ...prev,
                      color1: p.color1,
                      color2: p.color2,
                      color3: p.color3,
                      background: p.bg,
                    }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200/80 bg-stone-50/80 px-2.5 py-1 text-[11px] font-medium text-stone-700 shadow-2xs hover:bg-stone-100 hover:border-stone-300 transition-colors"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{
                      background: `linear-gradient(135deg, ${p.color1}, ${p.color2})`,
                    }}
                  />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Color 1</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.color1}
                    onChange={e => setConfig(prev => ({ ...prev, color1: e.target.value }))}
                    className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                  />
                  <span className="text-xs font-mono text-stone-700">{config.color1}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Color 2</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.color2}
                    onChange={e => setConfig(prev => ({ ...prev, color2: e.target.value }))}
                    className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                  />
                  <span className="text-xs font-mono text-stone-700">{config.color2}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Color 3</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.color3 || '#06b6d4'}
                    onChange={e => setConfig(prev => ({ ...prev, color3: e.target.value }))}
                    className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                  />
                  <span className="text-xs font-mono text-stone-700">{config.color3}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.background}
                    onChange={e => setConfig(prev => ({ ...prev, background: e.target.value }))}
                    className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                  />
                  <span className="text-xs font-mono text-stone-700">{config.background}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="transparentBg"
                  checked={config.isTransparent}
                  onChange={e => setConfig(prev => ({ ...prev, isTransparent: e.target.checked }))}
                  className="rounded border-stone-300 text-pink-600 focus:ring-pink-500"
                />
                <label
                  htmlFor="transparentBg"
                  className="text-xs font-medium text-stone-700 cursor-pointer"
                >
                  Transparent Canvas
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Canvas & Actions (6 cols - sticky) */}
        <div className="lg:col-span-6 flex flex-col gap-5 lg:sticky lg:top-4 self-start">
          {/* Canvas Preview Box */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs flex flex-col items-center">
            {/* Canvas Background Toggles */}
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Live Vector Graphic
              </span>
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
                <button
                  type="button"
                  onClick={() => setPreviewBg('checker')}
                  title="Checkerboard"
                  className={`p-1 rounded ${previewBg === 'checker' ? 'bg-white shadow-xs' : 'text-stone-500'}`}
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('dark')}
                  title="Dark background"
                  className={`p-1 rounded ${previewBg === 'dark' ? 'bg-white shadow-xs' : 'text-stone-500'}`}
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('light')}
                  title="Light background"
                  className={`p-1 rounded ${previewBg === 'light' ? 'bg-white shadow-xs' : 'text-stone-500'}`}
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Rendered SVG Preview */}
            <div
              className={`w-full aspect-square max-w-90 rounded-2xl flex items-center justify-center p-6 transition-colors ${
                previewBg === 'checker'
                  ? 'bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-size-[16px_16px] bg-stone-50'
                  : previewBg === 'dark'
                    ? 'bg-stone-950'
                    : 'bg-white border border-stone-100'
              }`}
            >
              {output?.svg ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: output.svg }}
                />
              ) : (
                <span className="text-xs text-stone-400">Rendering vector...</span>
              )}
            </div>
          </div>

          {/* Action Export Cards */}
          {output && (
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-3">
              <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block">
                Export Graphic
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download SVG
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPng(1024)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  PNG (1024x1024)
                </button>
              </div>

              {/* Code Export Tabs */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setActiveTab('svg')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                        activeTab === 'svg' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      <Code2 className="h-3 w-3" /> SVG Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('jsx')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                        activeTab === 'jsx' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      <FileCode className="h-3 w-3" /> React JSX
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('uri')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                        activeTab === 'uri' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Data URI
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        activeTab === 'svg'
                          ? output.svg
                          : activeTab === 'jsx'
                            ? output.reactJsx
                            : output.cssDataUrl,
                        activeTab
                      )
                    }
                    className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium px-2 py-1"
                  >
                    {copiedKey === activeTab ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-stone-500" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
