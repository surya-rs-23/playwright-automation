/**
 * Centralized constant values for the test automation framework.
 * Keeping these separate makes it extremely easy to update global values (like routes and timeouts) in one place.
 */
export const APP_ROUTES = {
  LOGIN: '/login',
  WATCHLIST: '/watchlist', // Example, if we ever navigate directly
  ORDERS: '/orders',
} as const;

export const TIMEOUTS = {
  SHORT_WAIT: 1000,
  MEDIUM_WAIT: 2000,
  LONG_WAIT: 5000,
  ACTION_TIMEOUT: 15000,
  NAVIGATION_TIMEOUT: 30000,
} as const;
