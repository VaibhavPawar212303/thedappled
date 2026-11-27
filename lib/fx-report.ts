// Checks a learner's Playwright JSON report for the advanced fixtures assignment (stage 7).
// Pure: no I/O. Each check looks for evidence only a working fixture leaves in the report.

import { flattenReport, type FlatTest, type ReportCheck } from "@/lib/ann-report";

export type FixtureReportStep = "fx-auto" | "fx-worker" | "fx-option";
export type FixtureReportResult = { checks: Record<FixtureReportStep, ReportCheck>; tests: number; startTime: Date | null };

const annotationValues = (t: FlatTest, type: string) =>
  t.annotations.filter((a) => a.type.toLowerCase() === type && a.description?.trim()).map((a) => a.description!.trim());

export function evaluateFixturesReport(report: unknown): FixtureReportResult {
  const tests = flattenReport(report);
  const r = (report && typeof report === "object" ? (report as Record<string, unknown>) : {}) as { stats?: { startTime?: unknown } };
  const start = typeof r.stats?.startTime === "string" ? r.stats.startTime : "";
  const startTime = start && !Number.isNaN(Date.parse(start)) ? new Date(start) : null;
  const ran = tests.filter((t) => t.status !== "skipped");

  // 1) An auto fixture attaches something to every test: one attachment name present on every test that ran.
  let auto: ReportCheck;
  if (ran.length < 3) {
    auto = { ok: false, message: `Only ${ran.length} test run${ran.length === 1 ? "" : "s"} in this report. Run at least 3 tests so an auto fixture can show up on all of them.` };
  } else {
    const counts = new Map<string, number>();
    for (const t of ran) for (const n of new Set(t.attachments)) counts.set(n, (counts.get(n) ?? 0) + 1);
    const everywhere = [...counts.entries()].find(([, c]) => c === ran.length);
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    auto = everywhere
      ? { ok: true, message: `All ${ran.length} test runs have a “${everywhere[0]}” attachment.` }
      : best
        ? { ok: false, message: `“${best[0]}” is attached to ${best[1]} of ${ran.length} test runs. Attach it from an { auto: true } fixture so every test gets it.` }
        : { ok: false, message: "No test has an attachment. In an { auto: true } fixture, call testInfo.attach('console', { body }) after await use()." };
  }

  // 2) A worker fixture: tests in one worker share one account, and different workers have different accounts.
  let worker: ReportCheck;
  const withAccount = ran.filter((t) => t.workerIndex !== null && annotationValues(t, "account").length);
  const byWorker = new Map<number, Set<string>>();
  for (const t of withAccount) {
    const set = byWorker.get(t.workerIndex!) ?? new Set<string>();
    for (const v of annotationValues(t, "account")) set.add(v);
    byWorker.set(t.workerIndex!, set);
  }
  const workers = [...byWorker.keys()].sort((a, b) => a - b);
  const mixed = workers.find((w) => byWorker.get(w)!.size > 1);
  const accounts = workers.map((w) => [...byWorker.get(w)!][0]);
  const shared = accounts.find((a, i) => accounts.indexOf(a) !== i);
  if (!withAccount.length) {
    worker = { ok: false, message: "No test has an “account” annotation. Push one from a test fixture that uses your worker account: test.info().annotations.push({ type: 'account', description: account.email })." };
  } else if (workers.length < 2) {
    worker = { ok: false, message: "All account-annotated tests ran in one worker. Run with workers: 2 (or more) so accounts can be compared." };
  } else if (mixed !== undefined) {
    worker = { ok: false, message: `Worker ${mixed} used ${byWorker.get(mixed)!.size} different accounts. A worker-scoped fixture is set up once per worker, so its tests share one.` };
  } else if (shared) {
    const ws = workers.filter((w) => [...byWorker.get(w)!][0] === shared);
    const list = ws.length > 2 ? `${ws.slice(0, -1).join(", ")} and ${ws[ws.length - 1]}` : ws.join(" and ");
    worker = { ok: false, message: `Workers ${list} ${ws.length > 2 ? "all" : "both"} used ${shared}. Build the account from workerInfo.workerIndex.` };
  } else {
    worker = { ok: true, message: `${workers.length} workers, ${workers.length} accounts: each worker kept its own (${accounts.slice(0, 3).join(", ")}${accounts.length > 3 ? ", …" : ""}).` };
  }

  // 3) An option fixture: the "currency" annotation differs between projects.
  let option: ReportCheck;
  const byProject = new Map<string, Set<string>>();
  for (const t of ran) for (const v of annotationValues(t, "currency")) byProject.set(t.project, (byProject.get(t.project) ?? new Set<string>()).add(v));
  const single = [...byProject.entries()].filter(([, v]) => v.size === 1).map(([p, v]) => [p, [...v][0]] as const);
  const distinct = new Set(single.map(([, v]) => v));
  if (!byProject.size) {
    option = { ok: false, message: "No test has a “currency” annotation. From the fixture that reads your currency option, push { type: 'currency', description: currency }." };
  } else if (byProject.size < 2) {
    option = { ok: false, message: `Only the “${[...byProject.keys()][0] || "default"}” project reported a currency. Add a second project that sets a different currency in use: { currency: 'EUR' }.` };
  } else if (distinct.size < 2) {
    option = { ok: false, message: `Every project used ${[...distinct][0] ?? "the same currency"}. Set the option to a different value in each project.` };
  } else {
    option = { ok: true, message: `The currency option changes per project: ${single.map(([p, v]) => `${p || "default"} → ${v}`).join(", ")}.` };
  }

  return { checks: { "fx-auto": auto, "fx-worker": worker, "fx-option": option }, tests: tests.length, startTime };
}
