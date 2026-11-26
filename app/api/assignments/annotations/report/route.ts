import { ANNOTATIONS } from "@/lib/assignments";
import { evaluateAnnotationsReport } from "@/lib/ann-report";
import { reportHandler } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";

export const POST = reportHandler(ANNOTATIONS, evaluateAnnotationsReport);
