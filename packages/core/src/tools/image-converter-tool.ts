import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export type ImageOutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface ImageConverterInput {
  readonly originalWidth: number;
  readonly originalHeight: number;
  readonly originalBytes: number;
  readonly targetFormat: ImageOutputFormat;
  readonly quality?: number; // 0.1 to 1.0
  readonly scalePercent?: number; // 10 to 100
  readonly customWidth?: number;
  readonly customHeight?: number;
}

export interface ImageConverterOutput {
  readonly originalDimensions: { readonly width: number; readonly height: number };
  readonly targetDimensions: { readonly width: number; readonly height: number };
  readonly format: ImageOutputFormat;
  readonly extension: string;
  readonly quality: number;
}

export const imageConverterTool: Tool<ImageConverterInput, ImageConverterOutput> = {
  id: 'image-converter',
  name: 'Image Compressor & Converter',
  description: 'Convert between PNG, JPEG, and WebP, resize dimensions, and optimize image payload size client-side.',
  category: 'images',

  execute(
    input: ImageConverterInput,
    handlers?: Partial<ResultHandlers<ImageConverterOutput, void>>
  ): ToolExecutionResult<ImageConverterOutput> {
    const startTime = performance.now();
    try {
      const origW = Math.max(1, input.originalWidth);
      const origH = Math.max(1, input.originalHeight);
      const scale = (input.scalePercent ?? 100) / 100;

      let targetW = Math.round(origW * scale);
      let targetH = Math.round(origH * scale);

      if (input.customWidth && input.customWidth > 0) {
        targetW = input.customWidth;
        // Keep aspect ratio if height not specified
        if (!input.customHeight) {
          targetH = Math.round((origH / origW) * targetW);
        }
      }

      if (input.customHeight && input.customHeight > 0) {
        targetH = input.customHeight;
        if (!input.customWidth) {
          targetW = Math.round((origW / origH) * targetH);
        }
      }

      const quality = Math.max(0.1, Math.min(1.0, input.quality ?? 0.85));

      const extMap: Record<ImageOutputFormat, string> = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/webp': '.webp',
      };

      const output: ImageConverterOutput = {
        originalDimensions: { width: origW, height: origH },
        targetDimensions: { width: targetW, height: targetH },
        format: input.targetFormat,
        extension: extMap[input.targetFormat] ?? '.png',
        quality,
      };

      const durationMs = performance.now() - startTime;
      const res = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to configure image conversion';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
