import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface DiffLine {
  readonly type: 'added' | 'removed' | 'unchanged';
  readonly lineNumberOriginal?: number;
  readonly lineNumberModified?: number;
  readonly content: string;
}

export interface DiffToolInput {
  readonly original: string;
  readonly modified: string;
  readonly ignoreWhitespace?: boolean;
}

export interface DiffToolOutput {
  readonly lines: ReadonlyArray<DiffLine>;
  readonly additions: number;
  readonly deletions: number;
  readonly unchanged: number;
  readonly similarityPercentage: number;
}

/**
 * Computes Longest Common Subsequence (LCS) matrix for line diffing.
 */
function computeDiff(
  originalLines: string[],
  modifiedLines: string[],
  ignoreWhitespace: boolean
): DiffLine[] {
  const norm = (s: string) => (ignoreWhitespace ? s.trim() : s);
  const n = originalLines.length;
  const m = modifiedLines.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    const orig = originalLines[i];
    if (orig === undefined) continue;

    for (let j = 0; j < m; j++) {
      const mod = modifiedLines[j];
      if (mod === undefined) continue;

      if (norm(orig) === norm(mod)) {
        dp[i + 1]![j + 1] = (dp[i]![j] ?? 0) + 1;
      } else {
        dp[i + 1]![j + 1] = Math.max(dp[i + 1]![j] ?? 0, dp[i]![j + 1] ?? 0);
      }
    }
  }

  // Backtrack to construct diff lines
  const result: DiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && norm(originalLines[i - 1] ?? '') === norm(modifiedLines[j - 1] ?? '')) {
      result.unshift({
        type: 'unchanged',
        lineNumberOriginal: i,
        lineNumberModified: j,
        content: originalLines[i - 1] ?? '',
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || (dp[i]![j - 1] ?? 0) >= (dp[i - 1]![j] ?? 0))) {
      result.unshift({
        type: 'added',
        lineNumberModified: j,
        content: modifiedLines[j - 1] ?? '',
      });
      j--;
    } else if (i > 0) {
      result.unshift({
        type: 'removed',
        lineNumberOriginal: i,
        content: originalLines[i - 1] ?? '',
      });
      i--;
    }
  }

  return result;
}

export const diffTool: Tool<DiffToolInput, DiffToolOutput> = {
  id: 'diff-tool',
  name: 'Text Diff & Comparator',
  description:
    'Compares two blocks of text or code line-by-line, highlighting additions, deletions, and line changes.',
  category: 'formatters',

  execute(
    input: DiffToolInput,
    handlers?: Partial<ResultHandlers<DiffToolOutput, void>>
  ): ToolExecutionResult<DiffToolOutput> {
    const startTime = performance.now();

    if (!input || typeof input.original !== 'string' || typeof input.modified !== 'string') {
      const res = onFailure('Both original and modified texts are required.', 'INVALID_INPUT');
      handlers?.onFailure?.(res.error);
      return res;
    }

    try {
      const originalLines = input.original.split('\n');
      const modifiedLines = input.modified.split('\n');
      const ignoreWhitespace = input.ignoreWhitespace ?? false;

      const lines = computeDiff(originalLines, modifiedLines, ignoreWhitespace);

      let additions = 0;
      let deletions = 0;
      let unchanged = 0;

      for (const line of lines) {
        if (line.type === 'added') additions++;
        else if (line.type === 'removed') deletions++;
        else unchanged++;
      }

      const totalLines = additions + deletions + unchanged;
      const similarityPercentage =
        totalLines > 0 ? Math.round((unchanged / totalLines) * 100) : 100;

      const durationMs = performance.now() - startTime;
      const res = onSuccess(
        {
          lines,
          additions,
          deletions,
          unchanged,
          similarityPercentage,
        },
        durationMs
      );
      handlers?.onSuccess?.(res.data, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Diff calculation failed.';
      const res = onFailure(message, 'DIFF_ERROR');
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
