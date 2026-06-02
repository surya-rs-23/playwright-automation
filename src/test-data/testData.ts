/**
 * Strong, typed test data inputs for Playwright automation tests.
 * Decouples user information, watchlists, and stock data from tests/locators.
 */
export const defaultUser = {
  username: process.env.OMS_USER || 'Surya',
  password: process.env.OMS_PASSWORD || 'Test@123',
  otp: process.env.OMS_OTP || '0000',
} as const;

export const defaultWatchlistName = 'Retail';
export const defaultStock = {
  query: 'SAIB',
  displayName: 'SAIB - Saudi Investment Bank',
  symbol: 'SAIB',
} as const;

export const defaultAccounts = {
  client: '-1-AshwiniPF',
  market: '-1-Mikahel',
  limit: '-2-mekhel',
} as const;

export const defaultOrderQuantities = {
  market: '100',
  limit: '200',
  advanced: '150',
} as const;

export const defaultPrices = {
  limit: '1.00',
  gtd: '1.05',
} as const;

export const defaultOrderOptions = {
  tifDay: 'Day',
  tifGTC: 'Good till cancel',
  tifGTD: 'Good till date',
  tifIOC: 'Immediate Or Cancel',
  tifFOK: 'Fill Or Kill',
  minFill: '50',
  disclosedQty: '25',
} as const;

export const defaultTestOrders = {
  marketBuy: {
    account: defaultAccounts.market,
    quantity: defaultOrderQuantities.market,
  },
  limitBuy: {
    account: defaultAccounts.limit,
    quantity: defaultOrderQuantities.limit,
    price: defaultPrices.limit,
  },
} as const;
