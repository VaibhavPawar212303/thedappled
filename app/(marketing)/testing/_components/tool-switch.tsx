"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { TOOL_COOKIE, TOOL_LABEL, TOOLS, type Tool } from "@/lib/tools";

// Remember the choice for a year so other testing pages open on the same tool.
export function rememberTool(tool: Tool) {
  try {
    document.cookie = `${TOOL_COOKIE}=${tool}; path=/; max-age=31536000; samesite=lax`;
  } catch {}
}

// A plain link that also remembers the tool it switches to.
export function SwitchToolLink({ href, tool, children, className }: { href: string; tool: Tool; children: ReactNode; className?: string }) {
  return (
    <Link href={href} onClick={() => rememberTool(tool)} data-testid="switch-tool" className={className}>
      {children}
    </Link>
  );
}

// Playwright | Cypress segmented switch. Each option is a link (?tool=…), so it works without JS
// and the page re-renders on the server for that tool. `completed` marks tools the learner finished.
export function ToolSwitch({
  current,
  hrefs,
  completed = [],
  size = "md",
}: {
  current: Tool;
  hrefs: Record<Tool, string>;
  completed?: Tool[];
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";
  // A page opened with ?tool= (a shared link, a redirect) also becomes the remembered choice.
  useEffect(() => rememberTool(current), [current]);
  return (
    <nav aria-label="Automation tool" data-testid="tool-switch" className="inline-flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
      {TOOLS.map((t) => {
        const active = t === current;
        return (
          <Link
            key={t}
            href={hrefs[t]}
            scroll={false}
            onClick={() => rememberTool(t)}
            aria-current={active ? "page" : undefined}
            data-testid={`tool-switch-${t}`}
            className={`inline-flex items-center gap-1.5 rounded-lg font-bold transition ${pad} ${
              active ? "bg-white text-foreground shadow-sm dark:bg-slate-950" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {TOOL_LABEL[t]}
            {completed.includes(t) && (
              <span aria-label="completed" className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
