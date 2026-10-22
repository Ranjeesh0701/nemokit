/**
 * Represents a structured execution error produced by a tool.
 */
export interface ToolExecutionError {
  readonly message: string;
  readonly code?: string;
  readonly details?: unknown;
}

/**
 * Represents a successful tool execution with its output payload.
 */
export interface ToolExecutionSuccess<TOutput> {
  readonly success: true;
  readonly data: TOutput;
  readonly durationMs?: number;
}

/**
 * Represents a failed tool execution with structured error details.
 */
export interface ToolExecutionFailure {
  readonly success: false;
  readonly error: ToolExecutionError;
}

/**
 * Discriminated union of all possible tool execution outcomes.
 */
export type ToolExecutionResult<TOutput> = ToolExecutionSuccess<TOutput> | ToolExecutionFailure;

/**
 * Utility type allowing synchronous or asynchronous execution returns.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Standard functional categories for organizing tools.
 */
export type ToolCategory = 'formatters' | 'converters' | 'crypto' | 'web';

/**
 * Basic metadata describing a tool for identification and discovery.
 */
export interface ToolMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
}

/**
 * Minimum contract for any Nemokit tool.
 * Individual tools define their own input and output types.
 */
export interface Tool<TInput = unknown, TOutput = unknown> extends ToolMetadata {
  execute(input: TInput): MaybePromise<ToolExecutionResult<TOutput>>;
}

/**
 * Helper to construct a typed success result with optional execution duration.
 */
export function successResult<TOutput>(
  data: TOutput,
  durationMs?: number
): ToolExecutionSuccess<TOutput> {
  return {
    success: true,
    data,
    ...(durationMs !== undefined && { durationMs }),
  };
}

/**
 * Helper to construct a typed failure result.
 */
export function failureResult(
  message: string,
  code?: string,
  details?: unknown
): ToolExecutionFailure {
  return {
    success: false,
    error: {
      message,
      ...(code !== undefined && { code }),
      ...(details !== undefined && { details }),
    },
  };
}
