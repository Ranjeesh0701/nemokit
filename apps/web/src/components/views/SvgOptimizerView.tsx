import { useState, useId } from 'react';
import { svgOptimizerTool } from '@nemokit/core';
import type { SvgOptimizerOutput } from '@nemokit/core';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Upload,
  Code2,
  Eye,
  Sliders,
  FileCode,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const SAMPLE_SVGS = [
  {
    name: 'Inkscape Icon',
    svg: `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <metadata id="metadata5">
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <cc:Work rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <defs id="defs2">
    <linearGradient id="sampleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1">
    <rect x="8.123456" y="8.654321" width="111.987654" height="111.456789" rx="24.123456" fill="url(#sampleGrad)" stroke="#4338ca" stroke-width="4.000123" />
    <path d="M 64.000123 32.543210 L 88.654321 84.123456 L 39.345678 84.123456 Z" fill="#ffffff" />
  </g>
</svg>`,
  },
  {
    name: 'Badge Vector',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Brand Badge Illustration -->
  <circle cx="50.00000" cy="50.00000" r="44.12345" fill="#10b981" />
  <path d="M30.1234 50.4567 L44.8765 65.1234 L72.3456 35.6789" stroke="#ffffff" stroke-width="8.1234" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`,
  },
];

export function SvgOptimizerView() {
  const uploadInputId = useId();
  const [svgInput, setSvgInput] = useState<string>(SAMPLE_SVGS[0]?.svg ?? '');
  const [precision, setPrecision] = useState<number>(1);
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);
  const [removeEditorAttributes, setRemoveEditorAttributes] = useState<boolean>(true);
  const [removeEmptyContainers, setRemoveEmptyContainers] = useState<boolean>(true);
  const [collapseWhitespace, setCollapseWhitespace] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'code' | 'jsx' | 'preview'>('code');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute optimization
  const result: SvgOptimizerOutput | null = (() => {
    if (!svgInput.trim() || !svgInput.includes('<svg')) return null;
    const res = svgOptimizerTool.execute({
      svg: svgInput,
      precision,
      removeComments,
      removeMetadata,
      removeEditorAttributes,
      removeEmptyContainers,
      collapseWhitespace,
    });
    return res.success ? res.data : null;
  })();

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result;
      if (typeof content === 'string') {
        setSvgInput(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownload = () => {
    if (!result?.optimized) return;
    const blob = new Blob([result.optimized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              SVG Optimizer & Cleaner
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Minify vector bloat, round decimal coordinates, strip editor junk (Inkscape, Sketch),
            and export production-ready React JSX.
          </p>
        </div>

        {/* Action presets & upload */}
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_SVGS.map(sample => (
            <button
              key={sample.name}
              type="button"
              onClick={() => setSvgInput(sample.svg)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              {sample.name}
            </button>
          ))}
          <label
            htmlFor={uploadInputId}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-stone-500" />
            <span>Upload SVG</span>
            <input
              id={uploadInputId}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Compression Metric Banner */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="rounded-xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
            <span className="text-xs font-medium text-stone-500">Original Size</span>
            <div className="mt-1 text-lg font-bold text-stone-800">
              {formatBytes(result.stats.originalBytes)}
            </div>
          </div>
          <div className="rounded-xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
            <span className="text-xs font-medium text-stone-500">Optimized Size</span>
            <div className="mt-1 text-lg font-bold text-emerald-600">
              {formatBytes(result.stats.optimizedBytes)}
            </div>
          </div>
          <div className="rounded-xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
            <span className="text-xs font-medium text-stone-500">Bytes Saved</span>
            <div className="mt-1 text-lg font-bold text-stone-800">
              {formatBytes(result.stats.savedBytes)}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-emerald-700">Size Reduction</span>
              <div className="mt-0.5 text-xl font-extrabold text-emerald-700">
                -{result.stats.savingsPercent}%
              </div>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
      )}

      {/* Main Workspace Split (Input / Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[460px]">
        {/* Left Column: Input + Optimization Settings */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5" />
              Raw SVG Input
            </label>
            {svgInput && (
              <button
                type="button"
                onClick={() => setSvgInput('')}
                className="text-xs text-stone-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          <textarea
            value={svgInput}
            onChange={e => setSvgInput(e.target.value)}
            placeholder="Paste your raw <svg> markup here..."
            className="flex-1 w-full rounded-xl border border-stone-200 bg-white p-4 font-mono text-xs text-stone-800 shadow-xs focus:border-stone-900 focus:outline-hidden resize-none min-h-[220px]"
            spellCheck={false}
          />

          {/* Optimizer Controls */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="h-4 w-4 text-stone-700" />
              <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                Optimization Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeComments}
                  onChange={e => setRemoveComments(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                Remove XML & comments
              </label>

              <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeMetadata}
                  onChange={e => setRemoveMetadata(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                Remove metadata & desc
              </label>

              <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeEditorAttributes}
                  onChange={e => setRemoveEditorAttributes(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                Strip Inkscape/Sketch tags
              </label>

              <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeEmptyContainers}
                  onChange={e => setRemoveEmptyContainers(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                Strip empty &lt;g&gt; / &lt;defs&gt;
              </label>

              <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={collapseWhitespace}
                  onChange={e => setCollapseWhitespace(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                Minify & collapse whitespace
              </label>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="font-medium text-stone-700">Precision:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrecision(p)}
                      className={`h-6 w-7 rounded text-xs font-semibold transition-colors ${
                        precision === p
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Tabs (SVG Code / React JSX / Live Preview) */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'code'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Clean SVG
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('jsx')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'jsx'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                React JSX
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            </div>

            {/* Action buttons */}
            {result && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(activeTab === 'jsx' ? result.reactJsx : result.optimized, activeTab)
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
                >
                  {copiedKey === activeTab ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-stone-500" />
                      <span>Copy {activeTab === 'jsx' ? 'JSX' : 'SVG'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Tab Content Panes */}
          <div className="flex-1 min-h-[300px] flex flex-col">
            {activeTab === 'code' && (
              <textarea
                readOnly
                value={result?.optimized ?? ''}
                placeholder="Optimized SVG code will display here..."
                className="flex-1 w-full rounded-xl border border-stone-200 bg-stone-50/60 p-4 font-mono text-xs text-stone-800 shadow-xs focus:outline-hidden resize-none"
              />
            )}

            {activeTab === 'jsx' && (
              <textarea
                readOnly
                value={result?.reactJsx ?? ''}
                placeholder="React JSX code will display here..."
                className="flex-1 w-full rounded-xl border border-stone-200 bg-stone-50/60 p-4 font-mono text-xs text-stone-800 shadow-xs focus:outline-hidden resize-none"
              />
            )}

            {activeTab === 'preview' && (
              <div className="flex-1 w-full rounded-xl border border-stone-200 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-white p-8 flex items-center justify-center shadow-xs overflow-auto">
                {result?.optimized ? (
                  <div
                    className="max-h-72 max-w-72 flex items-center justify-center drop-shadow-sm"
                    dangerouslySetInnerHTML={{ __html: result.optimized }}
                  />
                ) : (
                  <div className="text-xs text-stone-400">No valid SVG preview available</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
