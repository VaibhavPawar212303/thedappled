import { recordRepoChecks, toolOfToken, type AssignmentStatus } from "@/lib/assignments";
import { parseTool, type Tool } from "@/lib/tools";
import { demoCredentials } from "@/lib/framework-creds";
import { evaluateRepo, loadRepo, parseRepoUrl, RepoError, type RepoResult } from "@/lib/repo-scan";
import { evaluatePomRepo, type PomRepoResult } from "@/lib/pom-repo-scan";
import { evaluateCrossBrowserRepo, type CrossBrowserRepoResult } from "@/lib/xb-repo-scan";

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
