import { PARALLEL_RUNS } from "@/lib/assignments";
import { statusHandlers } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";

// Stage 8 is Playwright only: any ?tool= is ignored.
const handlers = statusHandlers(PARALLEL_RUNS);
export const GET = handlers.GET;
export const POST = handlers.POST;
