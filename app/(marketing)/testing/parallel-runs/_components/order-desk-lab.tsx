"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useAssignmentReporter } from "../../ui-automation/_components/assignment-reporter";

// Design: Penpot "26 - Testing Learning Path", page "Stage 8 – Parallel runs & workers", board D.
//   Create an order → unique data per test (order-${testInfo.testId}); a repeated ID is refused
//   Checkout        → a serial group: the payment step always fails, so later steps get skipped
//   Reports         → four independent ~2 s jobs: run them in parallel and the file finishes in about the time of one

const REPORT_MS = 2000;
const REPORTS = ["daily", "weekly", "monthly", "yearly"] as const;
const ORDERS_KEY = "order-desk-orders";
const ID_RE = /^[\w-]{3,120}$/;

function readOrders(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(ORDERS_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function Panel({ title, tag, tone, testid, children, className = "" }: { title: string; tag: string; tone: string; testid: string; children: React.ReactNode; className?: string }) {
  return (
    <section data-testid={testid} className={`min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-7 ${className}`}>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{tag}</span>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function OrderDeskLab() {
  const { token, report } = useAssignmentReporter();

  // Each page load by the learner's tests counts as a lab visit (the server decides whether it was automated).
  React.useEffect(() => {
    if (!token) return;
    const id = setTimeout(() => report("par-lab"), 400);
    return () => clearTimeout(id);
  }, [token, report]);

  // Orders
  const [orderId, setOrderId] = React.useState("");
  const [orderMsg, setOrderMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const createOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!ID_RE.test(id)) {
      setOrderMsg({ ok: false, text: "Use 3–120 letters, numbers, dashes or underscores." });
      return;
    }
    const orders = readOrders();
    if (orders.includes(id)) {
      setOrderMsg({ ok: false, text: `Order ${id} already exists` });
      return;
    }
    try {
      sessionStorage.setItem(ORDERS_KEY, JSON.stringify([...orders, id]));
    } catch {}
    setOrderMsg({ ok: true, text: `Order ${id} created` });
  };

  // Checkout
  const [payment, setPayment] = React.useState<"waiting" | "failed">("waiting");

  // Reports
  const [reports, setReports] = React.useState<Record<string, "idle" | "running" | "ready">>({});
  const generate = (name: string) => {
    setReports((r) => ({ ...r, [name]: "running" }));
    setTimeout(() => setReports((r) => ({ ...r, [name]: "ready" })), REPORT_MS);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Order desk</h1>
      <p className="mt-2 text-muted-foreground">The parallel lab: orders to create, a checkout in three steps, and a step that’s broken.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel testid="panel-orders" title="Create an order" tag="Unique data → order-${testInfo.testId}" tone="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          <form className="flex flex-wrap gap-3" onSubmit={createOrder}>
            <label htmlFor="order-id" className="sr-only">Order ID</label>
            <input
              id="order-id"
              data-testid="order-id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="order-…"
              className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            />
            <Button type="submit" data-testid="order-create" className="h-10 bg-blue-600 px-5 text-white hover:bg-blue-700">Create</Button>
          </form>
          {orderMsg && (
            <p data-testid="order-result" role={orderMsg.ok ? "status" : "alert"} className={`mt-4 break-all text-sm font-semibold ${orderMsg.ok ? "" : "text-red-600"}`}>
              {orderMsg.text}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Creating the same ID twice shows “Order … already exists”.</p>
        </Panel>

        <Panel testid="panel-checkout" title="Checkout" tag="Serial group → payment fails, the rest are skipped" tone="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <ul className="m-0 list-none space-y-2 p-0">
            <li className="flex items-center justify-between gap-3 rounded-xl border bg-background px-4 py-2.5">
              <span className="text-sm font-semibold">1. Cart</span>
              <span data-testid="checkout-cart" className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Ready</span>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background px-4 py-2.5">
              <span className="text-sm font-semibold">2. Payment</span>
              <span className="flex items-center gap-3">
                <span data-testid="checkout-payment" className={`text-sm font-bold ${payment === "failed" ? "text-red-600" : "text-muted-foreground"}`}>
                  {payment === "failed" ? "Service unavailable" : "Not paid"}
                </span>
                <Button data-testid="checkout-pay" size="sm" onClick={() => setPayment("failed")} className="h-8 bg-blue-600 px-3 text-white hover:bg-blue-700">Pay</Button>
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-xl border bg-background px-4 py-2.5">
              <span className="text-sm font-semibold">3. Confirm</span>
              <span data-testid="checkout-confirm" className="text-sm font-bold text-muted-foreground">Waiting</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">The payment service is down, so step 2 always fails and step 3 never confirms.</p>
        </Panel>

        <Panel testid="panel-reports" title="Reports" tag="Parallel in one file → each report takes about 2 seconds" tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" className="md:col-span-2">
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {REPORTS.map((name) => {
              const st = reports[name] ?? "idle";
              return (
                <li key={name} className="flex items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3">
                  <span>
                    <span className="block text-sm font-bold capitalize">{name} report</span>
                    <span data-testid={`report-${name}-status`} className={`block text-xs font-semibold ${st === "ready" ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                      {st === "ready" ? "Ready" : st === "running" ? "Generating…" : "Not generated"}
                    </span>
                  </span>
                  <Button data-testid={`report-${name}-generate`} size="sm" disabled={st === "running"} onClick={() => generate(name)} className="h-8 bg-blue-600 px-3 text-white hover:bg-blue-700">
                    Generate
                  </Button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Four independent reports: run them in parallel and the file finishes in about the time of one.</p>
        </Panel>
      </div>
    </div>
  );
}
