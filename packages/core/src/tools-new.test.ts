import { describe, it, expect } from 'vitest';
import {
  svgOptimizerTool,
  jsonSchemaTool,
  logoBuilderTool,
  patternGeneratorTool,
  randomSvgTool,
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

  it('supports expanded shape catalog including starburst and curved shield', () => {
    const starburstRes = logoBuilderTool.execute({
      shape: 'starburst',
      backgroundType: 'gradient',
      bgColor1: '#ea580c',
      bgColor2: '#f59e0b',
      gradientAngle: 45,
      borderWidth: 2,
      borderColor: '#ffffff',
      shadow: true,
      contentType: 'icon',
      iconId: 'star',
      monogramText: '',
      monogramFont: 'sans',
      symbolColor: '#ffffff',
      symbolScale: 0.5,
    });
    expect(starburstRes.success).toBe(true);
    if (starburstRes.success) {
      expect(starburstRes.data.svg).toContain('polygon');
    }

    const curvedShieldRes = logoBuilderTool.execute({
      shape: 'shield-curved',
      backgroundType: 'solid',
      bgColor1: '#059669',
      bgColor2: '#059669',
      gradientAngle: 0,
      borderWidth: 4,
      borderColor: '#ffffff',
      shadow: false,
      contentType: 'icon',
      iconId: 'shield',
      monogramText: '',
      monogramFont: 'sans',
      symbolColor: '#ffffff',
      symbolScale: 0.5,
    });
    expect(curvedShieldRes.success).toBe(true);
    if (curvedShieldRes.success) {
      expect(curvedShieldRes.data.svg).toContain('path');
    }
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

describe('patternGeneratorTool', () => {
  it('generates repeating SVG patterns and CSS rules', () => {
    const res = patternGeneratorTool.execute({
      patternType: 'grid',
      foreground: '#0284c7',
      background: '#0f172a',
      spacing: 32,
      strokeWidth: 1,
      opacity: 0.5,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.svg).toContain('<svg');
    expect(res.data.svg).toContain('line');
    expect(res.data.cssRule).toContain('background-image: url("data:image/svg+xml');
    expect(res.data.cssRule).toContain('background-repeat: repeat');
  });

  it('supports transparent background and dots pattern', () => {
    const res = patternGeneratorTool.execute({
      patternType: 'dots',
      foreground: '#a855f7',
      background: 'transparent',
      spacing: 20,
      strokeWidth: 2,
      opacity: 0.8,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.svg).toContain('<circle');
    expect(res.data.svg).not.toContain('<rect');
  });
});

describe('randomSvgTool', () => {
  it('generates organic blob SVGs with cubic bezier curves and React JSX', () => {
    const res = randomSvgTool.execute({
      type: 'blob',
      complexity: 6,
      color1: '#06b6d4',
      color2: '#a855f7',
      background: '#09090b',
      isTransparent: false,
      seed: 42,
    });

    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.svg).toContain('<svg');
    expect(res.data.svg).toContain('<path');
    expect(res.data.reactJsx).toContain('export function GeneratedGraphic');
    expect(res.data.cssDataUrl).toContain('data:image/svg+xml');
  });

  it('generates symmetrical pixel identicons and circuit node maps', () => {
    const identiconRes = randomSvgTool.execute({
      type: 'identicon',
      complexity: 5,
      color1: '#f43f5e',
      color2: '#fb923c',
      background: '#ffffff',
      isTransparent: false,
      seed: 99,
    });
    expect(identiconRes.success).toBe(true);
    if (identiconRes.success) {
      expect(identiconRes.data.svg).toContain('<rect');
    }

    const circuitsRes = randomSvgTool.execute({
      type: 'circuits',
      complexity: 8,
      color1: '#10b981',
      color2: '#34d399',
      background: 'transparent',
      isTransparent: true,
      seed: 77,
    });
    expect(circuitsRes.success).toBe(true);
    if (circuitsRes.success) {
      expect(circuitsRes.data.svg).toContain('<path');
      expect(circuitsRes.data.svg).toContain('<circle');
    }
  });
});
