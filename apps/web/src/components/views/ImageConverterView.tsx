import { useState, useRef, useEffect, useCallback } from 'react';
import type { ImageOutputFormat } from '@nemokit/core';
import {
  Download,
  Image as ImageIcon,
  Check,
  Scale,
} from 'lucide-react';

const SAMPLE_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366f1"/><stop offset="50%" stop-color="%23ec4899"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient></defs><rect width="800" height="500" fill="url(%23g)"/><circle cx="400" cy="250" r="140" fill="%23ffffff" opacity="0.2"/><text x="400" y="260" font-family="system-ui, sans-serif" font-size="32" font-weight="800" fill="%23ffffff" text-anchor="middle">Nemokit Image Studio</text></svg>`;

export function ImageConverterView() {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGE_SVG);
  const [filename, setFilename] = useState<string>('banner.png');
  const [targetFormat, setTargetFormat] = useState<ImageOutputFormat>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);
  const [scalePercent, setScalePercent] = useState<number>(100);

  // Stats
  const [originalBytes, setOriginalBytes] = useState<number>(145000);
  const [compressedBytes, setCompressedBytes] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ w: number; h: number }>({
    w: 800,
    h: 500,
  });
  const [targetDimensions, setTargetDimensions] = useState<{ w: number; h: number }>({
    w: 800,
    h: 500,
  });

  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const outputBlobRef = useRef<Blob | null>(null);

  // Compress & render on canvas
  const processImage = useCallback(() => {
    const img = originalImageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const scale = scalePercent / 100;
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    setTargetDimensions({ w, h });

    canvas.toBlob(
      blob => {
        if (!blob) return;
        outputBlobRef.current = blob;
        setCompressedBytes(blob.size);
      },
      targetFormat,
      targetFormat === 'image/png' ? undefined : quality
    );
  }, [scalePercent, targetFormat, quality]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImageRef.current = img;
      setOriginalDimensions({ w: img.naturalWidth || 800, h: img.naturalHeight || 500 });
      processImage();
    };
    img.src = imageSrc;
  }, [imageSrc, processImage]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  const handleDownload = () => {
    const blob = outputBlobRef.current;
    if (!blob) return;

    const extMap: Record<ImageOutputFormat, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
    };

    const cleanBase = filename.replace(/\.[^/.]+$/, '');
    const outName = `${cleanBase}-optimized${extMap[targetFormat]}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const savingsPercent =
    originalBytes > 0 && compressedBytes > 0
      ? Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-700">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Image Compressor & Converter
              </h1>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Convert between WebP, JPEG, and PNG, downscale resolutions, and optimize file payloads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-xs"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Download Optimized Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Compression Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* File Upload Dropzone */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
              Upload Target Image
            </span>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-4 cursor-pointer bg-stone-50/50 hover:bg-stone-100/50 transition-all text-center">
              <ImageIcon className="h-6 w-6 text-stone-400 mb-1.5" />
              <span className="text-xs font-medium text-stone-700">Choose image or drop file</span>
              <span className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, WebP</span>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFilename(file.name);
                  setOriginalBytes(file.size);
                  const reader = new FileReader();
                  reader.onload = ev => {
                    if (ev.target?.result) {
                      setImageSrc(ev.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Configuration Form */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Output Options
            </span>

            {/* Target Format */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-stone-600">Target Format:</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'image/webp' as const, label: 'WebP (Best)' },
                  { id: 'image/jpeg' as const, label: 'JPEG' },
                  { id: 'image/png' as const, label: 'PNG' },
                ].map(fmt => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTargetFormat(fmt.id)}
                    className={`py-1.5 rounded-lg border font-medium text-center transition-all ${
                      targetFormat === fmt.id
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for WebP & JPEG) */}
            {targetFormat !== 'image/png' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">Quality Compression:</span>
                  <span className="font-mono font-semibold text-stone-800">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                  className="w-full accent-stone-900 cursor-pointer"
                />
              </div>
            )}

            {/* Scale / Dimension Resize */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Resolution Scale:</span>
                <span className="font-mono font-semibold text-stone-800">{scalePercent}%</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[100, 75, 50, 25].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setScalePercent(pct)}
                    className={`py-1 rounded-lg border text-center transition-all ${
                      scalePercent === pct
                        ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Before/After Size Meter */}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Original:</span>
                <span className="font-mono">{formatFileSize(originalBytes)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-900 font-semibold">
                <span>Optimized:</span>
                <span className="font-mono text-emerald-700">
                  {formatFileSize(compressedBytes)}
                </span>
              </div>
              {savingsPercent > 0 && (
                <div className="rounded-lg bg-emerald-50 text-emerald-800 p-2 text-xs font-semibold text-center border border-emerald-200/60">
                  Saved {savingsPercent}% payload size!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Preview Canvas */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-800 uppercase tracking-wider">
              Preview Canvas
            </span>
            <span className="font-mono text-stone-500">
              {originalDimensions.w}×{originalDimensions.h} → {targetDimensions.w}×{targetDimensions.h} px
            </span>
          </div>

          <div className="p-6 flex items-center justify-center min-h-[460px] bg-stone-100/50 overflow-auto">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm border border-stone-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
