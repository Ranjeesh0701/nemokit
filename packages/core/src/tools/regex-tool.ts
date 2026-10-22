import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface RegexMatch {
  readonly index: number;
  readonly length: number;
  readonly match: string;
  readonly groups?: Record<string, string>;
  readonly captureGroups: ReadonlyArray<string>;
}

export interface RegexToolInput {
  readonly pattern: string;
  readonly flags?: string;
  readonly testString: string;
  readonly replacement?: string;
}

export interface RegexToolOutput {
  readonly pattern: string;
  readonly flags: string;
  readonly isValid: boolean;
  readonly matchCount: number;
  readonly matches: ReadonlyArray<RegexMatch>;
  readonly substituted?: string;
}

export const regexTool: Tool<RegexToolInput, RegexToolOutput> = {
  id: 'regex-tester',
  name: 'Regex Tester & Explainer',
  description:
    'Evaluates regular expressions in real time, visualizes captured groups, and performs string substitutions.',
  category: 'formatters',

  execute(
    input: RegexToolInput,
    handlers?: Partial<ResultHandlers<RegexToolOutput, void>>
  ): ToolExecutionResult<RegexToolOutput> {
    const startTime = performance.now();

    const pattern = input?.pattern ?? '';
    const flags = input?.flags ?? 'g';
    const testString = input?.testString ?? '';
    const replacement = input?.replacement;

    if (!pattern) {
      const emptyResult: RegexToolOutput = {
        pattern: '',
        flags,
        isValid: true,
        matchCount: 0,
        matches: [],
        substituted: replacement !== undefined ? testString : undefined,
      };
      const successRes = onSuccess(emptyResult, 0);
      handlers?.onSuccess?.(emptyResult);
      return successRes;
    }

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid Regular Expression syntax';
      const res = onFailure(msg, 'INVALID_REGEX');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const matches: RegexMatch[] = [];

    if (flags.includes('g')) {
      let match: RegExpExecArray | null;
      let lastIndex = -1;

      // Safety counter against infinite loops on zero-length matches
      let loopCount = 0;
      const MAX_MATCHES = 5000;

      while ((match = regex.exec(testString)) !== null && loopCount < MAX_MATCHES) {
        loopCount++;

        const captureGroups = match.slice(1).map(g => g ?? '');
        const groups = match.groups ? { ...match.groups } : undefined;

        matches.push({
          index: match.index,
          length: match[0].length,
          match: match[0],
          groups,
          captureGroups,
        });

        // Avoid infinite loop on zero-width match
        if (regex.lastIndex === lastIndex) {
          regex.lastIndex++;
        }
        lastIndex = regex.lastIndex;

        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        matches.push({
          index: match.index,
          length: match[0].length,
          match: match[0],
          groups: match.groups ? { ...match.groups } : undefined,
          captureGroups: match.slice(1).map(g => g ?? ''),
        });
      }
    }

    let substituted: string | undefined = undefined;
    if (replacement !== undefined) {
      try {
        substituted = testString.replace(regex, replacement);
      } catch {
        substituted = undefined;
      }
    }

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const output: RegexToolOutput = {
      pattern,
      flags,
      isValid: true,
      matchCount: matches.length,
      matches,
      substituted,
    };

    const successRes = onSuccess(output, durationMs);
    handlers?.onSuccess?.(output);
    return successRes;
  },
};
