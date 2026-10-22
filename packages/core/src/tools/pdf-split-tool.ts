import { PDFDocument } from 'pdf-lib';
import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface PdfSplitInput {
  readonly fileBuffer: Uint8Array | ArrayBuffer;
  readonly mode: 'ranges' | 'single-pages';
  readonly ranges?: string; // e.g., "1-2, 3-5" or "1, 3, 5"
}

export interface SplitPdfFile {
  readonly name: string;
  readonly pageRange: string;
  readonly bytes: Uint8Array;
  readonly pageCount: number;
}

export interface PdfSplitOutput {
  readonly totalOriginalPages: number;
  readonly splitFiles: ReadonlyArray<SplitPdfFile>;
}

function parseRanges(rangeStr: string, maxPages: number): number[][] {
  const parts = rangeStr
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
  const groups: number[][] = [];

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr ?? '', 10);
      const end = parseInt(endStr ?? '', 10);

      if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
        const group: number[] = [];
        const boundedEnd = Math.min(end, maxPages);
        for (let p = Math.max(start, 1); p <= boundedEnd; p++) {
          group.push(p - 1); // 0-based index
        }
        if (group.length > 0) groups.push(group);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        groups.push([pageNum - 1]);
      }
    }
  }

  return groups;
}

export const pdfSplitTool: Tool<PdfSplitInput, PdfSplitOutput> = {
  id: 'pdf-splitter',
  name: 'PDF Splitter & Page Extractor',
  description:
    'Extracts pages and splits PDF documents into custom ranges or individual files 100% in your browser.',
  category: 'pdf',

  async execute(
    input: PdfSplitInput,
    handlers?: Partial<ResultHandlers<PdfSplitOutput, void>>
  ): Promise<ToolExecutionResult<PdfSplitOutput>> {
    const startTime = performance.now();

    if (!input || !input.fileBuffer) {
      const res = onFailure('No PDF file buffer provided.', 'EMPTY_BUFFER');
      handlers?.onFailure?.(res.error);
      return res;
    }

    try {
      const srcDoc = await PDFDocument.load(input.fileBuffer);
      const totalOriginalPages = srcDoc.getPageCount();

      if (totalOriginalPages === 0) {
        const res = onFailure('The uploaded PDF does not contain any pages.', 'EMPTY_PDF');
        handlers?.onFailure?.(res.error);
        return res;
      }

      const splitFiles: SplitPdfFile[] = [];

      if (input.mode === 'single-pages') {
        for (let i = 0; i < totalOriginalPages; i++) {
          const newDoc = await PDFDocument.create();
          const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
          if (copiedPage) {
            newDoc.addPage(copiedPage);
          }
          const bytes = await newDoc.save();
          splitFiles.push({
            name: `page-${i + 1}.pdf`,
            pageRange: `Page ${i + 1}`,
            bytes,
            pageCount: 1,
          });
        }
      } else {
        const rangeString = input.ranges?.trim() || `1-${totalOriginalPages}`;
        const pageGroups = parseRanges(rangeString, totalOriginalPages);

        if (pageGroups.length === 0) {
          const res = onFailure(
            `Invalid page range "${rangeString}". Must be between 1 and ${totalOriginalPages}.`,
            'INVALID_RANGE'
          );
          handlers?.onFailure?.(res.error);
          return res;
        }

        for (let i = 0; i < pageGroups.length; i++) {
          const group = pageGroups[i];
          if (!group || group.length === 0) continue;

          const newDoc = await PDFDocument.create();
          const copiedPages = await newDoc.copyPages(srcDoc, group);
          for (const page of copiedPages) {
            newDoc.addPage(page);
          }
          const bytes = await newDoc.save();
          const firstPage = (group[0] ?? 0) + 1;
          const lastPage = (group[group.length - 1] ?? 0) + 1;
          const rangeLabel =
            firstPage === lastPage ? `Page ${firstPage}` : `Pages ${firstPage}-${lastPage}`;

          splitFiles.push({
            name: `split-${firstPage}-${lastPage}.pdf`,
            pageRange: rangeLabel,
            bytes,
            pageCount: group.length,
          });
        }
      }

      const durationMs = performance.now() - startTime;
      const res = onSuccess(
        {
          totalOriginalPages,
          splitFiles,
        },
        durationMs
      );
      handlers?.onSuccess?.(res.data, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to split PDF.';
      const res = onFailure(`PDF splitting failed: ${message}`, 'PDF_SPLIT_ERROR');
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
