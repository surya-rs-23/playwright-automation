import { test, expect } from '@playwright/test';
import { LoginPage, WatchlistPage, OrdersPage } from '../src/pages';
import {
  defaultLimitSourceAccount,
  defaultLimitTargetAccount,
  defaultMarketAccount,
  defaultStockQuery,
  defaultUser,
  defaultWatchlistName,
  defaultAdvancedBuyOrder,
} from '../src/test-data/testData';

test('Full OMS Automation Flow', async ({ page }) => {
  // Initialize Page Objects
  const loginPage = new LoginPage(page);
  const watchlistPage = new WatchlistPage(page);
  const ordersPage = new OrdersPage(page);

  // 1. Authentication Flow
  await loginPage.navigate();
  await loginPage.login(defaultUser.username, defaultUser.password);
  await loginPage.submitOtp(defaultUser.otp);

  // 2. Watchlist Flow - Create and Add Stock
  await watchlistPage.createWatchlist(defaultWatchlistName);
  
  // We parameterized the search input query and the exact stock display name
  await watchlistPage.searchAndAddStock('1', 'SAIB - Saudi Investment Bank');

  // 3. Purchase Stock - Market Order
  await watchlistPage.buyStockWithAccount(defaultMarketAccount);

  // 4. Order Book Verification - Navigating and Asserting states
  await ordersPage.navigateToOrders();
  await ordersPage.viewExecutedOrders();
  await expect(ordersPage.executedTab).toBeVisible(); // Strong verification inside spec

  await ordersPage.viewRejectedOrders();
  await expect(ordersPage.rejectedTab).toBeVisible(); // Strong verification inside spec

  // 5. Switch Account and Purchase Stock - Limit Order
  // Parameterized the target stock code to avoid brittle nth(3) clicks!
  await watchlistPage.buyLimitStockWithSwitch(
    defaultStockQuery, 
    defaultLimitSourceAccount, 
    defaultLimitTargetAccount
  );

  // 6. Balance Order / Advanced Options Order Flow
  await ordersPage.placeAdvancedBuyOrder(defaultAdvancedBuyOrder);
});
