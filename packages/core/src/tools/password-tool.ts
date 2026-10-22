import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface PasswordToolInput {
  readonly length?: number;
  readonly count?: number;
  readonly includeUppercase?: boolean;
  readonly includeLowercase?: boolean;
  readonly includeNumbers?: boolean;
  readonly includeSymbols?: boolean;
  readonly excludeAmbiguous?: boolean;
}

export type PasswordStrength = 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

export interface GeneratedPassword {
  readonly value: string;
  readonly entropyBits: number;
  readonly strength: PasswordStrength;
}

export interface PasswordToolOutput {
  readonly passwords: ReadonlyArray<GeneratedPassword>;
  readonly poolSize: number;
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = new Set(['O', '0', 'I', '1', 'l', '|', '`', "'", '"', ';']);

function calculateStrength(entropyBits: number): PasswordStrength {
  if (entropyBits < 36) return 'Very Weak';
  if (entropyBits < 60) return 'Weak';
  if (entropyBits < 80) return 'Medium';
  if (entropyBits < 100) return 'Strong';
  return 'Very Strong';
}

function getRandomIndex(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] ?? 0) % max;
}

export const passwordTool: Tool<PasswordToolInput, PasswordToolOutput> = {
  id: 'password-tool',
  name: 'Password & Token Generator',
  description:
    'Generates cryptographically random passwords and secure tokens with entropy bits and strength measurement.',
  category: 'crypto',

  execute(
    input: PasswordToolInput,
    handlers?: Partial<ResultHandlers<PasswordToolOutput, void>>
  ): ToolExecutionResult<PasswordToolOutput> {
    const startTime = performance.now();

    const length = Math.min(Math.max(input?.length ?? 16, 4), 128);
    const count = Math.min(Math.max(input?.count ?? 5, 1), 50);

    const useUpper = input?.includeUppercase ?? true;
    const useLower = input?.includeLowercase ?? true;
    const useNumbers = input?.includeNumbers ?? true;
    const useSymbols = input?.includeSymbols ?? true;
    const excludeAmbiguous = input?.excludeAmbiguous ?? false;

    let pool = '';
    if (useUpper) pool += UPPERCASE_CHARS;
    if (useLower) pool += LOWERCASE_CHARS;
    if (useNumbers) pool += NUMBER_CHARS;
    if (useSymbols) pool += SYMBOL_CHARS;

    if (excludeAmbiguous) {
      pool = pool
        .split('')
        .filter(c => !AMBIGUOUS_CHARS.has(c))
        .join('');
    }

    if (pool.length === 0) {
      const res = onFailure('At least one character set must be selected.', 'EMPTY_POOL');
      handlers?.onFailure?.(res.error);
      return res;
    }

    const entropyBits = Math.round(length * Math.log2(pool.length));
    const strength = calculateStrength(entropyBits);

    const passwords: GeneratedPassword[] = [];
    for (let i = 0; i < count; i++) {
      let pwd = '';
      for (let j = 0; j < length; j++) {
        pwd += pool[getRandomIndex(pool.length)];
      }
      passwords.push({
        value: pwd,
        entropyBits,
        strength,
      });
    }

    const durationMs = performance.now() - startTime;
    const res = onSuccess(
      {
        passwords,
        poolSize: pool.length,
      },
      durationMs
    );
    handlers?.onSuccess?.(res.data, durationMs);
    return res;
  },
};
