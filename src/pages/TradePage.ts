import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../constants/appConstants';

export type OrderType = 'Market' | 'Limit';
export type TimeInForce = 'Day' | 'Good till cancel' | 'Good till date' | 'Immediate Or Cancel' | 'Fill Or Kill';

export interface OrderRequest {
  client: string;
  account: string;
  orderType: OrderType;
  quantity: string;
  price?: string;
  tif?: TimeInForce;
  minFill?: string;
  disclosedQty?: string;
}

export class TradePage extends BasePage {
  private readonly portfolioDropdown: Locator;
  private readonly accountDropdown: Locator;
  private readonly marketRadio: Locator;
  private readonly limitRadio: Locator;
  private readonly quantityInput: Locator;
  private readonly priceInput: Locator;
  private readonly advancedOptionsButton: Locator;
  private readonly minFillInput: Locator;
  private readonly disclosedQtyInput: Locator;
  private readonly timeInForcePanel: Locator;
  private readonly buySubmitButton: Locator;
  private readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.portfolioDropdown = page.getByRole('combobox').nth(0);
    this.accountDropdown = page.getByRole('combobox').nth(1);
    this.marketRadio = page.getByRole('radio', { name: /market/i });
    this.limitRadio = page.getByRole('radio', { name: /limit/i });
    this.quantityInput = page.getByRole('spinbutton', { name: /quantity/i }).first();
    this.priceInput = page.locator('input[name="price"], input[placeholder*="Price"], input[aria-label*="Price"]');
    this.advancedOptionsButton = page.getByRole('button', { name: /advanced options/i });
    this.minFillInput = page.getByRole('spinbutton', { name: /min fill/i });
    this.disclosedQtyInput = page.getByRole('spinbutton', { name: /disclosed qty/i });
    this.timeInForcePanel = page.locator('div').filter({ hasText: /time in force/i }).first();
    this.buySubmitButton = page.getByRole('button', { name: /^buy$/i }).last();
    this.successToast = page.locator('text=/order.*success|successfully|submitted/i').first();
  }

  async selectClient(clientName: string): Promise<void> {
    await this.selectOption(this.portfolioDropdown, clientName);
  }

  async selectTradingAccount(accountName: string): Promise<void> {
    await this.selectOption(this.accountDropdown, accountName);
  }

  async chooseOrderType(orderType: OrderType): Promise<void> {
    if (orderType === 'Market') {
      await this.click(this.marketRadio);
    } else {
      await this.click(this.limitRadio);
    }
  }

  async setQuantity(quantity: string): Promise<void> {
    await this.fill(this.quantityInput, quantity);
  }

  async setPrice(price: string): Promise<void> {
    await this.fill(this.priceInput, price);
  }

  async openAdvancedOptions(): Promise<void> {
    await this.click(this.advancedOptionsButton);
  }

  async setMinFill(minFill: string): Promise<void> {
    await this.fill(this.minFillInput, minFill);
  }

  async setDisclosedQuantity(disclosedQty: string): Promise<void> {
    await this.fill(this.disclosedQtyInput, disclosedQty);
  }

  async selectTimeInForce(tif: TimeInForce): Promise<void> {
    // Click on the Time in Force dropdown/panel
    const tifDropdown = this.page.getByRole('button', { name: /time in force|day|tif/i }).first()
      .or(this.page.locator('[class*="tif"], [class*="time-force"]').first());
    await this.click(tifDropdown);

    // Select the specific TIF option
    const tifOption = this.page.getByRole('option', { name: new RegExp(tif, 'i') })
      .or(this.page.getByText(new RegExp(tif, 'i')).first());
    await this.waitForState(tifOption, 'visible', TIMEOUTS.ACTION_TIMEOUT);
    await this.click(tifOption);
  }

  async submitOrder(): Promise<void> {
    await this.click(this.buySubmitButton);
    await this.waitForState(this.successToast, 'visible', TIMEOUTS.LONG_WAIT);
  }

  async verifyOrderSuccess(): Promise<void> {
    await this.expectToastVisible();
  }

  private async expectToastVisible(): Promise<void> {
    await this.waitForState(this.successToast, 'visible', TIMEOUTS.LONG_WAIT);
  }

  async placeMarketOrder(order: OrderRequest): Promise<void> {
    await this.selectClient(order.client);
    await this.selectTradingAccount(order.account);
    await this.chooseOrderType('Market');
    await this.setQuantity(order.quantity);
    await this.submitOrder();
  }

  async placeLimitOrder(order: OrderRequest): Promise<void> {
    await this.selectClient(order.client);
    await this.selectTradingAccount(order.account);
    await this.chooseOrderType('Limit');
    await this.setQuantity(order.quantity);
    if (order.price) {
      await this.setPrice(order.price);
    }
    await this.submitOrder();
  }

  private async configureLimitOrder(order: OrderRequest): Promise<void> {
    await this.selectClient(order.client);
    await this.selectTradingAccount(order.account);
    await this.chooseOrderType('Limit');
    await this.setQuantity(order.quantity);
    if (order.price) {
      await this.setPrice(order.price);
    }
  }

  async placeDayOrder(order: OrderRequest): Promise<void> {
    await this.configureLimitOrder(order);
    await this.openAdvancedOptions();
    await this.selectTimeInForce('Day');
    await this.submitOrder();
  }

  async placeGTCCOrder(order: OrderRequest): Promise<void> {
    await this.configureLimitOrder(order);
    await this.openAdvancedOptions();
    await this.selectTimeInForce('Good till cancel');
    await this.submitOrder();
  }

  async placeGTDOrder(order: OrderRequest): Promise<void> {
    await this.configureLimitOrder(order);
    await this.openAdvancedOptions();
    await this.selectTimeInForce('Good till date');
    await this.submitOrder();
  }

  async placeIOCOrder(order: OrderRequest): Promise<void> {
    await this.configureLimitOrder(order);
    await this.openAdvancedOptions();
    await this.selectTimeInForce('Immediate Or Cancel');
    await this.submitOrder();
  }

  async placeFOKOrder(order: OrderRequest): Promise<void> {
    await this.configureLimitOrder(order);
    await this.openAdvancedOptions();
    await this.selectTimeInForce('Fill Or Kill');
    await this.submitOrder();
  }

  async placeAdvancedOrder(order: OrderRequest): Promise<void> {
    await this.selectClient(order.client);
    await this.selectTradingAccount(order.account);
    if (order.orderType === 'Limit') {
      await this.chooseOrderType('Limit');
      if (order.price) {
        await this.setPrice(order.price);
      }
    } else {
      await this.chooseOrderType('Market');
    }
    await this.setQuantity(order.quantity);
    await this.openAdvancedOptions();
    if (order.minFill) await this.setMinFill(order.minFill);
    if (order.disclosedQty) await this.setDisclosedQuantity(order.disclosedQty);
    if (order.tif) await this.selectTimeInForce(order.tif);
    await this.submitOrder();
  }
}
