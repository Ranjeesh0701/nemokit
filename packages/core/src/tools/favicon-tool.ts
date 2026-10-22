import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface FaviconDimension {
  readonly size: number;
  readonly name: string;
  readonly purpose: string;
}

export const FAVICON_SIZES: ReadonlyArray<FaviconDimension> = [
  { size: 16, name: 'favicon-16x16.png', purpose: 'Standard browser tab icon' },
  { size: 32, name: 'favicon-32x32.png', purpose: 'Retina / high-DPI tab icon' },
  { size: 48, name: 'favicon-48x48.png', purpose: 'Windows desktop shortcut' },
  { size: 180, name: 'apple-touch-icon.png', purpose: 'iOS Safari Home Screen bookmark' },
  { size: 192, name: 'android-chrome-192x192.png', purpose: 'Android Chrome PWA launcher icon' },
  { size: 512, name: 'android-chrome-512x512.png', purpose: 'PWA splash screen & high-res assets' },
];

export interface FaviconInput {
  readonly appName?: string;
  readonly themeColor?: string;
  readonly backgroundColor?: string;
  readonly paddingPercent?: number; // 0 to 25
  readonly shape?: 'square' | 'rounded' | 'circle';
}

export interface FaviconOutput {
  readonly htmlHeadSnippet: string;
  readonly manifestSnippet: string;
  readonly dimensions: ReadonlyArray<FaviconDimension>;
  readonly appName: string;
  readonly themeColor: string;
}

/**
 * Creates binary ICO format buffer containing multiple PNG chunks.
 */
export function createIcoFile(pngBuffers: Array<{ size: number; data: Uint8Array }>): Uint8Array {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalHeaderSize = headerSize + count * dirEntrySize;

  let totalSize = totalHeaderSize;
  for (const png of pngBuffers) {
    totalSize += png.data.length;
  }

  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  // 1. Header (6 bytes)
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type 1 = Icon (.ICO)
  view.setUint16(4, count, true); // Image count

  // 2. Directory Entries (16 bytes each)
  let currentOffset = totalHeaderSize;
  for (let i = 0; i < count; i++) {
    const png = pngBuffers[i]!;
    const entryOffset = headerSize + i * dirEntrySize;

    view.setUint8(entryOffset, png.size >= 256 ? 0 : png.size); // Width
    view.setUint8(entryOffset + 1, png.size >= 256 ? 0 : png.size); // Height
    view.setUint8(entryOffset + 2, 0); // Palette count
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32-bit RGBA)
    view.setUint32(entryOffset + 8, png.data.length, true); // PNG payload size
    view.setUint32(entryOffset + 12, currentOffset, true); // Offset in file

    // 3. Copy PNG data
    out.set(png.data, currentOffset);
    currentOffset += png.data.length;
  }

  return out;
}

export function generateHtmlSnippet(appName: string, themeColor = '#ffffff'): string {
  return `<!-- Nemokit Favicon & App Icons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="apple-mobile-web-app-title" content="${appName}">
<meta name="theme-color" content="${themeColor}">
<link rel="manifest" href="/site.webmanifest">`;
}

export function generateManifestSnippet(appName: string, themeColor = '#ffffff'): string {
  return JSON.stringify(
    {
      name: appName,
      short_name: appName,
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: themeColor,
      background_color: '#ffffff',
      display: 'standalone',
    },
    null,
    2
  );
}

export const faviconTool: Tool<FaviconInput, FaviconOutput> = {
  id: 'favicon-generator',
  name: 'Favicon & App Icon Studio',
  description: 'Generate multi-resolution favicon.ico, Apple touch icons, Android PWA assets, and webmanifest tags client-side.',
  category: 'images',

  execute(
    input: FaviconInput,
    handlers?: Partial<ResultHandlers<FaviconOutput, void>>
  ): ToolExecutionResult<FaviconOutput> {
    const startTime = performance.now();
    try {
      const appName = input.appName?.trim() || 'My Web App';
      const themeColor = input.themeColor?.trim() || '#1c1917';

      const output: FaviconOutput = {
        htmlHeadSnippet: generateHtmlSnippet(appName, themeColor),
        manifestSnippet: generateManifestSnippet(appName, themeColor),
        dimensions: FAVICON_SIZES,
        appName,
        themeColor,
      };

      const durationMs = performance.now() - startTime;
      const res = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Favicon generation failed';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
