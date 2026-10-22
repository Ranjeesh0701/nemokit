import { useEffect, useRef, useState } from 'react';
import { documentConverterTool } from '@nemokit/core';
import type { DocumentConverterOutput } from '@nemokit/core';
import { FileText, Download, Printer, Trash2, AlertCircle, FileUp } from 'lucide-react';

const SAMPLE_DOC = `# Project Kickoff & Executive Summary

Nemokit is a modern utility suite with a browser-first tool engine.

## Core Architecture Principles
- **Library-First Foundation**: The engine operates purely in TypeScript without React or UI coupling.
- **Privacy by Design**: Sensitive data, tokens, and documents never leave your browser.
- **Hardware Acceleration**: Heavy calculations leverage Web Crypto and native browser parsing.

## Conversion Capabilities
1. Instant conversion to Microsoft Word (.doc)
2. Clean vector-grade PDF export via browser print engine
3. Zero telemetry or server storage`;

export function DocumentConverterView() {
  const [title, setTitle] = useState<string>('Project Kickoff & Executive Summary');
  const [content, setContent] = useState<string>(SAMPLE_DOC);
  const [target, setTarget] = useState<'word' | 'pdf'>('word');
  const [output, setOutput] = useState<DocumentConverterOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  const convertDocument = async (
    docTitle: string,
    docContent: string,
    docTarget: 'word' | 'pdf'
  ) => {
    await documentConverterTool.execute(
      {
        title: docTitle,
        content: docContent,
        target: docTarget,
      },
      {
        onSuccess: data => {
          setOutput(data);
          setErrorMessage(null);
        },
        onFailure: error => {
          setErrorMessage(error.message);
        },
      }
    );
  };

  useEffect(() => {
    void convertDocument(title, content, target);
  }, []);

  const handleDownloadWord = () => {
    if (!output) return;
    const blob = new Blob([output.htmlDocument], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = output.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    if (!output) return;
    const iframe = printFrameRef.current;
    if (!iframe) return;

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(output.htmlDocument);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 250);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const docName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(docName);
        setContent(text);
        void convertDocument(docName, text, target);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hidden print iframe for PDF generation */}
      <iframe ref={printFrameRef} title="Print Frame" className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <FileText className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Document & PDF Converter
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Convert formatted text and markdown into downloadable Microsoft Word (.doc) and PDF
            documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 cursor-pointer transition-colors">
            <FileUp className="h-3.5 w-3.5 text-stone-500" />
            <span>Upload File</span>
            <input
              type="file"
              accept=".txt,.md,.markdown"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setTitle('Untitled Document');
              setContent('');
              setOutput(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-stone-400" />
            Clear
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Document Error</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Document Title input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Document Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => {
            const newTitle = e.target.value;
            setTitle(newTitle);
            void convertDocument(newTitle, content, target);
          }}
          placeholder="Document Title..."
          className="w-full rounded-xl border border-stone-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all shadow-xs"
        />
      </div>

      {/* Editor & Preview Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full min-w-0">
        {/* Editor Column */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Content Editor (Markdown / Text)
            </span>
            {output && (
              <span className="text-xs font-mono text-stone-400">
                {output.wordCount} words • {output.characterCount} chars
              </span>
            )}
          </div>

          <textarea
            value={content}
            onChange={e => {
              const newContent = e.target.value;
              setContent(newContent);
              void convertDocument(title, newContent, target);
            }}
            placeholder="Write or paste your document content here (supports # headings, - lists, **bold**, *italics*)..."
            rows={18}
            className="mt-3 w-full resize-y rounded-xl border border-stone-200/60 bg-[#fdfdfc] p-3.5 font-mono text-xs text-stone-900 leading-relaxed placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
            spellCheck={false}
          />
        </div>

        {/* Live Preview Column */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Live Document Preview
            </span>
            <div className="flex items-center gap-1.5">
              <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/80 p-0.5">
                {(['word', 'pdf'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => {
                      setTarget(fmt);
                      void convertDocument(title, content, fmt);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-all ${
                      target === fmt
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formatted Render */}
          <div className="relative mt-3 h-[396px] overflow-auto rounded-xl border border-stone-200/60 bg-white p-6 shadow-2xs">
            {output ? (
              <div
                className="prose prose-stone prose-sm max-w-none font-sans"
                dangerouslySetInnerHTML={{ __html: output.htmlDocument }}
              />
            ) : (
              <span className="text-stone-400 italic">Document preview will appear here...</span>
            )}
          </div>

          {/* Export Action Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              disabled={!output}
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-stone-600" />
              <span>Export as PDF</span>
            </button>
            <button
              type="button"
              disabled={!output}
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-stone-200" />
              <span>Download Word (.doc)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
