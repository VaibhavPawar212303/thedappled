import { ANNOTATIONS } from "@/lib/assignments";
import { checkAnnotationsRepoForAssignment } from "@/lib/framework-repo-check";
import { repoHandler } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = repoHandler(ANNOTATIONS, checkAnnotationsRepoForAssignment);
