# TUI E2E Tests (Playwright)

This repository contains end-to-end tests for the TUI booking flow using Playwright + TypeScript.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm

Install dependencies:

```bash
npm ci
```

Install Playwright browsers (first run):

```bash
npx playwright install --with-deps
```

## Test commands

- Run all tests (headed by default):

```bash
npm run test:e2e
```

- CI-style run (headed under virtual display):

```bash
npm run test:e2e:ci
```

- Open HTML report:

```bash
npm run report
```

## Headed mode strategy

CI intentionally runs in headed mode via `xvfb`:

- Workflow sets `PW_HEADED=1`
- `playwright.config.ts` maps that to `headless: false`
- Command uses `xvfb-run -a` so headed Chromium can run on Linux without a physical display

I had to do this, as headed mode has shown more stable behavior for this specific flow.

## Skip/retry logic

The booking inventory is dynamic. A hotel can become unavailable between steps.

Behavior is implemented in `tests/helpers/skip-warning.ts`:

1. When unavailability is detected, we attach a warning + reason to test artifacts.
2. If retries are still available, we throw an error to force Playwright retry.
3. On the final retry attempt, we mark the test as skipped.

I made this to achieve next goals:

- Temporary data instability gets another chance automatically.
- Persistent unavailability is reported as skipped instead of a product regression failure.

Current retry policy in `playwright.config.ts`:

- `retries: process.env.CI ? 2 : 0`

So on CI, Playwright can attempt up to 3 total runs (initial + 2 retries) before final skip behavior applies.

## CI workflow

GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on:

- Push to `main`
- Pull request to `main`
- Manual trigger (`workflow_dispatch`)

Pipeline steps:

1. Checkout
2. Setup Node
3. `npm ci`
4. `npx playwright install --with-deps`
5. Run tests headed (`npm run test:e2e:ci` with `PW_HEADED=1`)
6. Upload artifacts:
   - `playwright-report/`

## Analyzing results

Keep an eye on warnings and the attached `skip-reason` artifact to distinguish real app/test failures from live inventory volatility.
