import { useState, useEffect } from 'react';
import { markdownTool } from '@nemokit/core';
import type { MarkdownToolOutput } from '@nemokit/core';
import { FileEdit, Copy, Check, Download, BookOpen } from 'lucide-react';

const SAMPLE_MD = `# Welcome to Nemokit Markdown Editor

Nemokit is a **modern utility platform** designed for developers and designers.

## Key Features
- **100% Client-Side**: No data leaves your machine.
- **Lightning Fast**: Sub-millisecond formatting and conversions.
- **Zero Distractions**: Warm stone aesthetic without clutter.

### Code Sample
\`\`\`typescript
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

> "Simplicity is the soul of efficiency." — Austin Freeman

---
Enjoy building with clean tools!`;

export function MarkdownView() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MD);
  const [output, setOutput] = useState<MarkdownToolOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    markdownTool.execute(
      { markdown },
      {
        onSuccess: data => setOutput(data),
      }
    );
  }, [markdown]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInsert = (prefix: string, suffix: string = '') => {
    setMarkdown(prev => `${prev}\n${prefix}${suffix}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-5 sm:pb-6">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <span className="flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs mt-0.5 sm:mt-0">
            <FileEdit className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-stone-900 leading-snug">
              Markdown Live Editor & Stats
            </h1>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed max-w-2xl">
              Write GitHub-flavored markdown with split-pane live HTML rendering and real-time reading
              metrics.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleCopy(output?.html ?? '', 'html')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            {copiedKey === 'html' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied HTML</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-stone-500" />
                <span>Copy HTML</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadMd}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      {/* Formatting Quick Toolbar & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-stone-200/90 bg-stone-50/70 p-2.5 sm:p-3">
        {/* Quick format buttons */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleInsert('# Heading 1')}
            className="rounded px-2 py-1 text-xs font-bold text-stone-700 hover:bg-stone-200/60 whitespace-nowrap shrink-0"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => handleInsert('## Heading 2')}
            className="rounded px-2 py-1 text-xs font-bold text-stone-700 hover:bg-stone-200/60 whitespace-nowrap shrink-0"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => handleInsert('**bold text**')}
            className="rounded px-2 py-1 text-xs font-bold text-stone-700 hover:bg-stone-200/60 whitespace-nowrap shrink-0"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => handleInsert('*italic text*')}
            className="rounded px-2 py-1 text-xs italic text-stone-700 hover:bg-stone-200/60 whitespace-nowrap shrink-0"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => handleInsert('- List item')}
            className="rounded px-2 py-1 text-xs text-stone-700 hover:bg-stone-200/60 whitespace-nowrap shrink-0"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => handleInsert('```\n// code\n```')}
            className="rounded px-2 py-1 text-xs font-mono text-stone-700 hover:bg-stone-200/60 whitespace-nowrap shrink-0"
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            onClick={() => handleInsert('> Quote')}
            className="rounded px-2 py-1 text-xs text-stone-700 hover:bg-stone-200/60 whitespace-nowrap shrink-0"
          >
            Quote
          </button>
        </div>

        {/* Live Metrics */}
        {output && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-stone-600">
            <span>{output.wordCount} words</span>
            <span>•</span>
            <span>{output.characterCount} chars</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-stone-800 font-medium">
              <BookOpen className="h-3 w-3 text-stone-500" />~{output.estimatedReadTimeMinutes} min
              read
            </span>
          </div>
        )}
      </div>

      {/* Split-Pane Grid: Markdown Editor vs Live Render */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Editor */}
        <div className="flex flex-col gap-2 min-w-0 flex-1 min-h-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Markdown Source</span>
            <span className="font-mono text-stone-400">{output?.lineCount} lines</span>
          </div>
          <textarea
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            placeholder="Type your markdown content..."
            className="w-full flex-1 min-h-50 rounded-xl border border-stone-200 bg-white p-3.5 font-mono text-xs sm:text-sm text-stone-800 shadow-xs placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* HTML Preview */}
        <div className="flex flex-col gap-2 min-w-0 flex-1 min-h-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span>Live Document Render</span>
            <span className="font-mono text-stone-400">HTML Preview</span>
          </div>
          <div
            className="w-full flex-1 min-h-50 rounded-xl border border-stone-200 bg-white p-6 shadow-xs overflow-y-auto prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: output?.html ?? '' }}
          />
        </div>
      </div>
    </div>
  );
}
