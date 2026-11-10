import { useState, useEffect, useId } from 'react';
import { passwordTool } from '@nemokit/core';
import type { PasswordToolOutput, PasswordStrength } from '@nemokit/core';
import {
  Lock,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Sliders,
} from 'lucide-react';

export function PasswordToolView() {
  const [length, setLength] = useState<number>(18);
  const [count, setCount] = useState<number>(5);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [showPlain, setShowPlain] = useState<boolean>(true);

  const [output, setOutput] = useState<PasswordToolOutput | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const lengthId = useId();
  const countId = useId();

  const generatePasswords = () => {
    passwordTool.execute(
      {
        length,
        count,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        excludeAmbiguous,
      },
      {
        onSuccess: data => {
          setOutput(data);
        },
      }
    );
  };

  useEffect(() => {
    generatePasswords();
  }, [
    length,
    count,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
  ]);

  const handleCopyOne = async (val: string, index: number) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyAll = async () => {
    if (!output) return;
    try {
      const allText = output.passwords.map(p => p.value).join('\n');
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // ignore
    }
  };

  const applyPreset = (preset: 'strong' | 'pin' | 'memorable' | 'max') => {
    switch (preset) {
      case 'strong':
        setLength(18);
        setIncludeUppercase(true);
        setIncludeLowercase(true);
        setIncludeNumbers(true);
        setIncludeSymbols(true);
        setExcludeAmbiguous(false);
        break;
      case 'pin':
        setLength(6);
        setIncludeUppercase(false);
        setIncludeLowercase(false);
        setIncludeNumbers(true);
        setIncludeSymbols(false);
        setExcludeAmbiguous(false);
        break;
      case 'memorable':
        setLength(20);
        setIncludeUppercase(true);
        setIncludeLowercase(true);
        setIncludeNumbers(true);
        setIncludeSymbols(false);
        setExcludeAmbiguous(true);
        break;
      case 'max':
        setLength(36);
        setIncludeUppercase(true);
        setIncludeLowercase(true);
        setIncludeNumbers(true);
        setIncludeSymbols(true);
        setExcludeAmbiguous(true);
        break;
    }
  };

  const getStrengthBadge = (strength: PasswordStrength) => {
    switch (strength) {
      case 'Very Weak':
      case 'Weak':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200/60">
            <ShieldAlert className="h-3 w-3" />
            {strength}
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/60">
            <ShieldAlert className="h-3 w-3" />
            Medium
          </span>
        );
      case 'Strong':
      case 'Very Strong':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="h-3 w-3" />
            {strength}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <Lock className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Password & Token Generator
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Generate cryptographically secure random passwords and secrets with entropy bit ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={generatePasswords}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-stone-500" />
            Regenerate
          </button>
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={!output}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {copiedAll ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Copied All
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Config vs Generated Passwords */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 flex flex-col gap-5 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <Sliders className="h-3.5 w-3.5" />
              Generator Options
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyPreset('strong')}
                className="px-2 py-0.5 text-[11px] font-medium rounded text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Strong
              </button>
              <button
                type="button"
                onClick={() => applyPreset('max')}
                className="px-2 py-0.5 text-[11px] font-medium rounded text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Max
              </button>
              <button
                type="button"
                onClick={() => applyPreset('pin')}
                className="px-2 py-0.5 text-[11px] font-medium rounded text-stone-600 hover:bg-stone-100 transition-colors"
              >
                PIN
              </button>
              <button
                type="button"
                onClick={() => applyPreset('memorable')}
                className="px-2 py-0.5 text-[11px] font-medium rounded text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Safe
              </button>
            </div>
          </div>

          {/* Length Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-medium text-stone-700">
              <label htmlFor={lengthId}>Password Length</label>
              <span className="font-mono text-sm font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                {length} chars
              </span>
            </div>
            <input
              id={lengthId}
              type="range"
              min={6}
              max={64}
              value={length}
              onChange={e => setLength(parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-stone-900"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono">
              <span>6</span>
              <span>18</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          {/* Count Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-medium text-stone-700">
              <label htmlFor={countId}>Number of Passwords</label>
              <span className="font-mono text-xs font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                {count}
              </span>
            </div>
            <input
              id={countId}
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={e => setCount(parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-stone-900"
            />
          </div>

          {/* Checkbox Options */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-stone-100">
            <span className="text-xs font-medium text-stone-600">Character Sets Included</span>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={e => setIncludeUppercase(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Uppercase Letters (A-Z)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={e => setIncludeLowercase(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Lowercase Letters (a-z)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={e => setIncludeNumbers(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={e => setIncludeSymbols(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Special Symbols (!@#$%^&*)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={e => setExcludeAmbiguous(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span className="text-stone-600">Exclude Ambiguous (0, O, 1, l, I)</span>
            </label>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600 px-1">
            <span className="flex items-center gap-2">
              Generated Results
              {output && (
                <span className="text-stone-400 font-mono">
                  ({output.poolSize} characters pool size)
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setShowPlain(prev => !prev)}
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              {showPlain ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Mask Values
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Reveal Values
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {output?.passwords.map((pwd, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between gap-3 rounded-xl border border-stone-200/90 bg-white p-3.5 shadow-xs hover:border-stone-400 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-5 shrink-0 text-center text-xs font-mono text-stone-400 select-none">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm tracking-wide text-stone-900 break-all select-all font-medium">
                      {showPlain ? pwd.value : '•'.repeat(pwd.value.length)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStrengthBadge(pwd.strength)}
                      <span className="text-[11px] font-mono text-stone-500">
                        {pwd.entropyBits} bits entropy
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyOne(pwd.value, idx)}
                  className="shrink-0 p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                  title="Copy password"
                >
                  {copiedIndex === idx ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-stone-400 group-hover:text-stone-700" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
