"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StartAssignmentButton({
  label = "Start assignment",
  slug = "ui-automation",
  className = "bg-emerald-600 hover:bg-emerald-700",
}: {
  label?: string;
  slug?: "ui-automation" | "framework-setup";
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(false);

  const start = async () => {
    setBusy(true);
    setError(false);
    try {
      const r = await fetch(`/api/assignments/${slug}`, { method: "POST" });
      if (!r.ok) throw new Error();
      router.push(`/testing/${slug}/assignment`);
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
        {busy ? "Starting…" : label} {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-[13px] text-red-600">
          Couldn’t start the assignment. Please try again.
        </p>
      )}
    </div>
  );
}
