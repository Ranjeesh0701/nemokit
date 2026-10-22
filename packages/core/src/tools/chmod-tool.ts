import type { ResultHandlers, Tool, ToolExecutionResult } from '../types.js';
import { onFailure, onSuccess } from '../types.js';

export interface PermissionTriad {
  readonly r: boolean;
  readonly w: boolean;
  readonly x: boolean;
}

export interface SpecialPermissions {
  readonly setuid: boolean;
  readonly setgid: boolean;
  readonly sticky: boolean;
}

export interface ChmodToolInput {
  readonly octal?: string;
  readonly symbolic?: string;
  readonly user?: PermissionTriad;
  readonly group?: PermissionTriad;
  readonly others?: PermissionTriad;
  readonly special?: SpecialPermissions;
  readonly filename?: string;
}

export interface ChmodPreset {
  readonly octal: string;
  readonly symbolic: string;
  readonly name: string;
  readonly description: string;
}

export interface ChmodToolOutput {
  readonly octal: string;
  readonly symbolic: string;
  readonly binary: string;
  readonly user: PermissionTriad;
  readonly group: PermissionTriad;
  readonly others: PermissionTriad;
  readonly special: SpecialPermissions;
  readonly commands: {
    readonly octal: string;
    readonly symbolic: string;
    readonly recursive: string;
  };
  readonly explanation: {
    readonly user: string;
    readonly group: string;
    readonly others: string;
    readonly special?: string;
  };
  readonly presets: ReadonlyArray<ChmodPreset>;
}

export const CHMOD_PRESETS: ReadonlyArray<ChmodPreset> = [
  {
    octal: '644',
    symbolic: '-rw-r--r--',
    name: '644 — Standard File',
    description: 'Owner can read and write; group and others can only read. Ideal for web assets, documents, and source files.',
  },
  {
    octal: '755',
    symbolic: '-rwxr-xr-x',
    name: '755 — Standard Executable & Directory',
    description: 'Owner can read, write, and execute; group and others can read and execute. Standard for binaries, shell scripts, and directories.',
  },
  {
    octal: '600',
    symbolic: '-rw-------',
    name: '600 — Private SSH Key & Secret File',
    description: 'Owner can read and write; nobody else has any access. Required for SSH keys (~/.ssh/id_rsa) and credential files.',
  },
  {
    octal: '700',
    symbolic: '-rwx------',
    name: '700 — Private Directory & Script',
    description: 'Full access for the owner only. Group and public have zero permissions. Recommended for ~/.ssh directory and private admin scripts.',
  },
  {
    octal: '400',
    symbolic: '-r--------',
    name: '400 — Read-Only Secret',
    description: 'Owner can only read; no modifications allowed, and completely hidden from group and public.',
  },
  {
    octal: '664',
    symbolic: '-rw-rw-r--',
    name: '664 — Collaborative Team File',
    description: 'Owner and group members can read and write; external users can only read. Useful in shared team working directories.',
  },
  {
    octal: '775',
    symbolic: '-rwxrwxr-x',
    name: '775 — Shared Executable & Directory',
    description: 'Owner and group members have full read/write/execute rights; others can read and execute.',
  },
  {
    octal: '777',
    symbolic: '-rwxrwxrwx',
    name: '777 — Full Public Access (Unsafe)',
    description: 'Everyone can read, write, and execute. Caution: unrestricted write permission makes files vulnerable to modification or deletion.',
  },
];

function triadToValue(t: PermissionTriad): number {
  return (t.r ? 4 : 0) + (t.w ? 2 : 0) + (t.x ? 1 : 0);
}

function valueToTriad(val: number): PermissionTriad {
  return {
    r: (val & 4) !== 0,
    w: (val & 2) !== 0,
    x: (val & 1) !== 0,
  };
}

function triadToSymbolic(t: PermissionTriad, isSpecialX?: boolean, specialChar?: string): string {
  const r = t.r ? 'r' : '-';
  const w = t.w ? 'w' : '-';
  let x = t.x ? 'x' : '-';
  if (isSpecialX && specialChar) {
    x = t.x ? specialChar.toLowerCase() : specialChar.toUpperCase();
  }
  return `${r}${w}${x}`;
}

function triadToDescription(t: PermissionTriad): string {
  const parts: string[] = [];
  if (t.r) parts.push('Read');
  if (t.w) parts.push('Write');
  if (t.x) parts.push('Execute / Traverse');
  if (parts.length === 0) return 'No access permissions';
  return parts.join(', ');
}

export const chmodTool: Tool<ChmodToolInput, ChmodToolOutput> = {
  id: 'chmod-calculator',
  name: 'Chmod Permissions Calculator',
  description: 'Calculate Unix file permissions between Octal (755), Symbolic (-rwxr-xr-x), and interactive checkboxes with command generation.',
  category: 'converters',

  execute(
    input: ChmodToolInput,
    handlers?: Partial<ResultHandlers<ChmodToolOutput, void>>
  ): ToolExecutionResult<ChmodToolOutput> {
    const startTime = performance.now();
    try {
      let u: PermissionTriad = { r: true, w: true, x: false };
      let g: PermissionTriad = { r: true, w: false, x: false };
      let o: PermissionTriad = { r: true, w: false, x: false };
      let s: SpecialPermissions = { setuid: false, setgid: false, sticky: false };

      if (input.octal !== undefined && input.octal.trim() !== '') {
        const clean = input.octal.trim().replace(/^0+/, '') || '0';
        const padded = clean.padStart(3, '0').slice(-4);
        if (!/^[0-7]{3,4}$/.test(padded)) {
          const res = onFailure('Invalid octal representation. Must contain 3 or 4 digits from 0 to 7 (e.g. 755 or 0644).');
          handlers?.onFailure?.(res.error);
          return res;
        }

        const digits = padded.length === 4 ? padded : '0' + padded;
        const sVal = parseInt(digits[0]!, 10);
        const uVal = parseInt(digits[1]!, 10);
        const gVal = parseInt(digits[2]!, 10);
        const oVal = parseInt(digits[3]!, 10);

        s = {
          setuid: (sVal & 4) !== 0,
          setgid: (sVal & 2) !== 0,
          sticky: (sVal & 1) !== 0,
        };
        u = valueToTriad(uVal);
        g = valueToTriad(gVal);
        o = valueToTriad(oVal);
      } else if (input.symbolic !== undefined && input.symbolic.trim() !== '') {
        const sym = input.symbolic.trim();
        const core = sym.length === 10 ? sym.slice(1) : sym;
        if (core.length !== 9) {
          const res = onFailure('Invalid symbolic string. Expected 9 or 10 characters (e.g. -rwxr-xr-x or rwxr-xr-x).');
          handlers?.onFailure?.(res.error);
          return res;
        }

        u = {
          r: core[0] === 'r',
          w: core[1] === 'w',
          x: core[2] === 'x' || core[2] === 's',
        };
        g = {
          r: core[3] === 'r',
          w: core[4] === 'w',
          x: core[5] === 'x' || core[5] === 's',
        };
        o = {
          r: core[6] === 'r',
          w: core[7] === 'w',
          x: core[8] === 'x' || core[8] === 't',
        };
        s = {
          setuid: core[2] === 's' || core[2] === 'S',
          setgid: core[5] === 's' || core[5] === 'S',
          sticky: core[8] === 't' || core[8] === 'T',
        };
      } else {
        if (input.user) u = input.user;
        if (input.group) g = input.group;
        if (input.others) o = input.others;
        if (input.special) s = input.special;
      }

      const uVal = triadToValue(u);
      const gVal = triadToValue(g);
      const oVal = triadToValue(o);
      const sVal = (s.setuid ? 4 : 0) + (s.setgid ? 2 : 0) + (s.sticky ? 1 : 0);

      const octalShort = `${uVal}${gVal}${oVal}`;
      const octalFull = sVal > 0 ? `${sVal}${octalShort}` : octalShort;

      const symUser = triadToSymbolic(u, s.setuid, 's');
      const symGroup = triadToSymbolic(g, s.setgid, 's');
      const symOthers = triadToSymbolic(o, s.sticky, 't');
      const symbolic = `-${symUser}${symGroup}${symOthers}`;

      const binUser = uVal.toString(2).padStart(3, '0');
      const binGroup = gVal.toString(2).padStart(3, '0');
      const binOthers = oVal.toString(2).padStart(3, '0');
      const binary = `${binUser} ${binGroup} ${binOthers}`;

      const file = input.filename?.trim() || 'filename.ext';

      const buildSymbolicNotation = () => {
        const parts: string[] = [];
        const uSym = (u.r ? 'r' : '') + (u.w ? 'w' : '') + (u.x ? 'x' : '');
        const gSym = (g.r ? 'r' : '') + (g.w ? 'w' : '') + (g.x ? 'x' : '');
        const oSym = (o.r ? 'r' : '') + (o.w ? 'w' : '') + (o.x ? 'x' : '');
        parts.push(`u=${uSym || '-'}`);
        parts.push(`g=${gSym || '-'}`);
        parts.push(`o=${oSym || '-'}`);
        return parts.join(',');
      };

      const result: ChmodToolOutput = {
        octal: octalFull,
        symbolic,
        binary,
        user: u,
        group: g,
        others: o,
        special: s,
        commands: {
          octal: `chmod ${octalFull} ${file}`,
          symbolic: `chmod ${buildSymbolicNotation()} ${file}`,
          recursive: `chmod -R ${octalFull} ${file}`,
        },
        explanation: {
          user: `Owner (User): ${triadToDescription(u)}`,
          group: `Group: ${triadToDescription(g)}`,
          others: `Others (Public): ${triadToDescription(o)}`,
          special: sVal > 0 ? `Special flags enabled: ${[s.setuid && 'SetUID', s.setgid && 'SetGID', s.sticky && 'Sticky Bit'].filter(Boolean).join(', ')}` : undefined,
        },
        presets: CHMOD_PRESETS,
      };

      const durationMs = performance.now() - startTime;
      const res = onSuccess(result, durationMs);
      handlers?.onSuccess?.(result, durationMs);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to calculate chmod permissions';
      const res = onFailure(message);
      handlers?.onFailure?.(res.error);
      return res;
    }
  },
};
