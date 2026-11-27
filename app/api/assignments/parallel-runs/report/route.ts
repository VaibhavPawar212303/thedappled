import { PARALLEL_RUNS } from "@/lib/assignments";
import { evaluateParallelReport } from "@/lib/par-report";
import { reportHandler } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";

export const POST = reportHandler(PARALLEL_RUNS, evaluateParallelReport);
