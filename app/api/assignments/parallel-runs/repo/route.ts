import { PARALLEL_RUNS } from "@/lib/assignments";
import { checkParallelRepoForAssignment } from "@/lib/framework-repo-check";
import { repoHandler } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = repoHandler(PARALLEL_RUNS, checkParallelRepoForAssignment);
