"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_TOOL, TOOL_LABEL, type Tool } from "@/lib/tools";
import { rememberTool } from "../../_components/tool-switch";

export function StartAssignmentButton({
  label,
  slug = "ui-automation",
  tool = DEFAULT_TOOL,
  className = "bg-emerald-600 hover:bg-emerald-700",
}: {
  label?: string;
  slug?: "ui-automation" | "framework-setup" | "page-objects" | "cross-browser";
  tool?: Tool;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(false);

  const start = async () => {
    setBusy(true);
    setError(false);
    try {
      const r = await fetch(`/api/assignments/${slug}?tool=${tool}`, { method: "POST" });
      if (!r.ok) throw new Error();
      rememberTool(tool);
      router.push(`/testing/${slug}/assignment?tool=${tool}`);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div>
      <Button
        data-testid="assignment-start"
        onClick={start}
        disabled={busy}
        size="lg"
        className={`h-12 w-full text-white ${className}`}
      >
        {busy ? "Starting…" : (label ?? `Start ${TOOL_LABEL[tool]} assignment`)} {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-[13px] text-red-600">
          Couldn’t start the assignment. Please try again.
        </p>
      )}
    </div>
  );
}
