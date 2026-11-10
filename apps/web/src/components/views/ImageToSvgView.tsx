import { useState, useRef, useEffect, useCallback } from 'react';
import { bitmapToSvg, type VectorizeMode } from '@nemokit/core';
import { Sparkles, Download, Copy, Check, Code2, Eye, Image as ImageIcon } from 'lucide-react';
import { downloadAsFile } from '../../utils/fileDownload.js';

const SAMPLE_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ffffff"/><polygon points="100,20 180,180 20,180" fill="%231c1917"/><circle cx="100" cy="120" r="30" fill="%23ffffff"/><circle cx="100" cy="120" r="15" fill="%23f59e0b"/></svg>`;

export function ImageToSvgView() {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGE_SVG);
  const [filename, setFilename] = useState<string>('vectorized.svg');
  const [mode, setMode] = useState<VectorizeMode>('monochrome');
  const [threshold, setThreshold] = useState<number>(128);
  const [colorCount, setColorCount] = useState<number>(4);
  const [invert, setInvert] = useState<boolean>(false);
  const [downsample, setDownsample] = useState<number>(160); // Max width/height for fast path generation

  const [svgOutput, setSvgOutput] = useState<string>('');
  const [pathCount, setPathCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Convert image to SVG
  const processVectorization = useCallback(() => {
    const img = originalImageRef.current;
    if (!img) return;

    const scale = Math.min(
      1,
      downsample / Math.max(img.naturalWidth || 200, img.naturalHeight || 200)
    );
    const w = Math.max(1, Math.round((img.naturalWidth || 200) * scale));
    const h = Math.max(1, Math.round((img.naturalHeight || 200) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);

    const { svg, pathCount: count } = bitmapToSvg(
      imgData.data,
      w,
      h,
      mode,
      threshold,
      colorCount,
      invert
    );

    setSvgOutput(svg);
    setPathCount(count);
  }, [downsample, mode, threshold, colorCount, invert]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImageRef.current = img;
      processVectorization();
    };
    img.src = imageSrc;
  }, [imageSrc, processVectorization]);

  useEffect(() => {
    processVectorization();
  }, [processVectorization]);

  const handleCopyCode = () => {
    if (!svgOutput) return;
    navigator.clipboard.writeText(svgOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!svgOutput) return;
    downloadAsFile(filename, svgOutput, 'image/svg+xml');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200/80 gap-3.5 sm:gap-4 pb-5 sm:pb-6">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 mt-0.5 sm:mt-0 shadow-2xs">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-snug">
                Image to SVG Vectorizer
              </h1>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase tracking-wider shrink-0 whitespace-nowrap">
                Vector Trace
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed max-w-2xl">
              Transform bitmap photos, logos, and signatures into pure scalable vector SVG paths.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">SVG Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-stone-500" />
                <span>Copy SVG</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-xs"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Download .svg</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
        {/* Left Column: Vector Controls & Image Dropzone */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* File Upload Dropzone */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
              Source Bitmap Image
            </span>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-4 cursor-pointer bg-stone-50/50 hover:bg-stone-100/50 transition-all text-center">
              <ImageIcon className="h-6 w-6 text-stone-400 mb-1.5" />
              <span className="text-xs font-medium text-stone-700">Drop PNG, JPG, or WebP</span>
              <span className="text-[10px] text-stone-400 mt-0.5">
                High-contrast images trace best
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFilename(`${file.name.replace(/\.[^/.]+$/, '')}.svg`);
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

          {/* Tracing Options */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Tracing Mode
            </span>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-3 gap-2 text-[11px] sm:text-xs">
              {[
                { id: 'monochrome' as const, label: 'Silhouette' },
                { id: 'posterize' as const, label: 'Posterized' },
                { id: 'pixel' as const, label: 'Pixel Grid' },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`py-1.5 px-1 rounded-lg border font-medium text-center transition-all truncate ${
                    mode === m.id
                      ? 'border-stone-900 bg-stone-900 text-white shadow-2xs font-semibold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Monochrome Threshold */}
            {mode === 'monochrome' && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">B&W Threshold:</span>
                  <span className="font-mono font-semibold text-stone-800">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={threshold}
                  onChange={e => setThreshold(Number(e.target.value))}
                  className="w-full accent-stone-900 cursor-pointer"
                />
                <label className="flex items-center gap-2 mt-1 cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={invert}
                    onChange={e => setInvert(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-stone-900"
                  />
                  <span>Invert Foreground / Background</span>
                </label>
              </div>
            )}

            {/* Posterize Colors Slider */}
            {mode === 'posterize' && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">Color Layers:</span>
                  <span className="font-mono font-semibold text-stone-800">
                    {colorCount} colors
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={colorCount}
                  onChange={e => setColorCount(Number(e.target.value))}
                  className="w-full accent-stone-900 cursor-pointer"
                />
              </div>
            )}

            {/* Downsample Scale */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Max Trace Resolution:</span>
                <span className="font-mono font-semibold text-stone-800">{downsample}px</span>
              </div>
              <input
                type="range"
                min="64"
                max="320"
                step="32"
                value={downsample}
                onChange={e => setDownsample(Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <span className="text-[10px] text-stone-400">
                Lower resolutions produce lighter SVG files with smoother lines.
              </span>
            </div>

            {/* Stats */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>Paths: {pathCount}</span>
              <span>Size: {(new TextEncoder().encode(svgOutput).length / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Vector Preview & Code Viewer */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden flex-1 min-h-60 sm:min-h-75">
          {/* Header tabs */}
          <div className="px-3 sm:px-4 py-2 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Eye className="h-3.5 w-3.5 text-stone-500" />
                <span>Vector Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'code'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Code2 className="h-3.5 w-3.5 text-stone-500" />
                <span>SVG Markup</span>
              </button>
            </div>
          </div>

          {/* View Tab Content */}
          <div className="flex-1 overflow-hidden relative min-h-55 sm:min-h-70">
            {activeTab === 'preview' ? (
              <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] bg-[#faf9f6]">
                <div
                  className="max-w-full max-h-full flex items-center justify-center shadow-xs bg-white rounded-xl p-3 sm:p-4 border border-stone-200/60 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: svgOutput }}
                />
              </div>
            ) : (
              <textarea
                readOnly
                value={svgOutput}
                className="w-full h-full p-3 sm:p-4 font-mono text-xs text-stone-800 bg-stone-50/40 resize-none focus:outline-hidden leading-relaxed min-h-55"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
