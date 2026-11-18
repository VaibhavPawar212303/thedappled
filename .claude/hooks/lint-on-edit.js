// PostToolUse hook: run ESLint on edited JS/TS files and report problems to Claude.
const { spawnSync } = require("child_process");
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  const file = JSON.parse(input).tool_input?.file_path || "";
  if (!/\.(ts|tsx|js|jsx|mjs)$/.test(file) || file.includes("/node_modules/")) return;
  const r = spawnSync("npx", ["eslint", file], { cwd: process.env.CLAUDE_PROJECT_DIR, encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stdout || r.stderr);
    process.exit(2);
  }
});
