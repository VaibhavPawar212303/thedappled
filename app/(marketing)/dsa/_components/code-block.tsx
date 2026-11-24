"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

// Dark code surface with a file name and an optional copy button.
export function CodeBlock({ file, code, copy = false }: { file: string; code: string; copy?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="overflow-hidden rounded-xl bg-slate-900">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
        <span className="font-mono text-xs font-semibold text-slate-400">{file}</span>
        {copy && (
          <button
            type="button"
            onClick={onCopy}
            data-testid="copy-code"
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-slate-700 px-3 text-xs font-semibold text-white hover:bg-slate-600"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy code"}
          </button>
        )}
      </div>
      <pre className="m-0 overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
