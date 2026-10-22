import type { Tool, ResultHandlers, ToolExecutionResult } from '../types.js';
import { onSuccess, onFailure } from '../types.js';

export interface JsonSchemaValidationError {
  readonly path: string;
  readonly message: string;
  readonly keyword: string;
}

export interface JsonSchemaValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<JsonSchemaValidationError>;
}

export interface JsonSchemaInput {
  readonly schema: Record<string, unknown> | string;
  readonly data?: unknown;
  readonly action: 'validate' | 'mock' | 'infer';
  readonly mockOptions?: {
    readonly arrayLength?: number;
    readonly useDefaults?: boolean;
  };
}

export interface JsonSchemaOutput {
  readonly action: 'validate' | 'mock' | 'infer';
  readonly validation?: JsonSchemaValidationResult;
  readonly mockData?: unknown;
  readonly inferredSchema?: Record<string, unknown>;
}

/**
 * Validates a value against a basic JSON Schema specification (Draft-07 subset)
 */
export function validateJsonSchema(
  schema: Record<string, unknown>,
  data: unknown,
  currentPath = '$'
): JsonSchemaValidationError[] {
  const errors: JsonSchemaValidationError[] = [];

  // 1. Type validation
  if (schema.type) {
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actualType = getJsonType(data);

    const matchesType = expectedTypes.some(t => {
      if (t === 'integer') return typeof data === 'number' && Number.isInteger(data);
      if (t === 'number') return typeof data === 'number';
      return t === actualType;
    });

    if (!matchesType) {
      errors.push({
        path: currentPath,
        message: `Expected type ${expectedTypes.join(' | ')}, but received ${actualType}`,
        keyword: 'type',
      });
      return errors; // Early exit if type doesn't match
    }
  }

  // 2. Enum validation
  if (Array.isArray(schema.enum)) {
    const matchesEnum = schema.enum.some(val => JSON.stringify(val) === JSON.stringify(data));
    if (!matchesEnum) {
      errors.push({
        path: currentPath,
        message: `Value must be one of: [${schema.enum.map(e => JSON.stringify(e)).join(', ')}]`,
        keyword: 'enum',
      });
    }
  }

  // 3. String validation
  if (typeof data === 'string') {
    if (typeof schema.minLength === 'number' && data.length < schema.minLength) {
      errors.push({
        path: currentPath,
        message: `String length ${data.length} is less than minLength ${schema.minLength}`,
        keyword: 'minLength',
      });
    }
    if (typeof schema.maxLength === 'number' && data.length > schema.maxLength) {
      errors.push({
        path: currentPath,
        message: `String length ${data.length} exceeds maxLength ${schema.maxLength}`,
        keyword: 'maxLength',
      });
    }
    if (typeof schema.pattern === 'string') {
      try {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(data)) {
          errors.push({
            path: currentPath,
            message: `String does not match pattern: ${schema.pattern}`,
            keyword: 'pattern',
          });
        }
      } catch {
        // Invalid regex pattern in schema
      }
    }
  }

  // 4. Number validation
  if (typeof data === 'number') {
    if (typeof schema.minimum === 'number' && data < schema.minimum) {
      errors.push({
        path: currentPath,
        message: `Value ${data} is less than minimum ${schema.minimum}`,
        keyword: 'minimum',
      });
    }
    if (typeof schema.maximum === 'number' && data > schema.maximum) {
      errors.push({
        path: currentPath,
        message: `Value ${data} exceeds maximum ${schema.maximum}`,
        keyword: 'maximum',
      });
    }
    if (typeof schema.multipleOf === 'number' && schema.multipleOf > 0) {
      if (data % schema.multipleOf !== 0) {
        errors.push({
          path: currentPath,
          message: `Value ${data} is not a multiple of ${schema.multipleOf}`,
          keyword: 'multipleOf',
        });
      }
    }
  }

  // 5. Array validation
  if (Array.isArray(data)) {
    if (typeof schema.minItems === 'number' && data.length < schema.minItems) {
      errors.push({
        path: currentPath,
        message: `Array has ${data.length} items, minimum is ${schema.minItems}`,
        keyword: 'minItems',
      });
    }
    if (typeof schema.maxItems === 'number' && data.length > schema.maxItems) {
      errors.push({
        path: currentPath,
        message: `Array has ${data.length} items, maximum is ${schema.maxItems}`,
        keyword: 'maxItems',
      });
    }
    if (schema.items && typeof schema.items === 'object') {
      data.forEach((item, index) => {
        const itemErrors = validateJsonSchema(
          schema.items as Record<string, unknown>,
          item,
          `${currentPath}[${index}]`
        );
        errors.push(...itemErrors);
      });
    }
  }

  // 6. Object validation
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    const dataObj = data as Record<string, unknown>;

    // Required fields
    if (Array.isArray(schema.required)) {
      for (const reqKey of schema.required) {
        if (typeof reqKey === 'string' && !(reqKey in dataObj)) {
          errors.push({
            path: `${currentPath}.${reqKey}`,
            message: `Missing required property: "${reqKey}"`,
            keyword: 'required',
          });
        }
      }
    }

    // Properties validation
    if (schema.properties && typeof schema.properties === 'object') {
      const props = schema.properties as Record<string, Record<string, unknown>>;
      for (const [propKey, propSchema] of Object.entries(props)) {
        if (propKey in dataObj && propSchema && typeof propSchema === 'object') {
          const propErrors = validateJsonSchema(
            propSchema,
            dataObj[propKey],
            `${currentPath}.${propKey}`
          );
          errors.push(...propErrors);
        }
      }
    }

    // Additional properties restriction
    if (schema.additionalProperties === false && schema.properties) {
      const allowedKeys = new Set(Object.keys(schema.properties as object));
      for (const key of Object.keys(dataObj)) {
        if (!allowedKeys.has(key)) {
          errors.push({
            path: `${currentPath}.${key}`,
            message: `Additional property "${key}" is not permitted by schema`,
            keyword: 'additionalProperties',
          });
        }
      }
    }
  }

  return errors;
}

function getJsonType(val: unknown): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
}

/**
 * Recursively creates realistic mock fixture data from a JSON Schema
 */
export function generateMockFromJsonSchema(
  schema: Record<string, unknown>,
  options: { arrayLength?: number; useDefaults?: boolean } = {}
): unknown {
  const { arrayLength = 2, useDefaults = true } = options;

  if (useDefaults && schema.default !== undefined) {
    return schema.default;
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  const type = schema.type;

  switch (type) {
    case 'string': {
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'date') return new Date().toISOString().split('T')[0];
      if (schema.format === 'uri') return 'https://example.com/api/v1';
      if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
      if (schema.description) return `Sample ${schema.description}`;
      return 'sample_string';
    }
    case 'number': {
      const min = typeof schema.minimum === 'number' ? schema.minimum : 10;
      const max = typeof schema.maximum === 'number' ? schema.maximum : 100;
      return Math.round(((min + max) / 2) * 100) / 100;
    }
    case 'integer': {
      const min = typeof schema.minimum === 'number' ? schema.minimum : 1;
      const max = typeof schema.maximum === 'number' ? schema.maximum : 100;
      return Math.floor((min + max) / 2);
    }
    case 'boolean': {
      return true;
    }
    case 'null': {
      return null;
    }
    case 'array': {
      const itemsSchema = (schema.items as Record<string, unknown>) || { type: 'string' };
      const len =
        typeof schema.minItems === 'number' ? Math.max(schema.minItems, arrayLength) : arrayLength;
      return Array.from({ length: len }, () => generateMockFromJsonSchema(itemsSchema, options));
    }
    case 'object':
    default: {
      if (schema.properties && typeof schema.properties === 'object') {
        const result: Record<string, unknown> = {};
        const props = schema.properties as Record<string, Record<string, unknown>>;
        for (const [key, propSchema] of Object.entries(props)) {
          result[key] = generateMockFromJsonSchema(propSchema, options);
        }
        return result;
      }
      return {};
    }
  }
}

/**
 * Infers a clean JSON Schema (Draft-07) from an arbitrary JSON value
 */
export function inferJsonSchema(value: unknown): Record<string, unknown> {
  if (value === null) {
    return { type: 'null' };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return {
        type: 'array',
        items: { type: 'string' },
      };
    }
    return {
      type: 'array',
      items: inferJsonSchema(value[0]),
    };
  }

  if (typeof value === 'object') {
    const props: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      props[k] = inferJsonSchema(v);
      required.push(k);
    }

    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: props,
      required,
    };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return { type: 'string', format: 'date-time' };
    }
    if (/^https?:\/\//.test(value)) {
      return { type: 'string', format: 'uri' };
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { type: 'string', format: 'email' };
    }
    return { type: 'string' };
  }

  return { type: 'string' };
}

export class JsonSchemaTool implements Tool<JsonSchemaInput, JsonSchemaOutput> {
  public readonly id = 'json-schema';
  public readonly name = 'JSON Schema Validator & Mock Generator';
  public readonly description =
    'Validate JSON payloads against JSON Schemas, generate realistic mock fixtures, and infer schemas from data.';
  public readonly category = 'formatters';

  public execute(
    input: JsonSchemaInput,
    handlers?: Partial<ResultHandlers<JsonSchemaOutput, void>>
  ): ToolExecutionResult<JsonSchemaOutput> {
    const startTime = performance.now();
    try {
      let schemaObj: Record<string, unknown>;
      if (typeof input.schema === 'string') {
        if (!input.schema.trim() && input.action !== 'infer') {
          const res = onFailure('Empty schema provided.');
          handlers?.onFailure?.(res.error);
          return res;
        }
        schemaObj = input.schema.trim() ? JSON.parse(input.schema) : {};
      } else {
        schemaObj = input.schema || {};
      }

      const durationMs = () => Math.round((performance.now() - startTime) * 100) / 100;

      if (input.action === 'validate') {
        let payload = input.data;
        if (typeof payload === 'string') {
          payload = JSON.parse(payload);
        }
        const errors = validateJsonSchema(schemaObj, payload);
        const data: JsonSchemaOutput = {
          action: 'validate',
          validation: {
            valid: errors.length === 0,
            errors,
          },
        };
        const res = onSuccess(data, durationMs());
        handlers?.onSuccess?.(data, res.durationMs);
        return res;
      }

      if (input.action === 'mock') {
        const mockData = generateMockFromJsonSchema(schemaObj, input.mockOptions);
        const data: JsonSchemaOutput = {
          action: 'mock',
          mockData,
        };
        const res = onSuccess(data, durationMs());
        handlers?.onSuccess?.(data, res.durationMs);
        return res;
      }

      if (input.action === 'infer') {
        let payload = input.data;
        if (typeof payload === 'string') {
          payload = JSON.parse(payload);
        }
        const inferredSchema = inferJsonSchema(payload);
        const data: JsonSchemaOutput = {
          action: 'infer',
          inferredSchema,
        };
        const res = onSuccess(data, durationMs());
        handlers?.onSuccess?.(data, res.durationMs);
        return res;
      }

      const res = onFailure(`Unknown action: ${input.action}`);
      handlers?.onFailure?.(res.error);
      return res;
    } catch (err) {
      const res = onFailure(err instanceof Error ? err.message : 'JSON Schema operation failed.');
      handlers?.onFailure?.(res.error);
      return res;
    }
  }
}

export const jsonSchemaTool = new JsonSchemaTool();
