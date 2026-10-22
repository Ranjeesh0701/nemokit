import type { Tool, ResultHandlers, ToolExecutionResult } from '../types.js';
import { onSuccess, onFailure } from '../types.js';

export type PatternType =
  | 'dots'
  | 'grid'
  | 'lines'
  | 'crosshatch'
  | 'hexagons'
  | 'waves'
  | 'chevrons'
  | 'circuits'
  | 'memphis'
  | 'triangles';

export interface PatternInput {
  readonly patternType: PatternType;
  readonly foreground: string;
  readonly background: string;
  readonly spacing: number; // 10 - 120
  readonly strokeWidth: number; // 0.5 - 8
  readonly opacity: number; // 0.05 - 1
  readonly seed?: number;
}

export interface PatternOutput {
  readonly svg: string;
  readonly cssRule: string;
  readonly cssDataUrl: string;
  readonly tailwindClass: string;
  readonly config: PatternInput;
}

export const DEFAULT_PATTERN_CONFIG: PatternInput = {
  patternType: 'dots',
  foreground: '#6366f1',
  background: '#ffffff',
  spacing: 24,
  strokeWidth: 2,
  opacity: 0.8,
  seed: 42,
};

export const PATTERN_PRESETS: ReadonlyArray<{ name: string; config: PatternInput }> = [
  {
    name: 'Tech Blueprint',
    config: {
      patternType: 'grid',
      foreground: '#0284c7',
      background: '#0f172a',
      spacing: 32,
      strokeWidth: 1,
      opacity: 0.4,
      seed: 1,
    },
  },
  {
    name: 'Minimal Polka',
    config: {
      patternType: 'dots',
      foreground: '#a855f7',
      background: '#faf5ff',
      spacing: 24,
      strokeWidth: 2,
      opacity: 0.6,
      seed: 2,
    },
  },
  {
    name: 'Cyber Circuit',
    config: {
      patternType: 'circuits',
      foreground: '#10b981',
      background: '#09090b',
      spacing: 48,
      strokeWidth: 1.5,
      opacity: 0.7,
      seed: 3,
    },
  },
  {
    name: 'Memphis Confetti',
    config: {
      patternType: 'memphis',
      foreground: '#f43f5e',
      background: '#fff1f2',
      spacing: 40,
      strokeWidth: 2,
      opacity: 0.65,
      seed: 4,
    },
  },
  {
    name: 'Honeycomb Hex',
    config: {
      patternType: 'hexagons',
      foreground: '#f59e0b',
      background: '#ffffff',
      spacing: 36,
      strokeWidth: 1.5,
      opacity: 0.5,
      seed: 5,
    },
  },
  {
    name: 'Flowing Waves',
    config: {
      patternType: 'waves',
      foreground: '#4f46e5',
      background: '#eef2ff',
      spacing: 30,
      strokeWidth: 2,
      opacity: 0.55,
      seed: 6,
    },
  },
];

export function generatePatternTile(config: PatternInput): string {
  const {
    patternType = 'dots',
    foreground = '#6366f1',
    background = '#ffffff',
    spacing = 24,
    strokeWidth = 2,
    opacity = 0.8,
  } = config;

  const s = Math.max(8, Math.min(160, spacing));
  const sw = Math.max(0.5, Math.min(10, strokeWidth));
  const fgColor = foreground;
  const op = Math.max(0.01, Math.min(1, opacity));

  let innerElements = '';

  switch (patternType) {
    case 'dots': {
      const r = sw;
      innerElements = `<circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="${fgColor}" opacity="${op}" />`;
      break;
    }
    case 'grid': {
      innerElements = `
        <line x1="0" y1="0" x2="${s}" y2="0" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
        <line x1="0" y1="0" x2="0" y2="${s}" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
      `;
      break;
    }
    case 'lines': {
      // 45 degree diagonal stripes
      innerElements = `
        <line x1="0" y1="${s}" x2="${s}" y2="0" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
        <line x1="-${s / 2}" y1="${s / 2}" x2="${s / 2}" y2="-${s / 2}" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
        <line x1="${s / 2}" y1="${s * 1.5}" x2="${s * 1.5}" y2="${s / 2}" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
      `;
      break;
    }
    case 'crosshatch': {
      innerElements = `
        <line x1="0" y1="${s}" x2="${s}" y2="0" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
        <line x1="0" y1="0" x2="${s}" y2="${s}" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
      `;
      break;
    }
    case 'hexagons': {
      const h = Math.round(s * 0.866);
      innerElements = `
        <polygon points="${s / 2},0 ${s},${h / 3} ${s},${(2 * h) / 3} ${s / 2},${h} 0,${(2 * h) / 3} 0,${h / 3}" 
          fill="none" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
      `;
      break;
    }
    case 'waves': {
      innerElements = `
        <path d="M 0,${s / 2} Q ${s / 4},${s / 4} ${s / 2},${s / 2} T ${s},${s / 2}" 
          fill="none" stroke="${fgColor}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}" />
      `;
      break;
    }
    case 'chevrons': {
      innerElements = `
        <polyline points="0,${s / 4} ${s / 2},${s / 2} ${s},${s / 4}" 
          fill="none" stroke="${fgColor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" />
        <polyline points="0,${(3 * s) / 4} ${s / 2},${s} ${s},${(3 * s) / 4}" 
          fill="none" stroke="${fgColor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" />
      `;
      break;
    }
    case 'circuits': {
      innerElements = `
        <line x1="0" y1="${s / 2}" x2="${s / 2}" y2="${s / 2}" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
        <line x1="${s / 2}" y1="${s / 2}" x2="${(3 * s) / 4}" y2="${s / 4}" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
        <line x1="${(3 * s) / 4}" y1="${s / 4}" x2="${s}" y2="${s / 4}" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
        <circle cx="${s / 2}" cy="${s / 2}" r="${sw * 1.6}" fill="${fgColor}" opacity="${op}" />
        <circle cx="${s}" cy="${s / 4}" r="${sw * 1.6}" fill="${fgColor}" opacity="${op}" />
      `;
      break;
    }
    case 'triangles': {
      innerElements = `
        <polygon points="0,0 ${s},0 ${s / 2},${s}" fill="none" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
      `;
      break;
    }
    case 'memphis':
    default: {
      innerElements = `
        <circle cx="${s / 4}" cy="${s / 4}" r="${sw * 1.5}" fill="${fgColor}" opacity="${op}" />
        <polygon points="${(3 * s) / 4},${s / 5} ${(3 * s) / 4 + sw * 2},${s / 5 + sw * 3.5} ${(3 * s) / 4 - sw * 2},${s / 5 + sw * 3.5}" fill="${fgColor}" opacity="${op}" />
        <line x1="${s / 5}" y1="${(3 * s) / 4}" x2="${s / 5 + sw * 4}" y2="${(3 * s) / 4}" stroke="${fgColor}" stroke-width="${sw}" opacity="${op}" />
        <circle cx="${(3 * s) / 4}" cy="${(3 * s) / 4}" r="${sw * 2}" fill="none" stroke="${fgColor}" stroke-width="${sw * 0.8}" opacity="${op}" />
      `;
      break;
    }
  }

  const bgRect =
    background && background !== 'transparent'
      ? `<rect width="${s}" height="${s}" fill="${background}" />`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  ${bgRect}
  ${innerElements}
</svg>`;
}

export class PatternGeneratorTool implements Tool<PatternInput, PatternOutput> {
  public readonly id = 'pattern-generator';
  public readonly name = 'Background & Pattern Studio';
  public readonly description =
    'Generate customizable procedural vector patterns, repeating background textures, CSS data URIs, and SVG tiles.';
  public readonly category = 'images';

  public execute(
    input: PatternInput,
    handlers?: Partial<ResultHandlers<PatternOutput, void>>
  ): ToolExecutionResult<PatternOutput> {
    const startTime = performance.now();
    try {
      const svg = generatePatternTile(input);
      const encodedSvg = encodeURIComponent(svg.replace(/\s+/g, ' ').trim());
      const cssDataUrl = `url("data:image/svg+xml,${encodedSvg}")`;
      const bgProp =
        input.background && input.background !== 'transparent'
          ? `background-color: ${input.background}; `
          : '';
      const cssRule = `${bgProp}background-image: ${cssDataUrl}; background-repeat: repeat;`;
      const tailwindClass = `bg-[${cssDataUrl.replace(/\s+/g, '_')}]`;

      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      const data: PatternOutput = {
        svg,
        cssRule,
        cssDataUrl,
        tailwindClass,
        config: input,
      };

      const res = onSuccess(data, durationMs);
      handlers?.onSuccess?.(data, durationMs);
      return res;
    } catch (err) {
      const res = onFailure(err instanceof Error ? err.message : 'Failed to generate pattern.');
      handlers?.onFailure?.(res.error);
      return res;
    }
  }
}

export const patternGeneratorTool = new PatternGeneratorTool();
