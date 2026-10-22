import { useState, useEffect, useMemo } from 'react';
import { colorTool, evaluateWcagContrast, generateGradientCss } from '@nemokit/core';
import type { ColorToolOutput, GradientStop } from '@nemokit/core';
import {
  Palette,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Sparkles,
  Code2,
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Stone', hex: '#78716c' },
  { name: 'Obsidian', hex: '#18181b' },
];

const GRADIENT_PRESETS = [
  {
    name: 'Sunset Glow',
    type: 'linear' as const,
    angle: 135,
    stops: [
      { color: '#f43f5e', position: 0 },
      { color: '#fb923c', position: 100 },
    ],
  },
  {
    name: 'Ocean Depths',
    type: 'linear' as const,
    angle: 120,
    stops: [
      { color: '#0284c7', position: 0 },
      { color: '#0d9488', position: 100 },
    ],
  },
  {
    name: 'Cosmic Purple',
    type: 'linear' as const,
    angle: 135,
    stops: [
      { color: '#6366f1', position: 0 },
      { color: '#ec4899', position: 100 },
    ],
  },
  {
    name: 'Emerald Mist',
    type: 'linear' as const,
    angle: 90,
    stops: [
      { color: '#059669', position: 0 },
      { color: '#34d399', position: 100 },
    ],
  },
  {
    name: 'Obsidian Noir',
    type: 'linear' as const,
    angle: 180,
    stops: [
      { color: '#18181b', position: 0 },
      { color: '#3f3f46', position: 100 },
    ],
  },
];

export function ColorToolView() {
  const [activeTab, setActiveTab] = useState<'converter' | 'contrast' | 'gradient'>('converter');
  const [colorInput, setColorInput] = useState<string>('#4f46e5');
  const [result, setResult] = useState<ColorToolOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // WCAG Studio state
  const [contrastFg, setContrastFg] = useState<string>('#ffffff');
  const [contrastBg, setContrastBg] = useState<string>('#4f46e5');

  // Gradient Studio state
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [gradientAngle, setGradientAngle] = useState<number>(135);
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { color: '#6366f1', position: 0 },
    { color: '#ec4899', position: 100 },
  ]);

  useEffect(() => {
    colorTool.execute(
      { color: colorInput },
      {
        onSuccess: data => setResult(data),
        onFailure: () => setResult(null),
      }
    );
  }, [colorInput]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorInput(e.target.value);
  };

  // WCAG evaluation
  const wcagResult = useMemo(() => {
    return evaluateWcagContrast(contrastFg, contrastBg);
  }, [contrastFg, contrastBg]);

  const handleSwapContrastColors = () => {
    const prevFg = contrastFg;
    setContrastFg(contrastBg);
    setContrastBg(prevFg);
  };

  // Gradient computation
  const gradientResult = useMemo(() => {
    return generateGradientCss({
      type: gradientType,
      angle: gradientAngle,
      stops: gradientStops,
    });
  }, [gradientType, gradientAngle, gradientStops]);

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Palette className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Color Studio & Contrast
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Convert color values across formats, generate harmonious palettes, inspect WCAG 2.1
            accessibility, and build CSS gradients.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_COLORS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setColorInput(p.hex);
                setContrastBg(p.hex);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('converter')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'converter'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Palette className="h-3.5 w-3.5 text-indigo-600" />
          Converter & Harmonies
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contrast')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'contrast'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          WCAG Contrast Studio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gradient')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'gradient'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          CSS Gradient Studio
        </button>
      </div>

      {/* Tab 1: Converter & Harmonies */}
      {activeTab === 'converter' && (
        <div className="flex flex-col gap-6">
          {/* Main Color Selector Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
            {/* Interactive Native Color Swatch */}
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200 shadow-inner">
              <input
                type="color"
                value={result?.hex ?? '#4f46e5'}
                onChange={handleNativePickerChange}
                aria-label="Color picker"
                className="absolute -top-4 -left-4 h-24 w-24 cursor-pointer border-0"
              />
            </div>

            {/* Color Text Input */}
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-stone-500 block mb-1">
                Input Color (HEX, RGB, or HSL)
              </label>
              <input
                type="text"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                placeholder="#4f46e5 or rgb(79, 70, 229) or hsl(243, 75%, 59%)"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-900"
              />
            </div>

            {/* Active Color Preview & Luminance Badge */}
            {result && (
              <div className="flex items-center gap-3 shrink-0 sm:pl-4 sm:border-l border-stone-100">
                <div className="flex flex-col text-right sm:text-left">
                  <span className="text-xs font-medium text-stone-500">Luminance</span>
                  <span className="font-mono text-sm font-semibold text-stone-900">
                    {result.luminance}
                  </span>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium border ${
                    result.isDark
                      ? 'bg-stone-900 text-white border-stone-800'
                      : 'bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  {result.isDark ? 'Dark Tone' : 'Light Tone'}
                </span>
              </div>
            )}
          </div>

          {result && (
            <>
              {/* Format Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* HEX Card */}
                <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    HEX Format
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="font-mono text-base font-semibold text-stone-900 uppercase">
                      {result.hex}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.hex, 'hex')}
                      className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                    >
                      {copiedKey === 'hex' ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* RGB Card */}
                <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    RGB CSS
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="font-mono text-sm font-semibold text-stone-900">
                      {result.rgb.css}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.rgb.css, 'rgb')}
                      className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                    >
                      {copiedKey === 'rgb' ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* HSL Card */}
                <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    HSL CSS
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="font-mono text-sm font-semibold text-stone-900">
                      {result.hsl.css}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.hsl.css, 'hsl')}
                      className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                    >
                      {copiedKey === 'hsl' ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* HSV Card */}
                <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    HSV Format
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="font-mono text-sm font-semibold text-stone-900">
                      hsv({result.hsv.h}°, {result.hsv.s}%, {result.hsv.v}%)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `hsv(${result.hsv.h}, ${result.hsv.s}%, ${result.hsv.v}%)`,
                          'hsv'
                        )
                      }
                      className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                    >
                      {copiedKey === 'hsv' ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tint & Shade Palette */}
              <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <span>Color Tints & Shades Scale (50 - 900)</span>
                  <span className="font-normal normal-case text-stone-400">
                    Click swatch to copy hex
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                  {result.palette.map(shade => (
                    <button
                      key={shade.label}
                      type="button"
                      onClick={() => handleCopy(shade.hex, `shade-${shade.label}`)}
                      className={`group flex flex-col items-center rounded-xl p-2.5 transition-all text-center border ${
                        shade.isBase
                          ? 'border-stone-900 ring-2 ring-stone-900/10 bg-stone-50'
                          : 'border-stone-100 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div
                        className="h-9 w-full rounded-lg shadow-xs transition-transform group-hover:scale-105"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <span className="mt-2 text-[11px] font-semibold text-stone-800">
                        {shade.label}
                        {shade.isBase && ' (Base)'}
                      </span>
                      <span className="mt-0.5 font-mono text-[10px] text-stone-500 uppercase">
                        {copiedKey === `shade-${shade.label}` ? 'Copied!' : shade.hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Harmonies */}
              {result.harmonies && (
                <div className="flex flex-col gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Color Harmonies
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Complementary */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5">
                      <span className="text-xs font-semibold text-stone-700 block mb-2">
                        Complementary (180°)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(result.harmonies!.complementary, 'comp')}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-white shadow-xs hover:bg-stone-50 transition-colors w-full"
                        >
                          <span
                            className="h-4 w-4 rounded-md shrink-0 shadow-inner"
                            style={{ backgroundColor: result.harmonies.complementary }}
                          />
                          <span className="text-xs font-mono font-semibold text-stone-800 uppercase">
                            {result.harmonies.complementary}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Analogous */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5">
                      <span className="text-xs font-semibold text-stone-700 block mb-2">
                        Analogous (±30°)
                      </span>
                      <div className="flex items-center gap-2">
                        {result.harmonies.analogous.map((hex, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleCopy(hex, `ana-${i}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white shadow-xs hover:bg-stone-50 transition-colors flex-1"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-md shrink-0 shadow-inner"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[11px] font-mono font-semibold text-stone-800 uppercase">
                              {hex}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Triadic */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5">
                      <span className="text-xs font-semibold text-stone-700 block mb-2">
                        Triadic (120°)
                      </span>
                      <div className="flex items-center gap-2">
                        {result.harmonies.triadic.map((hex, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleCopy(hex, `tri-${i}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white shadow-xs hover:bg-stone-50 transition-colors flex-1"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-md shrink-0 shadow-inner"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[11px] font-mono font-semibold text-stone-800 uppercase">
                              {hex}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Split Complementary */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5">
                      <span className="text-xs font-semibold text-stone-700 block mb-2">
                        Split-Complementary
                      </span>
                      <div className="flex items-center gap-2">
                        {result.harmonies.splitComplementary.map((hex, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleCopy(hex, `split-${i}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white shadow-xs hover:bg-stone-50 transition-colors flex-1"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-md shrink-0 shadow-inner"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[11px] font-mono font-semibold text-stone-800 uppercase">
                              {hex}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: WCAG Contrast Studio */}
      {activeTab === 'contrast' && (
        <div className="flex flex-col gap-6">
          {/* Pickers & Swap Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            {/* Foreground */}
            <div className="md:col-span-5 flex items-center gap-3">
              <input
                type="color"
                value={contrastFg}
                onChange={e => setContrastFg(e.target.value)}
                className="h-12 w-14 rounded-xl cursor-pointer border border-stone-200 p-0.5 shadow-xs"
              />
              <div className="flex-1">
                <label className="text-xs font-medium text-stone-500 block mb-1">
                  Foreground Color (Text)
                </label>
                <input
                  type="text"
                  value={contrastFg}
                  onChange={e => setContrastFg(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-1.5 font-mono text-xs text-stone-900"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center">
              <button
                type="button"
                onClick={handleSwapContrastColors}
                className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors shadow-xs"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span>Swap</span>
              </button>
            </div>

            {/* Background */}
            <div className="md:col-span-5 flex items-center gap-3">
              <input
                type="color"
                value={contrastBg}
                onChange={e => setContrastBg(e.target.value)}
                className="h-12 w-14 rounded-xl cursor-pointer border border-stone-200 p-0.5 shadow-xs"
              />
              <div className="flex-1">
                <label className="text-xs font-medium text-stone-500 block mb-1">
                  Background Color
                </label>
                <input
                  type="text"
                  value={contrastBg}
                  onChange={e => setContrastBg(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-1.5 font-mono text-xs text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Contrast Score & Badges */}
          {wcagResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Scorecard */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Contrast Ratio
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-stone-900 font-mono">
                        {wcagResult.ratio}:1
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          wcagResult.ratio >= 7
                            ? 'bg-emerald-100 text-emerald-800'
                            : wcagResult.ratio >= 4.5
                              ? 'bg-emerald-50 text-emerald-700'
                              : wcagResult.ratio >= 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {wcagResult.scoreLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* WCAG Compliance Badges */}
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                    WCAG 2.1 Conformance Status
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                      <span className="font-medium text-stone-700">AA Normal Text (≥ 4.5:1)</span>
                      {wcagResult.aaNormal ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-rose-500">
                          <XCircle className="h-4 w-4" /> Fail
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                      <span className="font-medium text-stone-700">AA Large Text (≥ 3.0:1)</span>
                      {wcagResult.aaLarge ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-rose-500">
                          <XCircle className="h-4 w-4" /> Fail
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                      <span className="font-medium text-stone-700">AAA Normal Text (≥ 7.0:1)</span>
                      {wcagResult.aaaNormal ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-rose-500">
                          <XCircle className="h-4 w-4" /> Fail
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                      <span className="font-medium text-stone-700">AAA Large Text (≥ 4.5:1)</span>
                      {wcagResult.aaaLarge ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-rose-500">
                          <XCircle className="h-4 w-4" /> Fail
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                      <span className="font-medium text-stone-700">UI Components (≥ 3.0:1)</span>
                      {wcagResult.graphicalObjects ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-rose-500">
                          <XCircle className="h-4 w-4" /> Fail
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Live UI Preview Playground */}
              <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 block">
                  Simulated Real-World UI Preview
                </span>

                <div
                  className="rounded-2xl p-6 transition-colors shadow-inner flex flex-col gap-5"
                  style={{ backgroundColor: contrastBg, color: contrastFg }}
                >
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Large Headline Typography (24px)
                    </h2>
                    <h3 className="text-lg font-semibold opacity-90 mt-1">
                      Medium Subheading (18px Bold)
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed opacity-95">
                    Nemokit runs 100% in your browser. All computations, conversions, vector
                    optimizations, and accessibility audits occur strictly in client-side
                    WebAssembly and JavaScript threads without any remote network telemetry.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg text-xs font-bold border border-current transition-opacity hover:opacity-80"
                    >
                      Sample Interactive Button
                    </button>
                    <span className="px-3 py-1 rounded-full text-xs font-medium border border-current">
                      Status Badge
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-3">
                  <span>
                    FG: <strong className="font-mono text-stone-800">{contrastFg}</strong>
                  </span>
                  <span>
                    BG: <strong className="font-mono text-stone-800">{contrastBg}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: CSS Gradient Studio */}
      {activeTab === 'gradient' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Presets */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Gradient Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {GRADIENT_PRESETS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setGradientType(p.type);
                      setGradientAngle(p.angle);
                      setGradientStops(p.stops);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${p.stops[0]?.color}, ${p.stops[1]?.color})`,
                      }}
                    />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Geometry & Type */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Gradient Type & Angle
              </span>

              <div className="flex items-center gap-2">
                {(['linear', 'radial', 'conic'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGradientType(t)}
                    className={`capitalize px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      gradientType === t
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {gradientType !== 'radial' && (
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                    <span>Angle</span>
                    <span className="font-mono">{gradientAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradientAngle}
                    onChange={e => setGradientAngle(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Color Stops */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Color Stops ({gradientStops.length})
                </span>
                {gradientStops.length < 4 && (
                  <button
                    type="button"
                    onClick={() =>
                      setGradientStops(prev => [...prev, { color: '#8b5cf6', position: 50 }])
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Add Stop
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {gradientStops.map((stop, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-stone-100 bg-stone-50/50"
                  >
                    <input
                      type="color"
                      value={stop.color}
                      onChange={e => {
                        const newStops = [...gradientStops];
                        if (newStops[index]) {
                          newStops[index] = { ...newStops[index], color: e.target.value };
                          setGradientStops(newStops);
                        }
                      }}
                      className="h-8 w-12 rounded cursor-pointer border border-stone-200 p-0.5"
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={e => {
                        const newStops = [...gradientStops];
                        if (newStops[index]) {
                          newStops[index] = { ...newStops[index], color: e.target.value };
                          setGradientStops(newStops);
                        }
                      }}
                      className="w-20 rounded-md border border-stone-200 bg-white px-2 py-1 font-mono text-xs text-stone-900"
                    />

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={e => {
                          const newStops = [...gradientStops];
                          if (newStops[index]) {
                            newStops[index] = {
                              ...newStops[index],
                              position: parseInt(e.target.value, 10),
                            };
                            setGradientStops(newStops);
                          }
                        }}
                        className="flex-1 accent-indigo-600"
                      />
                      <span className="font-mono text-xs text-stone-500 w-8 text-right">
                        {stop.position}%
                      </span>
                    </div>

                    {gradientStops.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setGradientStops(prev => prev.filter((_, i) => i !== index))}
                        className="text-stone-400 hover:text-rose-500 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Live Preview & CSS Export (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Visual Canvas */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col items-center">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider w-full mb-3">
                Live Gradient Canvas
              </span>
              <div
                className="w-full h-64 rounded-2xl shadow-inner transition-all border border-stone-200/60"
                style={{ background: gradientResult.backgroundStyle }}
              />
            </div>

            {/* Generated CSS & Tailwind Code */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-stone-600" />
                  CSS Output
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(gradientResult.css, 'css')}
                  className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium"
                >
                  {copiedKey === 'css' ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy CSS
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-800 overflow-x-auto whitespace-pre-wrap break-all">
                {gradientResult.css}
              </pre>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Tailwind Class</span>
                <button
                  type="button"
                  onClick={() => handleCopy(gradientResult.tailwindArbitrary, 'tw')}
                  className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium"
                >
                  {copiedKey === 'tw' ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy Tailwind
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] text-stone-700 overflow-x-auto whitespace-pre-wrap break-all">
                {gradientResult.tailwindArbitrary}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
