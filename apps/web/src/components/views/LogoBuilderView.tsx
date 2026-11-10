import { useState, useMemo } from 'react';
import { logoBuilderTool, LOGO_ICONS, LOGO_PRESETS, DEFAULT_LOGO_CONFIG } from '@nemokit/core';
import type { LogoBuilderConfig, LogoShape } from '@nemokit/core';
import {
  Palette,
  Download,
  Copy,
  Check,
  Sparkles,
  Shapes,
  Sun,
  Moon,
  Grid,
  Shuffle,
} from 'lucide-react';

const RANDOM_PALETTES = [
  ['#4f46e5', '#06b6d4'],
  ['#6366f1', '#a855f7'],
  ['#ec4899', '#f43f5e'],
  ['#059669', '#10b981'],
  ['#ea580c', '#f59e0b'],
  ['#18181b', '#3f3f46'],
  ['#0284c7', '#38bdf8'],
  ['#8b5cf6', '#d946ef'],
  ['#0f172a', '#334155'],
  ['#0d9488', '#2dd4bf'],
  ['#e11d48', '#fb7185'],
  ['#7c3aed', '#c084fc'],
];

const RANDOM_MONOGRAMS = [
  'NK',
  'AI',
  'DEV',
  'GO',
  'TS',
  'UI',
  'HQ',
  'LAB',
  'HEX',
  'RUN',
  'N',
  'V',
  'K',
  'IO',
];

export function LogoBuilderView() {
  const [config, setConfig] = useState<LogoBuilderConfig>(DEFAULT_LOGO_CONFIG);
  const [previewBg, setPreviewBg] = useState<'checker' | 'dark' | 'light'>('checker');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleRandomize = () => {
    const allShapes: LogoShape[] = [
      'squircle',
      'circle',
      'shield',
      'hexagon',
      'diamond',
      'octagon',
    ];
    const shape = allShapes[Math.floor(Math.random() * allShapes.length)] ?? 'squircle';
    const pair = RANDOM_PALETTES[Math.floor(Math.random() * RANDOM_PALETTES.length)] ?? [
      '#4f46e5',
      '#06b6d4',
    ];
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    const angle = angles[Math.floor(Math.random() * angles.length)] ?? 135;
    const isIcon = Math.random() > 0.35;
    const randomIcon = LOGO_ICONS[Math.floor(Math.random() * LOGO_ICONS.length)]?.id ?? 'zap';
    const randomMonogram =
      RANDOM_MONOGRAMS[Math.floor(Math.random() * RANDOM_MONOGRAMS.length)] ?? 'NK';
    const fonts: Array<'sans' | 'serif' | 'mono'> = ['sans', 'serif', 'mono'];
    const font = fonts[Math.floor(Math.random() * fonts.length)] ?? 'sans';
    const widths = [0, 2, 4, 6, 8];
    const borderWidth = widths[Math.floor(Math.random() * widths.length)] ?? 4;

    setConfig({
      shape,
      backgroundType: 'gradient',
      bgColor1: pair[0]!,
      bgColor2: pair[1]!,
      gradientAngle: angle,
      borderWidth,
      borderColor: '#ffffff33',
      shadow: true,
      contentType: isIcon ? 'icon' : 'monogram',
      iconId: randomIcon,
      monogramText: randomMonogram,
      monogramFont: font,
      symbolColor: '#ffffff',
      symbolScale: Math.round((0.45 + Math.random() * 0.2) * 100) / 100,
      wordmark: config.wordmark,
      wordmarkColor: '#ffffff',
    });
  };

  // Generate SVG in real time
  const svgOutput = useMemo(() => {
    const res = logoBuilderTool.execute(config);
    return res.success ? res.data.svg : '';
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

  const handleDownloadSvg = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.wordmark ? config.wordmark.toLowerCase().replace(/\s+/g, '-') : 'logo'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = (size: number = 512) => {
    if (!svgOutput) return;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${config.wordmark ? config.wordmark.toLowerCase().replace(/\s+/g, '-') : 'logo'}-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const SHAPE_CATEGORIES: Array<{
    category: string;
    shapes: Array<{ id: LogoShape; label: string }>;
  }> = [
    {
      category: 'Geometry',
      shapes: [
        { id: 'squircle', label: 'Squircle' },
        { id: 'circle', label: 'Circle' },
        { id: 'rounded-rect', label: 'Rounded' },
        { id: 'square', label: 'Square' },
        { id: 'diamond', label: 'Diamond' },
      ],
    },
    {
      category: 'Polygons & Tech',
      shapes: [
        { id: 'hexagon', label: 'Hexagon' },
        { id: 'hexagon-horizontal', label: 'Hex Wide' },
        { id: 'octagon', label: 'Octagon' },
        { id: 'pentagon', label: 'Pentagon' },
        { id: 'triangle', label: 'Triangle' },
        { id: 'triangle-inverted', label: 'Triangle Inv' },
      ],
    },
    {
      category: 'Badges & Shields',
      shapes: [
        { id: 'shield', label: 'Crest Shield' },
        { id: 'shield-curved', label: 'Knight Shield' },
        { id: 'shield-pointed', label: 'Cyber Shield' },
        { id: 'arch', label: 'Arch' },
        { id: 'pill', label: 'Pill' },
      ],
    },
    {
      category: 'Emblems & Seals',
      shapes: [
        { id: 'starburst', label: 'Starburst Seal' },
        { id: 'clover', label: 'Clover Quad' },
        { id: 'cross', label: 'Swiss Cross' },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-5 sm:pb-6 shrink-0">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 aspect-square items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs mt-0.5 sm:mt-0">
            <Shapes className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-snug">
                Logo & Brand Badge Studio
              </h1>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 uppercase tracking-wider shrink-0 whitespace-nowrap">
                Vector Studio
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed max-w-2xl">
              Create high-resolution vector app icons, brand crests, and developer logos with pure
              client-side SVG rendering.
            </p>
          </div>
        </div>

        {/* Clean Single-Row Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:flex-initial min-w-36">
            <select
              aria-label="Preset logo templates"
              value=""
              onChange={e => {
                const preset = LOGO_PRESETS.find(p => p.name === e.target.value);
                if (preset) setConfig(preset.config);
              }}
              className="w-full appearance-none flex items-center rounded-lg border border-stone-200 bg-white pl-3 pr-8 py-2 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            >
              <option value="" disabled>
                Logo Presets...
              </option>
              {LOGO_PRESETS.map(preset => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start flex-1 min-h-0 sm:min-h-115">
        {/* Left Control Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
          {/* Section 1: Shape & Geometry */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Shapes className="h-3.5 w-3.5 text-indigo-600" />
                Shape & Frame Library (19 Shapes)
              </h3>
            </div>

            <div className="space-y-3">
              {SHAPE_CATEGORIES.map(group => (
                <div key={group.category} className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    {group.category}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
                    {group.shapes.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, shape: s.id }))}
                        className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border text-xs font-medium transition-all ${
                          config.shape === s.id
                            ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-xs ring-1 ring-indigo-500/20'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span className="truncate w-full text-center">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">
                  Border Width ({config.borderWidth}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={config.borderWidth}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, borderWidth: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    Border Color
                  </label>
                  <input
                    type="color"
                    value={config.borderColor.substring(0, 7)}
                    onChange={e => setConfig(prev => ({ ...prev, borderColor: e.target.value }))}
                    className="h-8 w-14 rounded cursor-pointer border border-stone-200 p-0.5"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="shadowToggle"
                    checked={config.shadow}
                    onChange={e => setConfig(prev => ({ ...prev, shadow: e.target.checked }))}
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="shadowToggle"
                    className="text-xs font-medium text-stone-700 cursor-pointer"
                  >
                    Drop Shadow
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Background & Color Gradient */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-purple-600" />
              Background Colors
            </h3>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, backgroundType: 'gradient' }))}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    config.backgroundType === 'gradient'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Linear Gradient
                </button>
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, backgroundType: 'solid' }))}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    config.backgroundType === 'solid'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Solid Color
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.bgColor1}
                    onChange={e => setConfig(prev => ({ ...prev, bgColor1: e.target.value }))}
                    className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                  />
                  <span className="text-xs font-mono text-stone-700">{config.bgColor1}</span>
                </div>
              </div>

              {config.backgroundType === 'gradient' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-stone-600 block mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.bgColor2}
                        onChange={e => setConfig(prev => ({ ...prev, bgColor2: e.target.value }))}
                        className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                      />
                      <span className="text-xs font-mono text-stone-700">{config.bgColor2}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-600 block mb-1">
                      Angle ({config.gradientAngle}°)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={config.gradientAngle}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          gradientAngle: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Symbol / Icon / Monogram */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Emblem Content
              </h3>

              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, contentType: 'icon' }))}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    config.contentType === 'icon'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Vector Icon
                </button>
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, contentType: 'monogram' }))}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    config.contentType === 'monogram'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Monogram Text
                </button>
              </div>
            </div>

            {config.contentType === 'icon' ? (
              <div className="space-y-3">
                <label className="text-xs font-medium text-stone-600 block">Choose Symbol</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {LOGO_ICONS.map(icon => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, iconId: icon.id }))}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        config.iconId === icon.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <svg
                        className={`h-6 w-6 ${
                          config.iconId === icon.id ? 'text-indigo-600' : 'text-stone-700'
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d={icon.path} />
                      </svg>
                      <span className="mt-1 text-[10px] text-stone-500 truncate w-full text-center">
                        {icon.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    Monogram Letters (1-4 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={config.monogramText}
                    onChange={e => setConfig(prev => ({ ...prev, monogramText: e.target.value }))}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-bold text-sm tracking-wider uppercase text-stone-900 shadow-xs focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    Font Family
                  </label>
                  <select
                    value={config.monogramFont}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        monogramFont: e.target.value as 'sans' | 'serif' | 'mono',
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-800 shadow-xs focus:border-indigo-600 focus:outline-hidden"
                  >
                    <option value="sans">Modern Sans</option>
                    <option value="serif">Editorial Serif</option>
                    <option value="mono">Technical Monospace</option>
                  </select>
                </div>
              </div>
            )}

            {/* Symbol Customization: Size & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-100">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">
                  Symbol Size ({Math.round(config.symbolScale * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.8"
                  step="0.05"
                  value={config.symbolScale}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, symbolScale: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">
                  Symbol Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.symbolColor}
                    onChange={e => setConfig(prev => ({ ...prev, symbolColor: e.target.value }))}
                    className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                  />
                  <span className="text-xs font-mono text-stone-700">{config.symbolColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">
                  Wordmark / Text
                </label>
                <input
                  type="text"
                  placeholder="Optional title"
                  value={config.wordmark ?? ''}
                  onChange={e => setConfig(prev => ({ ...prev, wordmark: e.target.value }))}
                  className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-800 shadow-xs focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Canvas & Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-4 self-start">
          {/* Canvas Preview Box */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs flex flex-col items-center">
            {/* Canvas Background Toggles */}
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Live Vector Preview
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
              className={`w-full aspect-square max-w-85 rounded-2xl flex items-center justify-center p-8 transition-colors ${
                previewBg === 'checker'
                  ? 'bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-size-[16px_16px] bg-stone-50'
                  : previewBg === 'dark'
                    ? 'bg-stone-950'
                    : 'bg-white border border-stone-100'
              }`}
            >
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgOutput }}
              />
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Export Brand Assets
            </h4>

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
                onClick={() => handleDownloadPng(512)}
                className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                PNG (512x512)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(svgOutput, 'svg')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
              >
                {copiedKey === 'svg' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-stone-500" />
                    <span>Copy SVG Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/app/favicon-generator';
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Favicon Studio →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
