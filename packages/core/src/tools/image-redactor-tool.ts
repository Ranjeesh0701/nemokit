import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export type RedactionMode = 'pixelate' | 'blur' | 'blackout';

export interface RedactionRegion {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly mode: RedactionMode;
}

export interface ImageRedactorInput {
  readonly regions: ReadonlyArray<RedactionRegion>;
}

export interface ImageRedactorOutput {
  readonly totalRegions: number;
  readonly activeModes: ReadonlyArray<RedactionMode>;
}

/**
 * Pixelates a rectangular area in-place on ImageData.
 */
export function pixelateArea(
  data: Uint8ClampedArray,
  canvasWidth: number,
  x: number,
  y: number,
  w: number,
  h: number,
  blockSize = 12
): void {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.floor(x + w);
  const endY = Math.floor(y + h);

  for (let by = startY; by < endY; by += blockSize) {
    for (let bx = startX; bx < endX; bx += blockSize) {
      const curBlockW = Math.min(blockSize, endX - bx);
      const curBlockH = Math.min(blockSize, endY - by);

      // Compute average color in this block
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      for (let py = by; py < by + curBlockH; py++) {
        for (let px = bx; px < bx + curBlockW; px++) {
          const idx = (py * canvasWidth + px) * 4;
          rSum += data[idx]!;
          gSum += data[idx + 1]!;
          bSum += data[idx + 2]!;
          count++;
        }
      }

      const avgR = Math.round(rSum / count);
      const avgG = Math.round(gSum / count);
      const avgB = Math.round(bSum / count);

      // Fill block with average color
      for (let py = by; py < by + curBlockH; py++) {
        for (let px = bx; px < bx + curBlockW; px++) {
          const idx = (py * canvasWidth + px) * 4;
          data[idx] = avgR;
          data[idx + 1] = avgG;
          data[idx + 2] = avgB;
        }
      }
    }
  }
}

export const imageRedactorTool: Tool<ImageRedactorInput, ImageRedactorOutput> = {
  id: 'image-redactor',
  name: 'Image Privacy Redactor',
  description: 'Blur, pixelate, or black out sensitive credentials, API keys, and personal info on screenshots directly in your browser.',
  category: 'images',

  execute(
    input: ImageRedactorInput,
    handlers?: Partial<ResultHandlers<ImageRedactorOutput, void>>
  ): ToolExecutionResult<ImageRedactorOutput> {
    const startTime = performance.now();
    try {
      const regions = input.regions ?? [];
      const modes = Array.from(new Set(regions.map(r => r.mode)));

      const output: ImageRedactorOutput = {
        totalRegions: regions.length,
        activeModes: modes,
      };

      const durationMs = performance.now() - startTime;
      const res = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process redactions';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
