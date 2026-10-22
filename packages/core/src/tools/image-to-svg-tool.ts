import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export type VectorizeMode = 'monochrome' | 'posterize' | 'pixel';

export interface ImageToSvgInput {
  readonly width: number;
  readonly height: number;
  readonly pixels: Uint8ClampedArray; // RGBA
  readonly mode?: VectorizeMode;
  readonly threshold?: number; // 0 to 255 (for monochrome)
  readonly colorCount?: number; // 2 to 16 (for posterize)
  readonly invert?: boolean;
}

export interface ImageToSvgOutput {
  readonly svg: string;
  readonly width: number;
  readonly height: number;
  readonly pathCount: number;
  readonly byteSize: number;
  readonly mode: VectorizeMode;
}

/**
 * Converts RGBA pixels into optimized SVG paths.
 */
export function bitmapToSvg(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  mode: VectorizeMode = 'monochrome',
  threshold = 128,
  colorCount = 4,
  invert = false
): { svg: string; pathCount: number } {
  if (width <= 0 || height <= 0 || pixels.length === 0) {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>`,
      pathCount: 0,
    };
  }

  if (mode === 'monochrome') {
    // Group horizontal runs of matching pixels to minimize SVG path size
    const pathSegments: string[] = [];
    let pathCount = 0;

    for (let y = 0; y < height; y++) {
      let runStart = -1;

      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx]!;
        const g = pixels[idx + 1]!;
        const b = pixels[idx + 2]!;
        const a = pixels[idx + 3]!;

        // Perceived luminance
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const isForeground = a > 64 && (invert ? lum >= threshold : lum < threshold);

        if (isForeground) {
          if (runStart === -1) {
            runStart = x;
          }
        } else {
          if (runStart !== -1) {
            const runWidth = x - runStart;
            pathSegments.push(`M${runStart},${y}h${runWidth}v1h-${runWidth}z`);
            pathCount++;
            runStart = -1;
          }
        }
      }

      if (runStart !== -1) {
        const runWidth = width - runStart;
        pathSegments.push(`M${runStart},${y}h${runWidth}v1h-${runWidth}z`);
        pathCount++;
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <path fill="#1c1917" d="${pathSegments.join('')}"/>
</svg>`;

    return { svg, pathCount };
  }

  if (mode === 'pixel') {
    // Pixel vector art
    const rects: string[] = [];
    let pathCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const a = pixels[idx + 3]!;
        if (a < 32) continue;

        const r = pixels[idx]!;
        const g = pixels[idx + 1]!;
        const b = pixels[idx + 2]!;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

        rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${hex}"/>`);
        pathCount++;
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${rects.join('\n  ')}
</svg>`;

    return { svg, pathCount };
  }

  // Posterized mode: Quantize into prominent color buckets
  const step = Math.max(1, Math.floor(256 / Math.min(16, Math.max(2, colorCount))));
  const colorBuckets = new Map<string, string[]>();

  for (let y = 0; y < height; y++) {
    let currentHex = '';
    let runStart = -1;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = pixels[idx + 3]!;
      if (a < 32) {
        if (runStart !== -1) {
          const runWidth = x - runStart;
          const bucket = colorBuckets.get(currentHex) ?? [];
          bucket.push(`M${runStart},${y}h${runWidth}v1h-${runWidth}z`);
          colorBuckets.set(currentHex, bucket);
          runStart = -1;
        }
        continue;
      }

      const r = Math.min(255, Math.floor(pixels[idx]! / step) * step);
      const g = Math.min(255, Math.floor(pixels[idx + 1]! / step) * step);
      const b = Math.min(255, Math.floor(pixels[idx + 2]! / step) * step);
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

      if (hex !== currentHex) {
        if (runStart !== -1) {
          const runWidth = x - runStart;
          const bucket = colorBuckets.get(currentHex) ?? [];
          bucket.push(`M${runStart},${y}h${runWidth}v1h-${runWidth}z`);
          colorBuckets.set(currentHex, bucket);
        }
        currentHex = hex;
        runStart = x;
      }
    }

    if (runStart !== -1) {
      const runWidth = width - runStart;
      const bucket = colorBuckets.get(currentHex) ?? [];
      bucket.push(`M${runStart},${y}h${runWidth}v1h-${runWidth}z`);
      colorBuckets.set(currentHex, bucket);
    }
  }

  const paths: string[] = [];
  let totalPaths = 0;

  for (const [hex, segments] of colorBuckets.entries()) {
    paths.push(`  <path fill="${hex}" d="${segments.join('')}"/>`);
    totalPaths += segments.length;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${paths.join('\n')}
</svg>`;

  return { svg, pathCount: totalPaths };
}

export const imageToSvgTool: Tool<ImageToSvgInput, ImageToSvgOutput> = {
  id: 'image-to-svg',
  name: 'Image to SVG Vectorizer',
  description:
    'Convert raster bitmaps (PNG, JPEG, WebP) into scalable vector SVG markup with monochrome and posterization modes.',
  category: 'images',

  execute(
    input: ImageToSvgInput,
    handlers?: Partial<ResultHandlers<ImageToSvgOutput, void>>
  ): ToolExecutionResult<ImageToSvgOutput> {
    const startTime = performance.now();
    try {
      const mode = input.mode ?? 'monochrome';
      const threshold = input.threshold ?? 128;
      const colorCount = input.colorCount ?? 4;
      const invert = input.invert ?? false;

      const { svg, pathCount } = bitmapToSvg(
        input.pixels,
        input.width,
        input.height,
        mode,
        threshold,
        colorCount,
        invert
      );

      const byteSize = new TextEncoder().encode(svg).length;

      const output: ImageToSvgOutput = {
        svg,
        width: input.width,
        height: input.height,
        pathCount,
        byteSize,
        mode,
      };

      const durationMs = performance.now() - startTime;
      const res = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Vectorization failed';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
