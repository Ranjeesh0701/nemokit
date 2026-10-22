import { useState } from 'react';
import { pdfMergeTool } from '@nemokit/core';
import type { PdfMergeOutput } from '@nemokit/core';
import {
  FilePlus2,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SelectedFile {
  id: string;
  name: string;
  bytes: Uint8Array;
  sizeKb: number;
}

export function PdfMergeView() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [output, setOutput] = useState<PdfMergeOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const newFiles: SelectedFile[] = [];
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      if (!file) continue;
      const buffer = await file.arrayBuffer();
      newFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        bytes: new Uint8Array(buffer),
        sizeKb: Math.round(file.size / 1024),
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    setOutput(null);
    setErrorMessage(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const next = [...prev];
      const temp = next[index - 1]!;
      next[index - 1] = next[index]!;
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= files.length - 1) return;
    setFiles(prev => {
      const next = [...prev];
      const temp = next[index + 1]!;
      next[index + 1] = next[index]!;
      next[index] = temp;
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
    setOutput(null);
    setErrorMessage(null);
  };

  const handleMerge = async () => {
    if (files.length === 0) return;
    setIsMerging(true);
    setErrorMessage(null);

    try {
      const res = await pdfMergeTool.execute({
        files: files.map(f => ({ name: f.name, bytes: f.bytes })),
      });

      if (res.success) {
        setOutput(res.data);
      } else {
        setErrorMessage(res.error.message);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to merge PDF files');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownloadMerged = () => {
    if (!output) return;
    const blob = new Blob([output.mergedPdfBytes as unknown as BlobPart], {
      type: 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged-document.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <FilePlus2 className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              PDF Merge & Combiner
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Combine multiple PDF documents into a single document client-side without uploading your
            files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Clear All
            </button>
          )}

          <label className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 cursor-pointer transition-colors">
            <FilePlus2 className="h-3.5 w-3.5" />
            Add PDFs
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* File List or Empty State */}
      {files.length === 0 ? (
        <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center cursor-pointer hover:border-stone-400 transition-colors">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
            <FileText className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-stone-800">Select or drop PDF files here</p>
            <p className="text-xs text-stone-400">Add two or more files to combine them in order</p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700">
            Browse files
          </span>
          <input
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Merge Queue ({files.length} documents)</span>
            <span className="text-stone-400">Order from top to bottom</span>
          </div>

          <div className="flex flex-col gap-2">
            {files.map((file, idx) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/90 bg-white p-3.5 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 font-mono text-xs text-stone-500 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      {file.name}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">{file.sizeKb} KB</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    title="Move up"
                    className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-800 disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === files.length - 1}
                    title="Move down"
                    className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-800 disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    title="Remove file"
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors ml-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Execution Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/90 bg-stone-50/70 p-4 mt-2">
            <span className="text-xs font-medium text-stone-600">
              Ready to merge {files.length} PDF files into one.
            </span>

            <button
              type="button"
              onClick={handleMerge}
              disabled={isMerging || files.length < 2}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              {isMerging ? 'Merging PDF files...' : 'Combine & Generate PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Success & Download Card */}
      {output && (
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-950">
                  Successfully Consolidated {output.fileCount} Documents
                </h3>
                <p className="text-xs text-emerald-700 font-mono mt-0.5">
                  Total {output.totalPages} pages merged seamlessly
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadMerged}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download Merged PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
