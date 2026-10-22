import { useState } from 'react';
import { fileHashTool } from '@nemokit/core';
import type { FileHashOutput } from '@nemokit/core';
import {
  ShieldCheck,
  Copy,
  Check,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export function FileHashView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [output, setOutput] = useState<FileHashOutput | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const processFile = async (file: File, expected?: string) => {
    setIsHashing(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const res = await fileHashTool.execute({
        filename: file.name,
        bytes,
        expectedChecksum: expected !== undefined ? expected : expectedHash,
      });

      if (res.success) {
        setOutput(res.data);
      } else {
        setErrorMessage(res.error.message);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to calculate file checksum');
    } finally {
      setIsHashing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    await processFile(file);
  };

  const handleExpectedHashChange = (val: string) => {
    setExpectedHash(val);
    if (selectedFile) {
      void processFile(selectedFile, val);
    }
  };

  const handleCopy = async (hash: string, key: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
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
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              File Checksum & Hash Verifier
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Calculate SHA-256, SHA-512, and SHA-1 checksums locally in your browser and verify
            against release hashes.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* File Dropzone */}
      <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 bg-white p-10 text-center cursor-pointer hover:border-stone-400 transition-colors">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
          <FileCheck className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-stone-900">
            {selectedFile ? selectedFile.name : 'Choose or drop a file to verify checksum'}
          </p>
          <p className="text-xs text-stone-400">
            {selectedFile
              ? `${(selectedFile.size / 1024).toFixed(1)} KB • Click to choose a different file`
              : 'Zero upload • Computed securely in your browser'}
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700">
          {isHashing ? 'Hashing in progress...' : 'Select File'}
        </span>
        <input type="file" onChange={handleFileChange} className="hidden" />
      </label>

      {/* Verification Input Bar */}
      <div className="flex flex-col gap-2 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Expected Checksum (Optional Match Verifier)
        </label>
        <input
          type="text"
          value={expectedHash}
          onChange={e => handleExpectedHashChange(e.target.value)}
          placeholder="Paste expected SHA-256, SHA-512, or SHA-1 hash from vendor release..."
          className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 font-mono text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
        />

        {output?.verification && (
          <div
            className={`mt-2 flex items-center gap-2 rounded-xl p-3 text-xs font-medium border ${
              output.verification.matches
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {output.verification.matches ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Checksum Match Confirmed! The file integrity is 100% verified.</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  Checksum Mismatch! The calculated file hash does not match the expected hash.
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Calculated Hashes Cards */}
      {output && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Calculated Cryptographic Hashes</span>
            <span className="font-mono text-stone-400">{output.sizeFormatted}</span>
          </div>

          {/* SHA-256 */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase">SHA-256</span>
              <button
                type="button"
                onClick={() => handleCopy(output.hashes.sha256, 'sha256')}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
              >
                {copiedKey === 'sha256' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy
              </button>
            </div>
            <p className="font-mono text-xs text-stone-700 break-all select-all font-medium">
              {output.hashes.sha256}
            </p>
          </div>

          {/* SHA-512 */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase">SHA-512</span>
              <button
                type="button"
                onClick={() => handleCopy(output.hashes.sha512, 'sha512')}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
              >
                {copiedKey === 'sha512' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy
              </button>
            </div>
            <p className="font-mono text-xs text-stone-700 break-all select-all font-medium">
              {output.hashes.sha512}
            </p>
          </div>

          {/* SHA-1 */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase">SHA-1</span>
              <button
                type="button"
                onClick={() => handleCopy(output.hashes.sha1, 'sha1')}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
              >
                {copiedKey === 'sha1' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy
              </button>
            </div>
            <p className="font-mono text-xs text-stone-700 break-all select-all font-medium">
              {output.hashes.sha1}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
