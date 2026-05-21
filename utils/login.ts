import { Page } from '@playwright/test';

export async function login(page: Page, username = 'Surya', password = 'Test@123', otp = '0000') {

  await page.goto('https://api.cse.com.sa/oms-channel/login');

  // wait for page to stabilize
  await page.waitForTimeout(6000);

  await page.getByRole('textbox', { name: 'userName' }).fill(username);

  await page.locator('input[name="password"]').fill(password);

  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'otp' }).fill(otp);

  await page.getByRole('button', { name: 'Submit' }).click();
}
