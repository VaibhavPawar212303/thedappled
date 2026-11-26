// Copy for the two Playwright-only annotation stages (5 and 6), shared by their card and assignment view.
// Design: Penpot "26 - Testing Learning Path", pages "Stage 5 – Annotations" and "Stage 6 – Advanced annotations".
import { ADVANCED_STEPS, ANNOTATION_STEPS, type StepId } from "@/lib/assignments";

export const ANN_EXAMPLE = `// tests/lab.spec.ts
import { test, expect } from '@playwright/test';

test.describe('annotations lab', { tag: '@lab' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(\`/testing/annotations/lab?a=\${process.env.ASSIGNMENT_TOKEN}\`);
  });

  test('SAVE10 takes 10% off', {
    tag: '@smoke',
    annotation: { type: 'issue', description: 'SAVE10 gives 20% off' },
  }, async ({ page }) => {
    test.fail(); // known bug
    await page.getByTestId('coupon-input').fill('SAVE10');
    await page.getByTestId('coupon-apply').click();
    await expect(page.getByTestId('order-total')).toHaveText('$72.00');
  });

  test('export CSV', { tag: '@regression' }, async ({ page }) => {
    test.slow(); // 90 s instead of 30 s
    await page.getByTestId('export-button').click();
    await expect(page.getByTestId('export-status'))
      .toHaveText('Export ready', { timeout: 45_000 });
  });

  test.fixme('dark-mode export', async () => {});

  test('copy link', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Clipboard is not supported on WebKit');
    test.info().annotations.push({ type: 'browser', description: browserName });
    await page.getByTestId('copy-link').click();
    await expect(page.getByTestId('copy-status')).toHaveText('Link copied');
  });
});

// playwright.config.ts
export default defineConfig({
  forbidOnly: !!process.env.CI,
  use: { baseURL: process.env.BASE_URL },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});

# run, then upload results.json
npx playwright test --reporter=json > results.json

# .github/workflows/tests.yml
      - run: npx playwright test --grep @smoke
        env:
          BASE_URL: \${{ secrets.BASE_URL }}
          ASSIGNMENT_TOKEN: \${{ secrets.ASSIGNMENT_TOKEN }}`;

export const ADV_EXAMPLE = `// tests/advanced.spec.ts
import { test, expect } from '@playwright/test';

const lab = () => \`/testing/annotations-advanced/lab?a=\${process.env.ASSIGNMENT_TOKEN}\`;

test.describe('charts', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Charts need Chromium');
  test.beforeEach(async ({ page }) => { await page.goto(lab()); });

  test('revenue chart shows 6 months', async ({ page }) => {
    await expect(page.getByTestId('chart-bar')).toHaveCount(6);
  });
});

test.describe('settings', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.fixme(isMobile, 'Settings are not on mobile yet');
    await page.goto(lab());
  });

  test('turn on email alerts', async ({ page }) => {
    await page.getByTestId('setting-email').click();
    await expect(page.getByTestId('setting-email')).toBeChecked();
  });
});

test.describe('reports', {
  annotation: { type: 'category', description: 'report' },
}, () => {
  test.beforeEach(async ({ page }) => { await page.goto(lab()); });

  test('daily summary @fast', {
    annotation: [
      { type: 'issue', description: 'https://github.com/you/app/issues/58' },
      { type: 'owner', description: 'reports team' },
    ],
  }, async ({ page }) => {
    test.info().annotations.push({ type: '_runId', description: String(Date.now()) });
    await expect(page.getByTestId('report-daily')).toBeVisible();
  });

  test('full year report @slow', async ({ page }) => {
    await expect(page.getByTestId('report-year')).toBeVisible();
  });

  test.skip('export to PDF', async ({ page }) => {
    // written, not ready to run
  });
});

// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'mobile',   use: { ...devices['Pixel 7'] } },
],

# run all three, then upload results.json
npx playwright test --reporter=json > results.json

# .github/workflows/tests.yml (Linux runner: no escaping needed)
      - run: npx playwright test --grep "@fast|@slow"
# On Windows PowerShell: npx playwright test --grep --% "@fast^|@slow"`;

export type AnnSlug = "annotations" | "annotations-advanced";

type StageCopy = {
  name: string; // breadcrumb label
  title: string; // assignment page heading
  completeTitle: string;
  completeText: string;
  steps: { id: StepId; group: string; label: string }[];
  reportChecks: number;
  how: string[];
  example: string;
  projects?: { note: string; code: string };
  card: { title: string; blurb: string; points: string[]; checksLine: string; minutes: string };
};

export const ANN_STAGES: Record<AnnSlug, StageCopy> = {
  annotations: {
    name: "Playwright annotations",
    title: "Assignment: Playwright annotations",
    completeTitle: "Annotations assignment complete!",
    completeText: "Every annotation proved itself in a real run, and CI runs your @smoke tests.",
    steps: ANNOTATION_STEPS,
    reportChecks: 6,
    how: [
      "Open the lab link and write one test per lab panel",
      "Add the annotation each panel needs",
      "Run all projects with --reporter=json and upload the file",
      "Push, add forbidOnly and a @smoke CI run, then check the repo",
    ],
    example: ANN_EXAMPLE,
    card: {
      title: "Annotate a real test suite",
      blurb: "The annotations lab has a known bug, a slow export, an unfinished feature and a button WebKit can’t use. Annotate each test, upload your JSON report, and push the suite.",
      points: ["Each built-in annotation proves itself in a real run", "Tags and custom annotations show up in your report", "CI runs a @smoke subset and blocks a stray test.only"],
      checksLine: "1 lab run · 6 from your report · 3 GitHub checks",
      minutes: "Takes about 45–60 minutes",
    },
  },
  "annotations-advanced": {
    name: "Advanced annotations",
    title: "Assignment: advanced annotations",
    completeTitle: "Advanced annotations complete!",
    completeText: "Your groups skip and fixme per project, and CI combines tags with --grep.",
    steps: ADVANCED_STEPS,
    reportChecks: 5,
    how: [
      "Open the lab link and write a describe block per lab area",
      "Skip the charts group off Chromium and fixme settings on mobile",
      "Run chromium, firefox and mobile with --reporter=json, upload the file",
      "Push, add a combined --grep run in CI, then check the repo",
    ],
    example: ADV_EXAMPLE,
    projects: {
      note: "The group checks compare projects: a group must be skipped (or fixme) in one and run in another.",
      code: `projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'mobile',   use: { ...devices['Pixel 7'] } },
],`,
    },
    card: {
      title: "Annotate whole groups",
      blurb: "The advanced lab has Chromium-only charts, a settings page that doesn’t work on mobile yet and a reports list to tag. Run three projects, upload your report, and push the suite.",
      points: ["Group skip and hook fixme prove themselves per project", "Several annotations, title tags and a hidden one in your report", "CI combines tags with OR or AND in --grep"],
      checksLine: "1 lab run · 5 from your report · 4 GitHub checks",
      minutes: "Takes about 45–60 minutes · finish stage 5 first",
    },
  },
};
