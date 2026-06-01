import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { APP_ROUTES } from '../constants/appConstants';

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
    this.usernameInput = page.locator('input[name="userName"], input[name="username"], input[id*="user"], input[placeholder*="User"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"], input[placeholder*="Password"]');
    this.saveAccountCheckbox = page.getByRole('checkbox', { name: 'Save Account' });
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.otpInput = page.locator('input[name="otp"], input[id*="otp"], input[placeholder*="OTP"]');
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
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);

    await this.saveAccountCheckbox.check();
    await this.click(this.loginButton);

    const loginOutcome = await Promise.any([
      this.otpInput.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'otp'),
      this.page.getByText('Watchlist', { exact: true }).waitFor({ state: 'visible', timeout: 15000 }).then(() => 'watchlist'),
      this.page.getByText(/please try again later/i).waitFor({ state: 'visible', timeout: 15000 }).then(() => 'error'),
    ]).catch(() => 'none');

    if (loginOutcome === 'error') {
      throw new Error('Login failed: application displayed an error after submit.');
    }

    if (loginOutcome === 'none') {
      throw new Error('Login did not complete: neither OTP nor the post-login page appeared.');
    }
  }

  /**
   * Submits the secondary authentication OTP code if the OTP step is shown.
   */
  async submitOtp(otp: string): Promise<void> {
    await this.page.waitForLoadState('networkidle');

    const otpVisible = await this.otpInput.isVisible().catch(() => false);
    if (!otpVisible) {
      const watchlistVisible = (await this.page.getByText('Watchlist', { exact: true }).count()) > 0;
      if (watchlistVisible) {
        return;
      }
      throw new Error('OTP step did not appear and watchlist page was not reached after login.');
    }

    await this.fill(this.otpInput, otp);
    await this.click(this.submitButton);
    await this.page.waitForLoadState('networkidle');
  }
}
