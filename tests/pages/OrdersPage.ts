import { Page, Locator } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  readonly ordersLink: Locator;
  readonly executedTab: Locator;
  readonly rejectedTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ordersLink = page.getByRole('link', { name: 'Orders' });
    this.executedTab = page.getByText('Executed', { exact: true });
    this.rejectedTab = page.getByText('Rejected0');
  }

  /**
   * Navigates to the Orders section.
   */
  async navigateToOrders() {
    await this.ordersLink.click();
  }

  /**
   * Clicks/verifies both Executed and Rejected tabs as in the original recording.
   */
  async verifyExecutedAndRejectedOrders() {
    await this.executedTab.click();
    await this.rejectedTab.click();
  }
}
