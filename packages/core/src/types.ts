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
export type ToolCategory = 'formatters' | 'converters' | 'crypto' | 'web' | 'pdf' | 'images';

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
 * Handlers for consuming tool execution results pattern-style.
 */
export interface ResultHandlers<TOutput, R = void> {
  readonly onSuccess: (data: TOutput, durationMs?: number) => R;
  readonly onFailure: (error: ToolExecutionError) => R;
}

/**
 * Minimum contract for any Nemokit tool.
 * Individual tools define their own input and output types.
 */
export interface Tool<TInput = unknown, TOutput = unknown> extends ToolMetadata {
  execute(
    input: TInput,
    handlers?: Partial<ResultHandlers<TOutput, void>>
  ): MaybePromise<ToolExecutionResult<TOutput>>;
}

/**
 * Constructs a typed success result with optional execution duration.
 */
export function onSuccess<TOutput>(
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
 * Constructs a typed failure result with structured error details.
 */
export function onFailure(message: string, code?: string, details?: unknown): ToolExecutionFailure {
  return {
    success: false,
    error: {
      message,
      ...(code !== undefined && { code }),
      ...(details !== undefined && { details }),
    },
  };
}

/**
 * Handles a ToolExecutionResult using pattern-matching handlers.
 */
export function handleResult<TOutput, R = void>(
  result: ToolExecutionResult<TOutput>,
  handlers: ResultHandlers<TOutput, R>
): R {
  if (result.success) {
    return handlers.onSuccess(result.data, result.durationMs);
  }
  return handlers.onFailure(result.error);
}

// Backward-compatible aliases
export const successResult = onSuccess;
export const failureResult = onFailure;
