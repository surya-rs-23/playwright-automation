import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrdersPage extends BasePage {
  readonly ordersLink: Locator;
  readonly executedTab: Locator;
  readonly rejectedTab: Locator;

  constructor(page: Page) {
    super(page);
    this.ordersLink = page.getByRole('link', { name: 'Orders' });
    this.executedTab = page.getByText('Executed', { exact: true });
    this.rejectedTab = page.getByText('Rejected', { exact: true });
  }

  async navigateToOrders() {
    await this.click(this.ordersLink);
  }

  async verifyExecutedAndRejectedOrders() {
    await this.click(this.executedTab);
    await this.click(this.rejectedTab);
  }
}
