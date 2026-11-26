import { ANNOTATIONS } from "@/lib/assignments";
import { statusHandlers } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";

// Stage 5 is Playwright only: any ?tool= is ignored.
const handlers = statusHandlers(ANNOTATIONS);
export const GET = handlers.GET;
export const POST = handlers.POST;
