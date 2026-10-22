import type { Tool, ResultHandlers, ToolExecutionResult } from '../types.js';
import { onSuccess, onFailure } from '../types.js';

export type LogoShape = 'squircle' | 'circle' | 'shield' | 'hexagon' | 'diamond' | 'octagon';

export interface LogoIconDefinition {
  readonly id: string;
  readonly name: string;
  readonly path: string;
}

export const LOGO_ICONS: ReadonlyArray<LogoIconDefinition> = [
  {
    id: 'zap',
    name: 'Lightning Zap',
    path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  },
  {
    id: 'terminal',
    name: 'Terminal CLI',
    path: 'm4 17 6-6-6-6M12 19h8',
  },
  {
    id: 'sparkles',
    name: 'Sparkles AI',
    path: 'm12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z',
  },
  {
    id: 'shield',
    name: 'Security Shield',
    path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    id: 'rocket',
    name: 'Rocket Launch',
    path: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
  },
  {
    id: 'code',
    name: 'Code Brackets',
    path: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
  },
  {
    id: 'database',
    name: 'Database Engine',
    path: 'M3 5c0-1.66 4.03-3 9-3s9 1.34 9 3v14c0 1.66-4.03 3-9 3s-9-1.34-9-3V5zm0 7c0 1.66 4.03 3 9 3s9-1.34 9-3M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3',
  },
  {
    id: 'cpu',
    name: 'CPU Chip',
    path: 'M4 4h16v16H4zm5 5h6v6H9zM9 1v3m6-3v3m-6 16v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3',
  },
  {
    id: 'box',
    name: 'Package Cube',
    path: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  },
  {
    id: 'layers',
    name: 'Architecture Layers',
    path: 'm12 2 10 5-10 5L2 7l10-5zm0 9 10 5-10 5-10-5 10-5zm0 9 10 5-10 5-10-5 10-5z',
  },
  {
    id: 'infinity',
    name: 'Infinite Loop',
    path: 'M18.178 8c5.096 0 5.096 8 0 8-2.67 0-4.66-3.08-6.18-5.33C10.48 8.42 8.49 8 5.82 8 0.73 8 .73 16 5.82 16c2.67 0 4.66-3.08 6.18-5.33C13.52 12.92 15.51 16 18.18 16',
  },
  {
    id: 'flame',
    name: 'Flame Power',
    path: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  },
];

export interface LogoBuilderConfig {
  readonly shape: LogoShape;
  readonly backgroundType: 'gradient' | 'solid';
  readonly bgColor1: string;
  readonly bgColor2: string;
  readonly gradientAngle: number;
  readonly borderWidth: number;
  readonly borderColor: string;
  readonly shadow: boolean;
  readonly contentType: 'icon' | 'monogram';
  readonly iconId: string;
  readonly monogramText: string;
  readonly monogramFont: 'sans' | 'serif' | 'mono';
  readonly symbolColor: string;
  readonly symbolScale: number; // 0.3 - 0.8
  readonly wordmark?: string;
  readonly wordmarkColor?: string;
}

export interface LogoBuilderOutput {
  readonly svg: string;
  readonly config: LogoBuilderConfig;
}

export const DEFAULT_LOGO_CONFIG: LogoBuilderConfig = {
  shape: 'squircle',
  backgroundType: 'gradient',
  bgColor1: '#6366f1',
  bgColor2: '#a855f7',
  gradientAngle: 135,
  borderWidth: 4,
  borderColor: '#ffffff33',
  shadow: true,
  contentType: 'icon',
  iconId: 'zap',
  monogramText: 'NK',
  monogramFont: 'sans',
  symbolColor: '#ffffff',
  symbolScale: 0.5,
  wordmark: '',
  wordmarkColor: '#ffffff',
};

export const LOGO_PRESETS: ReadonlyArray<{ name: string; config: LogoBuilderConfig }> = [
  {
    name: 'Cyber Indigo',
    config: {
      ...DEFAULT_LOGO_CONFIG,
      shape: 'squircle',
      backgroundType: 'gradient',
      bgColor1: '#4f46e5',
      bgColor2: '#06b6d4',
      gradientAngle: 135,
      iconId: 'zap',
      contentType: 'icon',
      borderWidth: 6,
      borderColor: '#ffffff40',
    },
  },
  {
    name: 'Emerald Shield',
    config: {
      ...DEFAULT_LOGO_CONFIG,
      shape: 'shield',
      backgroundType: 'gradient',
      bgColor1: '#059669',
      bgColor2: '#10b981',
      gradientAngle: 180,
      iconId: 'shield',
      contentType: 'icon',
      borderWidth: 8,
      borderColor: '#34d399',
    },
  },
  {
    name: 'Monogram Noir',
    config: {
      ...DEFAULT_LOGO_CONFIG,
      shape: 'octagon',
      backgroundType: 'gradient',
      bgColor1: '#18181b',
      bgColor2: '#27272a',
      gradientAngle: 45,
      contentType: 'monogram',
      monogramText: 'DEV',
      monogramFont: 'mono',
      symbolColor: '#38bdf8',
      borderWidth: 4,
      borderColor: '#38bdf866',
    },
  },
  {
    name: 'Solar Rocket',
    config: {
      ...DEFAULT_LOGO_CONFIG,
      shape: 'circle',
      backgroundType: 'gradient',
      bgColor1: '#ea580c',
      bgColor2: '#f59e0b',
      gradientAngle: 120,
      iconId: 'rocket',
      contentType: 'icon',
      borderWidth: 4,
      borderColor: '#ffedd5',
    },
  },
  {
    name: 'AI Sparkle',
    config: {
      ...DEFAULT_LOGO_CONFIG,
      shape: 'diamond',
      backgroundType: 'gradient',
      bgColor1: '#9333ea',
      bgColor2: '#ec4899',
      gradientAngle: 90,
      iconId: 'sparkles',
      contentType: 'icon',
      borderWidth: 6,
      borderColor: '#fdf2f8',
    },
  },
];

function getShapeMarkup(shape: LogoShape, borderWidth: number, borderColor: string): string {
  const strokeAttr =
    borderWidth > 0 ? `stroke="${borderColor}" stroke-width="${borderWidth * 2}"` : '';

  switch (shape) {
    case 'circle':
      return `<circle cx="256" cy="256" r="236" fill="url(#bgGrad)" ${strokeAttr} />`;
    case 'hexagon':
      return `<polygon points="256,20 460,138 460,374 256,492 52,374 52,138" fill="url(#bgGrad)" ${strokeAttr} stroke-linejoin="round" />`;
    case 'diamond':
      return `<polygon points="256,20 492,256 256,492 20,256" fill="url(#bgGrad)" ${strokeAttr} stroke-linejoin="round" />`;
    case 'shield':
      return `<path d="M 256,24 C 360,24 476,52 476,144 C 476,336 336,448 256,488 C 176,448 36,336 36,144 C 36,52 152,24 256,24 Z" fill="url(#bgGrad)" ${strokeAttr} stroke-linejoin="round" />`;
    case 'octagon':
      return `<polygon points="160,20 352,20 492,160 492,352 352,492 160,492 20,352 20,160" fill="url(#bgGrad)" ${strokeAttr} stroke-linejoin="round" />`;
    case 'squircle':
    default:
      return `<rect x="20" y="20" width="472" height="472" rx="104" ry="104" fill="url(#bgGrad)" ${strokeAttr} />`;
  }
}

export function generateLogoSvg(config: LogoBuilderConfig): string {
  const {
    shape = 'squircle',
    backgroundType = 'gradient',
    bgColor1 = '#6366f1',
    bgColor2 = '#a855f7',
    gradientAngle = 135,
    borderWidth = 4,
    borderColor = '#ffffff33',
    shadow = true,
    contentType = 'icon',
    iconId = 'zap',
    monogramText = 'NK',
    monogramFont = 'sans',
    symbolColor = '#ffffff',
    symbolScale = 0.5,
    wordmark = '',
    wordmarkColor = '#ffffff',
  } = config;

  // Compute gradient vector from angle
  const rad = ((gradientAngle - 90) * Math.PI) / 180;
  const x1 = Math.round(50 + 50 * Math.cos(rad));
  const y1 = Math.round(50 + 50 * Math.sin(rad));
  const x2 = Math.round(50 + 50 * Math.cos(rad + Math.PI));
  const y2 = Math.round(50 + 50 * Math.sin(rad + Math.PI));

  const gradientDef =
    backgroundType === 'gradient'
      ? `<linearGradient id="bgGrad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stop-color="${bgColor1}" />
      <stop offset="100%" stop-color="${bgColor2}" />
    </linearGradient>`
      : `<linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgColor1}" />
      <stop offset="100%" stop-color="${bgColor1}" />
    </linearGradient>`;

  const shadowFilter = shadow
    ? `<filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.35" />
    </filter>`
    : '';

  const shapeElement = getShapeMarkup(shape, borderWidth, borderColor);

  // Content: Icon vs Monogram
  let contentElement = '';
  const scale = Math.max(0.2, Math.min(0.9, symbolScale));
  const centerShiftY = wordmark ? -36 : 0;

  if (contentType === 'icon') {
    const selectedIcon = LOGO_ICONS.find(i => i.id === iconId) ||
      LOGO_ICONS[0] || {
        id: 'zap',
        name: 'Lightning Zap',
        path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      };
    const iconSize = 512 * scale;
    const offset = (512 - iconSize) / 2;

    const isStrokeIcon =
      selectedIcon.path.includes('M4 17') || selectedIcon.path.includes('m16 18');
    const fillOrStroke = isStrokeIcon
      ? `fill="none" stroke="${symbolColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`
      : `fill="${symbolColor}" stroke="none"`;

    contentElement = `<g transform="translate(${offset}, ${offset + centerShiftY})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" ${fillOrStroke}>
        <path d="${selectedIcon.path}" />
      </svg>
    </g>`;
  } else {
    // Monogram
    const fontFamily =
      monogramFont === 'mono'
        ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        : monogramFont === 'serif'
          ? 'Georgia, Cambria, "Times New Roman", Times, serif'
          : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const fontSize = Math.round(200 * scale * (3 / Math.max(2, monogramText.length)));
    contentElement = `<text x="256" y="${256 + fontSize * 0.35 + centerShiftY}" text-anchor="middle" font-family="${fontFamily}" font-size="${fontSize}" font-weight="800" fill="${symbolColor}" letter-spacing="1">
      ${escapeXml(monogramText)}
    </text>`;
  }

  // Optional Wordmark
  const wordmarkElement = wordmark
    ? `<text x="256" y="420" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="700" fill="${wordmarkColor}" letter-spacing="3">
      ${escapeXml(wordmark.toUpperCase())}
    </text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    ${gradientDef}
    ${shadowFilter}
  </defs>
  <g ${shadow ? 'filter="url(#dropShadow)"' : ''}>
    ${shapeElement}
  </g>
  ${contentElement}
  ${wordmarkElement}
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class LogoBuilderTool implements Tool<LogoBuilderConfig, LogoBuilderOutput> {
  public readonly id = 'logo-builder';
  public readonly name = 'Logo & Brand Badge Builder';
  public readonly description =
    'Design clean vector app icons, brand badges, and developer logos with customizable geometry, gradients, monograms, and instant SVG/PNG export.';
  public readonly category = 'images';

  public execute(
    input: LogoBuilderConfig,
    handlers?: Partial<ResultHandlers<LogoBuilderOutput, void>>
  ): ToolExecutionResult<LogoBuilderOutput> {
    const startTime = performance.now();
    try {
      const svg = generateLogoSvg(input);
      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      const data: LogoBuilderOutput = {
        svg,
        config: input,
      };
      const res = onSuccess(data, durationMs);
      handlers?.onSuccess?.(data, durationMs);
      return res;
    } catch (err) {
      const res = onFailure(err instanceof Error ? err.message : 'Failed to generate logo.');
      handlers?.onFailure?.(res.error);
      return res;
    }
  }
}

export const logoBuilderTool = new LogoBuilderTool();
