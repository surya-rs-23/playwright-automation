import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WatchlistPage extends BasePage {
  readonly watchlistLink: Locator;
  readonly settingsIcon: Locator;
  readonly createWatchlistBtn: Locator;
  readonly renameInput: Locator;
  readonly saveBtn: Locator;
  readonly searchInput: Locator;
  readonly buyImg: Locator;
  readonly combobox: Locator;
  readonly buyBtn: Locator;
  readonly imgNth3: Locator;
  readonly limitLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.watchlistLink = page.getByRole('link', { name: 'Watchlist' });
    this.settingsIcon = page.locator('#settings-icon').getByRole('img');
    this.createWatchlistBtn = page.getByRole('button', { name: 'Create Watchlist' });
    this.renameInput = page.locator('#rename-input');
    this.saveBtn = page.getByRole('button', { name: 'Save' });
    this.searchInput = page.getByRole('textbox', { name: 'Search eg: Saudi Aramco' });
    this.buyImg = page.locator('.absolute.right-3 > div > img').filter({ visible: true }).first();
    this.combobox = page.getByRole('combobox').filter({ visible: true }).first();
    this.buyBtn = page.getByRole('button', { name: 'Buy' });
    this.imgNth3 = page.locator('img').filter({ visible: true }).nth(3);
    this.limitLabel = page.locator('label').filter({ hasText: 'Limit' });
  }

  async navigateToWatchlist() {
    await this.click(this.watchlistLink);
  }

  async createWatchlist(name: string) {
    await this.navigateToWatchlist();
    await this.click(this.settingsIcon);
    await this.click(this.createWatchlistBtn);
    await this.fill(this.renameInput, name);
    await this.click(this.saveBtn);
    await this.page.waitForTimeout(1000);
  }

  async searchAndAddStock(tempQuery: string, finalQuery: string) {
    await this.fill(this.searchInput, tempQuery);
    await this.page.waitForTimeout(500);
    await this.fill(this.searchInput, finalQuery);
    await this.page.waitForTimeout(2000);

    const resultRow = this.page.locator('div, span, li').filter({
      hasText: 'SAIB - Saudi Investment Bank',
    }).filter({ visible: true }).first();

    await resultRow.waitFor({ state: 'visible', timeout: 15000 });
    const box = await resultRow.boundingBox();
    if (box) {
      await resultRow.click({ position: { x: box.width - 25, y: box.height / 2 } });
    } else {
      await resultRow.click();
    }

    const tableRow = this.page.locator('table, tr, div').filter({ hasText: finalQuery }).first();
    await tableRow.waitFor({ state: 'visible', timeout: 15000 });
  }

  async buyStockWithAccount(accountName: string) {
    await this.click(this.buyImg);
    await this.click(this.combobox);
    const opt = this.page.getByRole('option', { name: accountName });
    await this.click(opt);
    await this.click(this.buyBtn);
  }

  async buyLimitStockWithSwitch(tempAccount: string, targetAccount: string) {
    await this.navigateToWatchlist();
    await this.click(this.imgNth3);
    await this.click(this.combobox);

    const tempOpt = this.page.getByText(tempAccount, { exact: true });
    await this.click(tempOpt);

    const targetOpt = this.page.getByRole('option', { name: targetAccount });
    await this.click(targetOpt);

    await this.click(this.limitLabel);
    await this.click(this.buyBtn);
  }
}
