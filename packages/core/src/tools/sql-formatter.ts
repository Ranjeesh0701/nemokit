import type { Tool, ToolExecutionResult } from '../types.js';
import { failureResult, successResult } from '../types.js';

export interface SqlFormatterInput {
  readonly raw: string;
  readonly indent?: number;
  readonly uppercaseKeywords?: boolean;
}

export interface SqlFormatterOutput {
  readonly formatted: string;
  readonly linesCount: number;
  readonly byteSize: number;
}

const MAJOR_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'INNER JOIN',
  'OUTER JOIN',
  'CROSS JOIN',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'CREATE TABLE',
  'ALTER TABLE',
  'DROP TABLE',
  'UNION ALL',
  'UNION',
];

const MINOR_KEYWORDS = [
  'AND',
  'OR',
  'ON',
  'AS',
  'IN',
  'IS',
  'NOT',
  'NULL',
  'LIKE',
  'BETWEEN',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'ASC',
  'DESC',
  'DISTINCT',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
];

function formatSql(sql: string, indentSize: number, uppercase: boolean): string {
  // Normalize whitespace
  let clean = sql.replace(/\s+/g, ' ').trim();

  if (uppercase) {
    const allKeywords = [...MAJOR_KEYWORDS, ...MINOR_KEYWORDS].sort((a, b) => b.length - a.length);
    for (const kw of allKeywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      clean = clean.replace(regex, kw);
    }
  }

  const indentStr = ' '.repeat(indentSize);
  const majorRegex = new RegExp(`\\b(${MAJOR_KEYWORDS.join('|')})\\b`, 'g');

  // Insert line breaks before major keywords
  clean = clean.replace(majorRegex, '\n$1');

  // Insert line breaks before secondary keywords like AND, OR
  clean = clean.replace(/\b(AND|OR)\b/g, `\n${indentStr}$1`);

  const lines = clean
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  let formatted = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check if line starts with a major keyword
    const isMajor = MAJOR_KEYWORDS.some(kw => line.startsWith(kw));

    if (isMajor) {
      formatted += (i > 0 ? '\n' : '') + line;
    } else {
      formatted += '\n' + indentStr + line;
    }
  }

  return formatted.trim();
}

export const sqlFormatterTool: Tool<SqlFormatterInput, SqlFormatterOutput> = {
  id: 'sql-formatter',
  name: 'SQL Formatter',
  description: 'Beautifies and structures SQL queries with keyword casing and clause alignment.',
  category: 'formatters',

  execute(input: SqlFormatterInput): ToolExecutionResult<SqlFormatterOutput> {
    const startTime = performance.now();

    if (!input || typeof input.raw !== 'string' || input.raw.trim() === '') {
      return failureResult('Input SQL query cannot be empty.', 'EMPTY_INPUT');
    }

    try {
      const indentSize = input.indent ?? 2;
      const uppercase = input.uppercaseKeywords ?? true;
      const formatted = formatSql(input.raw, indentSize, uppercase);
      const linesCount = formatted.split('\n').length;
      const byteSize = new TextEncoder().encode(formatted).length;

      return successResult(
        {
          formatted,
          linesCount,
          byteSize,
        },
        performance.now() - startTime
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'SQL formatting failed.';
      return failureResult(message, 'SQL_FORMAT_ERROR');
    }
  },
};
