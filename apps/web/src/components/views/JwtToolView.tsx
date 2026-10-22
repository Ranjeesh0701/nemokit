import { useEffect, useState } from 'react';
import { jwtTool } from '@nemokit/core';
import type { JwtToolOutput } from '@nemokit/core';
import { ShieldAlert, ShieldCheck, Copy, Check, Trash2, AlertCircle, FileKey } from 'lucide-react';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik5lbW9raXQgVXNlciIsImFkbWluIjp0cnVlLCJpYXQiOjE3MDQwNzIwMDAsImV4cCI6MTgwNzEyNDgwMH0.4P9y...placeholder';

export function JwtToolView() {
  const [token, setToken] = useState<string>(SAMPLE_JWT);
  const [output, setOutput] = useState<JwtToolOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const inspectJwt = async (jwtString: string) => {
    const result = await jwtTool.execute({ token: jwtString });
    if (result.success) {
      setOutput(result.data);
      setErrorMessage(null);
    } else {
      setErrorMessage(result.error.message);
      setOutput(null);
    }
  };

  useEffect(() => {
    void inspectJwt(SAMPLE_JWT);
  }, []);

  const copySection = async (data: unknown, key: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white shadow-xs">
              <FileKey className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">JWT Inspector</h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Decode and inspect JSON Web Tokens locally without transmitting sensitive claims over
            the network.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setToken(SAMPLE_JWT);
              inspectJwt(SAMPLE_JWT);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            Sample
          </button>
          <button
            type="button"
            onClick={() => {
              setToken('');
              setOutput(null);
              setErrorMessage(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-stone-400" />
            Clear
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Invalid JWT Token</p>
            <p className="mt-0.5 font-mono text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Token Input */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Encoded Token
          </span>
          <span className="text-xs font-mono text-stone-400">{token.length} chars</span>
        </div>

        <textarea
          value={token}
          onChange={e => {
            const val = e.target.value;
            setToken(val);
            if (val.trim()) {
              inspectJwt(val);
            } else {
              setOutput(null);
              setErrorMessage(null);
            }
          }}
          placeholder="Paste JWT here (header.payload.signature)..."
          rows={4}
          className="mt-3 w-full resize-y rounded-xl border border-stone-200/60 bg-[#fdfdfc] p-3.5 font-mono text-xs text-stone-900 leading-relaxed placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all break-all"
          spellCheck={false}
        />
      </div>

      {/* Decoded Sections */}
      {output && (
        <div className="flex flex-col gap-6">
          {/* Status summary */}
          <div className="flex flex-wrap items-center gap-3">
            {output.isExpired !== null && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  output.isExpired
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}
              >
                {output.isExpired ? (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Expired Token</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Active Token</span>
                  </>
                )}
              </div>
            )}

            {output.expiresAt && (
              <div className="text-xs text-stone-500 font-mono">
                Expires: <span className="text-stone-800">{output.expiresAt}</span>
              </div>
            )}

            {output.issuedAt && (
              <div className="text-xs text-stone-500 font-mono">
                Issued: <span className="text-stone-800">{output.issuedAt}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">
            {/* Header */}
            <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Header (Algorithm & Type)
                </span>
                <button
                  type="button"
                  onClick={() => copySection(output.header, 'header')}
                  className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600 hover:bg-stone-50"
                >
                  {copiedKey === 'header' ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-stone-400" />
                  )}
                  <span>Copy</span>
                </button>
              </div>

              <pre className="mt-3 overflow-auto rounded-xl border border-stone-200/60 bg-[#fbfbf9] p-3.5 font-mono text-xs text-stone-900 leading-relaxed">
                {JSON.stringify(output.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs min-w-0">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Payload (Claims)
                </span>
                <button
                  type="button"
                  onClick={() => copySection(output.payload, 'payload')}
                  className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600 hover:bg-stone-50"
                >
                  {copiedKey === 'payload' ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-stone-400" />
                  )}
                  <span>Copy</span>
                </button>
              </div>

              <pre className="mt-3 overflow-auto rounded-xl border border-stone-200/60 bg-[#fbfbf9] p-3.5 font-mono text-xs text-stone-900 leading-relaxed">
                {JSON.stringify(output.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
