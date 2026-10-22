import { useState, useRef, useEffect, useCallback, type MouseEvent } from 'react';
import {
  pixelateArea,
  type RedactionMode,
  type RedactionRegion,
} from '@nemokit/core';
import {
  Download,
  Undo2,
  Trash2,
  Image as ImageIcon,
  Check,
  EyeOff,
} from 'lucide-react';

const SAMPLE_SCREENSHOT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380"><rect width="600" height="380" fill="%23ffffff"/><rect x="40" y="40" width="520" height="300" rx="12" fill="%23f9fafb" stroke="%23e5e7eb"/><text x="70" y="90" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23111827">Production Server Credentials</text><text x="70" y="140" font-family="monospace" font-size="14" fill="%23374151">API_SECRET_KEY = sk_live_94821a48e7192a01</text><text x="70" y="180" font-family="monospace" font-size="14" fill="%23374151">DATABASE_URL   = postgres://admin:superSecretPassword@db:5432</text><text x="70" y="220" font-family="monospace" font-size="14" fill="%23374151">JWT_SECRET     = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</text><rect x="70" y="260" width="120" height="36" rx="8" fill="%2310b981"/><text x="95" y="283" font-family="sans-serif" font-size="13" font-weight="600" fill="%23ffffff">Verified</text></svg>`;

export function ImageRedactorView() {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_SCREENSHOT_SVG);
  const [filename, setFilename] = useState<string>('screenshot.png');
  const [mode, setMode] = useState<RedactionMode>('pixelate');
  const [regions, setRegions] = useState<RedactionRegion[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Redraw canvas with all applied redactions
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Draw base original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply each recorded redaction
    for (const r of regions) {
      if (r.mode === 'blackout') {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(r.x, r.y, r.width, r.height);
      } else if (r.mode === 'blur') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(r.x, r.y, r.width, r.height);
        ctx.clip();
        ctx.filter = 'blur(10px)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else if (r.mode === 'pixelate') {
        const imgData = ctx.getImageData(r.x, r.y, r.width, r.height);
        pixelateArea(imgData.data, r.width, 0, 0, r.width, r.height, 10);
        ctx.putImageData(imgData, r.x, r.y);
      }
    }

    // Draw active drawing box preview
    if (currentBox) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
      ctx.setLineDash([]);
    }
  }, [regions, currentBox]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 380;
      renderCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Mouse interaction for drawing rectangles
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const curX = (e.clientX - rect.left) * scaleX;
    const curY = (e.clientY - rect.top) * scaleY;

    const x = Math.min(startPos.x, curX);
    const y = Math.min(startPos.y, curY);
    const w = Math.abs(curX - startPos.x);
    const h = Math.abs(curY - startPos.y);

    setCurrentBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;
    setIsDrawing(false);

    if (currentBox.w > 4 && currentBox.h > 4) {
      const newRegion: RedactionRegion = {
        id: Math.random().toString(36).substring(2, 9),
        x: Math.round(currentBox.x),
        y: Math.round(currentBox.y),
        width: Math.round(currentBox.w),
        height: Math.round(currentBox.h),
        mode,
      };
      setRegions(prev => [...prev, newRegion]);
    }
    setCurrentBox(null);
    setStartPos(null);
  };

  const handleUndo = () => {
    setRegions(prev => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setRegions([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `redacted-${filename}`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    }, 'image/png');
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-700">
            <EyeOff className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Image Privacy Redactor
              </h1>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase">
                Zero Cloud Upload
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Draw redaction boxes over sensitive keys, tokens, emails, or faces before sharing screenshots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={regions.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs disabled:opacity-40"
            title="Undo last redaction"
          >
            <Undo2 className="h-3.5 w-3.5 text-stone-500" />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={regions.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs disabled:opacity-40"
            title="Clear all redactions"
          >
            <Trash2 className="h-3.5 w-3.5 text-stone-400" />
            <span>Clear</span>
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
                <span>Save Redacted Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
        {/* Left Column: Tool Selectors */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* File Upload Dropzone */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
              Source Screenshot
            </span>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-4 cursor-pointer bg-stone-50/50 hover:bg-stone-100/50 transition-all text-center">
              <ImageIcon className="h-6 w-6 text-stone-400 mb-1.5" />
              <span className="text-xs font-medium text-stone-700">Drop screenshot or image</span>
              <span className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, WebP</span>
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
                      setRegions([]);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Redaction Mode Switcher */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Redaction Style
            </span>

            <div className="flex flex-col gap-2">
              {[
                {
                  id: 'pixelate' as const,
                  label: 'Pixelate (Mosaic)',
                  desc: 'Blocks of pixels obscuring text while preserving general layout.',
                },
                {
                  id: 'blur' as const,
                  label: 'Gaussian Blur',
                  desc: 'Smooth optical blur concealing characters and tokens.',
                },
                {
                  id: 'blackout' as const,
                  label: 'Solid Blackout Box',
                  desc: 'Total opaque charcoal block covering sensitive data completely.',
                },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    mode === item.id
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200/80 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span
                    className={`text-[11px] mt-0.5 leading-relaxed ${
                      mode === item.id ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Applied Redactions:</span>
              <span className="font-semibold text-stone-800 font-mono">{regions.length}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Canvas Display */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden flex-1 min-h-[300px]">
          <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Canvas Editor
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Click & drag anywhere on the image to draw a redaction box
            </span>
          </div>

          <div className="p-6 flex-1 flex items-center justify-center min-h-[260px] bg-stone-100/50 overflow-auto">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-w-full max-h-[calc(100vh-20rem)] object-contain rounded-lg shadow-sm cursor-crosshair border border-stone-200 select-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
