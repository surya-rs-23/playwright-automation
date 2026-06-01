import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly saveAccountCheckbox: Locator;
  readonly loginButton: Locator;
  readonly otpInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByRole('textbox', { name: 'userName' });
    this.passwordInput = page.locator('input[name="password"]');
    this.saveAccountCheckbox = page.getByRole('checkbox', { name: 'Save Account' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.otpInput = page.getByRole('textbox', { name: 'otp' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async navigate() {
    await super.navigate('/login');
  }

  async login(username: string, password: string) {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.saveAccountCheckbox.check();
    await this.page.waitForTimeout(500);
    await this.click(this.loginButton);
  }

  async submitOtp(otp: string) {
    await this.otpInput.waitFor({ state: 'visible', timeout: 20000 });
    await this.fill(this.otpInput, otp);
    await this.click(this.submitButton);
  }
}
