import { useState, useEffect } from 'react';
import { colorTool } from '@nemokit/core';
import type { ColorToolOutput } from '@nemokit/core';
import { Palette, Copy, Check, CheckCircle2, XCircle } from 'lucide-react';

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

export function ColorToolView() {
  const [colorInput, setColorInput] = useState<string>('#4f46e5');
  const [result, setResult] = useState<ColorToolOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Palette className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Color Converter & Contrast
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Convert color values between HEX, RGB, HSL, inspect luminance, and verify WCAG 2.1
            accessibility ratios.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_COLORS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => setColorInput(p.hex)}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

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
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
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
                    handleCopy(`hsv(${result.hsv.h}, ${result.hsv.s}%, ${result.hsv.v}%)`, 'hsv')
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

          {/* WCAG Contrast Checker & Live Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contrast against White */}
            <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Against Pure White (#FFFFFF)
                  </span>
                  <span className="font-mono text-lg font-bold text-stone-900">
                    {result.contrastWithWhite}:1
                  </span>
                </div>

                {/* Sample visual box */}
                <div
                  className="mt-3.5 flex h-20 items-center justify-center rounded-xl border border-stone-200 p-4 transition-colors"
                  style={{ backgroundColor: '#ffffff', color: result.hex }}
                >
                  <p className="text-sm font-semibold">
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-1 font-medium">
                  {result.contrastWithWhite >= 4.5 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-stone-300" />
                  )}
                  <span>Normal Text (4.5:1)</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  {result.contrastWithWhite >= 7.0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-stone-300" />
                  )}
                  <span>WCAG AAA (7.0:1)</span>
                </div>
              </div>
            </div>

            {/* Contrast against Black */}
            <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Against Pure Black (#000000)
                  </span>
                  <span className="font-mono text-lg font-bold text-stone-900">
                    {result.contrastWithBlack}:1
                  </span>
                </div>

                {/* Sample visual box */}
                <div
                  className="mt-3.5 flex h-20 items-center justify-center rounded-xl border border-stone-800 p-4 transition-colors"
                  style={{ backgroundColor: '#000000', color: result.hex }}
                >
                  <p className="text-sm font-semibold">
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-1 font-medium">
                  {result.contrastWithBlack >= 4.5 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-stone-300" />
                  )}
                  <span>Normal Text (4.5:1)</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  {result.contrastWithBlack >= 7.0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-stone-300" />
                  )}
                  <span>WCAG AAA (7.0:1)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tint & Shade Palette */}
          <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <span>Color Tints & Shades Scale</span>
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
        </>
      )}
    </div>
  );
}
