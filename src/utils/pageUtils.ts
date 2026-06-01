import { Page } from '@playwright/test';

/**
 * Common helper functions that can be reused across any test spec or page object.
 * Helps avoid code duplication for generic web/page operations.
 */

/**
 * Captures a manual screenshot with a customized timestamp.
 * Useful for custom reporting or manual debugging steps.
 */
export async function captureScreenshot(page: Page, screenshotName: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${screenshotName}_${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Retries a specified action logic a set number of times.
 * Useful for flaky elements or third-party widgets.
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return retryAction(action, retries - 1, delayMs);
  }
}
