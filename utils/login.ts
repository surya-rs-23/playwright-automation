import { Page } from '@playwright/test';

export async function login(page: Page, username = 'Surya', password = 'Test@1234', otp = '0000') {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'userName' }).fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('textbox', { name: 'otp' }).fill(otp);
  await page.getByRole('button', { name: 'Submit' }).click();
}
