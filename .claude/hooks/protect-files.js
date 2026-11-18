// PreToolUse hook: block edits to secrets and generated files.
const path = require("path");
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  const file = JSON.parse(input).tool_input?.file_path || "";
  const base = path.basename(file);
  const blocked =
    /^\.env(\..*)?$/.test(base) ||
    file.includes("/generated/") ||
    file.includes("/node_modules/") ||
    base === "package-lock.json";
  if (blocked) {
    console.error(`Blocked: ${file} is protected (secrets/generated/lockfile). Edit it manually if intended.`);
    process.exit(2); // exit 2 = block and show stderr to Claude
  }
});
