import { FIXTURES_ADVANCED } from "@/lib/assignments";
import { evaluateFixturesReport } from "@/lib/fx-report";
import { reportHandler } from "@/lib/ann-routes";

export const dynamic = "force-dynamic";

export const POST = reportHandler(FIXTURES_ADVANCED, evaluateFixturesReport);
