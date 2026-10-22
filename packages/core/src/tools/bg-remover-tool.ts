import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface BgRemoverInput {
  readonly targetColor?: RgbColor;
  readonly tolerance?: number; // 0 to 100
  readonly feather?: number; // 0 to 20
  readonly autoDetect?: boolean;
}

export interface BgRemoverOutput {
  readonly targetColor: RgbColor;
  readonly tolerance: number;
  readonly feather: number;
  readonly autoDetected: boolean;
}

/**
 * Calculates Euclidean color distance normalized between 0 and 100.
 */
export function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  // Max possible distance is sqrt(255^2 * 3) ≈ 441.67
  return (Math.sqrt(dr * dr + dg * dg + db * db) / 441.673) * 100;
}

/**
 * Auto-samples corner pixels of an ImageData to estimate uniform background color.
 */
export function sampleCornerColor(
  data: Uint8ClampedArray,
  width: number,
  height: number
): RgbColor {
  const samplePoints = [
    0, // Top-left
    (width - 1) * 4, // Top-right
    (height - 1) * width * 4, // Bottom-left
    ((height - 1) * width + (width - 1)) * 4, // Bottom-right
  ];

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;

  for (const idx of samplePoints) {
    rSum += data[idx] ?? 255;
    gSum += data[idx + 1] ?? 255;
    bSum += data[idx + 2] ?? 255;
  }

  return {
    r: Math.round(rSum / samplePoints.length),
    g: Math.round(gSum / samplePoints.length),
    b: Math.round(bSum / samplePoints.length),
  };
}

/**
 * Applies chroma / Euclidean color thresholding with soft feathering to ImageData.
 */
export function processBackgroundRemoval(
  pixels: Uint8ClampedArray,
  target: RgbColor,
  tolerance: number,
  feather: number,
  replacement?: { r: number; g: number; b: number; a: number } | null
): void {
  const tol = Math.max(0, Math.min(100, tolerance));
  const fth = Math.max(0, feather);

  const len = pixels.length;
  for (let i = 0; i < len; i += 4) {
    const r = pixels[i]!;
    const g = pixels[i + 1]!;
    const b = pixels[i + 2]!;

    const dist = colorDistance(r, g, b, target.r, target.g, target.b);

    if (dist <= tol) {
      // Complete background match -> make transparent or replace
      if (replacement) {
        pixels[i] = replacement.r;
        pixels[i + 1] = replacement.g;
        pixels[i + 2] = replacement.b;
        pixels[i + 3] = replacement.a;
      } else {
        pixels[i + 3] = 0; // Alpha 0
      }
    } else if (fth > 0 && dist < tol + fth) {
      // Feathered transition boundary
      const factor = (dist - tol) / fth; // 0 to 1
      if (!replacement) {
        pixels[i + 3] = Math.round(pixels[i + 3]! * factor);
      }
    }
  }
}

export const bgRemoverTool: Tool<BgRemoverInput, BgRemoverOutput> = {
  id: 'bg-remover',
  name: 'Image Background Remover',
  description:
    'Instant client-side background removal and transparent keying for logos, icons, and product photos.',
  category: 'images',

  execute(
    input: BgRemoverInput,
    handlers?: Partial<ResultHandlers<BgRemoverOutput, void>>
  ): ToolExecutionResult<BgRemoverOutput> {
    const startTime = performance.now();
    try {
      const targetColor = input.targetColor ?? { r: 255, g: 255, b: 255 }; // default white
      const tolerance = input.tolerance ?? 18;
      const feather = input.feather ?? 6;
      const autoDetected = input.autoDetect ?? false;

      const output: BgRemoverOutput = {
        targetColor,
        tolerance,
        feather,
        autoDetected,
      };

      const durationMs = performance.now() - startTime;
      const res = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Background removal processing failed';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
