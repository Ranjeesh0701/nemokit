import { useState, useMemo } from 'react';
import { patternGeneratorTool, PATTERN_PRESETS, DEFAULT_PATTERN_CONFIG } from '@nemokit/core';
import type { PatternInput, PatternType } from '@nemokit/core';
import { Download, Copy, Check, Shuffle, Grid } from 'lucide-react';

const PATTERN_TYPES: Array<{ id: PatternType; label: string }> = [
  { id: 'dots', label: 'Polka Dots' },
  { id: 'grid', label: 'Tech Grid' },
  { id: 'lines', label: 'Stripes' },
  { id: 'crosshatch', label: 'Crosshatch' },
  { id: 'hexagons', label: 'Hexagons' },
  { id: 'waves', label: 'Waves' },
  { id: 'chevrons', label: 'Chevrons' },
  { id: 'circuits', label: 'Circuit PCB' },
  { id: 'memphis', label: 'Memphis' },
  { id: 'triangles', label: 'Triangles' },
];

const RANDOM_COLOR_PAIRS = [
  { fg: '#6366f1', bg: '#f5f3ff' },
  { fg: '#0284c7', bg: '#f0f9ff' },
  { fg: '#059669', bg: '#ecfdf5' },
  { fg: '#ea580c', bg: '#fff7ed' },
  { fg: '#db2777', bg: '#fdf2f8' },
  { fg: '#7c3aed', bg: '#faf5ff' },
  { fg: '#38bdf8', bg: '#0f172a' },
  { fg: '#10b981', bg: '#09090b' },
  { fg: '#f59e0b', bg: '#18181b' },
  { fg: '#a855f7', bg: '#ffffff' },
  { fg: '#64748b', bg: '#f8fafc' },
];

export function PatternGeneratorView() {
  const [config, setConfig] = useState<PatternInput>(DEFAULT_PATTERN_CONFIG);
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute pattern output
  const patternResult = useMemo(() => {
    const effectiveConfig = {
      ...config,
      background: isTransparentBg ? 'transparent' : config.background,
    };
    const res = patternGeneratorTool.execute(effectiveConfig);
    return res.success ? res.data : null;
  }, [config, isTransparentBg]);

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
    const allTypes: PatternType[] = [
      'dots',
      'grid',
      'lines',
      'crosshatch',
      'hexagons',
      'waves',
      'chevrons',
      'circuits',
      'memphis',
      'triangles',
    ];
    const randomType = allTypes[Math.floor(Math.random() * allTypes.length)] ?? 'dots';
    const pair = RANDOM_COLOR_PAIRS[Math.floor(Math.random() * RANDOM_COLOR_PAIRS.length)] ?? {
      fg: '#6366f1',
      bg: '#ffffff',
    };
    const spacing = Math.floor(Math.random() * 40) + 18; // 18 - 58
    const strokeWidth = Math.round((Math.random() * 2.5 + 1) * 10) / 10; // 1 - 3.5
    const opacity = Math.round((Math.random() * 0.5 + 0.35) * 100) / 100; // 0.35 - 0.85

    setConfig({
      patternType: randomType,
      foreground: pair.fg,
      background: pair.bg,
      spacing,
      strokeWidth,
      opacity,
      seed: Math.floor(Math.random() * 1000),
    });
  };

  const handleDownloadSvg = () => {
    if (!patternResult?.svg) return;
    const blob = new Blob([patternResult.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pattern-${config.patternType}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = (tileSize: number = 256) => {
    if (!patternResult?.svg) return;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([patternResult.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Fill background if not transparent
      if (!isTransparentBg && config.background) {
        ctx.fillStyle = config.background;
        ctx.fillRect(0, 0, tileSize, tileSize);
      }
      // Pattern fill repeat
      const ptrn = ctx.createPattern(img, 'repeat');
      if (ptrn) {
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, tileSize, tileSize);
      }
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `pattern-${config.patternType}-${tileSize}x${tileSize}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1 pb-12 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
              <Grid className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Background & Pattern Studio
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Generate seamless repeating vector textures, procedural SVG backgrounds, and CSS data
            URIs.
          </p>
        </div>

        {/* Action presets & Randomizer */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/80 px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-xs hover:bg-purple-100 transition-colors"
          >
            <Shuffle className="h-3.5 w-3.5 text-purple-600" />
            <span>Random Pattern</span>
          </button>
          {PATTERN_PRESETS.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setConfig(preset.config);
                setIsTransparentBg(false);
              }}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Left Controls + Right Live Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-[460px] pb-8">
        {/* Left Control Panel (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-5 min-w-0">
          {/* Pattern Type Picker */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
              Pattern Geometry
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PATTERN_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, patternType: type.id }))}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    config.patternType === type.id
                      ? 'border-purple-600 bg-purple-50/60 text-purple-900 shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="font-semibold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Settings */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
              Palette & Colors
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">
                  Pattern / Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.foreground}
                    onChange={e => setConfig(prev => ({ ...prev, foreground: e.target.value }))}
                    className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.foreground}
                    onChange={e => setConfig(prev => ({ ...prev, foreground: e.target.value }))}
                    className="w-24 rounded-lg border border-stone-200 px-2.5 py-1 font-mono text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-600">Background Color</label>
                  <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTransparentBg}
                      onChange={e => setIsTransparentBg(e.target.checked)}
                      className="rounded border-stone-300 text-purple-600 focus:ring-purple-500"
                    />
                    Transparent
                  </label>
                </div>
                {!isTransparentBg ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.background}
                      onChange={e => setConfig(prev => ({ ...prev, background: e.target.value }))}
                      className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                    />
                    <input
                      type="text"
                      value={config.background}
                      onChange={e => setConfig(prev => ({ ...prev, background: e.target.value }))}
                      className="w-24 rounded-lg border border-stone-200 px-2.5 py-1 font-mono text-xs text-stone-900"
                    />
                  </div>
                ) : (
                  <span className="text-xs italic text-stone-400 block pt-1">
                    Transparent background enabled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dimension & Density Sliders */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
              Scale & Density
            </span>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>Tile Spacing</span>
                  <span className="font-mono">{config.spacing}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="96"
                  value={config.spacing}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, spacing: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>Stroke / Particle Width</span>
                  <span className="font-mono">{config.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6"
                  step="0.5"
                  value={config.strokeWidth}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, strokeWidth: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                  <span>Pattern Opacity</span>
                  <span className="font-mono">{Math.round(config.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={config.opacity}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Preview Canvas & Export Cards (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4 lg:sticky lg:top-4 self-start">
          {/* Full-bleed repeating canvas */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col flex-1 min-h-[300px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Seamless Repeating Wallpaper Preview
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {config.spacing}×{config.spacing}px tile
              </span>
            </div>

            <div
              className={`flex-1 w-full min-h-[240px] rounded-xl shadow-inner transition-all border border-stone-200/80 ${
                isTransparentBg
                  ? 'bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]'
                  : ''
              }`}
              style={{
                backgroundColor: isTransparentBg ? 'transparent' : config.background,
                backgroundImage: patternResult?.cssDataUrl,
                backgroundRepeat: 'repeat',
              }}
            />
          </div>

          {/* Export Code & Assets */}
          {patternResult && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
              <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block">
                Export Pattern
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download SVG Tile
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPng(512)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  PNG Texture (512x512)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopy(patternResult.cssRule, 'css')}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  {copiedKey === 'css' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-stone-500" />
                      <span>Copy CSS Rule</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(patternResult.cssDataUrl, 'dataUrl')}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  {copiedKey === 'dataUrl' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-stone-500" />
                      <span>Copy Data URI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
