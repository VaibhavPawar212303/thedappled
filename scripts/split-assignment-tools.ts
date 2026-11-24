// One-off: after the 20261124120000_assignment_tool migration, every automation assignment is marked
// "playwright". This moves each verified check to the tool that actually ran it:
//   - test-run checks: by the signals the demo page recorded (window.Cypress -> Cypress, navigator.webdriver -> Playwright)
//   - GitHub repo checks and runs with no tool signal: follow the learner's runs on that stage; with no runs,
//     the repo's config file decides (only cypress.config -> Cypress)
// A learner who used both tools on one stage gets two assignments (the Cypress one with a new token).
//
// Dry run (prints the plan, writes nothing):  npx tsx scripts/split-assignment-tools.ts
// Apply:                                       npx tsx scripts/split-assignment-tools.ts --apply

import "dotenv/config";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { AUTOMATION_SLUGS, REPO_STEPS, stepsFor, type StepId } from "../lib/assignments";
import { CYPRESS, PLAYWRIGHT, toolFromSignals, type Tool } from "../lib/tools";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

type Ev = { id: string; name: string; verified: boolean; createdAt: Date; signals: unknown };

// Which tool's config the repo has, from GitHub's file listing. Null if unknown or both.
async function toolOfRepo(repo: string | undefined): Promise<Tool | null> {
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "thedappled-migration" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const meta = await fetch(`https://api.github.com/repos/${repo}`, { headers }).then((r) => (r.ok ? r.json() : null));
    if (!meta?.default_branch) return null;
    const tree = await fetch(`https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(meta.default_branch)}?recursive=1`, { headers }).then((r) => (r.ok ? r.json() : null));
    const paths: string[] = (tree?.tree ?? []).map((n: { path: string }) => n.path);
    const pw = paths.some((p) => /(^|\/)playwright\.config\.\w+$/.test(p));
    const cy = paths.some((p) => /(^|\/)cypress\.config\.\w+$/.test(p));
    return pw === cy ? null : cy ? CYPRESS : PLAYWRIGHT;
  } catch {
    return null;
  }
}

const repoOf = (e: Ev) => ((e.signals as { repo?: unknown } | null)?.repo as string | undefined) ?? undefined;

// When the last required step was verified, or null if the stage isn't complete.
function completedAt(slug: string, events: Ev[]): Date | null {
  const verified = events.filter((e) => e.verified);
  if (verified.length < stepsFor(slug).length) return null;
  return new Date(Math.max(...verified.map((e) => e.createdAt.getTime())));
}

async function main() {
  const rows = await prisma.assignment.findMany({
    where: { slug: { in: [...AUTOMATION_SLUGS] }, tool: PLAYWRIGHT },
    include: { events: { select: { id: true, name: true, verified: true, createdAt: true, signals: true } } },
  });
  console.log(`${APPLY ? "APPLY" : "DRY RUN"}: ${rows.length} automation assignments to check\n`);

  const summary = { unchanged: 0, toCypress: 0, split: 0, skipped: 0 };

  for (const a of rows) {
    const runs = a.events.filter((e) => !REPO_STEPS.has(e.name as StepId));
    const pwRuns = runs.filter((e) => toolFromSignals(e.signals as never) === PLAYWRIGHT).length;
    const cyRuns = runs.filter((e) => toolFromSignals(e.signals as never) === CYPRESS).length;

    // Tool for checks with no tool signal of their own (repo checks, hand-driven attempts).
    let fallback: Tool = cyRuns > pwRuns ? CYPRESS : PLAYWRIGHT;
    let why = cyRuns || pwRuns ? `runs: ${pwRuns} Playwright, ${cyRuns} Cypress` : "no runs";
    if (!cyRuns && !pwRuns) {
      const repo = a.events.map(repoOf).find(Boolean);
      const fromRepo = await toolOfRepo(repo);
      if (fromRepo) { fallback = fromRepo; why = `repo ${repo} has a ${fromRepo}.config`; }
      else why = repo ? `repo ${repo}: config unclear, kept Playwright` : "no runs or repo, kept Playwright";
    }

    const toolOf = (e: Ev): Tool => (REPO_STEPS.has(e.name as StepId) ? fallback : (toolFromSignals(e.signals as never) ?? fallback));
    const cy = a.events.filter((e) => toolOf(e) === CYPRESS);
    const pw = a.events.filter((e) => toolOf(e) === PLAYWRIGHT);
    const label = `${a.userId.slice(0, 12)}… ${a.slug}`;

    if (!cy.length) { summary.unchanged++; continue; }

    if (!pw.length) {
      console.log(`→ Cypress   ${label} (${cy.length} checks; ${why})`);
      summary.toCypress++;
      if (APPLY) await prisma.assignment.update({ where: { id: a.id }, data: { tool: CYPRESS } });
      continue;
    }

    const clash = await prisma.assignment.findUnique({ where: { userId_slug_tool: { userId: a.userId, slug: a.slug, tool: CYPRESS } } });
    if (clash) { console.log(`! skipped  ${label}: a Cypress assignment already exists`); summary.skipped++; continue; }

    console.log(`⇄ split     ${label}: ${pw.length} checks stay Playwright, ${cy.length} move to a new Cypress assignment (${why})`);
    summary.split++;
    if (APPLY) {
      await prisma.$transaction(async (tx) => {
        const created = await tx.assignment.create({
          data: { userId: a.userId, slug: a.slug, tool: CYPRESS, token: randomBytes(9).toString("base64url"), startedAt: a.startedAt, completedAt: completedAt(a.slug, cy) },
        });
        await tx.assignmentEvent.updateMany({ where: { id: { in: cy.map((e) => e.id) } }, data: { assignmentId: created.id } });
        await tx.assignment.update({ where: { id: a.id }, data: { completedAt: completedAt(a.slug, pw) } });
      });
    }
  }

  console.log(`\nUnchanged (Playwright): ${summary.unchanged}`);
  console.log(`Moved to Cypress:       ${summary.toCypress}`);
  console.log(`Split across both:      ${summary.split}`);
  console.log(`Skipped:                ${summary.skipped}`);
  if (!APPLY) console.log("\nNothing was written. Re-run with --apply to make these changes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
