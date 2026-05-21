import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { OrdersPage } from './pages/OrdersPage';

test('Full OMS Automation Flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const watchlistPage = new WatchlistPage(page);
  const ordersPage = new OrdersPage(page);

  // Step 1: Navigate to the application and login using preserved credentials
  console.log('Navigating to OMS application...');
  await loginPage.navigate();
  
  console.log('Performing login...');
  await loginPage.login('Surya', 'Test@1234');
  
  console.log('Submitting OTP verification...');
  await loginPage.submitOtp('0000');

  // Step 2: Navigate to Watchlist and create the "Retail" watchlist
  console.log('Creating Watchlist: "Retail"...');
  await watchlistPage.createWatchlist('Retail');

  // Step 3: Search for a stock (e.g. 1030) and add it to the watchlist
  console.log('Searching and adding stock "1030"...');
  await watchlistPage.searchAndAddStock('1', '1030');

  // Step 4: Place a market Buy order using the "-1-Mikahel" account
  console.log('Placing a market Buy order for "-1-Mikahel"...');
  await watchlistPage.buyStockWithAccount('-1-Mikahel');

  // Step 5: Check Orders to verify Executed and Rejected lists
  console.log('Verifying order statuses on the Orders tab...');
  await ordersPage.navigateToOrders();
  await ordersPage.verifyExecutedAndRejectedOrders();

  // Step 6: Place a Limit Buy order by switching from "-2-mekhel" to "-1-Mikahel"
  console.log('Placing a Limit Buy order switching accounts...');
  await watchlistPage.buyLimitStockWithSwitch('-2-mekhel', '-1-Mikahel');
  
  console.log('Automation flow completed successfully!');
});
