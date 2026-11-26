import { ANNOTATIONS_ADVANCED } from "@/lib/assignments";
import { statusHandlers } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";

// Stage 6 is Playwright only: any ?tool= is ignored.
const handlers = statusHandlers(ANNOTATIONS_ADVANCED);
export const GET = handlers.GET;
export const POST = handlers.POST;
