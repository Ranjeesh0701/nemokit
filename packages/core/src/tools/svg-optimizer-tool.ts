import type { Tool, ResultHandlers, ToolExecutionResult } from '../types.js';
import { onSuccess, onFailure } from '../types.js';

export interface SvgOptimizerInput {
  readonly svg: string;
  readonly precision?: number;
  readonly removeComments?: boolean;
  readonly removeMetadata?: boolean;
  readonly removeEmptyContainers?: boolean;
  readonly removeEditorAttributes?: boolean;
  readonly collapseWhitespace?: boolean;
}

export interface SvgOptimizerOutput {
  readonly optimized: string;
  readonly reactJsx: string;
  readonly stats: {
    readonly originalBytes: number;
    readonly optimizedBytes: number;
    readonly savedBytes: number;
    readonly savingsPercent: number;
  };
}

function roundNumbersInPath(d: string, precision: number): string {
  // Matches floating point numbers in SVG path strings
  return d.replace(/-?\d+\.\d+/g, match => {
    const num = parseFloat(match);
    return Number(num.toFixed(precision)).toString();
  });
}

function convertSvgToReactJsx(svgString: string): string {
  // Transform standard SVG attributes into camelCase React JSX properties
  const attrMap: Record<string, string> = {
    class: 'className',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'stroke-opacity': 'strokeOpacity',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'clip-path': 'clipPath',
    'fill-opacity': 'fillOpacity',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    'xmlns:xlink': 'xmlnsXlink',
    'xlink:href': 'xlinkHref',
    'color-interpolation-filters': 'colorInterpolationFilters',
  };

  let jsx = svgString;
  for (const [kebab, camel] of Object.entries(attrMap)) {
    const reg = new RegExp(`\\b${kebab}=`, 'g');
    jsx = jsx.replace(reg, `${camel}=`);
  }

  return `import type { SVGProps } from 'react';

export function SvgIcon(props: SVGProps<SVGSVGElement>) {
  return (
    ${jsx.replace('<svg', '<svg {...props}')}
  );
}`;
}

export function optimizeSvgString(
  svg: string,
  options: {
    precision?: number;
    removeComments?: boolean;
    removeMetadata?: boolean;
    removeEmptyContainers?: boolean;
    removeEditorAttributes?: boolean;
    collapseWhitespace?: boolean;
  } = {}
): string {
  const {
    precision = 1,
    removeComments = true,
    removeMetadata = true,
    removeEmptyContainers = true,
    removeEditorAttributes = true,
    collapseWhitespace = true,
  } = options;

  let cleaned = svg;

  // 1. Remove XML declaration & DOCTYPE
  cleaned = cleaned.replace(/<\?xml[\s\S]*?\?>/gi, '');
  cleaned = cleaned.replace(/<!DOCTYPE[\s\S]*?>/gi, '');

  // 2. Remove comments
  if (removeComments) {
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  }

  // 3. Remove metadata, title, desc
  if (removeMetadata) {
    cleaned = cleaned.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    cleaned = cleaned.replace(/<desc[\s\S]*?<\/desc>/gi, '');
  }

  // 4. Remove editor namespace definitions and proprietary attributes
  if (removeEditorAttributes) {
    // Namespaces
    cleaned = cleaned.replace(/\s*xmlns:(?:sketch|inkscape|sodipodi|illustrator)="[^"]*"/gi, '');
    // Attributes
    cleaned = cleaned.replace(/\s*(?:sketch|inkscape|sodipodi):[a-z0-9_-]+="[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*data-name="[^"]*"/gi, '');
    // Redundant layer IDs
    cleaned = cleaned.replace(/\s*id="(?:Layer|layer|Page|page)[^"]*"/gi, '');
  }

  // 5. Round coordinates in `d` path attributes
  cleaned = cleaned.replace(/\bd="([^"]+)"/g, (_, dContent: string) => {
    return `d="${roundNumbersInPath(dContent, precision)}"`;
  });

  // 6. Round coordinates in transform, points, and viewBox attributes
  cleaned = cleaned.replace(/\bpoints="([^"]+)"/g, (_, pts: string) => {
    return `points="${roundNumbersInPath(pts, precision)}"`;
  });

  // 7. Remove empty container tags like <g></g> or <g/>
  if (removeEmptyContainers) {
    cleaned = cleaned.replace(/<g\b[^>]*>\s*<\/g>/gi, '');
    cleaned = cleaned.replace(/<g\b[^>]*\/>/gi, '');
    cleaned = cleaned.replace(/<defs\b[^>]*>\s*<\/defs>/gi, '');
  }

  // 8. Collapse redundant whitespace
  if (collapseWhitespace) {
    cleaned = cleaned.replace(/>\s+</g, '><');
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.trim();
  }

  return cleaned;
}

export class SvgOptimizerTool implements Tool<SvgOptimizerInput, SvgOptimizerOutput> {
  public readonly id = 'svg-optimizer';
  public readonly name = 'SVG Optimizer & Cleaner';
  public readonly description =
    'Sanitize, minify, and clean vector SVG files by removing export bloat, rounding decimals, and generating React JSX.';
  public readonly category = 'images';

  public execute(
    input: SvgOptimizerInput,
    handlers?: Partial<ResultHandlers<SvgOptimizerOutput, void>>
  ): ToolExecutionResult<SvgOptimizerOutput> {
    const startTime = performance.now();

    if (!input.svg || typeof input.svg !== 'string' || !input.svg.trim()) {
      const res = onFailure('Empty SVG input provided.');
      handlers?.onFailure?.(res.error);
      return res;
    }

    if (!input.svg.includes('<svg')) {
      const res = onFailure('Invalid SVG: Input does not contain an <svg> tag.');
      handlers?.onFailure?.(res.error);
      return res;
    }

    try {
      const originalBytes = new TextEncoder().encode(input.svg).length;
      const optimized = optimizeSvgString(input.svg, {
        precision: input.precision ?? 1,
        removeComments: input.removeComments ?? true,
        removeMetadata: input.removeMetadata ?? true,
        removeEmptyContainers: input.removeEmptyContainers ?? true,
        removeEditorAttributes: input.removeEditorAttributes ?? true,
        collapseWhitespace: input.collapseWhitespace ?? true,
      });

      const optimizedBytes = new TextEncoder().encode(optimized).length;
      const savedBytes = Math.max(0, originalBytes - optimizedBytes);
      const savingsPercent = originalBytes > 0 ? Math.round((savedBytes / originalBytes) * 100) : 0;

      const reactJsx = convertSvgToReactJsx(optimized);

      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      const output: SvgOptimizerOutput = {
        optimized,
        reactJsx,
        stats: {
          originalBytes,
          optimizedBytes,
          savedBytes,
          savingsPercent,
        },
      };

      const res = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output, durationMs);
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to optimize SVG.';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  }
}

export const svgOptimizerTool = new SvgOptimizerTool();
