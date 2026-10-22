import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  htmlPreviewTool,
  type HtmlPreviewOutput,
} from '@nemokit/core';
import {
  Eye,
  Code2,
  Minimize2,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
} from 'lucide-react';
import { DropzoneWrapper } from '../common/DropzoneWrapper.js';
import { downloadAsFile } from '../../utils/fileDownload.js';
import { serializeStateToUrl, parseSharedState } from '../../utils/shareState.js';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preview Card</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #faf9f6; }
    .card { background: white; border: 1px solid #e7e5e4; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 320px; }
    h2 { margin: 0 0 8px 0; font-size: 18px; color: #1c1917; }
    p { margin: 0; font-size: 14px; color: #78716c; line-height: 1.5; }
    .badge { display: inline-block; background: #f5f5f4; color: #44403c; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 6px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">NEMOKIT WORKSPACE</span>
    <h2>100% Client-Side Preview</h2>
    <p>Live sandbox renderer executing entirely inside your browser. No server roundtrips.</p>
  </div>
</body>
</html>`;

export function HtmlPreviewView() {
  const initial = useMemo(() => {
    return parseSharedState<{
      code?: string;
      activeTab?: 'preview' | 'minified' | 'beautified';
    }>('html-preview');
  }, []);

  const [code, setCode] = useState<string>(initial?.code ?? SAMPLE_HTML);
  const [activeTab, setActiveTab] = useState<'preview' | 'minified' | 'beautified'>(
    initial?.activeTab ?? 'preview'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [output, setOutput] = useState<HtmlPreviewOutput | null>(null);

  // Execute engine tool
  useEffect(() => {
    htmlPreviewTool.execute(
      { code },
      {
        onSuccess: data => setOutput(data),
        onFailure: () => setOutput(null),
      }
    );
  }, [code]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const isSvg = output.type === 'svg';
    const textToSave =
      activeTab === 'minified'
        ? output.minified
        : activeTab === 'beautified'
        ? output.beautified
        : code;
    const filename = isSvg ? 'vector.svg' : 'index.html';
    const mime = isSvg ? 'image/svg+xml' : 'text/html';
    downloadAsFile(filename, textToSave, mime);
  };

  const handleShareLink = useCallback(() => {
    const url = serializeStateToUrl('html-preview', {
      code,
      activeTab,
    });
    navigator.clipboard.writeText(url);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  }, [code, activeTab]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-700">
            <Code2 className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                HTML & SVG Live Previewer
              </h1>
              {output && (
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase">
                  {output.type}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Sandboxed live rendering, code minification, and clean formatting for web markup.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            {shareSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-stone-500" />
                <span>Share Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Download file"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Code Editor */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden h-[540px]">
          <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Source Markup
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCode('')}
                className="text-[11px] text-stone-500 hover:text-stone-800 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setCode(SAMPLE_HTML)}
                className="text-[11px] text-stone-600 hover:text-stone-900 font-medium transition-colors"
              >
                Reset Sample
              </button>
            </div>
          </div>

          <DropzoneWrapper
            allowedExtensions={['.html', '.htm', '.svg', '.txt', '.xml']}
            onFileLoaded={(content) => setCode(content)}
            label="Drop .html or .svg file here"
          >
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Paste or write HTML or SVG markup here..."
              spellCheck={false}
              className="w-full h-full p-4 font-mono text-xs text-stone-800 bg-transparent resize-none focus:outline-hidden leading-relaxed"
            />
          </DropzoneWrapper>

          {/* Quick stats footer */}
          <div className="px-4 py-2 border-t border-stone-200/60 bg-stone-50/50 flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <span>Size: {output ? `${output.stats.originalBytes} bytes` : '0 bytes'}</span>
            <span>Lines: {code.split('\n').length}</span>
          </div>
        </div>

        {/* Right Column: Sandboxed Preview & Tools */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden h-[540px]">
          {/* Output Mode Tabs */}
          <div className="px-4 py-2 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between">
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
                <span>Live Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('minified')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'minified'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Minimize2 className="h-3.5 w-3.5 text-stone-500" />
                <span>Minified</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('beautified')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'beautified'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-stone-500" />
                <span>Beautified</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={() => {
                if (!output) return;
                const txt =
                  activeTab === 'minified'
                    ? output.minified
                    : activeTab === 'beautified'
                    ? output.beautified
                    : code;
                copyToClipboard(txt, 'output');
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200/60 transition-colors"
            >
              {copiedKey === 'output' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-stone-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'preview' && (
              <iframe
                srcDoc={code}
                title="Sanitized Preview"
                sandbox="allow-scripts"
                className="w-full h-full border-none bg-white"
              />
            )}

            {activeTab === 'minified' && (
              <textarea
                readOnly
                value={output?.minified ?? ''}
                className="w-full h-full p-4 font-mono text-xs text-stone-800 bg-stone-50/40 resize-none focus:outline-hidden leading-relaxed"
              />
            )}

            {activeTab === 'beautified' && (
              <textarea
                readOnly
                value={output?.beautified ?? ''}
                className="w-full h-full p-4 font-mono text-xs text-stone-800 bg-stone-50/40 resize-none focus:outline-hidden leading-relaxed"
              />
            )}
          </div>

          {/* Footer with Minification Stats */}
          {output && (
            <div className="px-4 py-2 border-t border-stone-200/60 bg-stone-50/50 flex items-center justify-between text-[11px] text-stone-600">
              <span className="font-mono">
                Minified: {output.stats.minifiedBytes} bytes
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <span>Saved: {output.stats.reductionPercent}%</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
