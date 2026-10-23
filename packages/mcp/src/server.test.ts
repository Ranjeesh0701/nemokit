import { describe, it, expect } from 'vitest';
import { createNemokitMcpServer } from './server.js';

describe('Nemokit MCP Server', () => {
  it('registers all 26 Nemokit developer tools', () => {
    const server = createNemokitMcpServer();
    // @ts-expect-error accessing internal registry for assertions
    const tools = server._registeredTools;

    expect(Object.keys(tools).length).toBe(26);

    const expectedTools = [
      'nemokit_format_json',
      'nemokit_validate_json_schema',
      'nemokit_generate_mock_json',
      'nemokit_infer_json_schema',
      'nemokit_format_sql',
      'nemokit_diff_texts',
      'nemokit_base64',
      'nemokit_parse_url',
      'nemokit_hash',
      'nemokit_generate_uuid',
      'nemokit_decode_jwt',
      'nemokit_convert_timestamp',
      'nemokit_generate_password',
      'nemokit_convert_color',
      'nemokit_check_wcag_contrast',
      'nemokit_explain_cron',
      'nemokit_test_regex',
      'nemokit_convert_curl',
      'nemokit_convert_data',
      'nemokit_calculate_chmod',
      'nemokit_http_reference',
      'nemokit_optimize_svg',
      'nemokit_generate_logo_svg',
      'nemokit_generate_pattern_svg',
      'nemokit_generate_random_svg',
      'nemokit_generate_qr_code',
    ];

    for (const toolName of expectedTools) {
      expect(tools[toolName]).toBeDefined();
    }
  });

  it('executes JSON formatter tool successfully', async () => {
    const server = createNemokitMcpServer();
    // @ts-expect-error accessing internal registry
    const tool = server._registeredTools['nemokit_format_json'];

    const res = await tool.handler({ raw: '{"name":"nemokit","active":true}', indent: 2 });
    expect(res.content[0].type).toBe('text');
    expect(res.content[0].text).toContain('{\n  "name": "nemokit",\n  "active": true\n}');
  });

  it('executes JSON schema validation tool', async () => {
    const server = createNemokitMcpServer();
    // @ts-expect-error accessing internal registry
    const tool = server._registeredTools['nemokit_validate_json_schema'];

    const res = await tool.handler({
      schema: JSON.stringify({
        type: 'object',
        properties: { count: { type: 'number' } },
        required: ['count'],
      }),
      data: JSON.stringify({ count: 42 }),
    });

    expect(res.content[0].type).toBe('text');
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.valid).toBe(true);
  });

  it('executes SVG optimizer tool and returns statistics and cleaned SVG', async () => {
    const server = createNemokitMcpServer();
    // @ts-expect-error accessing internal registry
    const tool = server._registeredTools['nemokit_optimize_svg'];

    const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <!-- comment to remove -->
      <path d="M 0 0 L 10 10" />
    </svg>`;

    const res = await tool.handler({
      svg: rawSvg,
      removeComments: true,
      precision: 2,
    });

    expect(res.content[0].type).toBe('text');
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.optimizedSvg).not.toContain('comment to remove');
    expect(parsed.stats.savedBytes).toBeGreaterThan(0);
    expect(parsed.reactJsx).toContain('export function SvgIcon');
  });

  it('executes SVG logo builder tool', async () => {
    const server = createNemokitMcpServer();
    // @ts-expect-error accessing internal registry
    const tool = server._registeredTools['nemokit_generate_logo_svg'];

    const res = await tool.handler({
      shape: 'shield',
      iconId: 'sparkles',
      bgColor1: '#6366f1',
      bgColor2: '#ec4899',
      wordmark: 'Brand',
      size: 512,
    });

    expect(res.content[0].type).toBe('text');
    expect(res.content[0].text).toContain('<svg');
    expect(res.content[0].text).toContain('BRAND');
  });

  it('executes SVG pattern generator tool', async () => {
    const server = createNemokitMcpServer();
    // @ts-expect-error accessing internal registry
    const tool = server._registeredTools['nemokit_generate_pattern_svg'];

    const res = await tool.handler({
      pattern: 'isometric-cubes',
      foreground: '#6366f1',
      background: '#0f172a',
      scale: 32,
      strokeWidth: 1,
      opacity: 0.8,
    });

    expect(res.content[0].type).toBe('text');
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.svg).toContain('<svg');
    expect(parsed.cssRule).toContain('background-image');
  });

  it('executes random generative SVG tool', async () => {
    const server = createNemokitMcpServer();
    // @ts-expect-error accessing internal registry
    const tool = server._registeredTools['nemokit_generate_random_svg'];

    const res = await tool.handler({
      type: 'blob',
      seed: 42,
      color1: '#6366f1',
      color2: '#06b6d4',
      background: '#0f172a',
      complexity: 6,
    });

    expect(res.content[0].type).toBe('text');
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.svg).toContain('<svg');
    expect(parsed.svg).toContain('viewBox="0 0 500 500"');
    expect(parsed.reactJsx).toContain('GeneratedGraphic');
  });

  it('handles invalid inputs gracefully with error flag', async () => {
    const server = createNemokitMcpServer();
    // @ts-expect-error accessing internal registry
    const tool = server._registeredTools['nemokit_format_json'];

    const res = await tool.handler({ raw: 'invalid json {' });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toBeDefined();
  });
});
