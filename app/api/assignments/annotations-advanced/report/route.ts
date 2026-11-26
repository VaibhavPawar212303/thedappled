import { ANNOTATIONS_ADVANCED } from "@/lib/assignments";
import { evaluateAdvancedReport } from "@/lib/ann-report";
import { reportHandler } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";

export const POST = reportHandler(ANNOTATIONS_ADVANCED, evaluateAdvancedReport);
