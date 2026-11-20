import { recordRepoChecks, type AssignmentStatus } from "@/lib/assignments";
import { demoCredentials } from "@/lib/framework-creds";
import { evaluateRepo, loadRepo, parseRepoUrl, RepoError, type RepoResult } from "@/lib/repo-scan";

export type RepoCheckOutcome = { repo: string; branch: string; checks: RepoResult; assignment: AssignmentStatus | null };

// Scans the learner's repository and records the passing checks on their assignment.
// Throws RepoError (with an HTTP status) for anything the learner can act on.
export async function checkRepoForAssignment(token: string, repoUrl: string): Promise<RepoCheckOutcome> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new RepoError("Enter a public GitHub repository URL, like https://github.com/you/your-repo.", 400);

  const { snapshot, branch } = await loadRepo(parsed);
  const checks = await evaluateRepo(snapshot, demoCredentials(token).password);
  const repo = `${parsed.owner}/${parsed.repo}`;
  const assignment = await recordRepoChecks(token, repo, {
    "repo-config": checks["repo-config"].ok,
    "repo-ignore": checks["repo-ignore"].ok,
    "repo-ci": checks["repo-ci"].ok,
  });
  return { repo, branch, checks, assignment };
}
