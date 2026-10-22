import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

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

  execute(
    input: UuidToolInput,
    handlers?: Partial<ResultHandlers<UuidToolOutput, void>>
  ): ToolExecutionResult<UuidToolOutput> {
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

      const durationMs = performance.now() - startTime;
      const res = onSuccess(
        {
          uuids,
          count: uuids.length,
        },
        durationMs
      );
      handlers?.onSuccess?.(res.data, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'UUID generation failed.';
      const res = onFailure(message, 'UUID_GENERATION_ERROR');
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
