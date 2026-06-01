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
    this.usernameInput = page.getByRole('textbox', { name: 'userName' });
    this.passwordInput = page.locator('input[name="password"]');
    this.saveAccountCheckbox = page.getByRole('checkbox', { name: 'Save Account' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.otpInput = page.getByRole('textbox', { name: 'otp' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  /**
   * Navigates directly to the login page using the centralized route constant.
   */
  async navigate(): Promise<void> {
    await super.navigate(APP_ROUTES.LOGIN);
  }

  /**
   * Enters the username and password, flags the save checkbox, and performs login submit.
   * Eliminates the anti-pattern of hardcoded sleeps (waitForTimeout).
   */
  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    
    // Playwright automatically waits for elements to be actionable, no sleep needed!
    await this.saveAccountCheckbox.check();
    await this.click(this.loginButton);
  }

  /**
   * Submits the secondary authentication OTP code.
   * Uses dynamic waiting to make sure the OTP input box is fully visible first.
   */
  async submitOtp(otp: string): Promise<void> {
    await this.waitForState(this.otpInput, 'visible');
    await this.fill(this.otpInput, otp);
    await this.click(this.submitButton);
  }
}
