import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../constants/appConstants';

export interface OrderCriteria {
  symbol: string;
  orderType?: string;
  tif?: string;
  quantity?: string;
  status?: string;
}

export class OrdersPage extends BasePage {
  readonly ordersLink: Locator;
  readonly executedTab: Locator;
  readonly rejectedTab: Locator;
  private readonly orderBookTable: Locator;

  constructor(page: Page) {
    super(page);
    this.ordersLink = page.getByRole('link', { name: /orders/i });
    this.executedTab = page.getByRole('tab', { name: /executed/i });
    this.rejectedTab = page.getByRole('tab', { name: /rejected/i });
    this.orderBookTable = page.locator('table, div').filter({ hasText: /Order Book|Orders/i }).first();
  }

  async navigateToOrders(): Promise<void> {
    await this.click(this.ordersLink);
    await this.waitForState(this.orderBookTable, 'visible', TIMEOUTS.NAVIGATION_TIMEOUT);
  }

  async viewExecutedOrders(): Promise<void> {
    await this.click(this.executedTab);
  }

  async viewRejectedOrders(): Promise<void> {
    await this.click(this.rejectedTab);
  }

  async verifyOrderInBook(criteria: OrderCriteria): Promise<void> {
    // Build selector for the order row containing the symbol
    let selector = this.page.locator('tr, [class*="order-row"], [class*="row"]').filter({ hasText: criteria.symbol });

    // Add additional filters for order type, TIF, quantity
    if (criteria.orderType) {
      selector = selector.filter({ hasText: new RegExp(criteria.orderType, 'i') });
    }
    if (criteria.tif) {
      selector = selector.filter({ hasText: new RegExp(criteria.tif, 'i') });
    }
    if (criteria.quantity) {
      selector = selector.filter({ hasText: criteria.quantity });
    }

    const orderRow = selector.first();
    await expect(orderRow).toBeVisible({ timeout: TIMEOUTS.LONG_WAIT });

    if (criteria.status) {
      await expect(orderRow).toContainText(new RegExp(criteria.status, 'i'));
    }
  }

  async captureOrderDetails(symbol: string): Promise<string> {
    const orderRow = this.page.locator('tr, div, li').filter({ hasText: symbol }).first();
    return (await orderRow.textContent()) ?? '';
  }
}
