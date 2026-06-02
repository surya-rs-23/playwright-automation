import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../constants/appConstants';

/**
 * WatchlistPage manages all watchlist-related interactions.
 * Handles navigation, creation, stock search, and stock management.
 */
export class WatchlistPage extends BasePage {
  // Main navigation & structure
  private readonly watchlistNavLink: Locator;
  private readonly watchlistContainer: Locator;
  private readonly watchlistsGrid: Locator;

  // Create watchlist modal
  private readonly createWatchlistButton: Locator;
  private readonly watchlistNameInput: Locator;
  private readonly saveWatchlistButton: Locator;

  // Search & stock management
  private readonly stockSearchInput: Locator;
  private readonly buyButton: Locator;

  constructor(page: Page) {
    super(page);
    // Navigation
    this.watchlistNavLink = page.getByRole('link', { name: /^watchlist$/i });
    this.watchlistContainer = page.locator('[class*="watchlist"], div').filter({ hasText: /watchlist/i }).first();
    this.watchlistsGrid = page.locator('[class*="grid"], [class*="list"]').filter({ hasText: /retail|watchlist/i }).first();

    // Create watchlist
    this.createWatchlistButton = page.getByRole('button', { name: /create watchlist|add watchlist|create new/i }).first();
    this.watchlistNameInput = page.locator('input[name*="name"], input[placeholder*="watchlist"], input[placeholder*="Watchlist"]').first();
    this.saveWatchlistButton = page.getByRole('button', { name: /^save$/i }).first();

    // Stock search
    this.stockSearchInput = page.getByPlaceholder(/search|search eg/i);
    this.buyButton = page.getByRole('button', { name: /^buy$/i }).last();
  }

  /**
   * Navigate to the watchlist section from the main menu.
   */
  async navigateToWatchlist(): Promise<void> {
    await this.waitForState(this.watchlistNavLink, 'visible', TIMEOUTS.ACTION_TIMEOUT);
    await this.click(this.watchlistNavLink);
    await this.waitForState(this.watchlistContainer, 'visible', TIMEOUTS.NAVIGATION_TIMEOUT);
  }

  /**
   * Create a new watchlist with the given name.
   */
  async createWatchlist(name: string): Promise<void> {
    await this.navigateToWatchlist();
    await this.waitForState(this.createWatchlistButton, 'visible', TIMEOUTS.ACTION_TIMEOUT);
    await this.click(this.createWatchlistButton);
    await this.fill(this.watchlistNameInput, name);
    await this.click(this.saveWatchlistButton);
  }

  /**
   * Verify that a watchlist was created by looking for its name in the UI.
   */
  async verifyWatchlistCreated(name: string): Promise<void> {
    const watchlistItem = this.page.locator('text=' + name).or(this.page.getByText(name));
    await this.waitForState(watchlistItem, 'visible', TIMEOUTS.LONG_WAIT);
  }

  /**
   * Search for a stock by query string.
   */
  async searchStock(query: string): Promise<void> {
    await this.click(this.stockSearchInput);
    await this.stockSearchInput.clear();
    await this.fill(this.stockSearchInput, query);
    // Allow time for search results to load
    await this.page.waitForTimeout(500);
  }

  /**
   * Add a stock to the watchlist by clicking its add/buy button in search results.
   */
  async addStockToWatchlist(stockDisplayName: string): Promise<void> {
    // Find the stock row by its display name
    const stockRow = this.page.locator('text=' + stockDisplayName).or(this.page.getByText(stockDisplayName)).first();
    await this.waitForState(stockRow, 'visible', TIMEOUTS.LONG_WAIT);

    // Find and click the add button within or near the stock row
    const addButton = stockRow.locator('.. [role="button"]').filter({ hasText: /add|buy/i }).first()
      .or(this.page.getByRole('button', { name: /add/i }).first());
    await this.click(addButton);
  }

  /**
   * Verify that a stock was added to the watchlist.
   */
  async verifyStockAdded(symbol: string): Promise<void> {
    const stockSymbol = this.page.locator('text=' + symbol).or(this.page.getByText(symbol));
    await this.waitForState(stockSymbol, 'visible', TIMEOUTS.LONG_WAIT);
  }

  /**
   * Open the buy panel for a specific stock symbol in the watchlist.
   */
  async openBuyPanelForStock(symbol: string): Promise<void> {
    const stockRow = this.page.locator('text=' + symbol).or(this.page.getByText(symbol)).first();
    await this.waitForState(stockRow, 'visible', TIMEOUTS.ACTION_TIMEOUT);
    await this.click(stockRow);

    // Wait for buy button to be visible
    await this.waitForState(this.buyButton, 'visible', TIMEOUTS.ACTION_TIMEOUT);
  }
}
