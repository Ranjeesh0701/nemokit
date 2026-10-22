import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface ColorRgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
  readonly css: string;
}

export interface ColorHsl {
  readonly h: number;
  readonly s: number;
  readonly l: number;
  readonly a: number;
  readonly css: string;
}

export interface ColorHsv {
  readonly h: number;
  readonly s: number;
  readonly v: number;
}

export interface ColorToolInput {
  readonly color: string;
  readonly compareColor?: string;
}

export interface ColorToolOutput {
  readonly inputColor: string;
  readonly hex: string;
  readonly rgb: ColorRgb;
  readonly hsl: ColorHsl;
  readonly hsv: ColorHsv;
  readonly luminance: number;
  readonly isDark: boolean;
  readonly contrastWithWhite: number;
  readonly contrastWithBlack: number;
  readonly customContrast?: {
    readonly compareHex: string;
    readonly ratio: number;
    readonly passesAANormal: boolean;
    readonly passesAALarge: boolean;
    readonly passesAAA: boolean;
  };
  readonly palette: ReadonlyArray<{
    readonly label: string;
    readonly hex: string;
    readonly isBase?: boolean;
  }>;
}

interface ParsedRgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColorToRgba(input: string): ParsedRgba | null {
  const str = input.trim();

  // HEX: #rgb, #rgba, #rrggbb, #rrggbbaa
  const hexMatch = str.match(/^#?([a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i);
  if (hexMatch && hexMatch[1]) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map(c => c + c)
        .join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a =
      hex.length === 8 ? Math.round((parseInt(hex.substring(6, 8), 16) / 255) * 100) / 100 : 1;
    return { r, g, b, a };
  }

  // RGB/RGBA: rgb(255, 255, 255) or rgba(255, 255, 255, 0.5)
  const rgbMatch = str.match(
    /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    const a = rgbMatch[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(rgbMatch[4]))) : 1;
    return { r, g, b, a };
  }

  // HSL/HSLA: hsl(240, 100%, 50%) or hsla(240, 100%, 50%, 0.8)
  const hslMatch = str.match(
    /hsla?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (hslMatch && hslMatch[1] && hslMatch[2] && hslMatch[3]) {
    const h = parseInt(hslMatch[1], 10) % 360;
    const s = Math.min(100, Math.max(0, parseInt(hslMatch[2], 10))) / 100;
    const l = Math.min(100, Math.max(0, parseInt(hslMatch[3], 10))) / 100;
    const a = hslMatch[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(hslMatch[4]))) : 1;
    const { r, g, b } = hslToRgb(h, s, l);
    return { r, g, b, a };
  }

  return null;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = x;
  } else if (hp >= 1 && hp < 2) {
    r1 = x;
    g1 = c;
  } else if (hp >= 2 && hp < 3) {
    g1 = c;
    b1 = x;
  } else if (hp >= 3 && hp < 4) {
    g1 = x;
    b1 = c;
  } else if (hp >= 4 && hp < 5) {
    r1 = x;
    b1 = c;
  } else if (hp >= 5 && hp < 6) {
    r1 = c;
    b1 = x;
  }

  const m = l - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h = 0;

  if (max === rn) {
    h = (gn - bn) / delta + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / delta + 2;
  } else {
    h = (rn - gn) / delta + 4;
  }

  h = Math.round(h * 60);
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number): ColorHsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
    } else if (max === gn) {
      h = ((bn - rn) / delta + 2) * 60;
    } else {
      h = ((rn - gn) / delta + 4) * 60;
    }
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function toHex(val: number): string {
  const h = Math.round(Math.max(0, Math.min(255, val))).toString(16);
  return h.length === 1 ? `0${h}` : h;
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const transform = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function getContrastRatio(lum1: number, lum2: number): number {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  const ratio = (l1 + 0.05) / (l2 + 0.05);
  return Math.round(ratio * 100) / 100;
}

export const colorTool: Tool<ColorToolInput, ColorToolOutput> = {
  id: 'color-tool',
  name: 'Color Converter & Contrast',
  description:
    'Converts colors across HEX, RGB, HSL, and HSV formats, computes WCAG accessibility contrast ratios, and generates shades.',
  category: 'converters',

  execute(
    input: ColorToolInput,
    handlers?: Partial<ResultHandlers<ColorToolOutput, void>>
  ): ToolExecutionResult<ColorToolOutput> {
    const startTime = performance.now();

    const rawColor = input?.color?.trim() || '#4f46e5';
    const parsed = parseColorToRgba(rawColor);

    if (!parsed) {
      const res = onFailure(
        `Unable to parse color "${rawColor}". Use HEX (#4f46e5), RGB (rgb(79,70,229)), or HSL (hsl(243,75%,59%)).`,
        'INVALID_COLOR_FORMAT'
      );
      handlers?.onFailure?.(res.error);
      return res;
    }

    const { r, g, b, a } = parsed;
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);

    const rgbCss = a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    const hslCss =
      a < 1 ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})` : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    const luminance = Math.round(getRelativeLuminance(r, g, b) * 1000) / 1000;
    const isDark = luminance < 0.5;

    // Luminance of pure white = 1.0, pure black = 0.0
    const contrastWithWhite = getContrastRatio(luminance, 1.0);
    const contrastWithBlack = getContrastRatio(luminance, 0.0);

    // Custom comparison if provided
    let customContrast: ColorToolOutput['customContrast'] = undefined;
    if (input?.compareColor) {
      const compParsed = parseColorToRgba(input.compareColor);
      if (compParsed) {
        const compLum = getRelativeLuminance(compParsed.r, compParsed.g, compParsed.b);
        const compHex = `#${toHex(compParsed.r)}${toHex(compParsed.g)}${toHex(compParsed.b)}`;
        const ratio = getContrastRatio(luminance, compLum);
        customContrast = {
          compareHex: compHex,
          ratio,
          passesAANormal: ratio >= 4.5,
          passesAALarge: ratio >= 3.0,
          passesAAA: ratio >= 7.0,
        };
      }
    }

    // Generate tint & shade palette (50, 100, 200 ... 900)
    const steps = [
      { label: '50', l: 96 },
      { label: '100', l: 90 },
      { label: '200', l: 80 },
      { label: '300', l: 70 },
      { label: '400', l: 60 },
      { label: '500', l: hsl.l, isBase: true },
      { label: '600', l: Math.max(10, hsl.l - 12) },
      { label: '700', l: Math.max(8, hsl.l - 24) },
      { label: '800', l: Math.max(5, hsl.l - 36) },
      { label: '900', l: Math.max(3, hsl.l - 48) },
    ];

    const palette = steps.map(step => {
      const rgbStep = hslToRgb(hsl.h, hsl.s / 100, step.l / 100);
      return {
        label: step.label,
        hex: `#${toHex(rgbStep.r)}${toHex(rgbStep.g)}${toHex(rgbStep.b)}`,
        isBase: step.isBase,
      };
    });

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const result: ColorToolOutput = {
      inputColor: rawColor,
      hex,
      rgb: { r, g, b, a, css: rgbCss },
      hsl: { h: hsl.h, s: hsl.s, l: hsl.l, a, css: hslCss },
      hsv,
      luminance,
      isDark,
      contrastWithWhite,
      contrastWithBlack,
      customContrast,
      palette,
    };

    const successRes = onSuccess(result, durationMs);
    handlers?.onSuccess?.(result);
    return successRes;
  },
};
