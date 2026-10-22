import { describe, it, expect } from 'vitest';
import {
  svgOptimizerTool,
  jsonSchemaTool,
  logoBuilderTool,
  colorTool,
  evaluateWcagContrast,
  generateGradientCss,
} from './index.js';

describe('svgOptimizerTool', () => {
  it('strips XML declarations, comments, and empty groups', () => {
    const rawSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Sample comment -->
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <g></g>
  <path d="M 10.1234 20.9876 L 30.5555 40.1111" />
</svg>`;

    const res = svgOptimizerTool.execute({
      svg: rawSvg,
      precision: 1,
      removeComments: true,
      removeEmptyContainers: true,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.data.optimized).not.toContain('<?xml');
    expect(res.data.optimized).not.toContain('Sample comment');
    expect(res.data.optimized).not.toContain('<g></g>');
    expect(res.data.stats.savedBytes).toBeGreaterThan(0);
    expect(res.data.reactJsx).toContain('export function SvgIcon');
  });

  it('fails gracefully on invalid input', () => {
    const res = svgOptimizerTool.execute({ svg: 'not an svg' });
    expect(res.success).toBe(false);
  });
});

describe('jsonSchemaTool', () => {
  const userSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'email', 'age'],
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'integer', minimum: 18 },
      role: { type: 'string', enum: ['admin', 'user'] },
    },
  };

  it('validates conforming payloads successfully', () => {
    const validData = {
      id: 'usr_123',
      email: 'jane@example.com',
      age: 25,
      role: 'admin',
    };

    const res = jsonSchemaTool.execute({
      action: 'validate',
      schema: userSchema,
      data: validData,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.validation?.valid).toBe(true);
    expect(res.data.validation?.errors).toHaveLength(0);
  });

  it('detects missing required fields and constraint violations', () => {
    const invalidData = {
      id: 'usr_123',
      age: 12, // under 18
      role: 'superadmin', // invalid enum
    };

    const res = jsonSchemaTool.execute({
      action: 'validate',
      schema: userSchema,
      data: invalidData,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.validation?.valid).toBe(false);
    expect(res.data.validation?.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('generates synthetic mock fixtures from schema', () => {
    const res = jsonSchemaTool.execute({
      action: 'mock',
      schema: userSchema,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    const mock = res.data.mockData as Record<string, unknown>;
    expect(mock).toBeDefined();
    expect(typeof mock.id).toBe('string');
    expect(mock.email).toBe('user@example.com');
  });

  it('infers schema from sample data', () => {
    const sample = {
      name: 'Nemokit',
      stars: 100,
      active: true,
      tags: ['tools', 'developer'],
    };

    const res = jsonSchemaTool.execute({
      action: 'infer',
      schema: {},
      data: sample,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    const inferred = res.data.inferredSchema as Record<string, unknown>;
    expect(inferred.type).toBe('object');
    expect(inferred.properties).toBeDefined();
  });
});

describe('logoBuilderTool', () => {
  it('generates valid vector SVG markup with gradient and shape', () => {
    const res = logoBuilderTool.execute({
      shape: 'squircle',
      backgroundType: 'gradient',
      bgColor1: '#4f46e5',
      bgColor2: '#06b6d4',
      gradientAngle: 135,
      borderWidth: 4,
      borderColor: '#ffffff',
      shadow: true,
      contentType: 'icon',
      iconId: 'zap',
      monogramText: 'NK',
      monogramFont: 'sans',
      symbolColor: '#ffffff',
      symbolScale: 0.5,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.svg).toContain('<svg');
    expect(res.data.svg).toContain('linearGradient');
    expect(res.data.svg).toContain('viewBox="0 0 512 512"');
  });

  it('renders monogram typography properly', () => {
    const res = logoBuilderTool.execute({
      shape: 'circle',
      backgroundType: 'solid',
      bgColor1: '#18181b',
      bgColor2: '#18181b',
      gradientAngle: 0,
      borderWidth: 0,
      borderColor: '#000000',
      shadow: false,
      contentType: 'monogram',
      iconId: 'zap',
      monogramText: 'PRO',
      monogramFont: 'mono',
      symbolColor: '#38bdf8',
      symbolScale: 0.6,
      wordmark: 'STUDIO',
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.svg).toContain('PRO');
    expect(res.data.svg).toContain('STUDIO');
  });
});

describe('colorTool expansions', () => {
  it('computes WCAG 2.1 compliance accurately', () => {
    const blackOnWhite = evaluateWcagContrast('#000000', '#ffffff');
    expect(blackOnWhite).toBeDefined();
    expect(blackOnWhite?.ratio).toBe(21);
    expect(blackOnWhite?.aaNormal).toBe(true);
    expect(blackOnWhite?.aaaNormal).toBe(true);
    expect(blackOnWhite?.scoreLabel).toBe('Superb');

    const lowContrast = evaluateWcagContrast('#888888', '#999999');
    expect(lowContrast?.aaNormal).toBe(false);
  });

  it('generates gradient CSS and Tailwind arbitrary values', () => {
    const grad = generateGradientCss({
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#ff0000', position: 0 },
        { color: '#0000ff', position: 100 },
      ],
    });

    expect(grad.css).toContain('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
    expect(grad.tailwindArbitrary).toContain('bg-[linear-gradient');
  });

  it('calculates complementary and harmony palettes in tool execution', async () => {
    const res = await colorTool.execute({ color: '#4f46e5' });
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.harmonies).toBeDefined();
    expect(res.data.harmonies?.complementary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(res.data.harmonies?.analogous).toHaveLength(2);
    expect(res.data.harmonies?.triadic).toHaveLength(2);
  });
});
