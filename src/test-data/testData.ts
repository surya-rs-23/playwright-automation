/**
 * Strong, typed test data inputs for Playwright automation tests.
 * Decouples user information, watchlists, and stock data from tests/locators.
 */
export const defaultUser = {
  username: 'Surya',
  password: 'Test@1234',
  otp: '0000',
} as const;

export const defaultWatchlistName = 'Retail';
export const defaultStockQuery = '1030';
export const defaultMarketAccount = '-1-Mikahel';
export const defaultLimitSourceAccount = '-2-mekhel';
export const defaultLimitTargetAccount = '-1-Mikahel';

export const defaultAdvancedBuyOrder = {
  accountName: '-1-Mikahel',
  quantity: '50000',
  orderType: 'Limit' as const,
  advancedOptions: {
    minFill: '05000',
    disclosedQty: '5000',
    timeInForce: 'Day' as const,
  },
} as const;
