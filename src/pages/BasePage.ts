import { Locator, Page } from '@playwright/test';
import { TIMEOUTS } from '../constants/appConstants';

/**
 * BasePage is the parent class for all Page Objects.
 * It encapsulates common Playwright actions (like clicking, typing, and navigating)
 * to provide centralized error handling, logging, and automatic waits.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigates to a specific application path.
   */
  protected async navigate(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Safely clicks an element after ensuring it is visible and ready.
   */
  protected async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ACTION_TIMEOUT });
    await locator.click();
  }

  /**
   * Safely fills an input field after ensuring it is visible and ready.
   */
  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ACTION_TIMEOUT });
    await locator.fill(value);
  }

  /**
   * Selects an option from a native or ARIA dropdown control.
   */
  protected async selectOption(locator: Locator, optionText: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ACTION_TIMEOUT });
    await locator.click();
    const option = this.page.getByRole('option', { name: new RegExp(optionText, 'i') }).first();
    if (!(await option.isVisible().catch(() => false))) {
      await this.page.locator(`text=${optionText}`).first().waitFor({ state: 'visible', timeout: TIMEOUTS.ACTION_TIMEOUT });
    }
    await option.click().catch(async () => {
      await this.page.locator(`text=${optionText}`).first().click();
    });
  }

  /**
   * Smartly types into an input field (simulates real keyboard input).
   * Prevents race conditions compared to sudden value assignments.
   */
  protected async type(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ACTION_TIMEOUT });
    // Use Playwright's type with a small delay to better simulate user input
    await locator.type(value, { delay: 100 });
  }

  /**
   * Waits for a locator to achieve a desired state (visible, hidden, attached, detached).
   */
  protected async waitForState(
    locator: Locator,
    state: 'visible' | 'hidden' | 'attached' | 'detached',
    timeout: number = TIMEOUTS.ACTION_TIMEOUT
  ): Promise<void> {
    await locator.waitFor({ state, timeout });
  }
}
