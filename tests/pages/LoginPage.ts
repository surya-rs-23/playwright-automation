import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly saveAccountCheckbox: Locator;
  readonly loginButton: Locator;
  readonly otpInput: Locator;
  readonly submitButton: Locator;
  readonly welcomeText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeText = page.getByText('Welcome to CSEUsernamePasswordShow passwordSave AccountForgot PasswordLogin');
    this.usernameInput = page.getByRole('textbox', { name: 'userName' });
    this.passwordInput = page.locator('input[name="password"]');
    this.saveAccountCheckbox = page.getByRole('checkbox', { name: 'Save Account' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.otpInput = page.getByRole('textbox', { name: 'otp' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  /**
   * Navigates to the initial URL sequence exactly as recorded.
   */
  async navigate() {
    await this.page.goto('https://api.cse.com.sa/oms-channel/orders', { waitUntil: 'domcontentloaded' });
    await this.page.locator('html').click();
    await this.page.goto('https://api.cse.com.sa/oms-channel/login', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Fills credentials, checks "Save Account", and submits login.
   */
  async login(username: string, password: string) {
    // Optional click on welcome container to ensure page focus if needed
    try {
      await this.welcomeText.click({ timeout: 5000 });
    } catch (e) {
      // Ignored if not clickable or present
    }
    
    await this.usernameInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.usernameInput.click();
    await this.usernameInput.fill(username);
    
    await this.passwordInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
    
    await this.saveAccountCheckbox.check();
    
    // Short delay to ensure React state has completely synchronized before clicking
    await this.page.waitForTimeout(500);
    
    await this.loginButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.loginButton.click();
  }

  /**
   * Enters the OTP and submits the form, with self-healing retry.
   */
  async submitOtp(otp: string) {
    try {
      // Wait up to 20 seconds for the OTP view to load
      await this.otpInput.waitFor({ state: 'visible', timeout: 20000 });
    } catch (e) {
      console.log('OTP input timed out, attempting to retry clicking Login...');
      await this.loginButton.click().catch(() => {});
      await this.otpInput.waitFor({ state: 'visible', timeout: 15000 });
    }
    
    await this.otpInput.click();
    await this.otpInput.fill(otp);
    await this.submitButton.click();
  }
}
