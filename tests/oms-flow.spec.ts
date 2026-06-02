import { test, expect } from '@playwright/test';
import { LoginPage, WatchlistPage, TradePage, OrdersPage } from '../src/pages';
import {
  defaultUser,
  defaultWatchlistName,
  defaultStock,
  defaultAccounts,
  defaultOrderQuantities,
  defaultPrices,
  defaultOrderOptions,
} from '../src/test-data/testData';

/**
 * Production-ready OMS (Order Management System) automation flow.
 * Tests complete user journey: authentication → watchlist → stock search → multiple order types.
 *
 * This test demonstrates the clean POM pattern with:
 * - Robust authentication with transient error handling
 * - Watchlist creation and stock search
 * - Market and limit orders
 * - All 5 Time-in-Force (TIF) types
 * - Advanced orders with Min Fill and Disclosed Quantity
 * - Final order verification
 */
test('Full OMS Automation Flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const watchlistPage = new WatchlistPage(page);
  const tradePage = new TradePage(page);
  const ordersPage = new OrdersPage(page);

  // ============ STEP 1: Authentication ============
  await test.step('STEP 1: User Authentication - Login + OTP + Verify', async () => {
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
    });

    await test.step('Submit credentials and handle transient errors', async () => {
      await loginPage.login(defaultUser.username, defaultUser.password);
    });

    await test.step('Submit OTP', async () => {
      await loginPage.submitOtp(defaultUser.otp);
    });

    await test.step('Verify login success', async () => {
      await loginPage.verifyLoginSuccess();
    });
  });

  // ============ STEP 2: Watchlist Creation & Stock Search ============
  await test.step('STEP 2: Create Watchlist & Search Stock', async () => {
    await test.step('Navigate to watchlist', async () => {
      await watchlistPage.navigateToWatchlist();
    });

    await test.step(`Create watchlist "${defaultWatchlistName}"`, async () => {
      await watchlistPage.createWatchlist(defaultWatchlistName);
    });

    await test.step('Verify watchlist created', async () => {
      await watchlistPage.verifyWatchlistCreated(defaultWatchlistName);
    });

    await test.step(`Search for stock "${defaultStock.query}"`, async () => {
      await watchlistPage.searchStock(defaultStock.query);
    });

    await test.step('Add stock to watchlist', async () => {
      await watchlistPage.addStockToWatchlist(defaultStock.displayName);
    });
  });

  // ============ STEP 3: Market Buy Order ============
  await test.step('STEP 3: Place Market Buy Order', async () => {
    await test.step('Open buy panel for stock', async () => {
      await watchlistPage.openBuyPanelForStock(defaultStock.symbol);
    });

    await test.step('Place market order', async () => {
      await tradePage.placeMarketOrder({
        client: defaultAccounts.client,
        account: defaultAccounts.market,
        orderType: 'Market',
        quantity: defaultOrderQuantities.market,
      });
    });

    await test.step('Verify market order success', async () => {
      await tradePage.verifyOrderSuccess();
    });
  });

  // ============ STEP 4: Limit Buy Order ============
  await test.step('STEP 4: Place Limit Buy Order', async () => {
    await test.step('Open buy panel for stock', async () => {
      await watchlistPage.openBuyPanelForStock(defaultStock.symbol);
    });

    await test.step('Place limit order', async () => {
      await tradePage.placeLimitOrder({
        client: defaultAccounts.client,
        account: defaultAccounts.limit,
        orderType: 'Limit',
        quantity: defaultOrderQuantities.limit,
        price: defaultPrices.limit,
      });
    });

    await test.step('Verify limit order success', async () => {
      await tradePage.verifyOrderSuccess();
    });
  });

  // ============ STEP 5: Test Time In Force (TIF) Options ============
  await test.step('STEP 5: Validate 5 Time In Force (TIF) Types', async () => {
    const tifOptions = [
      { name: defaultOrderOptions.tifDay, label: 'Day' },
      { name: defaultOrderOptions.tifGTC, label: 'GTC' },
      { name: defaultOrderOptions.tifGTD, label: 'GTD' },
      { name: defaultOrderOptions.tifIOC, label: 'IOC' },
      { name: defaultOrderOptions.tifFOK, label: 'FOK' },
    ];

    for (const tif of tifOptions) {
      await test.step(`Test TIF: ${tif.label}`, async () => {
        await watchlistPage.openBuyPanelForStock(defaultStock.symbol);
        await tradePage.placeAdvancedOrder({
          client: defaultAccounts.client,
          account: defaultAccounts.limit,
          orderType: 'Limit',
          quantity: '50',
          price: defaultPrices.limit,
          tif: tif.name,
        });
        await tradePage.verifyOrderSuccess();
      });
    }

    await test.step('Verify 5 orders placed in order book', async () => {
      await ordersPage.navigateToOrders();
      const orderCount = await ordersPage.captureOrderDetails(defaultStock.symbol);
      expect(orderCount).toBeGreaterThanOrEqual(5);
    });
  });

  // ============ STEP 6: Advanced Order Options ============
  await test.step('STEP 6: Place Advanced Order with Min Fill & Disclosed Qty', async () => {
    await test.step('Open buy panel for stock', async () => {
      await watchlistPage.openBuyPanelForStock(defaultStock.symbol);
    });

    await test.step('Place advanced order with constraints', async () => {
      await tradePage.placeAdvancedOrder({
        client: defaultAccounts.client,
        account: defaultAccounts.limit,
        orderType: 'Limit',
        quantity: defaultOrderQuantities.advanced,
        price: defaultPrices.gtd,
        tif: defaultOrderOptions.tifGTD,
        minFill: defaultOrderOptions.minFill,
        disclosedQty: defaultOrderOptions.disclosedQty,
      });
    });

    await test.step('Verify advanced order success', async () => {
      await tradePage.verifyOrderSuccess();
    });
  });

  // ============ STEP 7: Final Verification ============
  await test.step('STEP 7: Final Verification - Summary', async () => {
    await test.step('Navigate to orders page', async () => {
      await ordersPage.navigateToOrders();
    });

    await test.step('Verify market orders in book', async () => {
      await ordersPage.verifyOrderInBook({
        symbol: defaultStock.symbol,
        orderType: 'Market',
      });
    });

    await test.step('Verify limit orders in book', async () => {
      await ordersPage.verifyOrderInBook({
        symbol: defaultStock.symbol,
        orderType: 'Limit',
      });
    });

    await test.step('Test completion summary', async () => {
      console.log('✅ Full OMS Flow Completed Successfully');
      console.log(`   • Stock: ${defaultStock.symbol}`);
      console.log(`   • Market Orders: ✓ Placed`);
      console.log(`   • Limit Orders: ✓ Placed`);
      console.log(`   • TIF Types: ✓ All 5 validated`);
      console.log(`   • Advanced Options: ✓ Min Fill + Disclosed Qty`);
    });
  });
});
