import { Page, Locator } from '@playwright/test';

export class WatchlistPage {
  readonly page: Page;
  readonly watchlistLink: Locator;
  readonly settingsIcon: Locator;
  readonly createWatchlistBtn: Locator;
  readonly renameInput: Locator;
  readonly saveBtn: Locator;
  readonly searchInput: Locator;
  readonly addStockBtn: Locator;
  readonly buyImg: Locator;
  readonly combobox: Locator;
  readonly buyBtn: Locator;
  readonly imgNth3: Locator;
  readonly limitLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.watchlistLink = page.getByRole('link', { name: 'Watchlist' });
    this.settingsIcon = page.locator('#settings-icon').getByRole('img');
    this.createWatchlistBtn = page.getByRole('button', { name: 'Create Watchlist' });
    this.renameInput = page.locator('#rename-input');
    this.saveBtn = page.getByRole('button', { name: 'Save' });
    this.searchInput = page.getByRole('textbox', { name: 'Search eg: Saudi Aramco' });
    this.addStockBtn = page.locator('text=, .w-7 > .text-primary, svg.text-primary').filter({ visible: true }).first();
    this.buyImg = page.locator('.absolute.right-3 > div > img').filter({ visible: true }).first();
    this.combobox = page.getByRole('combobox').filter({ visible: true }).first();
    this.buyBtn = page.getByRole('button', { name: 'Buy' });
    this.imgNth3 = page.locator('img').filter({ visible: true }).nth(3);
    this.limitLabel = page.locator('label').filter({ hasText: 'Limit' });
  }

  /**
   * Navigates to the Watchlist section.
   */
  async navigateToWatchlist() {
    await this.watchlistLink.click();
  }

  /**
   * Creates a new watchlist using the exactly recorded sequence of actions.
   */
  async createWatchlist(name: string) {
    await this.navigateToWatchlist();
    
    // Original recorded sequence of helper clicks
    await this.page.locator('.\\!h-\\[18px\\] > svg > path:nth-child(2)').click();
    await this.page.locator('html').click();
    await this.page.locator('button').nth(1).click();
    await this.page.locator('html').click();
    
    // Open settings and create watchlist
    await this.settingsIcon.waitFor({ state: 'visible', timeout: 10000 });
    await this.settingsIcon.click();
    await this.createWatchlistBtn.waitFor({ state: 'visible', timeout: 10000 });
    await this.createWatchlistBtn.click();
    await this.renameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.renameInput.fill(name);
    await this.saveBtn.click();
    
    // Wait for saving dialog/modal to close before dismissal clicks
    await this.renameInput.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    
    // Dismissal clicks
    await this.page.locator('html').click();
    await this.page.locator('html').click();
  }

  /**
   * Searches for a stock (two-stage input as recorded) and adds it to the watchlist.
   */
  async searchAndAddStock(tempQuery: string, finalQuery: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.searchInput.click();
    await this.searchInput.fill(tempQuery);
    
    // Optional stabilization wait between search queries
    await this.page.waitForTimeout(500);
    
    await this.searchInput.click();
    await this.searchInput.fill(finalQuery);
    
    // Wait for search result to load from API
    await this.page.waitForTimeout(2000);
    
    // Locate the specific search result row for SAIB to avoid hidden or ambiguous selectors
    const resultRow = this.page.locator('div, span, li')
      .filter({ hasText: 'SAIB - Saudi Investment Bank' })
      .filter({ visible: true })
      .first();
      
    await resultRow.waitFor({ state: 'visible', timeout: 15000 });
    
    // Get row bounding box and click the right side (where the add button icon is) dynamically
    const box = await resultRow.boundingBox();
    if (box) {
      console.log(`Clicking add button at dynamic position: x=${box.width - 25}, y=${box.height / 2}`);
      await resultRow.click({ position: { x: box.width - 25, y: box.height / 2 } });
    } else {
      // Fallback: Click the row itself
      await resultRow.click();
    }
    
    // Wait for the stock to be added and appear in the watchlist table
    console.log('Waiting for stock 1030 to appear in the watchlist table...');
    const tableRow = this.page.locator('table, tr, div').filter({ hasText: '1030' }).first();
    await tableRow.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  /**
   * Places a market Buy order for a selected account.
   */
  async buyStockWithAccount(accountName: string) {
    await this.buyImg.waitFor({ state: 'visible', timeout: 15000 });
    await this.buyImg.click();
    
    await this.combobox.waitFor({ state: 'visible', timeout: 10000 });
    await this.combobox.click();
    
    const opt = this.page.getByRole('option', { name: accountName });
    await opt.waitFor({ state: 'visible', timeout: 10000 });
    await opt.click();
    
    await this.buyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await this.buyBtn.click();
  }

  /**
   * Places a limit Buy order by switching between accounts.
   */
  async buyLimitStockWithSwitch(tempAccount: string, targetAccount: string) {
    await this.navigateToWatchlist();
    
    await this.imgNth3.waitFor({ state: 'visible', timeout: 15000 });
    await this.imgNth3.click();
    
    await this.combobox.waitFor({ state: 'visible', timeout: 10000 });
    await this.combobox.click();
    
    const tempOpt = this.page.getByLabel(tempAccount).getByText(tempAccount);
    await tempOpt.waitFor({ state: 'visible', timeout: 10000 });
    await tempOpt.click();
    
    const filteredCombobox = this.page.getByRole('combobox').filter({ hasText: tempAccount });
    await filteredCombobox.waitFor({ state: 'visible', timeout: 10000 });
    await filteredCombobox.click();
    
    const targetOpt = this.page.getByRole('option', { name: targetAccount });
    await targetOpt.waitFor({ state: 'visible', timeout: 10000 });
    await targetOpt.click();
    
    await this.limitLabel.waitFor({ state: 'visible', timeout: 10000 });
    await this.limitLabel.click();
    
    await this.buyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await this.buyBtn.click();
  }
}
