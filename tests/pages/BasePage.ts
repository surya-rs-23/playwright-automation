import { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async navigate(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  protected async click(locator: Locator) {
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.click();
  }

  protected async fill(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.fill(value);
  }
}
