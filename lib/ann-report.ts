// Checks a learner's Playwright JSON report (npx playwright test --reporter=json) for the
// annotations assignment (stage 5). Pure: no I/O, so it can be tested on its own.

export type ReportStep = "ann-skip" | "ann-fixme" | "ann-fail" | "ann-slow" | "ann-tags" | "ann-custom";
export type ReportCheck = { ok: boolean; message: string };
export type ReportResult = {
  checks: Record<ReportStep, ReportCheck>;
  tests: number; // test runs found in the report (one per test per project)
  startTime: Date | null;
};

type Annotation = { type: string; description?: string };
export type FlatTest = {
  title: string;
  file: string;
  project: string;
  tags: string[]; // without the leading "@", lower case
  annotations: Annotation[];
  expectedStatus: string; // "passed" | "failed" | "skipped" | ...
  status: string; // "expected" | "unexpected" | "skipped" | "flaky"
  lastResult: string; // the final attempt's status: "passed" | "failed" | "timedOut" | "skipped" | ...
  maxDurationMs: number;
};

// Built-in annotation types. Anything else (not starting with "_", which Playwright uses internally) is custom.
const BUILT_IN = new Set(["skip", "fixme", "fail", "slow", "only"]);
const SLOW_MS = 30_000; // the default test timeout: a test that ran longer only passed thanks to test.slow()

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown) => (typeof v === "string" ? v : "");

function annotationsOf(v: unknown): Annotation[] {
  return arr(v)
    .map(obj)
    .filter((a) => typeof a.type === "string")
    .map((a) => ({ type: str(a.type), description: typeof a.description === "string" ? a.description : undefined }));
}

const normTag = (t: string) => t.trim().replace(/^@/, "").toLowerCase();

// Flattens the report's nested suites into one entry per test per project.
export function flattenReport(report: unknown): FlatTest[] {
  const out: FlatTest[] = [];
  const walk = (suite: Record<string, unknown>, file: string) => {
    const f = str(suite.file) || file;
    for (const sp of arr(suite.specs).map(obj)) {
      const title = str(sp.title);
      const titleTags = (title.match(/@[\w-]+/g) ?? []).map(normTag);
      const specTags = arr(sp.tags).filter((t): t is string => typeof t === "string").map(normTag);
      for (const t of arr(sp.tests).map(obj)) {
        const results = arr(t.results).map(obj);
        const anns = [...annotationsOf(t.annotations), ...results.flatMap((r) => annotationsOf(r.annotations))];
        const seen = new Set<string>();
        out.push({
          title,
          file: str(sp.file) || f,
          project: str(t.projectName),
          tags: [...new Set([...specTags, ...titleTags])],
          annotations: anns.filter((a) => {
            const k = `${a.type}\u0000${a.description ?? ""}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          }),
          expectedStatus: str(t.expectedStatus),
          status: str(t.status),
          lastResult: results.length ? str(results[results.length - 1].status) : "",
          maxDurationMs: results.reduce((m, r) => Math.max(m, typeof r.duration === "number" ? r.duration : 0), 0),
        });
      }
    }
    for (const child of arr(suite.suites).map(obj)) walk(child, f);
  };
  for (const s of arr(obj(report).suites).map(obj)) walk(s, "");
  return out;
}

const has = (t: FlatTest, type: string) => t.annotations.some((a) => a.type === type);
const name = (t: FlatTest) => `“${t.title}”${t.project ? ` (${t.project})` : ""}`;

export function evaluateAnnotationsReport(report: unknown): ReportResult {
  const tests = flattenReport(report);
  const start = str(obj(obj(report).stats).startTime);
  const startTime = start && !Number.isNaN(Date.parse(start)) ? new Date(start) : null;

  // test.skip(condition, 'reason'): skipped, with a reason.
  const skipped = tests.filter((t) => has(t, "skip"));
  const skipOk = skipped.find((t) => t.status === "skipped" && t.annotations.some((a) => a.type === "skip" && a.description?.trim()));
  const skip: ReportCheck = skipOk
    ? { ok: true, message: `${name(skipOk)} was skipped: ${skipOk.annotations.find((a) => a.type === "skip")?.description}` }
    : skipped.length
      ? { ok: false, message: `${name(skipped[0])} is skipped but has no reason. Use test.skip(browserName === 'webkit', 'why it is skipped').` }
      : { ok: false, message: "No skipped test. Skip the Copy link test on WebKit: test.skip(browserName === 'webkit', 'reason'), and run the webkit project." };

  // test.fixme(): skipped and marked as to be fixed.
  const fixmes = tests.filter((t) => has(t, "fixme"));
  const fixme: ReportCheck = fixmes.length
    ? { ok: true, message: `${name(fixmes[0])} is marked fixme.` }
    : { ok: false, message: "No test is marked test.fixme. Add one for the dark-mode export, which isn't built yet." };

  // test.fail(): it ran, it failed, and that was the expected outcome.
  const fails = tests.filter((t) => has(t, "fail"));
  const failOk = fails.find((t) => t.expectedStatus === "failed" && t.status === "expected");
  const fail: ReportCheck = failOk
    ? { ok: true, message: `${name(failOk)} failed as expected (the known coupon bug).` }
    : fails.length
      ? {
          ok: false,
          message:
            fails[0].status === "skipped"
              ? `${name(fails[0])} didn't run. test.fail must run the test so the bug can be seen.`
              : `${name(fails[0])} passed, so test.fail reported it as unexpected. Assert the correct total ($72.00) so the bug makes it fail.`,
        }
      : { ok: false, message: "No test uses test.fail. Mark the SAVE10 coupon test, which hits a known bug." };

  // test.slow(): triples the timeout, so a test longer than the default 30 s passes.
  const slows = tests.filter((t) => has(t, "slow"));
  const slowOk = slows.find((t) => t.status === "expected" && t.lastResult === "passed" && t.maxDurationMs > SLOW_MS);
  const secs = (ms: number) => `${Math.round(ms / 1000)} s`;
  const slow: ReportCheck = slowOk
    ? { ok: true, message: `${name(slowOk)} passed in ${secs(slowOk.maxDurationMs)}, more than the default 30 s.` }
    : slows.length
      ? {
          ok: false,
          message:
            slows[0].lastResult === "passed"
              ? `${name(slows[0])} passed in ${secs(slows[0].maxDurationMs)}. Wait for the 40-second export to show “Export ready”.`
              : `${name(slows[0])} did not pass (${slows[0].lastResult || "no result"}). Give the “Export ready” check a 45 s timeout.`,
        }
      : tests.some((t) => t.lastResult === "timedOut")
        ? { ok: false, message: "A test timed out. Add test.slow() to the export test so it gets 90 s instead of 30 s." }
        : { ok: false, message: "No test uses test.slow. Add it to the export test, which takes about 40 seconds." };

  // Tags: at least one @smoke and one @regression test.
  const tagSet = new Set(tests.flatMap((t) => t.tags));
  const missingTags = ["smoke", "regression"].filter((t) => !tagSet.has(t));
  const tags: ReportCheck = missingTags.length
    ? { ok: false, message: `No test is tagged ${missingTags.map((t) => "@" + t).join(" or ")}. Use { tag: '@smoke' } in the test details.` }
    : { ok: true, message: `Tests are tagged @smoke and @regression (${tests.filter((t) => t.tags.length).length} tagged test runs).` };

  // A custom annotation: any type that isn't built in.
  const customT = tests.find((t) => t.annotations.some((a) => !BUILT_IN.has(a.type) && !a.type.startsWith("_") && a.description?.trim()));
  const customA = customT?.annotations.find((a) => !BUILT_IN.has(a.type) && !a.type.startsWith("_"));
  const custom: ReportCheck = customT
    ? { ok: true, message: `${name(customT)} has a custom annotation: “${customA?.type}”.` }
    : { ok: false, message: "No custom annotation with a description. Add { annotation: { type: 'issue', description: '…' } } to a test." };

  return {
    checks: { "ann-skip": skip, "ann-fixme": fixme, "ann-fail": fail, "ann-slow": slow, "ann-tags": tags, "ann-custom": custom },
    tests: tests.length,
    startTime,
  };
}

// The report must come from a run that drove the learner's lab: its start time has to be within two
// hours before the latest lab visit (or a few minutes after, for clock differences).
export const REPORT_WINDOW = { beforeMs: 2 * 60 * 60 * 1000, afterMs: 10 * 60 * 1000 };

export function reportMatchesLab(startTime: Date | null, lastLab: Date | null, now = new Date()): { ok: boolean; message: string } {
  if (!lastLab) return { ok: false, message: "Run your tests against your lab link first. The report must come from a run that opened the lab." };
  if (!startTime) return { ok: false, message: "This file has no stats.startTime. Upload the file made by --reporter=json." };
  const t = startTime.getTime();
  if (t > now.getTime() + REPORT_WINDOW.afterMs) return { ok: false, message: "This report's start time is in the future. Check your computer's clock and run again." };
  if (t < lastLab.getTime() - REPORT_WINDOW.beforeMs || t > lastLab.getTime() + REPORT_WINDOW.afterMs) {
    return { ok: false, message: "This report doesn't match your latest lab run. Run the whole suite again and upload the new results.json." };
  }
  return { ok: true, message: "" };
}
