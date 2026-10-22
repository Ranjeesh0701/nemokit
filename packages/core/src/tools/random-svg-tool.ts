import type { Tool, ResultHandlers, ToolExecutionResult } from '../types.js';
import { onSuccess, onFailure } from '../types.js';

export type RandomSvgType = 'blob' | 'waves' | 'identicon' | 'constellation' | 'circuits';

export interface RandomSvgInput {
  readonly type: RandomSvgType;
  readonly complexity: number; // 3 to 12
  readonly color1: string;
  readonly color2: string;
  readonly color3?: string;
  readonly background: string;
  readonly isTransparent: boolean;
  readonly seed?: number;
}

export interface RandomSvgOutput {
  readonly svg: string;
  readonly reactJsx: string;
  readonly cssDataUrl: string;
  readonly config: RandomSvgInput;
}

export const RANDOM_SVG_PALETTES: ReadonlyArray<{
  name: string;
  color1: string;
  color2: string;
  color3: string;
  bg: string;
}> = [
  {
    name: 'Cyber Neon',
    color1: '#06b6d4',
    color2: '#a855f7',
    color3: '#ec4899',
    bg: '#09090b',
  },
  {
    name: 'Sunset Flame',
    color1: '#f43f5e',
    color2: '#fb923c',
    color3: '#facc15',
    bg: '#18181b',
  },
  {
    name: 'Emerald Forest',
    color1: '#059669',
    color2: '#10b981',
    color3: '#6ee7b7',
    bg: '#064e3b',
  },
  {
    name: 'Royal Indigo',
    color1: '#4f46e5',
    color2: '#8b5cf6',
    color3: '#38bdf8',
    bg: '#0f172a',
  },
  {
    name: 'Pastel Dream',
    color1: '#f472b6',
    color2: '#c084fc',
    color3: '#60a5fa',
    bg: '#faf5ff',
  },
];

// Simple deterministic PRNG for reproducible seeds
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateRandomSvgString(input: RandomSvgInput): string {
  const {
    type = 'blob',
    complexity = 6,
    color1 = '#6366f1',
    color2 = '#ec4899',
    color3 = '#06b6d4',
    background = '#ffffff',
    isTransparent = false,
    seed = Math.floor(Math.random() * 100000),
  } = input;

  const rand = seededRandom(seed);
  const width = 500;
  const height = 500;

  const bgMarkup =
    isTransparent || !background || background === 'transparent'
      ? ''
      : `<rect width="${width}" height="${height}" fill="${background}" />`;

  const gradDef = `<defs>
    <linearGradient id="svgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
    <linearGradient id="svgGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${color2}" />
      <stop offset="100%" stop-color="${color3 || color1}" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="${color1}" flood-opacity="0.3" />
    </filter>
  </defs>`;

  let contentMarkup = '';

  switch (type) {
    case 'blob': {
      // Generate organic smooth bezier blob
      const numPoints = Math.max(4, Math.min(12, complexity));
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = 160;

      const angles: number[] = [];
      const points: Array<{ x: number; y: number }> = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI) / numPoints;
        const variance = (rand() - 0.5) * 80;
        const radius = baseRadius + variance;
        angles.push(angle);
        points.push({
          x: Math.round(centerX + radius * Math.cos(angle)),
          y: Math.round(centerY + radius * Math.sin(angle)),
        });
      }

      // Smooth closed path using cubic splines
      let pathD = `M ${points[0]?.x} ${points[0]?.y}`;
      for (let i = 0; i < numPoints; i++) {
        const p0 = points[(i - 1 + numPoints) % numPoints]!;
        const p1 = points[i]!;
        const p2 = points[(i + 1) % numPoints]!;
        const p3 = points[(i + 2) % numPoints]!;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        pathD += ` C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${p2.x} ${p2.y}`;
      }
      pathD += ' Z';

      contentMarkup = `<g filter="url(#softGlow)">
        <path d="${pathD}" fill="url(#svgGrad1)" />
      </g>`;
      break;
    }

    case 'waves': {
      // Layered waves stacked from bottom
      const waveLayers = 3;
      let waveMarkup = '';

      for (let l = 0; l < waveLayers; l++) {
        const yBase = 220 + l * 80;
        const numSegments = Math.max(3, Math.min(8, complexity));
        let pathD = `M 0,${height} L 0,${yBase}`;

        const segmentWidth = width / numSegments;
        for (let i = 0; i < numSegments; i++) {
          const xStart = i * segmentWidth;
          const xEnd = (i + 1) * segmentWidth;
          const cpY = yBase + (rand() - 0.5) * 90;
          pathD += ` Q ${(xStart + xEnd) / 2},${Math.round(cpY)} ${xEnd},${Math.round(yBase + (rand() - 0.5) * 40)}`;
        }

        pathD += ` L ${width},${height} Z`;
        const grad = l % 2 === 0 ? 'url(#svgGrad1)' : 'url(#svgGrad2)';
        const op = 0.5 + l * 0.25;
        waveMarkup += `<path d="${pathD}" fill="${grad}" opacity="${op.toFixed(2)}" />`;
      }

      contentMarkup = waveMarkup;
      break;
    }

    case 'identicon': {
      // 5x5 Symmetrical Identicon grid
      const gridSize = 5;
      const cellSize = 60;
      const padding = (width - gridSize * cellSize) / 2;
      const halfGrid = Math.ceil(gridSize / 2);

      let rects = '';
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < halfGrid; col++) {
          const fillCell = rand() > 0.45;
          if (fillCell) {
            const color = rand() > 0.5 ? color1 : color2;
            const xLeft = padding + col * cellSize;
            const xRight = padding + (gridSize - 1 - col) * cellSize;
            const y = padding + row * cellSize;

            rects += `<rect x="${xLeft}" y="${y}" width="${cellSize - 4}" height="${cellSize - 4}" rx="10" fill="${color}" />`;
            if (xRight !== xLeft) {
              rects += `<rect x="${xRight}" y="${y}" width="${cellSize - 4}" height="${cellSize - 4}" rx="10" fill="${color}" />`;
            }
          }
        }
      }

      contentMarkup = `<g filter="url(#softGlow)">${rects}</g>`;
      break;
    }

    case 'constellation': {
      // Connected nodes & glowing constellation lines
      const nodeCount = Math.max(8, Math.min(24, complexity * 2));
      const nodes: Array<{ x: number; y: number; r: number }> = [];

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.round(50 + rand() * 400),
          y: Math.round(50 + rand() * 400),
          r: Math.round(4 + rand() * 6),
        });
      }

      let lines = '';
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i]!.x - nodes[j]!.x;
          const dy = nodes[i]!.y - nodes[j]!.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const op = (1 - dist / 140).toFixed(2);
            lines += `<line x1="${nodes[i]!.x}" y1="${nodes[i]!.y}" x2="${nodes[j]!.x}" y2="${nodes[j]!.y}" stroke="${color2}" stroke-width="1.5" opacity="${op}" />`;
          }
        }
      }

      let circles = '';
      for (const n of nodes) {
        circles += `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${color1}" />`;
        circles += `<circle cx="${n.x}" cy="${n.y}" r="${n.r + 3}" fill="none" stroke="${color3 || color2}" stroke-width="1" opacity="0.6" />`;
      }

      contentMarkup = `<g>${lines}${circles}</g>`;
      break;
    }

    case 'circuits':
    default: {
      // Tech circuit traces with 90 deg bends and chips
      const numTraces = Math.max(6, Math.min(18, complexity * 2));
      let traces = '';

      for (let i = 0; i < numTraces; i++) {
        const x1 = Math.round(40 + rand() * 420);
        const y1 = Math.round(40 + rand() * 420);
        const bendX = Math.round(x1 + (rand() - 0.5) * 120);
        const bendY = y1;
        const x2 = bendX;
        const y2 = Math.round(bendY + (rand() - 0.5) * 120);

        traces += `<path d="M ${x1},${y1} L ${bendX},${bendY} L ${x2},${y2}" fill="none" stroke="${color1}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" />`;
        traces += `<circle cx="${x1}" cy="${y1}" r="4" fill="${color2}" />`;
        traces += `<circle cx="${x2}" cy="${y2}" r="5" fill="${color3 || color1}" />`;
      }

      // Central IC chip
      traces += `<rect x="210" y="210" width="80" height="80" rx="16" fill="url(#svgGrad1)" filter="url(#softGlow)" />`;
      traces += `<circle cx="250" cy="250" r="14" fill="#ffffff" opacity="0.9" />`;

      contentMarkup = `<g>${traces}</g>`;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${gradDef}
  ${bgMarkup}
  ${contentMarkup}
</svg>`;
}

export class RandomSvgTool implements Tool<RandomSvgInput, RandomSvgOutput> {
  public readonly id = 'random-svg';
  public readonly name = 'Random SVG Generator';
  public readonly description =
    'Generate procedural organic blobs, layered waves, identicon avatars, low-poly constellations, and tech circuits.';
  public readonly category = 'images';

  public execute(
    input: RandomSvgInput,
    handlers?: Partial<ResultHandlers<RandomSvgOutput, void>>
  ): ToolExecutionResult<RandomSvgOutput> {
    const startTime = performance.now();
    try {
      const svg = generateRandomSvgString(input);
      const encodedSvg = encodeURIComponent(svg.replace(/\s+/g, ' ').trim());
      const cssDataUrl = `url("data:image/svg+xml,${encodedSvg}")`;

      const reactJsx = `import type { SVGProps } from 'react';

export function GeneratedGraphic(props: SVGProps<SVGSVGElement>) {
  return (
    ${svg.replace('<svg', '<svg {...props}')}
  );
}`;

      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      const data: RandomSvgOutput = {
        svg,
        reactJsx,
        cssDataUrl,
        config: input,
      };

      const res = onSuccess(data, durationMs);
      handlers?.onSuccess?.(data, durationMs);
      return res;
    } catch (err) {
      const res = onFailure(err instanceof Error ? err.message : 'Failed to generate random SVG.');
      handlers?.onFailure?.(res.error);
      return res;
    }
  }
}

export const randomSvgTool = new RandomSvgTool();
