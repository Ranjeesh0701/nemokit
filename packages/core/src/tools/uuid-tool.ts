import type { Tool, ToolExecutionResult } from '../types.js';
import { failureResult, successResult } from '../types.js';

export interface UuidToolInput {
  readonly count?: number;
  readonly uppercase?: boolean;
  readonly removeHyphens?: boolean;
}

export interface UuidToolOutput {
  readonly uuids: ReadonlyArray<string>;
  readonly count: number;
}

function generateV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const uuidTool: Tool<UuidToolInput, UuidToolOutput> = {
  id: 'uuid-tool',
  name: 'UUID / GUID Generator',
  description:
    'Generates RFC 4122 compliant version 4 UUIDs in bulk with customizable casing and formatting.',
  category: 'crypto',

  execute(input: UuidToolInput): ToolExecutionResult<UuidToolOutput> {
    const startTime = performance.now();
    const count = Math.min(Math.max(input.count ?? 1, 1), 100);

    try {
      const uuids: string[] = [];
      for (let i = 0; i < count; i++) {
        let id = generateV4();
        if (input.removeHyphens) {
          id = id.replace(/-/g, '');
        }
        if (input.uppercase) {
          id = id.toUpperCase();
        }
        uuids.push(id);
      }

      return successResult(
        {
          uuids,
          count: uuids.length,
        },
        performance.now() - startTime
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'UUID generation failed.';
      return failureResult(message, 'UUID_GENERATION_ERROR');
    }
  },
};
