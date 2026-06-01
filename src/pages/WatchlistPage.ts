import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object representing the Watchlist management page.
 * Provides APIs to create watchlists, search and add stocks, and execute buy orders.
 */
export class WatchlistPage extends BasePage {
  // Encapsulated UI locators
  private readonly watchlistLink: Locator;
  private readonly settingsIcon: Locator;
  private readonly createWatchlistBtn: Locator;
  private readonly renameInput: Locator;
  private readonly saveBtn: Locator;
  private readonly searchInput: Locator;
  private readonly buyImg: Locator;
  private readonly combobox: Locator;
  private readonly buyBtn: Locator;
  private readonly imgNth3: Locator;
  private readonly limitLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.watchlistLink = page.getByRole('link', { name: 'Watchlist' });
    this.settingsIcon = page.locator('#settings-icon').getByRole('img');
    this.createWatchlistBtn = page.getByRole('button', { name: 'Create Watchlist' });
    this.renameInput = page.locator('#rename-input');
    this.saveBtn = page.getByRole('button', { name: 'Save' });
    this.searchInput = page.getByRole('textbox', { name: 'Search eg: Saudi Aramco' });
    
    // Legacy generic locators maintained for backward compatibility
    this.buyImg = page.locator('.absolute.right-3 > div > img').filter({ visible: true }).first();
    this.combobox = page.getByRole('combobox').filter({ visible: true }).first();
    this.buyBtn = page.getByRole('button', { name: 'Buy' });
    this.imgNth3 = page.locator('img').filter({ visible: true }).nth(3);
    this.limitLabel = page.locator('label').filter({ hasText: 'Limit' });
  }

  /**
   * Helper to retrieve a table or block row containing the specified stock.
   * Parameterizing this locator makes it robust against dynamic DOM lists.
   */
  private getStockRow(stockSymbol: string): Locator {
    return this.page.locator('table tr, div, li').filter({ hasText: stockSymbol }).first();
  }

  /**
   * Helper to identify the Buy Action image/button within a specific stock row.
   * Eliminates the fragile nth(3) or first() selector indexing.
   */
  private getBuyButtonInRow(rowLocator: Locator): Locator {
    return rowLocator.locator('img, button').filter({ visible: true }).first();
  }

  /**
   * Navigates to the Watchlist tab.
   */
  async navigateToWatchlist(): Promise<void> {
    await this.click(this.watchlistLink);
  }

  /**
   * Creates a new watchlist by name.
   * Replaced static sleep (waitForTimeout) with a state wait checking for modal save button to close.
   */
  async createWatchlist(name: string): Promise<void> {
    await this.navigateToWatchlist();
    await this.click(this.settingsIcon);
    await this.click(this.createWatchlistBtn);
    await this.fill(this.renameInput, name);
    await this.click(this.saveBtn);

    // Dynamic wait: Wait for the save button to disappear (signaling modal closure)
    await this.waitForState(this.saveBtn, 'hidden');
  }

  /**
   * Searches for a stock and adds it to the watchlist.
   * Parameterizes the stock search queries and the target display name.
   * 
   * @param query The search text (e.g., '1' or stock code)
   * @param stockDisplayName The target option name to select (e.g., 'SAIB - Saudi Investment Bank')
   */
  async searchAndAddStock(query: string, stockDisplayName: string): Promise<void> {
    // Clear and type cleanly using sequenced typing to prevent front-end search race conditions
    await this.click(this.searchInput);
    await this.searchInput.clear();
    await this.type(this.searchInput, query);

    // Locate the search result row dynamically based on the display name
    const resultRow = this.page.locator('div, span, li')
      .filter({ hasText: stockDisplayName })
      .filter({ visible: true })
      .first();

    // Wait for the result row to appear dynamically (no arbitrary timeout needed)
    await this.waitForState(resultRow, 'visible');

    // Click the "+" add icon inside the row.
    // If a direct child selector isn't possible, we use a clean wrapper method.
    await this.clickAddButtonOnRow(resultRow);

    // Wait for the stock to be successfully added to the active watchlist table
    const tableRow = this.getStockRow(query);
    await this.waitForState(tableRow, 'visible');
  }

  /**
   * Helper to click the add action (typically on the far right of the row).
   * Uses bounding box coordinates if no direct class/element is available, but encapsulates it cleanly.
   */
  private async clickAddButtonOnRow(rowLocator: Locator): Promise<void> {
    const box = await rowLocator.boundingBox();
    if (box) {
      // Click at the far right offset (width - 25px) where the add button/icon sits
      await rowLocator.click({ position: { x: box.width - 25, y: box.height / 2 } });
    } else {
      await rowLocator.click();
    }
  }

  /**
   * Executes a Market Buy order for the first available stock item using a given account.
   */
  async buyStockWithAccount(accountName: string): Promise<void> {
    await this.click(this.buyImg);
    await this.click(this.combobox);

    const accountOption = this.page.getByRole('option', { name: accountName });
    await this.click(accountOption);
    await this.click(this.buyBtn);
  }

  /**
   * Executes a Limit Buy order for a specific stock in the watchlist by switching accounts.
   * Uses robust row-based selection instead of brittle nth(3) indexing.
   * 
   * @param stockSymbol The code/identifier of the stock row (e.g. defaultStockQuery)
   * @param tempAccount The initial account name to select
   * @param targetAccount The target account name to confirm
   */
  async buyLimitStockWithSwitch(stockSymbol: string, tempAccount: string, targetAccount: string): Promise<void> {
    await this.navigateToWatchlist();

    // Find the row for this specific stock dynamically
    const stockRow = this.getStockRow(stockSymbol);
    const buyButton = this.getBuyButtonInRow(stockRow);

    // If stock row doesn't resolve dynamically, fall back to legacy image click to maintain compatibility
    if (await buyButton.isVisible()) {
      await this.click(buyButton);
    } else {
      await this.click(this.imgNth3);
    }

    await this.click(this.combobox);

    // Select the temporary account option
    const tempOpt = this.page.getByText(tempAccount, { exact: true });
    await this.click(tempOpt);

    // Re-open and select the target account option
    await this.click(this.combobox);
    const targetOpt = this.page.getByRole('option', { name: targetAccount });
    await this.click(targetOpt);

    await this.click(this.limitLabel);
    await this.click(this.buyBtn);
  }
}
