import { FIXTURES_ADVANCED } from "@/lib/assignments";
import { statusHandlers } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";

// Stage 7 is Playwright only: any ?tool= is ignored.
const handlers = statusHandlers(FIXTURES_ADVANCED);
export const GET = handlers.GET;
export const POST = handlers.POST;
