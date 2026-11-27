#!/usr/bin/env node
// Renders a Thedappled LinkedIn card (1080 × 1350 PNG, dark style) from a small JSON spec.
//
//   node make-card.mjs spec.json [out.png]
//
// spec.json:
// {
//   "slug": "playwright-annotations",              // default output: public/social/linkedin/<slug>.png
//   "brand": "Testing learning path",              // after "Thedappled ·"
//   "badge": "STAGE 5 · PLAYWRIGHT ANNOTATIONS",
//   "title": "Stop commenting", "accent": "tests out.",   // two-line headline, second line green
//   "sub": "Annotate them, and prove it in a real run",
//   "items": [["test.skip", "skip on WebKit, with a reason"], ...],   // 3–5 rows
//   "mono": true,                                   // render the left column in monospace
//   "keyWidth": 190,                                // px for the left column (default 190)
//   "file": "tests/lab.spec.ts",                    // code window title (omit "code" to hide the window)
//   "code": "<span class=\"b\">test</span>(...)",   // pre-formatted HTML; classes: c (comment) b (keyword) ok (string) bad (red)
//   "link": "thedappled.com/testing/annotations"
// }
//
// Needs Google Chrome. Set CHROME_PATH if it isn't in a standard place.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [specPath, outArg] = process.argv.slice(2);
if (!specPath) {
  console.error("usage: node make-card.mjs spec.json [out.png]");
  process.exit(1);
}
const s = JSON.parse(fs.readFileSync(specPath, "utf8"));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const out = path.resolve(outArg ?? path.join("public", "social", "linkedin", `${s.slug}.png`));

const tick = '<span class="tick"><svg viewBox="0 0 20 20" fill="none" stroke="#0B1120" stroke-width="3"><path d="M4 10.5l4 4 8-9"/></svg></span>';
const items = (s.items ?? [])
  .map(([k, v]) => `<li>${tick}<span class="k"${s.mono ? ` style="font-family:'JetBrains Mono',monospace"` : ""}>${esc(k)}</span><span class="v">${esc(v)}</span></li>`)
  .join("");
const codeBox = s.code
  ? `<div class="code"><div class="bar"><span class="dot" style="background:#F87171"></span><span class="dot" style="background:#FBBF24"></span><span class="dot" style="background:#34D399"></span><span class="file">${esc(s.file ?? "")}</span></div><pre>${s.code}</pre></div>`
  : "";

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1350px; }
  body { font-family: Inter, sans-serif; color: #F8FAFC; padding: 72px;
    background: radial-gradient(900px 700px at 100% 0%, rgba(16,185,129,0.22), transparent 60%), #0B1120; position: relative; overflow: hidden; }
  .brand { font-size: 30px; color: #94A3B8; } .brand b { color: #fff; font-weight: 700; }
  .badge { display: inline-block; margin-top: 26px; padding: 9px 18px; border: 2px solid rgba(16,185,129,.55); background: rgba(16,185,129,.12);
    color: #34D399; border-radius: 999px; font-weight: 600; font-size: 19px; letter-spacing: .5px; }
  h1 { margin-top: 26px; font-size: 84px; line-height: 1.02; font-weight: 900; letter-spacing: -2.5px; }
  h1 .g { color: #10B981; }
  .sub { margin-top: 22px; font-size: 27px; color: #94A3B8; }
  ul { list-style: none; margin-top: 34px; }
  li { display: grid; grid-template-columns: 52px ${Number(s.keyWidth ?? 190)}px 1fr; align-items: center; height: 46px; font-size: 24px; }
  .tick { width: 32px; height: 32px; border-radius: 7px; background: #10B981; display: flex; align-items: center; justify-content: center; }
  .tick svg { width: 20px; height: 20px; }
  .k { color: #94A3B8; } .v { font-weight: 600; }
  .code { position: absolute; left: 72px; right: 72px; top: 820px; border: 1px solid #1E293B; border-radius: 18px; background: #070B15; overflow: hidden; }
  .bar { display: flex; align-items: center; gap: 10px; padding: 18px 22px; border-bottom: 1px solid #1E293B; }
  .dot { width: 14px; height: 14px; border-radius: 50%; }
  .file { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 15px; color: #64748B; }
  pre { font-family: 'JetBrains Mono', monospace; font-size: 22px; line-height: 1.6; padding: 24px 30px 26px; color: #E2E8F0; }
  .c { color: #64748B; } .b { color: #60A5FA; } .ok { color: #34D399; } .bad { color: #F87171; }
  .link { position: absolute; left: 72px; bottom: 58px; font-size: 30px; font-weight: 700; color: #10B981; }
</style></head>
<body>
  <p class="brand"><b>Thedappled</b> · ${esc(s.brand ?? "")}</p>
  <span class="badge">${esc(s.badge ?? "")}</span>
  <h1>${esc(s.title ?? "")}<br><span class="g">${esc(s.accent ?? "")}</span></h1>
  <p class="sub">${esc(s.sub ?? "")}</p>
  <ul>${items}</ul>
  ${codeBox}
  <p class="link">${esc(s.link ?? "thedappled.com")}</p>
</body></html>`;

const tmp = path.join(os.tmpdir(), `card-${s.slug ?? "x"}-${Date.now()}.html`);
fs.writeFileSync(tmp, html);
fs.mkdirSync(path.dirname(out), { recursive: true });

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
// Cloud / CI: fall back to a Chromium installed by `npx playwright install chromium`.
const pwCache = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), ".cache", "ms-playwright");
if (fs.existsSync(pwCache)) {
  for (const d of fs.readdirSync(pwCache).filter((n) => n.startsWith("chromium")).sort().reverse()) {
    for (const rel of ["chrome-linux/chrome", "chrome-linux64/chrome", "chrome-win/chrome.exe", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
      candidates.push(path.join(pwCache, d, rel));
    }
  }
}
const chrome = candidates.find((c) => fs.existsSync(c));
if (!chrome) {
  console.error("Chrome not found. Set CHROME_PATH, or run: npx -y playwright@1.49.1 install --with-deps chromium");
  process.exit(1);
}
const linuxFlags = process.platform === "linux" ? ["--no-sandbox", "--disable-dev-shm-usage"] : []; // containers run as root
execFileSync(chrome, [...linuxFlags, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1080,1350", `--screenshot=${out}`, pathToFileURL(tmp).href], { stdio: "ignore" });
fs.rmSync(tmp, { force: true });
const size = fs.statSync(out).size;
console.log(`${out} (${size} bytes)${size > 5 * 1024 * 1024 ? "  WARNING: over 5 MB" : ""}`);
