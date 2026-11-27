import { recordRepoChecks, toolOfToken, type AssignmentStatus } from "@/lib/assignments";
import { parseTool, type Tool } from "@/lib/tools";
import { demoCredentials } from "@/lib/framework-creds";
import { evaluateRepo, loadRepo, parseRepoUrl, RepoError, type RepoResult } from "@/lib/repo-scan";
import { evaluatePomRepo, type PomRepoResult } from "@/lib/pom-repo-scan";
import { evaluateCrossBrowserRepo, type CrossBrowserRepoResult } from "@/lib/xb-repo-scan";
import { evaluateAnnotationsRepo, type AnnotationsRepoResult } from "@/lib/ann-repo-scan";
import { evaluateAdvancedRepo, type AdvancedRepoResult } from "@/lib/ann-adv-repo-scan";
import { evaluateFixturesRepo, type FixturesRepoResult } from "@/lib/fx-repo-scan";
import { evaluateParallelRepo, type ParallelRepoResult } from "@/lib/par-repo-scan";

export type RepoCheckOutcome = { repo: string; branch: string; checks: RepoResult; assignment: AssignmentStatus | null };

// The tool of the learner's assignment decides which files each scan accepts.
const trackTool = async (token: string): Promise<Tool> => parseTool(await toolOfToken(token));

// Scans the learner's repository and records the passing checks on their assignment.
// Throws RepoError (with an HTTP status) for anything the learner can act on.
export async function checkRepoForAssignment(token: string, repoUrl: string): Promise<RepoCheckOutcome> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new RepoError("Enter a public GitHub repository URL, like https://github.com/you/your-repo.", 400);

  const { snapshot, branch } = await loadRepo(parsed);
  const checks = await evaluateRepo(snapshot, demoCredentials(token).password, await trackTool(token));
  const repo = `${parsed.owner}/${parsed.repo}`;
  const assignment = await recordRepoChecks(token, repo, {
    "repo-config": checks["repo-config"].ok,
    "repo-ignore": checks["repo-ignore"].ok,
    "repo-ci": checks["repo-ci"].ok,
  });
  return { repo, branch, checks, assignment };
}

export type PomRepoCheckOutcome = { repo: string; branch: string; checks: PomRepoResult; assignment: AssignmentStatus | null };

// Stage 3: scans for page classes, a fixture and clean specs, and records the passing checks.
export async function checkPomRepoForAssignment(token: string, repoUrl: string): Promise<PomRepoCheckOutcome> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new RepoError("Enter a public GitHub repository URL, like https://github.com/you/your-repo.", 400);

  const { snapshot, branch } = await loadRepo(parsed);
  const checks = await evaluatePomRepo(snapshot, await trackTool(token));
  const repo = `${parsed.owner}/${parsed.repo}`;
  const assignment = await recordRepoChecks(token, repo, {
    "repo-pages": checks["repo-pages"].ok,
    "repo-fixture": checks["repo-fixture"].ok,
    "repo-specs": checks["repo-specs"].ok,
  });
  return { repo, branch, checks, assignment };
}

export type CrossBrowserRepoCheckOutcome = { repo: string; branch: string; checks: CrossBrowserRepoResult; assignment: AssignmentStatus | null };

// Stage 4: scans for browser projects and a CI run on all three engines, and records the passing checks.
export async function checkCrossBrowserRepoForAssignment(token: string, repoUrl: string): Promise<CrossBrowserRepoCheckOutcome> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new RepoError("Enter a public GitHub repository URL, like https://github.com/you/your-repo.", 400);

  const { snapshot, branch } = await loadRepo(parsed);
  const checks = await evaluateCrossBrowserRepo(snapshot, await trackTool(token));
  const repo = `${parsed.owner}/${parsed.repo}`;
  const assignment = await recordRepoChecks(token, repo, {
    "repo-browsers": checks["repo-browsers"].ok,
    "repo-ci-matrix": checks["repo-ci-matrix"].ok,
  });
  return { repo, branch, checks, assignment };
}

export type AnnotationsRepoCheckOutcome = { repo: string; branch: string; checks: AnnotationsRepoResult; assignment: AssignmentStatus | null };

// Stage 5 (Playwright only): scans for forbidOnly, a @smoke run and describe/runtime annotations, and records the passing checks.
export async function checkAnnotationsRepoForAssignment(token: string, repoUrl: string): Promise<AnnotationsRepoCheckOutcome> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new RepoError("Enter a public GitHub repository URL, like https://github.com/you/your-repo.", 400);

  const { snapshot, branch } = await loadRepo(parsed);
  const checks = await evaluateAnnotationsRepo(snapshot);
  const repo = `${parsed.owner}/${parsed.repo}`;
  const assignment = await recordRepoChecks(token, repo, {
    "repo-forbid-only": checks["repo-forbid-only"].ok,
    "repo-grep-smoke": checks["repo-grep-smoke"].ok,
    "repo-describe-runtime": checks["repo-describe-runtime"].ok,
  });
  return { repo, branch, checks, assignment };
}

export type AdvancedRepoCheckOutcome = { repo: string; branch: string; checks: AdvancedRepoResult; assignment: AssignmentStatus | null };

// Stage 6 (Playwright only): scans for a callback skip, a hook fixme, a declared skip with an annotated describe,
// and a run that combines tags, and records the passing checks.
export async function checkAdvancedRepoForAssignment(token: string, repoUrl: string): Promise<AdvancedRepoCheckOutcome> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new RepoError("Enter a public GitHub repository URL, like https://github.com/you/your-repo.", 400);

  const { snapshot, branch } = await loadRepo(parsed);
  const checks = await evaluateAdvancedRepo(snapshot);
  const repo = `${parsed.owner}/${parsed.repo}`;
  const assignment = await recordRepoChecks(token, repo, {
    "repo-skip-callback": checks["repo-skip-callback"].ok,
    "repo-fixme-hook": checks["repo-fixme-hook"].ok,
    "repo-declared-skip": checks["repo-declared-skip"].ok,
    "repo-grep-combine": checks["repo-grep-combine"].ok,
  });
  return { repo, branch, checks, assignment };
}

export type FixturesRepoCheckOutcome = { repo: string; branch: string; checks: FixturesRepoResult; assignment: AssignmentStatus | null };

// Stage 7 (Playwright only): scans fixture files for teardown, mergeTests, an override and a global worker hook.
export async function checkFixturesRepoForAssignment(token: string, repoUrl: string): Promise<FixturesRepoCheckOutcome> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new RepoError("Enter a public GitHub repository URL, like https://github.com/you/your-repo.", 400);

  const { snapshot, branch } = await loadRepo(parsed);
  const checks = await evaluateFixturesRepo(snapshot);
  const repo = `${parsed.owner}/${parsed.repo}`;
  const assignment = await recordRepoChecks(token, repo, {
    "repo-fx-teardown": checks["repo-fx-teardown"].ok,
    "repo-fx-merge": checks["repo-fx-merge"].ok,
    "repo-fx-override": checks["repo-fx-override"].ok,
    "repo-fx-global": checks["repo-fx-global"].ok,
  });
  return { repo, branch, checks, assignment };
}

export type ParallelRepoCheckOutcome = { repo: string; branch: string; checks: ParallelRepoResult; assignment: AssignmentStatus | null };

// Stage 8 (Playwright only): scans for a CI shard matrix, describe modes and the parallel config.
export async function checkParallelRepoForAssignment(token: string, repoUrl: string): Promise<ParallelRepoCheckOutcome> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new RepoError("Enter a public GitHub repository URL, like https://github.com/you/your-repo.", 400);

  const { snapshot, branch } = await loadRepo(parsed);
  const checks = await evaluateParallelRepo(snapshot);
  const repo = `${parsed.owner}/${parsed.repo}`;
  const assignment = await recordRepoChecks(token, repo, {
    "repo-par-shard-ci": checks["repo-par-shard-ci"].ok,
    "repo-par-modes": checks["repo-par-modes"].ok,
    "repo-par-config": checks["repo-par-config"].ok,
  });
  return { repo, branch, checks, assignment };
}
