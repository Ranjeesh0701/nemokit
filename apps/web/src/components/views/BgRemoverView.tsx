import { useState, useRef, useEffect, useCallback, type MouseEvent } from 'react';
import {
  sampleCornerColor,
  processBackgroundRemoval,
  type RgbColor,
} from '@nemokit/core';
import {
  Pipette,
  Download,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Layers,
} from 'lucide-react';

// Clean SVG badge converted to data URL for instantaneous sample preview
const SAMPLE_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23ffffff"/><circle cx="200" cy="200" r="120" fill="%231c1917"/><polygon points="200,120 260,240 140,240" fill="%23f59e0b"/><circle cx="200" cy="200" r="30" fill="%23ffffff"/></svg>`;

export function BgRemoverView() {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGE_SVG);
  const [filename, setFilename] = useState<string>('logo.png');
  const [targetColor, setTargetColor] = useState<RgbColor>({ r: 255, g: 255, b: 255 });
  const [tolerance, setTolerance] = useState<number>(18);
  const [feather, setFeather] = useState<number>(6);
  const [backdropMode, setBackdropMode] = useState<'transparent' | 'white' | 'dark'>('transparent');
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageDataRef = useRef<ImageData | null>(null);

  // Load image into canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 400;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const raw = ctx.getImageData(0, 0, canvas.width, canvas.height);
      originalImageDataRef.current = raw;

      // Auto-sample corner pixel color
      const corner = sampleCornerColor(raw.data, canvas.width, canvas.height);
      setTargetColor(corner);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Apply removal algorithm
  const applyRemoval = useCallback(() => {
    const canvas = canvasRef.current;
    const orig = originalImageDataRef.current;
    if (!canvas || !orig) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Create a clone of the original pixels
    const cloned = ctx.createImageData(orig);
    cloned.data.set(orig.data);

    let replacement: { r: number; g: number; b: number; a: number } | null = null;
    if (backdropMode === 'white') {
      replacement = { r: 255, g: 255, b: 255, a: 255 };
    } else if (backdropMode === 'dark') {
      replacement = { r: 24, g: 24, b: 27, a: 255 };
    }

    processBackgroundRemoval(cloned.data, targetColor, tolerance, feather, replacement);
    ctx.putImageData(cloned, 0, 0);
  }, [targetColor, tolerance, feather, backdropMode]);

  useEffect(() => {
    applyRemoval();
  }, [applyRemoval]);

  // Eyedropper click handler
  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isEyedropperActive) return;
    const canvas = canvasRef.current;
    const orig = originalImageDataRef.current;
    if (!canvas || !orig) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = Math.floor((e.clientX - rect.left) * scaleX);
    const clickY = Math.floor((e.clientY - rect.top) * scaleY);

    if (clickX >= 0 && clickX < canvas.width && clickY >= 0 && clickY < canvas.height) {
      const idx = (clickY * canvas.width + clickX) * 4;
      const r = orig.data[idx] ?? 255;
      const g = orig.data[idx + 1] ?? 255;
      const b = orig.data[idx + 2] ?? 255;

      setTargetColor({ r, g, b });
      setIsEyedropperActive(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transparent-${filename.replace(/\.[^/.]+$/, '')}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    }, 'image/png');
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    const orig = originalImageDataRef.current;
    if (!canvas || !orig) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(orig, 0, 0);
    setTolerance(18);
    setFeather(6);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Image Background Remover
              </h1>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Chroma keying and solid background removal directly on your browser canvas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Reset to original image"
          >
            <RotateCcw className="h-3.5 w-3.5 text-stone-500" />
            <span>Reset</span>
          </button>

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
                <span>Export PNG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Canvas Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* File Dropzone Loader */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
              Upload Image
            </span>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-4 cursor-pointer bg-stone-50/50 hover:bg-stone-100/50 transition-all text-center">
              <ImageIcon className="h-6 w-6 text-stone-400 mb-1.5" />
              <span className="text-xs font-medium text-stone-700">Choose image or drop here</span>
              <span className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, WebP, SVG</span>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFilename(file.name);
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

          {/* Color & Tolerance Settings */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Removal Parameters
            </span>

            {/* Target Color & Eyedropper */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Target Color:</span>
                <span className="font-mono text-stone-500 text-[11px]">
                  rgb({targetColor.r}, {targetColor.g}, {targetColor.b})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-12 rounded-lg border border-stone-300 shadow-2xs shrink-0"
                  style={{
                    backgroundColor: `rgb(${targetColor.r},${targetColor.g},${targetColor.b})`,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsEyedropperActive(prev => !prev)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    isEyedropperActive
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  <Pipette className="h-3.5 w-3.5" />
                  <span>{isEyedropperActive ? 'Click Canvas to Pick' : 'Pick from Image'}</span>
                </button>
              </div>
            </div>

            {/* Tolerance Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Color Tolerance:</span>
                <span className="font-mono font-semibold text-stone-800">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tolerance}
                onChange={e => setTolerance(Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <span className="text-[10px] text-stone-400">
                Higher tolerance removes similar color shades.
              </span>
            </div>

            {/* Feathering Edge Smoothness Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Edge Feathering:</span>
                <span className="font-mono font-semibold text-stone-800">{feather}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={feather}
                onChange={e => setFeather(Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <span className="text-[10px] text-stone-400">
                Softens boundary edges to prevent jagged borders.
              </span>
            </div>

            {/* Preview Backdrop Switcher */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-600 font-medium">Preview Backdrop:</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBackdropMode('transparent')}
                  className={`py-1.5 rounded-lg border font-medium text-center transition-all ${
                    backdropMode === 'transparent'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Transparent
                </button>
                <button
                  type="button"
                  onClick={() => setBackdropMode('white')}
                  className={`py-1.5 rounded-lg border font-medium text-center transition-all ${
                    backdropMode === 'white'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => setBackdropMode('dark')}
                  className={`py-1.5 rounded-lg border font-medium text-center transition-all ${
                    backdropMode === 'dark'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Canvas Viewport */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-stone-500" />
              <span>Canvas Result</span>
            </span>
            {isEyedropperActive && (
              <span className="text-xs font-semibold text-violet-700 animate-pulse">
                Click anywhere on canvas to pick background color
              </span>
            )}
          </div>

          {/* Checkerboard Transparent Pattern Canvas Container */}
          <div
            className={`p-6 flex items-center justify-center min-h-[460px] overflow-auto ${
              backdropMode === 'white'
                ? 'bg-white'
                : backdropMode === 'dark'
                ? 'bg-stone-900'
                : 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-[#fbfbf9]'
            }`}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`max-w-full max-h-[500px] object-contain rounded-lg shadow-sm ${
                isEyedropperActive ? 'cursor-crosshair ring-2 ring-violet-500' : 'cursor-default'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
