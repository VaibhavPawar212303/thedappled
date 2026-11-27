import { COMPILER_URL } from "./dsa-footer";

// A link that opens a program in the Thedappled Compiler, ready to step through.
// The Compiler reads `code` as URL-safe base64 of the UTF-8 source (see its share links).
export function compilerRunUrl(code: string): string {
  const bytes = new TextEncoder().encode(code);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const param = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${COMPILER_URL}&code=${param}`;
}
