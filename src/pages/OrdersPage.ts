import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object representing the Orders tracking page.
 * Exposes methods to navigate and switch between Executed and Rejected tabs,
 * returning Locators to allow high-level assertions in the test files.
 */
export class OrdersPage extends BasePage {
  // Elements defined as public/private locators for clean test spec assertions
  readonly ordersLink: Locator;
  readonly executedTab: Locator;
  readonly rejectedTab: Locator;

  constructor(page: Page) {
    super(page);
    this.ordersLink = page.getByRole('link', { name: 'Orders' });
    this.executedTab = page.getByText('Executed', { exact: true });
    this.rejectedTab = page.getByText('Rejected', { exact: true });
  }

  /**
   * Navigates to the Orders page.
   */
  async navigateToOrders(): Promise<void> {
    await this.click(this.ordersLink);
  }

  /**
   * Clicks and views the Executed orders list.
   */
  async viewExecutedOrders(): Promise<void> {
    await this.click(this.executedTab);
  }

  /**
   * Clicks and views the Rejected orders list.
   */
  async viewRejectedOrders(): Promise<void> {
    await this.click(this.rejectedTab);
  }

  /**
   * Executes a robust parameterized Advanced Buy order (Limit / Advanced Options) from the Chart trading panel.
   * Integrates the Balance Order and Advanced Options flow directly.
   * Completely removes codegen noise (redundant arrow keystrokes, duplicate clicks, and nested loops).
   */
  async placeAdvancedBuyOrder(options: {
    accountName: string;
    quantity: string;
    orderType: 'Limit' | 'Market';
    advancedOptions?: {
      minFill?: string;
      disclosedQty?: string;
      timeInForce?: 'Day' | 'IOC' | 'FOK';
    };
  }): Promise<void> {
    // 1. Navigate to the chart panel where the buy widget resides relative to baseURL
    await this.navigate('/home/chart');

    // 2. Define locators cleanly using standard Playwright selectors
    const buyPanelTrigger = this.page.getByRole('button', { name: 'Buy' });
    const accountCombobox = this.page.getByRole('combobox').first();
    const quantityInput = this.page.getByRole('spinbutton', { name: 'Quantity' });
    const limitRadio = this.page.getByRole('radio', { name: 'Limit' });
    const advancedOptionsBtn = this.page.getByRole('button', { name: 'Advanced Options' });
    const minFillInput = this.page.getByRole('spinbutton', { name: 'Min Fill' });
    const disclosedQtyInput = this.page.getByRole('spinbutton', { name: 'Disclosed Qty.' });
    const timeInForcePanel = this.page.locator('div').filter({ hasText: /^Time in Force/ }).first();
    const submitBuyBtn = this.page.getByText('BuyReset');

    // 3. Open Buy Order Panel
    await this.click(buyPanelTrigger);

    // 4. Select Account Option
    await this.click(accountCombobox);
    const accountOption = this.page.getByLabel(options.accountName).getByText(options.accountName);
    await this.click(accountOption);

    // 5. Fill main order properties
    await this.fill(quantityInput, options.quantity);

    if (options.orderType === 'Limit') {
      await this.click(limitRadio);
    }

    // 6. Handle Advanced Parameters if specified
    if (options.advancedOptions) {
      await this.click(advancedOptionsBtn);

      if (options.advancedOptions.minFill) {
        await this.fill(minFillInput, options.advancedOptions.minFill);
      }

      if (options.advancedOptions.disclosedQty) {
        await this.fill(disclosedQtyInput, options.advancedOptions.disclosedQty);
      }

      if (options.advancedOptions.timeInForce) {
        // Toggle the Time In Force menu cleanly
        if (await timeInForcePanel.isVisible()) {
          await this.click(timeInForcePanel);
        } else {
          await this.click(this.page.getByText('Time in ForceDay'));
        }

        // Select the desired TIF option
        const tifOption = this.page.getByLabel(`Time in Force${options.advancedOptions.timeInForce}`)
          .getByText(options.advancedOptions.timeInForce);
        await this.click(tifOption);
      }
    }

    // 7. Submit Buy Order
    await this.click(submitBuyBtn);
  }
}
