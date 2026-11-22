// Checks a learner's public GitHub repository for the page-objects assignment (stage 3).
// `evaluatePomRepo` is pure (a file listing plus a reader), so it can be tested without the network.

import { SKIP_RE, type RepoCheck, type RepoSnapshot } from "@/lib/repo-scan";

export type PomRepoResult = {
  "repo-pages": RepoCheck;
  "repo-fixture": RepoCheck;
  "repo-specs": RepoCheck;
};

const CODE_RE = /\.(ts|tsx|js|jsx|mjs|cjs|mts|cts)$/;
const SPEC_RE = /\.(spec|test|cy)\.(ts|tsx|js|jsx|mjs|cjs|mts|cts)$/;
const PAGES_DIR_RE = /(^|\/)(pages|page-objects|page_objects|pageobjects|pom)\//i;
// Where fixtures usually live: fixtures.ts, tests/fixtures/*, cypress/support/commands.ts, e2e.ts …
const FIXTURE_HINT_RE = /fixture|(^|\/)support\/|commands|(^|\/)e2e\.|base|setup|(^|\/)(tests?|e2e|cypress)\//i;
const MAX_FILES = 30;

const REQUIRED_PAGES = [
  { name: "LoginPage", re: /login|signin|sign_?in/i },
  { name: "ProductsPage", re: /products?|catalog|inventory|shop/i },
  { name: "CartPage", re: /cart|basket|checkout/i },
] as const;

const FIXTURE_RE = /\b(test|base)\.extend\s*(<|\()|\bCypress\.Commands\.add\s*\(/;
const PAGE_USE_RE = /\bnew\s+[A-Z]\w*Page\s*\(|from\s+['"][^'"]*(pages|page-objects|pom)\//;

// Raw locators that belong inside a page class, not in a spec.
const RAW_LOCATOR_RES: { re: RegExp; label: string }[] = [
  { re: /\bcy\.(get|contains|find|xpath)\s*\(/, label: "cy.$1()" },
  { re: /\.(locator|getByTestId|getByRole|getByText|getByLabel|getByPlaceholder|getByAltText|getByTitle)\s*\(/, label: "$1()" },
  { re: /\bpage\.(\$\$?|click|fill|type|check|press|hover|selectOption|waitForSelector|textContent|innerText|isVisible)\s*\(/, label: "page.$1()" },
  { re: /\[data-(testid|test|cy)=/, label: "a [data-$1=…] selector" },
];

const isComment = (line: string) => /^\s*(\/\/|\*|\/\*)/.test(line);

async function readAll(snap: RepoSnapshot, paths: string[]) {
  const out = new Map<string, string>();
  await Promise.all(
    paths.map(async (p) => {
      const t = await snap.read(p);
      if (t !== null) out.set(p, t);
    }),
  );
  return out;
}

// First raw locator in a spec, as "file:line uses cy.get()", or null if the spec is clean.
export function findRawLocator(path: string, text: string): string | null {
  const lines = text.split(/\r\n|\r|\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isComment(line)) continue;
    for (const { re, label } of RAW_LOCATOR_RES) {
      const m = re.exec(line);
      if (m) return `${path}:${i + 1} uses ${label.replace(/\$(\d)/g, (_, n) => m[Number(n)] ?? "")}`;
    }
  }
  return null;
}

export async function evaluatePomRepo(snap: RepoSnapshot): Promise<PomRepoResult> {
  const code = snap.paths.filter((p) => !SKIP_RE.test(p) && CODE_RE.test(p));
  const specs = code.filter((p) => SPEC_RE.test(p)).slice(0, MAX_FILES);
  const pageFiles = code.filter((p) => PAGES_DIR_RE.test(p) && !SPEC_RE.test(p)).slice(0, MAX_FILES);
  const fixtureFiles = code.filter((p) => !SPEC_RE.test(p) && !PAGES_DIR_RE.test(p) && FIXTURE_HINT_RE.test(p)).slice(0, MAX_FILES);
  const texts = await readAll(snap, [...new Set([...specs, ...pageFiles, ...fixtureFiles])]);

  // 1) a page class per screen, in a pages/ folder
  const classes: { name: string; file: string }[] = [];
  for (const f of pageFiles) {
    for (const m of (texts.get(f) ?? "").matchAll(/\bclass\s+([A-Za-z_]\w*)/g)) classes.push({ name: m[1], file: f });
  }
  const found = REQUIRED_PAGES.map((r) => ({ want: r.name, hit: classes.find((c) => r.re.test(c.name)) }));
  const missing = found.filter((f) => !f.hit).map((f) => f.want);
  const pages: RepoCheck = !pageFiles.length
    ? { ok: false, message: "No pages/ folder found. Put one class per screen in pages/ (e.g. tests/pages/LoginPage.ts).", found: [] }
    : missing.length
      ? {
          ok: false,
          message: `pages/ is missing a class for ${missing.join(", ")}${classes.length ? ` (found: ${classes.map((c) => c.name).join(", ")})` : " (no classes found — use export class LoginPage { … })"}.`,
          found: pageFiles,
        }
      : { ok: true, message: `Found ${found.map((f) => f.hit!.name).join(", ")} in pages/.`, found: found.map((f) => f.hit!.file) };

  // 2) a fixture (test.extend or Cypress.Commands.add) that hands the page objects to tests
  const pageNames = classes.map((c) => c.name);
  let fixtureOk: string | null = null;
  let fixtureNoPages: string | null = null;
  for (const f of fixtureFiles) {
    const t = texts.get(f) ?? "";
    if (!FIXTURE_RE.test(t)) continue;
    if (PAGE_USE_RE.test(t) || pageNames.some((n) => new RegExp(`\\b${n}\\b`).test(t))) { fixtureOk = f; break; }
    fixtureNoPages = fixtureNoPages ?? f;
  }
  const fixture: RepoCheck = fixtureOk
    ? { ok: true, message: `${fixtureOk} provides the page objects to your tests.`, found: [fixtureOk] }
    : {
        ok: false,
        message: fixtureNoPages
          ? `${fixtureNoPages} defines a fixture but doesn't create your page objects (e.g. loginPage: async ({ page }, use) => use(new LoginPage(page))).`
          : "No test.extend() or Cypress.Commands.add() found under tests/ or cypress/.",
        found: fixtureNoPages ? [fixtureNoPages] : [],
      };

  // 3) specs only talk to page objects
  let rawHit: string | null = null;
  let usesPages = false;
  for (const s of specs) {
    const t = texts.get(s) ?? "";
    rawHit = rawHit ?? findRawLocator(s, t);
    if (/\b[A-Za-z]\w*Page\b/.test(t)) usesPages = true;
  }
  const specsCheck: RepoCheck = !specs.length
    ? { ok: false, message: "No spec files found (*.spec.ts, *.test.ts or *.cy.ts).", found: [] }
    : rawHit
      ? { ok: false, message: `${rawHit} — move it into a page class.`, found: [rawHit.split(":")[0]] }
      : !usesPages
        ? { ok: false, message: "Your specs don't use any page objects yet (e.g. loginPage.signIn(…)).", found: specs }
        : { ok: true, message: `${specs.length} spec file${specs.length === 1 ? " uses" : "s use"} page objects only.`, found: specs };

  return { "repo-pages": pages, "repo-fixture": fixture, "repo-specs": specsCheck };
}
