import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  chmodTool,
  CHMOD_PRESETS,
  type ChmodToolOutput,
  type PermissionTriad,
  type SpecialPermissions,
} from '@nemokit/core';
import {
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  Share2,
  FileText,
  Key,
  FolderLock,
  Lock,
} from 'lucide-react';
import { serializeStateToUrl, parseSharedState } from '../../utils/shareState.js';

export function ChmodToolView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [filename, setFilename] = useState('script.sh');

  // Shared state initial recovery
  const initial = useMemo(() => {
    return parseSharedState<{
      octal?: string;
      filename?: string;
    }>('chmod-calculator');
  }, []);

  const [user, setUser] = useState<PermissionTriad>({ r: true, w: true, x: true });
  const [group, setGroup] = useState<PermissionTriad>({ r: true, w: false, x: true });
  const [others, setOthers] = useState<PermissionTriad>({ r: true, w: false, x: true });
  const [special, setSpecial] = useState<SpecialPermissions>({
    setuid: false,
    setgid: false,
    sticky: false,
  });

  const [octalInput, setOctalInput] = useState<string>(initial?.octal ?? '755');
  const [output, setOutput] = useState<ChmodToolOutput | null>(null);

  // Calculate permissions output
  useEffect(() => {
    chmodTool.execute(
      {
        user,
        group,
        others,
        special,
        filename,
      },
      {
        onSuccess: data => {
          setOutput(data);
        },
        onFailure: () => {
          setOutput(null);
        },
      }
    );
  }, [user, group, others, special, filename]);

  // Keep octal input in sync when checkboxes change
  useEffect(() => {
    if (output && output.octal !== octalInput) {
      setOctalInput(output.octal);
    }
  }, [output?.octal]);

  // Handle direct octal text change
  const handleOctalChange = (val: string) => {
    setOctalInput(val);
    const clean = val.replace(/[^0-7]/g, '').slice(0, 4);
    if (clean.length >= 3) {
      chmodTool.execute(
        { octal: clean, filename },
        {
          onSuccess: data => {
            setUser(data.user);
            setGroup(data.group);
            setOthers(data.others);
            setSpecial(data.special);
          },
        }
      );
    }
  };

  // Preset selector
  const applyPreset = (presetOctal: string) => {
    handleOctalChange(presetOctal);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleShareLink = useCallback(() => {
    if (!output) return;
    const url = serializeStateToUrl('chmod-calculator', {
      octal: output.octal,
      filename,
    });
    navigator.clipboard.writeText(url);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  }, [output, filename]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/80 gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              Chmod Permissions Calculator
            </h1>
            <p className="text-xs text-stone-500">
              Interactive Unix file permissions converter between Octal, Symbolic, and Checkboxes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            {shareSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-stone-500" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Checkbox Matrix & Filename */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Filename Input */}
          <div className="flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white p-3 shadow-2xs">
            <FileText className="h-4 w-4 text-stone-400 shrink-0" />
            <span className="text-xs font-medium text-stone-500 shrink-0">Target File / Directory:</span>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="e.g. script.sh or deploy.sh"
              className="flex-1 text-xs font-mono bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1.5 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
            />
          </div>

          {/* Interactive Checkbox Table */}
          <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                Permission Checkbox Matrix
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                {output?.binary}
              </span>
            </div>

            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200/60 text-xs font-medium text-stone-500">
                    <th className="pb-3 font-semibold text-stone-800">Target Role</th>
                    <th className="pb-3 text-center">Read (4)</th>
                    <th className="pb-3 text-center">Write (2)</th>
                    <th className="pb-3 text-center">Execute (1)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {/* Owner (User) */}
                  <tr>
                    <td className="py-3 font-medium text-stone-800 flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-amber-600" />
                      <span>Owner (User)</span>
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={user.r}
                        onChange={e => setUser(prev => ({ ...prev, r: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={user.w}
                        onChange={e => setUser(prev => ({ ...prev, w: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={user.x}
                        onChange={e => setUser(prev => ({ ...prev, x: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                  </tr>

                  {/* Group */}
                  <tr>
                    <td className="py-3 font-medium text-stone-800 flex items-center gap-2">
                      <FolderLock className="h-3.5 w-3.5 text-blue-600" />
                      <span>Group</span>
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={group.r}
                        onChange={e => setGroup(prev => ({ ...prev, r: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={group.w}
                        onChange={e => setGroup(prev => ({ ...prev, w: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={group.x}
                        onChange={e => setGroup(prev => ({ ...prev, x: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                  </tr>

                  {/* Others */}
                  <tr>
                    <td className="py-3 font-medium text-stone-800 flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Others (Public)</span>
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={others.r}
                        onChange={e => setOthers(prev => ({ ...prev, r: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={others.w}
                        onChange={e => setOthers(prev => ({ ...prev, w: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={others.x}
                        onChange={e => setOthers(prev => ({ ...prev, x: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Special Permissions Flags */}
              <div className="mt-4 pt-4 border-t border-stone-200/60">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                  Special Flags (Advanced)
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={special.setuid}
                      onChange={e => setSpecial(s => ({ ...s, setuid: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-stone-900"
                    />
                    <span>SetUID (4000)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={special.setgid}
                      onChange={e => setSpecial(s => ({ ...s, setgid: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-stone-900"
                    />
                    <span>SetGID (2000)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={special.sticky}
                      onChange={e => setSpecial(s => ({ ...s, sticky: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-stone-900"
                    />
                    <span>Sticky Bit (1000)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
            <span className="text-xs font-semibold text-stone-700 block mb-3">
              Standard Permission Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {CHMOD_PRESETS.map(p => (
                <button
                  key={p.octal}
                  type="button"
                  onClick={() => applyPreset(p.octal)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    output?.octal === p.octal
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/60'
                  }`}
                >
                  <span className="font-mono font-bold mr-1.5">{p.octal}</span>
                  <span>{p.name.split('—')[1]?.trim() || p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Values & Generated Commands */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Main Octal & Symbolic Readouts */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Octal */}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-stone-500 mb-1">Octal Notation</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={octalInput}
                    onChange={e => handleOctalChange(e.target.value)}
                    maxLength={4}
                    className="w-full text-2xl font-mono font-extrabold tracking-wider bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => output && copyToClipboard(output.octal, 'octal')}
                    className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50"
                  >
                    {copiedKey === 'octal' ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Symbolic */}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-stone-500 mb-1">Symbolic Notation</span>
                <div className="flex items-center gap-2">
                  <div className="w-full text-base font-mono font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 truncate">
                    {output?.symbolic ?? '-rw-r--r--'}
                  </div>
                  <button
                    type="button"
                    onClick={() => output && copyToClipboard(output.symbolic, 'symbolic')}
                    className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50"
                  >
                    {copiedKey === 'symbolic' ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Shell Commands */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col gap-3">
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-stone-500" />
              <span>Generated Shell Commands</span>
            </span>

            {/* Octal command */}
            <div className="flex items-center justify-between bg-stone-900 text-stone-100 rounded-xl px-3.5 py-2.5 font-mono text-xs">
              <span className="truncate">{output?.commands.octal}</span>
              <button
                type="button"
                onClick={() => output && copyToClipboard(output.commands.octal, 'cmd-octal')}
                className="ml-2 text-stone-400 hover:text-white transition-colors"
                title="Copy command"
              >
                {copiedKey === 'cmd-octal' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Recursive command */}
            <div className="flex items-center justify-between bg-stone-900 text-stone-100 rounded-xl px-3.5 py-2.5 font-mono text-xs">
              <span className="truncate">{output?.commands.recursive}</span>
              <button
                type="button"
                onClick={() => output && copyToClipboard(output.commands.recursive, 'cmd-rec')}
                className="ml-2 text-stone-400 hover:text-white transition-colors"
                title="Copy recursive command"
              >
                {copiedKey === 'cmd-rec' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Symbolic command */}
            <div className="flex items-center justify-between bg-stone-100 text-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-xs border border-stone-200/80">
              <span className="truncate">{output?.commands.symbolic}</span>
              <button
                type="button"
                onClick={() => output && copyToClipboard(output.commands.symbolic, 'cmd-sym')}
                className="ml-2 text-stone-500 hover:text-stone-900 transition-colors"
                title="Copy symbolic command"
              >
                {copiedKey === 'cmd-sym' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Plain English Explanation */}
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 text-xs space-y-2">
            <span className="font-semibold text-stone-800 block mb-1">Access Rights Summary</span>
            <p className="text-stone-600 leading-relaxed">• {output?.explanation.user}</p>
            <p className="text-stone-600 leading-relaxed">• {output?.explanation.group}</p>
            <p className="text-stone-600 leading-relaxed">• {output?.explanation.others}</p>
            {output?.explanation.special && (
              <p className="text-amber-800 font-medium leading-relaxed">
                • {output.explanation.special}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
