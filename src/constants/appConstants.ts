/**
 * Centralized constant values for the test automation framework.
 * Keeping these separate makes it extremely easy to update global values (like routes and timeouts) in one place.
 */
export const APP_ROUTES = {
  LOGIN: '',
  WATCHLIST: 'watchlist', // Example, if we ever navigate directly
  ORDERS: 'orders',
  PROFILE: 'profile',
  SUBSCRIPTION_PLANS: 'profile/subscription-plans',
  NOTIFICATION_ALERTS: 'profile/notification-alerts',
} as const;

export const TIMEOUTS = {
  SHORT_WAIT: 3000,
  MEDIUM_WAIT: 4000,
  LONG_WAIT: 5000,
  ACTION_TIMEOUT: 25000,
  NAVIGATION_TIMEOUT: 30000,
  PROFILE_ACTION_TIMEOUT: 20000,
  PROFILE_NAVIGATION_TIMEOUT: 40000,
  // Login-specific settings
  LOGIN_RETRIES: 3,
  // Increased to accommodate slower backend responses during E2E runs
  LOGIN_OUTCOME_TIMEOUT: 60000,
  LOGIN_BACKOFF_MS: 2000,
} as const;
