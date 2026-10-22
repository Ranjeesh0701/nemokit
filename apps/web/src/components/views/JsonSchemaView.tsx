import { useState, useMemo } from 'react';
import { jsonSchemaTool } from '@nemokit/core';
import type { JsonSchemaValidationError } from '@nemokit/core';
import {
  FileCheck2,
  Copy,
  Check,
  Download,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Database,
  Code2,
  Wand2,
} from 'lucide-react';

const PRESET_SCHEMAS = [
  {
    name: 'User Account',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'User',
      type: 'object',
      required: ['id', 'username', 'email', 'isActive'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        username: { type: 'string', minLength: 3, maxLength: 20 },
        email: { type: 'string', format: 'email' },
        age: { type: 'integer', minimum: 18, maximum: 120 },
        role: { type: 'string', enum: ['admin', 'member', 'guest'] },
        isActive: { type: 'boolean', default: true },
        tags: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
        },
      },
    },
    sampleData: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'alex_dev',
      email: 'alex@example.com',
      age: 28,
      role: 'admin',
      isActive: true,
      tags: ['typescript', 'react', 'tailwind'],
    },
  },
  {
    name: 'Product Item',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Product',
      type: 'object',
      required: ['sku', 'name', 'price', 'inStock'],
      properties: {
        sku: { type: 'string', minLength: 5 },
        name: { type: 'string' },
        price: { type: 'number', minimum: 0.99 },
        currency: { type: 'string', enum: ['USD', 'EUR', 'GBP'] },
        inStock: { type: 'boolean' },
        categories: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    sampleData: {
      sku: 'PRD-98124',
      name: 'Wireless Ergonomic Keyboard',
      price: 129.99,
      currency: 'USD',
      inStock: true,
      categories: ['Hardware', 'Peripherals'],
    },
  },
];

export function JsonSchemaView() {
  const [activeMode, setActiveMode] = useState<'validate' | 'mock' | 'infer'>('validate');
  const [schemaText, setSchemaText] = useState<string>(
    JSON.stringify(PRESET_SCHEMAS[0]?.schema ?? {}, null, 2)
  );
  const [dataText, setDataText] = useState<string>(
    JSON.stringify(PRESET_SCHEMAS[0]?.sampleData ?? {}, null, 2)
  );
  const [mockOutput, setMockOutput] = useState<string>('');
  const [inferredOutput, setInferredOutput] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadJson = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Live validation
  const validationResult: {
    valid: boolean;
    errors: ReadonlyArray<JsonSchemaValidationError>;
    parseError?: string;
  } = useMemo(() => {
    if (activeMode !== 'validate') return { valid: false, errors: [] };
    if (!schemaText.trim()) {
      return { valid: false, errors: [], parseError: 'Schema is empty' };
    }
    if (!dataText.trim()) {
      return { valid: false, errors: [], parseError: 'JSON payload is empty' };
    }

    try {
      const res = jsonSchemaTool.execute({
        action: 'validate',
        schema: schemaText,
        data: dataText,
      });

      if (res.success && res.data.validation) {
        return {
          valid: res.data.validation.valid,
          errors: res.data.validation.errors,
        };
      } else {
        return {
          valid: false,
          errors: [],
          parseError: res.success ? undefined : res.error.message,
        };
      }
    } catch (err) {
      return {
        valid: false,
        errors: [],
        parseError: err instanceof Error ? err.message : 'Invalid JSON input',
      };
    }
  }, [schemaText, dataText, activeMode]);

  const handleGenerateMock = () => {
    try {
      const res = jsonSchemaTool.execute({
        action: 'mock',
        schema: schemaText,
        mockOptions: { arrayLength: 3, useDefaults: true },
      });
      if (res.success && res.data.mockData !== undefined) {
        setMockOutput(JSON.stringify(res.data.mockData, null, 2));
      }
    } catch {
      // ignore
    }
  };

  const handleInferSchema = () => {
    try {
      const res = jsonSchemaTool.execute({
        action: 'infer',
        schema: {},
        data: dataText,
      });
      if (res.success && res.data.inferredSchema) {
        setInferredOutput(JSON.stringify(res.data.inferredSchema, null, 2));
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <FileCheck2 className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              JSON Schema Validator & Mock Studio
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Validate JSON objects against JSON Schema Draft-07, generate synthetic mock fixtures,
            and reverse-engineer schemas.
          </p>
        </div>

        {/* Preset schema chips */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SCHEMAS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setSchemaText(JSON.stringify(p.schema, null, 2));
                setDataText(JSON.stringify(p.sampleData, null, 2));
              }}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveMode('validate')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'validate'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
            Validate Schema
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('mock');
              if (!mockOutput) handleGenerateMock();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'mock'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wand2 className="h-3.5 w-3.5 text-amber-600" />
            Generate Mock Data
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('infer');
              if (!inferredOutput) handleInferSchema();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'infer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            Infer Schema from JSON
          </button>
        </div>

        {/* Validation Status Indicator */}
        {activeMode === 'validate' && (
          <div>
            {validationResult.parseError ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 border border-amber-200">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                {validationResult.parseError}
              </span>
            ) : validationResult.valid ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Valid: Payload conforms to schema
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 border border-rose-200">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                {validationResult.errors.length} Schema Violation
                {validationResult.errors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mode 1: Validation Screen */}
      {activeMode === 'validate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[460px]">
          {/* Left: JSON Schema */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5" />
                JSON Schema (Draft-07)
              </label>
              <button
                type="button"
                onClick={() => handleCopy(schemaText, 'schema')}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'schema' ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                Copy Schema
              </button>
            </div>
            <textarea
              value={schemaText}
              onChange={e => setSchemaText(e.target.value)}
              placeholder="Paste JSON Schema here..."
              className="flex-1 w-full rounded-xl border border-stone-200 bg-white p-4 font-mono text-xs text-stone-800 shadow-xs focus:border-stone-900 focus:outline-hidden resize-none min-h-[300px]"
              spellCheck={false}
            />
          </div>

          {/* Right: Data Payload & Errors */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" />
                JSON Data Payload
              </label>
              <button
                type="button"
                onClick={() => handleCopy(dataText, 'data')}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'data' ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                Copy JSON
              </button>
            </div>
            <textarea
              value={dataText}
              onChange={e => setDataText(e.target.value)}
              placeholder="Paste sample JSON payload to validate..."
              className="flex-1 w-full rounded-xl border border-stone-200 bg-white p-4 font-mono text-xs text-stone-800 shadow-xs focus:border-stone-900 focus:outline-hidden resize-none min-h-[220px]"
              spellCheck={false}
            />

            {/* Validation Errors List */}
            {validationResult.errors.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                  Validation Failures ({validationResult.errors.length})
                </div>
                <div className="space-y-1.5">
                  {validationResult.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs font-mono bg-white/80 p-2 rounded-lg border border-rose-100"
                    >
                      <span className="font-semibold text-rose-700 shrink-0">{err.path}:</span>
                      <span className="text-stone-700">{err.message}</span>
                      <span className="ml-auto text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-sans shrink-0">
                        {err.keyword}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Mock Data Generator */}
      {activeMode === 'mock' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[460px]">
          {/* Left: Schema Source */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Source JSON Schema
              </label>
              <button
                type="button"
                onClick={handleGenerateMock}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
              >
                <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                Regenerate Fixture
              </button>
            </div>
            <textarea
              value={schemaText}
              onChange={e => setSchemaText(e.target.value)}
              className="flex-1 w-full rounded-xl border border-stone-200 bg-white p-4 font-mono text-xs text-stone-800 shadow-xs focus:border-stone-900 focus:outline-hidden resize-none min-h-[300px]"
              spellCheck={false}
            />
          </div>

          {/* Right: Generated Mock Fixture */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Generated Mock Fixture
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(mockOutput, 'mock')}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
                >
                  {copiedKey === 'mock' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-stone-500" />
                  )}
                  Copy JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadJson(mockOutput, 'mock-fixture.json')}
                  className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={mockOutput}
              placeholder="Click 'Regenerate Fixture' to create synthetic mock JSON..."
              className="flex-1 w-full rounded-xl border border-stone-200 bg-stone-50/70 p-4 font-mono text-xs text-stone-800 shadow-xs focus:outline-hidden resize-none min-h-[300px]"
            />
          </div>
        </div>
      )}

      {/* Mode 3: Infer Schema from JSON */}
      {activeMode === 'infer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[460px]">
          {/* Left: Raw JSON Sample */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Sample JSON Data
              </label>
              <button
                type="button"
                onClick={handleInferSchema}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Infer Schema
              </button>
            </div>
            <textarea
              value={dataText}
              onChange={e => setDataText(e.target.value)}
              placeholder="Paste any sample JSON object or array..."
              className="flex-1 w-full rounded-xl border border-stone-200 bg-white p-4 font-mono text-xs text-stone-800 shadow-xs focus:border-stone-900 focus:outline-hidden resize-none min-h-[300px]"
              spellCheck={false}
            />
          </div>

          {/* Right: Inferred Schema */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Generated JSON Schema Draft-07
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(inferredOutput, 'infer')}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
                >
                  {copiedKey === 'infer' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-stone-500" />
                  )}
                  Copy Schema
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadJson(inferredOutput, 'inferred-schema.json')}
                  className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={inferredOutput}
              placeholder="Click 'Infer Schema' to produce schema specifications..."
              className="flex-1 w-full rounded-xl border border-stone-200 bg-stone-50/70 p-4 font-mono text-xs text-stone-800 shadow-xs focus:outline-hidden resize-none min-h-[300px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
