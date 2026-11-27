// Checks a learner's Playwright JSON report for the parallel runs assignment (stage 8).
// Pure: no I/O. Learners upload several reports (a normal run, a run stopped by maxFailures, a shard);
// each one passes the checks its own data proves.

import { flattenReport, type FlatTest, type ReportCheck } from "@/lib/ann-report";

export type ParallelReportStep = "par-file-parallel" | "par-serial" | "par-unique-data" | "par-max-failures" | "par-shard";
export type ParallelReportResult = { checks: Record<ParallelReportStep, ReportCheck>; tests: number; startTime: Date | null };

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const ran = (t: FlatTest) => t.status !== "skipped" && t.workerIndex !== null && t.workerIndex >= 0 && t.startMs !== null;
// A skip Playwright decided on its own (serial group or maxFailures), not one the test asked for.
const unannotatedSkip = (t: FlatTest) => t.status === "skipped" && !t.annotations.some((a) => a.type === "skip" || a.type === "fixme");
const base = (f: string) => f.split("/").pop() || f;

export function evaluateParallelReport(report: unknown): ParallelReportResult {
  const tests = flattenReport(report);
  const r = obj(report);
  const config = obj(r.config);
  const stats = obj(r.stats);
  const start = typeof stats.startTime === "string" ? stats.startTime : "";
  const startTime = start && !Number.isNaN(Date.parse(start)) ? new Date(start) : null;

  // 1) Two tests from the same file ran at the same time, in different workers.
  let fileParallel: ReportCheck = { ok: false, message: "No file had two tests running at the same time. Add test.describe.configure({ mode: 'parallel' }) (or fullyParallel: true) and use 2+ workers." };
  const byFile = new Map<string, FlatTest[]>();
  for (const t of tests.filter(ran)) byFile.set(`${t.project}\u0000${t.file}`, [...(byFile.get(`${t.project}\u0000${t.file}`) ?? []), t]);
  outer: for (const list of byFile.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (a.workerIndex === b.workerIndex) continue;
        if (a.startMs! < b.startMs! + b.durationMs && b.startMs! < a.startMs! + a.durationMs) {
          fileParallel = { ok: true, message: `In ${base(a.file)}, “${a.title}” and “${b.title}” ran at the same time in workers ${a.workerIndex} and ${b.workerIndex}.` };
          break outer;
        }
      }
    }
  }

  // 2) Serial group: a failure inside a describe block, and every later test in that block skipped by Playwright.
  let serial: ReportCheck = { ok: false, message: "No serial group stopped after a failure. In a describe block add test.describe.configure({ mode: 'serial' }) and include the broken payment step." };
  const groups = new Map<string, FlatTest[]>();
  for (const t of tests) if (t.group) groups.set(`${t.project}\u0000${t.file}\u0000${t.group}`, [...(groups.get(`${t.project}\u0000${t.file}\u0000${t.group}`) ?? []), t]);
  const failedGroups = new Set<string>();
  for (const [key, list] of groups) {
    const i = list.findIndex((t) => t.status === "unexpected");
    if (i < 0) continue;
    failedGroups.add(key);
    const after = list.slice(i + 1);
    if (after.length && after.every(unannotatedSkip)) {
      serial = { ok: true, message: `In “${list[i].group}”, “${list[i].title}” failed and the ${after.length} test${after.length === 1 ? "" : "s"} after it ${after.length === 1 ? "was" : "were"} skipped.` };
      break;
    }
    if (!serial.ok && after.some((t) => t.status !== "skipped")) {
      serial = { ok: false, message: `“${list[i].title}” failed in “${list[i].group}”, but the tests after it still ran. Make the group serial: test.describe.configure({ mode: 'serial' }).` };
    }
  }

  // 3) Unique data: an "order" annotation that contains the test's own id, and no two tests share one.
  const ordered = tests.filter((t) => t.id && t.annotations.some((a) => a.type.toLowerCase() === "order"));
  const own = ordered.filter((t) => t.annotations.some((a) => a.type.toLowerCase() === "order" && a.description?.includes(t.id)));
  const values = own.map((t) => t.annotations.find((a) => a.type.toLowerCase() === "order")!.description!);
  let unique: ReportCheck;
  if (!ordered.length) unique = { ok: false, message: "No test has an “order” annotation. Create the order as `order-${testInfo.testId}` and push { type: 'order', description: id }." };
  else if (own.length < 2) unique = { ok: false, message: `${own.length} of ${ordered.length} order IDs contain the test's own testId. Build each one from testInfo.testId.` };
  else if (new Set(values).size !== values.length) unique = { ok: false, message: "Two tests used the same order ID. testInfo.testId is different for every test; use it as is." };
  else unique = { ok: true, message: `${own.length} tests created their own order, each from its testId (e.g. ${values[0].slice(0, 40)}).` };

  // 4) maxFailures: the setting is on, the run hit it, and tests were skipped that no serial group explains.
  const maxFailures = typeof config.maxFailures === "number" ? config.maxFailures : 0;
  const failures = tests.filter((t) => t.status === "unexpected").length;
  const stopped = tests.filter((t) => unannotatedSkip(t) && !failedGroups.has(`${t.project}\u0000${t.file}\u0000${t.group}`));
  let maxF: ReportCheck;
  if (maxFailures < 1) maxF = { ok: false, message: "maxFailures was 0 in this report. Run with --max-failures=1 (or set maxFailures in the config)." };
  else if (failures < maxFailures) maxF = { ok: false, message: `maxFailures was ${maxFailures} but only ${failures} test${failures === 1 ? "" : "s"} failed, so the run never stopped. Lower it, or include the broken payment test.` };
  else if (!stopped.length) maxF = { ok: false, message: `The run reached ${maxFailures} failure${maxFailures === 1 ? "" : "s"} but nothing else was left to skip. Run more tests after the failing one.` };
  else maxF = { ok: true, message: `The run stopped after ${maxFailures} failure${maxFailures === 1 ? "" : "s"} and skipped ${stopped.length} test${stopped.length === 1 ? "" : "s"} it hadn't started.` };

  // 5) A sharded run.
  const shard = obj(config.shard);
  const total = typeof shard.total === "number" ? shard.total : 0;
  const current = typeof shard.current === "number" ? shard.current : 0;
  const shardCheck: ReportCheck =
    total >= 2
      ? { ok: true, message: `This report is shard ${current} of ${total}.` }
      : { ok: false, message: "This report isn't from a sharded run. Run with --shard=1/2 and upload that report." };

  return {
    checks: { "par-file-parallel": fileParallel, "par-serial": serial, "par-unique-data": unique, "par-max-failures": maxF, "par-shard": shardCheck },
    tests: tests.length,
    startTime,
  };
}
