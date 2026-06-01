import { test } from '@playwright/test';
import { LoginPage, WatchlistPage, OrdersPage } from '../pages';
import {
  defaultLimitSourceAccount,
  defaultLimitTargetAccount,
  defaultMarketAccount,
  defaultStockQuery,
  defaultUser,
  defaultWatchlistName,
} from '../../utils/testData';

test('Full OMS Automation Flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const watchlistPage = new WatchlistPage(page);
  const ordersPage = new OrdersPage(page);

  await loginPage.navigate();
  await loginPage.login(defaultUser.username, defaultUser.password);
  await loginPage.submitOtp(defaultUser.otp);

  await watchlistPage.createWatchlist(defaultWatchlistName);
  await watchlistPage.searchAndAddStock('1', defaultStockQuery);
  await watchlistPage.buyStockWithAccount(defaultMarketAccount);

  await ordersPage.navigateToOrders();
  await ordersPage.verifyExecutedAndRejectedOrders();

  await watchlistPage.buyLimitStockWithSwitch(defaultLimitSourceAccount, defaultLimitTargetAccount);
});
