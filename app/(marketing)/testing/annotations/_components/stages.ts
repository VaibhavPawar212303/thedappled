// Copy for the Playwright-only stages 5-7 (annotations and fixtures), shared by their card and assignment view.
// Design: Penpot "26 - Testing Learning Path", pages "Stage 5 – Annotations", "Stage 6 – Advanced annotations", "Stage 7 – Advanced fixtures".
import { ADVANCED_STEPS, ANNOTATION_STEPS, FIXTURE_STEPS, type StepId } from "@/lib/assignments";

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

export const FX_EXAMPLE = `// tests/fixtures/auth.ts — a worker account, shared by every test in that worker
import { test as base } from '@playwright/test';

export const authTest = base.extend<{ account: { email: string } }, { workerAccount: { email: string } }>({
  workerAccount: [async ({}, use, workerInfo) => {
    await use({ email: \`worker-\${workerInfo.workerIndex}@lab.test\` });
  }, { scope: 'worker' }],
  // test-scoped view of it, so the report shows which account each test used
  account: async ({ workerAccount }, use, testInfo) => {
    testInfo.annotations.push({ type: 'account', description: workerAccount.email });
    await use(workerAccount);
  },
});

// tests/fixtures/shop.ts — an option, auto logs, an override and a global worker hook
import { test as base } from '@playwright/test';

export const shopTest = base.extend<{ currency: string; saveLogs: void }, { forEachWorker: void }>({
  currency: ['USD', { option: true }],

  saveLogs: [async ({ page }, use, testInfo) => {
    const logs: string[] = [];
    page.on('console', (m) => logs.push(\`[\${m.type()}] \${m.text()}\`));
    await use();
    await testInfo.attach('console', { body: logs.join('\\n'), contentType: 'text/plain' });  // teardown
  }, { auto: true, box: true }],

  page: async ({ page, currency }, use, testInfo) => {
    testInfo.annotations.push({ type: 'currency', description: currency });
    await page.goto(\`/testing/fixtures-advanced/lab?a=\${process.env.ASSIGNMENT_TOKEN}&currency=\${currency}\`);
    await use(page);
  },

  forEachWorker: [async ({}, use) => {
    // runs once per worker, before any test: a global beforeAll
    await use();
  }, { scope: 'worker', auto: true, title: 'worker setup' }],
});

// tests/fixtures/index.ts
import { mergeTests } from '@playwright/test';
export const test = mergeTests(authTest, shopTest);
export { expect } from '@playwright/test';

// tests/lab.spec.ts
import { test, expect } from './fixtures';

test('sign up with the worker account', async ({ page, account }) => {
  await page.getByTestId('signup-email').fill(account.email);
  await page.getByTestId('signup-submit').click();
  await expect(page.getByTestId('signed-in-as')).toHaveText(account.email);
});

test('prices use the project currency', async ({ page, currency }) => {
  await expect(page.getByTestId('store-currency')).toHaveText(currency);
});

// playwright.config.ts
workers: 2,
projects: [
  { name: 'usd', use: { currency: 'USD' } },
  { name: 'eu',  use: { currency: 'EUR' } },
],

# run, then upload results.json
npx playwright test --reporter=json > results.json`;

export type AnnSlug = "annotations" | "annotations-advanced" | "fixtures-advanced";

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
  "fixtures-advanced": {
    name: "Advanced fixtures",
    title: "Assignment: advanced fixtures",
    completeTitle: "Advanced fixtures complete!",
    completeText: "Your fixture layer cleans up, shares accounts per worker and changes per project.",
    steps: FIXTURE_STEPS,
    reportChecks: 3,
    how: [
      "Open the lab link and build fixtures in two files you merge",
      "A worker account, an auto log fixture and a currency option",
      "Run two projects with 2+ workers and --reporter=json, upload the file",
      "Push, then check the repo for teardown, mergeTests, an override and a global hook",
    ],
    example: FX_EXAMPLE,
    projects: {
      note: "The report compares workers (one account each) and projects (one currency each).",
      code: `workers: 2,
projects: [
  { name: 'usd', use: { currency: 'USD' } },
  { name: 'eu',  use: { currency: 'EUR' } },
],`,
    },
    card: {
      title: "Build a fixture layer",
      blurb: "The fixtures lab has sign-up, a store with prices per currency and a console that logs errors. Give each worker its own account, attach logs to every test, and set the currency per project.",
      points: ["Auto, worker and option fixtures prove themselves in your report", "Your report shows one account per worker", "Teardown, mergeTests and overrides checked on GitHub"],
      checksLine: "1 lab run · 3 from your report · 4 GitHub checks",
      minutes: "Takes about 60 minutes · finish stage 3 first",
    },
  },
};
