import QRCode from 'qrcode';
import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrToolInput {
  readonly text: string;
  readonly errorCorrectionLevel?: QrErrorCorrectionLevel;
  readonly margin?: number;
  readonly darkColor?: string;
  readonly lightColor?: string;
  readonly size?: number;
}

export interface QrToolOutput {
  readonly text: string;
  readonly svg: string;
  readonly dataUrl: string;
  readonly errorCorrectionLevel: QrErrorCorrectionLevel;
  readonly size: number;
}

export const qrTool: Tool<QrToolInput, QrToolOutput> = {
  id: 'qr-tool',
  name: 'QR Code Generator & Exporter',
  description:
    'Generates customizable QR codes with configurable error correction, color themes, and SVG / PNG export.',
  category: 'web',

  async execute(
    input: QrToolInput,
    handlers?: Partial<ResultHandlers<QrToolOutput, void>>
  ): Promise<ToolExecutionResult<QrToolOutput>> {
    const startTime = performance.now();

    const text = (input?.text ?? '').trim();
    if (!text) {
      const res = onFailure('Input text or URL cannot be empty.', 'EMPTY_INPUT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const ecLevel: QrErrorCorrectionLevel = input?.errorCorrectionLevel ?? 'M';
    const margin = input?.margin ?? 2;
    const darkColor = input?.darkColor ?? '#000000';
    const lightColor = input?.lightColor ?? '#ffffff';
    const size = input?.size ?? 320;

    try {
      const [svg, dataUrl] = await Promise.all([
        QRCode.toString(text, {
          type: 'svg',
          errorCorrectionLevel: ecLevel,
          margin,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          width: size,
        }),
        QRCode.toDataURL(text, {
          errorCorrectionLevel: ecLevel,
          margin,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          width: size,
        }),
      ]);

      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      const output: QrToolOutput = {
        text,
        svg,
        dataUrl,
        errorCorrectionLevel: ecLevel,
        size,
      };

      const successRes = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output);
      return successRes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate QR code';
      const res = onFailure(msg, 'QR_GENERATION_FAILED');
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
