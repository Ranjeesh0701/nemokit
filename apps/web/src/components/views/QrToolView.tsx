import { useState, useEffect } from 'react';
import { qrTool } from '@nemokit/core';
import type { QrToolOutput, QrErrorCorrectionLevel } from '@nemokit/core';
import { QrCode, Download, Copy, Check, Sliders } from 'lucide-react';

const QR_PRESETS = [
  { label: 'Website URL', text: 'https://nemokit.dev' },
  { label: 'Wi-Fi Network', text: 'WIFI:S:Office-Guest;T:WPA;P:SuperSecret123;;' },
  { label: 'Email', text: 'mailto:contact@nemokit.dev?subject=Hello' },
  {
    label: 'vCard Contact',
    text: 'BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nFN:John Doe\nEMAIL:john@example.com\nEND:VCARD',
  },
];

export function QrToolView() {
  const [text, setText] = useState<string>('https://nemokit.dev');
  const [ecLevel, setEcLevel] = useState<QrErrorCorrectionLevel>('M');
  const [darkColor, setDarkColor] = useState<string>('#18181b');
  const [lightColor, setLightColor] = useState<string>('#ffffff');
  const [output, setOutput] = useState<QrToolOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    void (async () => {
      const res = await qrTool.execute({
        text,
        errorCorrectionLevel: ecLevel,
        darkColor,
        lightColor,
        size: 360,
      });

      if (res.success) {
        setOutput(res.data);
      }
    })();
  }, [text, ecLevel, darkColor, lightColor]);

  const handleDownloadPng = () => {
    if (!output) return;
    const a = document.createElement('a');
    a.href = output.dataUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  const handleDownloadSvg = () => {
    if (!output) return;
    const blob = new Blob([output.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDataUrl = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output.dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <QrCode className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              QR Code Generator & Exporter
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Generate customizable QR codes for links, text, and Wi-Fi networks with high-res SVG &
            PNG exports.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QR_PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setText(p.text)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Content & Controls vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Input text / URL */}
          <div className="flex flex-col gap-2 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              QR Content (Text or URL)
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter URL or text to encode..."
              rows={4}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 font-mono text-xs sm:text-sm text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Configuration Options */}
          <div className="flex flex-col gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
              <Sliders className="h-3.5 w-3.5" />
              Styling & Error Correction
            </span>

            {/* Error correction levels */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-stone-700">Error Correction Level</span>
              <div className="grid grid-cols-4 gap-2">
                {(['L', 'M', 'Q', 'H'] as QrErrorCorrectionLevel[]).map(lvl => {
                  const labels: Record<QrErrorCorrectionLevel, string> = {
                    L: '7% (Low)',
                    M: '15% (Med)',
                    Q: '25% (High)',
                    H: '30% (Max)',
                  };
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEcLevel(lvl)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium border transition-colors ${
                        ecLevel === lvl
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-bold">{lvl}</span>
                      <span className="text-[10px] opacity-80">{labels[lvl]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Foreground Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-stone-700">Dark Color (Dots)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={e => setDarkColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-stone-200 bg-white"
                  />
                  <input
                    type="text"
                    value={darkColor}
                    onChange={e => setDarkColor(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-stone-700">Light Color (Backdrop)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={e => setLightColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-stone-200 bg-white"
                  />
                  <input
                    type="text"
                    value={lightColor}
                    onChange={e => setLightColor(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Preview Column */}
        <div className="lg:col-span-5 flex flex-col gap-4 items-center rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 self-start">
            Live QR Preview
          </span>

          {output ? (
            <div
              className="flex items-center justify-center p-4 rounded-2xl border border-stone-200 shadow-inner bg-white max-w-full"
              style={{ backgroundColor: lightColor }}
            >
              <img
                src={output.dataUrl}
                alt="Generated QR Code"
                className="w-64 h-64 object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-xs text-stone-400">
              Generating QR...
            </div>
          )}

          {/* Download & Copy Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!output}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              PNG
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={!output}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" />
              SVG Vector
            </button>
            <button
              type="button"
              onClick={handleCopyDataUrl}
              disabled={!output}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-50 transition-colors"
              title="Copy base64 Data URL"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-stone-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
