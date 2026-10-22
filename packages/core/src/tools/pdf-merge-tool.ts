import { PDFDocument } from 'pdf-lib';
import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface PdfFileInput {
  readonly name: string;
  readonly bytes: Uint8Array;
}

export interface PdfMergeInput {
  readonly files: ReadonlyArray<PdfFileInput>;
}

export interface PdfMergeOutput {
  readonly mergedPdfBytes: Uint8Array;
  readonly totalPages: number;
  readonly fileCount: number;
  readonly fileBreakdown: ReadonlyArray<{
    readonly name: string;
    readonly pageCount: number;
  }>;
}

export const pdfMergeTool: Tool<PdfMergeInput, PdfMergeOutput> = {
  id: 'pdf-merge',
  name: 'PDF Merge & Combiner',
  description:
    'Combines multiple PDF documents into a single consolidated file client-side using browser memory.',
  category: 'pdf',

  async execute(
    input: PdfMergeInput,
    handlers?: Partial<ResultHandlers<PdfMergeOutput, void>>
  ): Promise<ToolExecutionResult<PdfMergeOutput>> {
    const startTime = performance.now();

    const files = input?.files ?? [];
    if (files.length === 0) {
      const res = onFailure('Please provide at least one PDF file to merge.', 'EMPTY_FILES');
      handlers?.onFailure?.(res.error);
      return res;
    }

    try {
      const mergedDoc = await PDFDocument.create();
      const fileBreakdown: Array<{ name: string; pageCount: number }> = [];

      for (const file of files) {
        let doc: PDFDocument;
        try {
          doc = await PDFDocument.load(file.bytes);
        } catch {
          const res = onFailure(
            `Failed to read PDF file "${file.name}". Ensure it is a valid PDF.`,
            'INVALID_PDF'
          );
          handlers?.onFailure?.(res.error);
          return res;
        }

        const count = doc.getPageCount();
        const pageIndices = doc.getPageIndices();
        const copiedPages = await mergedDoc.copyPages(doc, pageIndices);

        for (const page of copiedPages) {
          mergedDoc.addPage(page);
        }

        fileBreakdown.push({
          name: file.name,
          pageCount: count,
        });
      }

      const mergedPdfBytes = await mergedDoc.save();
      const totalPages = mergedDoc.getPageCount();
      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

      const output: PdfMergeOutput = {
        mergedPdfBytes,
        totalPages,
        fileCount: files.length,
        fileBreakdown,
      };

      const successRes = onSuccess(output, durationMs);
      handlers?.onSuccess?.(output);
      return successRes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error merging PDF documents';
      const res = onFailure(msg, 'PDF_MERGE_ERROR');
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
