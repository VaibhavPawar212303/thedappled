import { FIXTURES_ADVANCED } from "@/lib/assignments";
import { checkFixturesRepoForAssignment } from "@/lib/framework-repo-check";
import { repoHandler } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = repoHandler(FIXTURES_ADVANCED, checkFixturesRepoForAssignment);
