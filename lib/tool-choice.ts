import { cookies } from "next/headers";
import { isTool, parseTool, TOOL_COOKIE, type Tool } from "@/lib/tools";

// Which tool a page shows: ?tool= wins, then the learner's remembered choice, then the default.
export async function chosenTool(param: unknown): Promise<Tool> {
  if (isTool(param)) return param;
  const remembered = (await cookies()).get(TOOL_COOKIE)?.value;
  return parseTool(remembered);
}
