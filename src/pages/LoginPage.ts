import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { APP_ROUTES, TIMEOUTS } from '../constants/appConstants';

/**
 * Page Object representing the Login page.
 * Handles credentials input, checkbox states, and OTP code submission.
 */
export class LoginPage extends BasePage {
  // Elements defined as readonly locators for clear encapsulation
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly saveAccountCheckbox: Locator;
  private readonly loginButton: Locator;
  private readonly otpInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="userName"], input[name="username"], input[id*="user"], input[placeholder*="User"], input[aria-label*="User"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"], input[placeholder*="Password"], input[aria-label*="Password"]');
    this.saveAccountCheckbox = page.getByRole('checkbox', { name: 'Save Account' });
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.otpInput = page.locator('input[name="otp"], input[id*="otp"], input[placeholder*="OTP"], input[aria-label*="OTP"]');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  /**
   * Navigates directly to the login page using the centralized route constant.
   */
  async navigate(): Promise<void> {
    await super.navigate(APP_ROUTES.LOGIN);
    await this.page.waitForURL(/\/(?:login)?$/, { timeout: 20000 });
  }

  /**
   * Enters the username and password, flags the save checkbox, and performs login submit.
   * Eliminates the anti-pattern of hardcoded sleeps (waitForTimeout).
   */
  async login(username: string, password: string): Promise<void> {
    const configuredRetries = Number(TIMEOUTS.LOGIN_RETRIES ?? 3);
    // Allow a couple of extra transient retries for backend hiccups (e.g. "Please try again later")
    const transientExtraRetries = 2;
    const maxAttempts = configuredRetries + transientExtraRetries;
    const outcomeTimeout = Number(TIMEOUTS.LOGIN_OUTCOME_TIMEOUT ?? 15000);
    const backoffMs = Number(TIMEOUTS.LOGIN_BACKOFF_MS ?? 2000);
    let lastOutcome: string | null = null;
    let lastToastText: string | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Fill credentials fresh each attempt
      await this.fill(this.usernameInput, username);
      await this.fill(this.passwordInput, password);
      try {
        await this.saveAccountCheckbox.check();
      } catch {
        // optional checkbox may not exist in some builds
      }

      // Ensure button is attached and enabled before clicking
      try {
        await this.loginButton.waitFor({ state: 'attached', timeout: 5000 });
        if (!(await this.loginButton.isEnabled().catch(() => false))) {
          await this.page.waitForTimeout(500);
        }
      } catch {
        // proceed to click regardless; click wrapper will handle visibility
      }

      await this.click(this.loginButton);
      await this.page.waitForLoadState('networkidle').catch(() => {});

      // Wait for one of the expected outcomes: OTP, post-login Watchlist, or an error toast
      const loginOutcome = await Promise.any([
        this.otpInput.waitFor({ state: 'visible', timeout: outcomeTimeout }).then(() => 'otp'),
        this.page.getByText(/watchlist/i).waitFor({ state: 'visible', timeout: outcomeTimeout }).then(() => 'watchlist'),
        this.page.getByText(/please try again later|try again later|temporar(?:y)?|server error|login failed|invalid credentials/i).waitFor({ state: 'visible', timeout: outcomeTimeout }).then(() => 'error'),
        this.page.locator('[role="alert"], .toast, .notification, .notification-message').first().waitFor({ state: 'visible', timeout: outcomeTimeout }).then(() => 'error'),
      ]).catch(() => 'none');

      lastOutcome = loginOutcome;

      if (loginOutcome === 'otp' || loginOutcome === 'watchlist') {
        return; // success
      }

      if (loginOutcome === 'error') {
        // try to capture toast text and close it
        try {
          const toast = this.page.locator('[role="alert"], .toast, .notification, .notification-message').first();
          lastToastText = (await toast.textContent())?.trim() ?? null;
        } catch (e) {
          // ignore
        }

        try {
          await this.page.getByRole('button', { name: 'Close toast' }).click({ timeout: 2000 }).catch(() => {});
        } catch {
          // ignore
        }

        // If the message is a known transient backend hiccup, allow extra retries
        const transient = !!(lastToastText && /please try again later|temporar|try again later|server is busy/i.test(lastToastText));
        if (attempt < maxAttempts && transient) {
          // longer backoff for transient server errors
          await this.page.waitForTimeout(backoffMs * attempt * 2);
          await this.page.reload({ waitUntil: 'domcontentloaded' });
          continue;
        }

        if (attempt < configuredRetries) {
          // standard retry path (invalid credentials or other recoverable cases)
          await this.page.waitForTimeout(backoffMs * attempt);
          await this.page.reload({ waitUntil: 'domcontentloaded' });
          continue;
        }
      }

      if (loginOutcome === 'none' && attempt < maxAttempts) {
        await this.page.waitForTimeout(backoffMs * attempt);
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        continue;
      }

      break;
    }

    if (lastOutcome === 'error') {
      const msg = lastToastText ? `Login failed: ${lastToastText}` : 'Login failed: application displayed an error after submit.';
      throw new Error(msg + ' Please verify credentials and server health.');
    }

    throw new Error('Login did not complete: neither OTP nor the post-login page appeared.');
  }

  /**
   * Submits the secondary authentication OTP code if the OTP step is shown.
   */
  async submitOtp(otp: string): Promise<void> {
    const otpVisible = await this.otpInput.isVisible().catch(() => false);
    if (!otpVisible) {
      const watchlistVisible = (await this.page.getByText(/watchlist/i).count()) > 0;
      if (watchlistVisible) {
        return; // Already logged in, skip OTP
      }
      throw new Error('OTP step did not appear and watchlist page was not reached after login.');
    }

    await this.fill(this.otpInput, otp);
    await this.click(this.submitButton);
    // Wait for navigation to complete instead of networkidle
    await this.page.waitForURL(/watchlist|home|dashboard/i, { timeout: TIMEOUTS.NAVIGATION_TIMEOUT });
  }

  async verifyLoginSuccess(): Promise<void> {
    await this.page.getByText(/watchlist/i).first().waitFor({ state: 'visible', timeout: TIMEOUTS.NAVIGATION_TIMEOUT });
  }
}
