# Playwright OMS Automation

A clean and maintainable Playwright automation project for the CSE OMS application.

## Project structure

- `tests/specs/` - test specifications and flows
- `tests/pages/` - page object models
- `utils/` - shared helpers and test data
- `playwright.config.ts` - Playwright configuration
- `tsconfig.json` - TypeScript compiler options

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Install Playwright browsers:
   ```bash
   npm run install:browsers
   ```

## Running tests

- `npm test` - run all tests
- `npm run test:headed` - run tests with the browser visible
- `npm run test:ui` - open the Playwright test runner UI
- `npm run test:report` - open the latest HTML report

## Continuous Integration

This repository includes a GitHub Actions workflow at `.github/workflows/playwright.yml`.
The workflow runs on `push` and `pull_request` for the `main` and `master` branches, installs dependencies, installs Playwright browsers, runs tests, and uploads both the HTML report and raw test results as artifacts.

## Adding new tests

1. Add a new spec to `tests/specs/`
2. Reuse page objects from `tests/pages/`
3. Keep selectors and waits stable using Playwright locators

## Notes

- The project uses TypeScript and Playwright best practices.
- Test results are stored in `test-results/`.
- Browser reports are stored in `playwright-report/`.
