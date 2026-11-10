import { useState } from 'react';
import { pdfSplitTool } from '@nemokit/core';
import type { PdfSplitOutput, SplitPdfFile } from '@nemokit/core';
import { FileDown, Download, AlertCircle, FileUp, Sparkles, Check, Scissors } from 'lucide-react';

export function PdfSplitView() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'ranges' | 'single-pages'>('ranges');
  const [ranges, setRanges] = useState<string>('1-2');
  const [output, setOutput] = useState<PdfSplitOutput | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadedIndex, setDownloadedIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setOutput(null);
      setErrorMessage(null);
    }
  };

  const handleSplit = async () => {
    if (!file) {
      setErrorMessage('Please select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      await pdfSplitTool.execute(
        {
          fileBuffer: arrayBuffer,
          mode,
          ranges,
        },
        {
          onSuccess: (data, durationMs) => {
            setOutput(data);
            setDuration(durationMs ?? null);
            setIsProcessing(false);
          },
          onFailure: error => {
            setErrorMessage(error.message);
            setIsProcessing(false);
          },
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to read PDF.';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (splitFile: SplitPdfFile, idx: number) => {
    const blob = new Blob([splitFile.bytes as Uint8Array<ArrayBuffer>], {
      type: 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = splitFile.name;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedIndex(idx);
    setTimeout(() => setDownloadedIndex(null), 2000);
  };

  const handleDownloadAll = () => {
    if (!output) return;
    output.splitFiles.forEach((fileItem, idx) => {
      setTimeout(() => {
        handleDownloadSingle(fileItem, idx);
      }, idx * 250);
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Scissors className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              PDF Splitter & Extractor
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Split PDF documents by page ranges or extract individual pages directly in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-stone-800 cursor-pointer transition-colors">
            <FileUp className="h-3.5 w-3.5" />
            <span>{file ? 'Change PDF' : 'Select PDF'}</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Split Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* File status & Options Card */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Loaded Document
            </span>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-900">
              {file ? (
                <>
                  <span>{file.name}</span>
                  <span className="text-xs font-normal text-stone-400">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </>
              ) : (
                <span className="text-stone-400 font-normal italic">No PDF file chosen yet.</span>
              )}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
            {[
              { id: 'ranges', label: 'Page Ranges' },
              { id: 'single-pages', label: 'Extract Every Page' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id as typeof mode)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  mode === tab.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Range input when mode === 'ranges' */}
        {mode === 'ranges' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-stone-700">
              Page Ranges (comma-separated, e.g.,{' '}
              <code className="font-mono text-stone-900">1-3, 5, 7-10</code>):
            </label>
            <input
              type="text"
              value={ranges}
              onChange={e => setRanges(e.target.value)}
              placeholder="e.g., 1-2, 3-5"
              className="w-full sm:w-80 rounded-xl border border-stone-200/80 bg-[#fdfdfc] px-3.5 py-2 font-mono text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
            />
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Runs locally • Zero document upload to servers</span>
          </div>

          <button
            type="button"
            disabled={!file || isProcessing}
            onClick={handleSplit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            {isProcessing ? 'Processing PDF...' : 'Split & Extract'}
          </button>
        </div>
      </div>

      {/* Output / Split Files List */}
      {output && (
        <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-[#fbfbf9]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Split Results ({output.splitFiles.length} files generated)
              </span>
              <span className="text-xs text-stone-400">
                • Source: {output.totalOriginalPages} pages
              </span>
            </div>

            <div className="flex items-center gap-3">
              {duration !== null && (
                <span className="text-xs font-mono text-emerald-700">{duration.toFixed(2)} ms</span>
              )}
              {output.splitFiles.length > 1 && (
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-2xs"
                >
                  <Download className="h-3 w-3" />
                  <span>Download All</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {output.splitFiles.map((splitFile, idx) => (
              <div
                key={`${splitFile.name}-${idx}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 truncate pr-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                    <FileDown className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      {splitFile.name}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {splitFile.pageRange} • {(splitFile.bytes.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadSingle(splitFile, idx)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors shrink-0"
                >
                  {downloadedIndex === idx ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
