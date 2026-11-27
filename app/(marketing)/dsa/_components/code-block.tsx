"use client";

import * as React from "react";
import { Check, Copy, ExternalLink, Play } from "lucide-react";
import { compilerRunUrl } from "./compiler-link";

// Dark code surface with a file name, an optional copy button, and an optional "Run in Compiler" link.
// `run` is the full program to open in the Compiler (a snippet shown here can be wrapped in main()).
// Design: Penpot "27 - DSA Learning Path", page "Foundations 3 – Coding basics in C".
export function CodeBlock({ file, code, copy = false, run }: { file: string; code: string; copy?: boolean; run?: string }) {
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
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800 px-4 py-2">
        <span className="font-mono text-xs font-semibold text-slate-400">{file}</span>
        <span className="flex flex-wrap gap-2">
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
          {run && (
            <a
              href={compilerRunUrl(run)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="run-in-compiler"
              className="inline-flex h-7 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Play className="h-3 w-3" />
              Run in Compiler
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </span>
      </div>
      <pre className="m-0 overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
